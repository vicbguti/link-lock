import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Use PostgreSQL in production, SQLite in development
const dbModule = process.env.DATABASE_URL ? './db-postgres.js' : './db.js';
const { initDb, getLinks, saveLink, updateLinkFolder, deleteLink, getUserById, getLinkCount, toggleLinkPrivacy, exportUserLinks, updateUserProfile, getPublicUserLinks, getUserByUsername } = await import(dbModule);

import { registerUser, loginUser, authMiddleware } from './auth.js';
import { createCheckoutSession, handleStripeWebhook, verifyWebhookSignature } from './stripe.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database
initDb();

// AUTH ENDPOINTS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await registerUser(email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const user = getUserById(req.userId);
    const linkCount = getLinkCount(req.userId);
    res.json({ ...user, linkCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE profile (username, public/private)
app.patch('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const { username, isPublic } = req.body;
    
    if (username && username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    updateUserProfile(req.userId, username, isPublic);
    const updated = getUserById(req.userId);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC: Get user profile and links
app.get('/api/public/:username', (req, res) => {
  try {
    const { username } = req.params;
    const user = getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const links = getPublicUserLinks(username);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      },
      links
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED ROUTES
app.get('/api/links', authMiddleware, (req, res) => {
  const links = getLinks(req.userId);
  res.json(links);
});

// POST new link (with limit check)
app.post('/api/links', authMiddleware, (req, res) => {
  const { url, screenshot, title, folder } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    const user = getUserById(req.userId);
    const linkCount = getLinkCount(req.userId);
    
    // Check free tier limit
    if (user.plan === 'free' && linkCount >= 500) {
      return res.status(403).json({ error: 'Free tier limit reached. Upgrade to Pro.' });
    }

    const link = {
      id: uuidv4(),
      userId: req.userId,
      url,
      screenshot: screenshot || null,
      title: title || new URL(url).hostname,
      folder: folder || 'default',
      createdAt: new Date().toISOString(),
    };

    saveLink(link);
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH move link to folder
app.patch('/api/links/:linkId/folder', authMiddleware, (req, res) => {
  const { linkId } = req.params;
  const { folder } = req.body;

  if (!folder) {
    return res.status(400).json({ error: 'folder is required' });
  }

  try {
    updateLinkFolder(linkId, folder);
    res.json({ id: linkId, folder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE link
app.delete('/api/links/:linkId', authMiddleware, (req, res) => {
  const { linkId } = req.params;

  try {
    deleteLink(linkId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE private
app.patch('/api/links/:linkId/privacy', authMiddleware, (req, res) => {
  const { linkId } = req.params;
  const { isPrivate } = req.body;

  try {
    const user = getUserById(req.userId);
    if (user.plan !== 'pro') {
      return res.status(403).json({ error: 'Private folders require Pro plan' });
    }

    toggleLinkPrivacy(linkId, isPrivate);
    res.json({ id: linkId, isPrivate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EXPORT links
app.get('/api/export/:format', authMiddleware, (req, res) => {
  const { format } = req.params;
  const user = getUserById(req.userId);

  if (user.plan !== 'pro') {
    return res.status(403).json({ error: 'Export requires Pro plan' });
  }

  try {
    const data = exportUserLinks(req.userId, format);
    const filename = `linklock-export-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
    
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    res.header('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BILLING ENDPOINTS
app.post('/api/billing/checkout', authMiddleware, async (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (user.plan === 'pro') {
      return res.status(400).json({ error: 'Already on Pro plan' });
    }

    const session = await createCheckoutSession(req.userId, req.email);
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = verifyWebhookSignature(req.body, signature);
    handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`LinkLock API running on http://localhost:${PORT}`);
});
