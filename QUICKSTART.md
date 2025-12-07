# LinkLock Quick Start - First Time Deploy

**Total time: 30-60 minutes** (plus 1-3 days for Chrome review)

## Step 1: Local Testing (5 min)

Verify everything works locally before deploying:

```bash
# Install dependencies
npm install

# Terminal 1: Start API
npm start --workspace=@link-lock/api

# Terminal 2: Start Web (in new terminal)
npm run dev --workspace=@link-lock/web

# Terminal 3: Load Extension (in new terminal)
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select: packages/extension/
```

**Test:**
- Register at http://localhost:5173
- Save a link with extension
- Search for it in web app
- Should work perfectly ✅

---

## Step 2: Create Stripe Account (10 min)

1. Go to https://stripe.com/
2. Click "Sign up"
3. Complete registration
4. Go to https://dashboard.stripe.com
5. Copy these keys:
   - **Secret key:** `sk_live_...` (or `sk_test_...` for testing)
   - **Publishable key:** `pk_live_...`
6. Create webhook:
   - Dashboard → Webhooks
   - "Add endpoint"
   - URL: `https://your-api.railway.app/api/billing/webhook` (you'll have this after step 4)
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy signing secret: `whsec_...`

**Save these 3 values - you'll need them in Step 4**

---

## Step 3: Generate JWT Secret (2 min)

```bash
node scripts/generate-jwt-secret.js
# Output:
# ✅ Generated secure JWT secret:
# aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890...
```

**Copy this value - you'll need it in Step 4**

---

## Step 4: Create Railway Project (15 min)

### 4.1 Sign Up
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project

### 4.2 Add PostgreSQL Database
1. Click "New Service"
2. Select "Database" → "PostgreSQL"
3. Wait for database to create (~1 min)
4. Click on PostgreSQL service
5. Copy `DATABASE_URL` from "Connect" tab
6. **Save this - use in next step**

### 4.3 Deploy API
1. Click "New Service"
2. Select "GitHub repo"
3. Select `link-lock` repository
4. Railway auto-detects Dockerfile ✅
5. Set environment variables (click "Variables"):
   ```
   NODE_ENV              production
   API_URL               https://your-api-xxxx.railway.app
   DATABASE_URL          postgresql://... (paste from Step 4.2)
   JWT_SECRET            (paste from Step 3)
   STRIPE_SECRET_KEY     sk_live_... (from Step 2)
   STRIPE_PUBLISHABLE_KEY pk_live_... (from Step 2)
   STRIPE_WEBHOOK_SECRET whsec_... (from Step 2)
   ```
6. Click "Deploy"
7. Wait for build (~3 min)
8. Go to "Settings" → "Domains"
9. Copy the Railway domain: `https://your-api-xxxx.railway.app`
10. **Update Stripe webhook URL if different than you created in Step 2**

### 4.4 Test API
```bash
API_URL=https://your-api-xxxx.railway.app node scripts/verify-deployment.js
# Should output:
# Health check           ✅
# Auth endpoint         ✅  
# Database connection   ✅
```

---

## Step 5: Migrate Database (10 min)

**Very important - transfers your local data to PostgreSQL on Railway**

```bash
DATABASE_URL="postgresql://... (copy exact URL from Railway)" node migrate-to-postgres.js

# Output:
# 🔄 Starting migration: SQLite → PostgreSQL...
# ✅ Connected to SQLite database
# ✅ Connected to PostgreSQL
# ✅ Tables created in PostgreSQL
# 📦 Found X users to migrate
# ✅ Migrated X users
# ✅ Migrated X links
# ✅ Migration completed successfully!
```

---

## Step 6: Update Extension Config (3 min)

Edit `packages/extension/src/config.js`:

```javascript
export const API_URL = 'https://your-api-xxxx.railway.app';
export const WEB_URL = 'https://linklock.app';
```

Replace `your-api-xxxx.railway.app` with your actual Railway domain.

---

## Step 7: Deploy Web App (Choose One - 10 min)

### Option A: Vercel (Recommended)
1. Go to https://vercel.com
2. Click "Add new..." → "Project"
3. Import GitHub `link-lock` repo
4. Settings:
   - Root directory: `packages/web`
   - Build: `npm run build`
   - Output: `dist`
5. Environment variables:
   ```
   VITE_API_URL    https://your-api-xxxx.railway.app
   ```
6. Deploy
7. Copy domain: `https://your-domain.vercel.app`

### Option B: Railway (Same Project)
1. In Railway project, click "New Service"
2. Select `link-lock` repo again
3. Specify root directory: `packages/web`
4. Environment:
   ```
   VITE_API_URL    https://your-api-xxxx.railway.app
   ```
5. Deploy

**Pick ONE option** and continue...

---

## Step 8: Update Config with Web Domain (2 min)

Update `packages/extension/src/config.js`:

```javascript
export const API_URL = 'https://your-api-xxxx.railway.app';
export const WEB_URL = 'https://your-domain.vercel.app';  // or Railway domain
```

---

## Step 9: Build Extension for Chrome Store (5 min)

```bash
cd packages/extension
npm run build
# Creates: linklock-extension.zip

# Verify it has everything:
# - src/popup.js, popup.html, popup.css
# - src/background.js, content.js, config.js
# - manifest.json
```

---

## Step 10: Submit to Chrome Web Store (20 min)

### 10.1 Developer Account
1. Go to https://chrome.google.com/webstore/devconsole
2. Pay $5 registration fee
3. Verify email

### 10.2 Create Store Listing
1. Click "New item"
2. Upload `packages/extension/linklock-extension.zip`

### 10.3 Fill Metadata
**Basic:**
- Name: `LinkLock - Save & Organize Links`
- Summary: `The inbox for links. Save any link in one click.`

**Detailed Description:**
```
LinkLock is your personal link inbox. Save any link with one click and access it later with lightning-fast search and organization.

Features:
✨ One-click saving with screenshots
🔍 Lightning-fast search
📁 Organize with smart folders
🔐 Private folders (Pro)
💾 Export as CSV/JSON (Pro)
🌐 Share your public profile (Pro)

Free tier: 500 links/month
Pro: $3.99/month unlimited

Perfect for researchers, content creators, and anyone who saves links.
```

**Category:** Productivity  
**Language:** English  
**Support Email:** your-email@gmail.com  

### 10.4 Upload Assets
Create these images (quick versions):

**Screenshots (1280x800):**
- Screenshot 1: Link dashboard/grid
- Screenshot 2: Extension popup
- Screenshot 3: Search functionality

Quick way: Just take Chrome screenshots and resize to 1280x800

**Icons (use existing from design or create quick ones):**
- 128x128 (store icon)
- 48x48 (toolbar icon)  
- 16x16 (favicon)

Use your existing logo or a simple design.

### 10.5 Permissions Justification
For each permission Chrome asks, explain:

**activeTab:**
"Needed to save the current page's URL and title"

**scripting:**
"Needed to capture page screenshots"

**storage:**
"Needed to store authentication token"

**tabs:**
"Needed to detect the active tab"

### 10.6 Privacy Policy
Create a simple one and host it somewhere:
```
We collect: URL, screenshots, email
We store: Encrypted in database
We share: Only with Stripe for payments
You can: Export or delete anytime
```

Add link to your policy in the store listing.

### 10.7 Submit
Click "Submit for review"
⏳ Wait 1-3 days for approval

---

## Step 11: Launch (When approved!)

Once Chrome approves:

1. Extension goes live immediately
2. Copy the Extension ID from store
3. (Optional) Update EXTENSION_ID in config
4. Ready to market! 🚀

---

## Step 12: Post-Launch Testing

1. Install from Chrome Web Store
2. Test save link → works
3. Test web app → can view links
4. Test login → works
5. Test upgrade button → Stripe modal opens

---

## Success Checklist

```
✅ API deployed on Railway
✅ PostgreSQL connected
✅ Database migrated
✅ Web app deployed (Vercel/Railway)
✅ Extension config updated
✅ Extension submitted to Chrome store
✅ Waiting for approval...
✅ Approved! Extension live!
```

---

## Troubleshooting

### API won't start
```
Error: DATABASE_URL is required
→ Check DATABASE_URL is set in Railway env vars
```

### Extension won't save
```
Error: API_URL not accessible
→ Check API_URL in config.js matches Railway domain
→ Check API is actually running (test /health endpoint)
```

### Database migration fails
```
Error: connect ECONNREFUSED
→ Verify DATABASE_URL is correct
→ Verify PostgreSQL service is running in Railway
```

### Web app won't load
```
Error: Cannot connect to API
→ Check VITE_API_URL in web env vars
→ Check API is deployed and running
```

---

## Next Steps (After Launch)

1. **Marketing** - See [MARKETING.md](./MARKETING.md)
   - TikTok videos
   - Reddit posts
   - Product Hunt
   - Twitter thread

2. **Monitoring** - See [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
   - Watch error logs
   - Monitor Stripe payments
   - Track analytics

3. **Iterate** - Listen to user feedback
   - Fix bugs quickly
   - Add features based on requests
   - Improve UX

---

## Estimated Costs (First 3 Months)

```
Railway (API + PostgreSQL):   $10-20/month
Vercel (Web app):              Free tier (generous)
Chrome Web Store:              $5 (one-time)
Domain (optional):             $10/year
Stripe:                        2.9% + $0.30 per transaction

Total: $0-60 (depends on scale)
```

---

**You're ready! Follow this guide step-by-step and you'll be live in 60 minutes.** ✅

Questions? Check the detailed guides:
- [DEPLOY.md](./DEPLOY.md) - Deep dive
- [CHROME_WEBSTORE.md](./CHROME_WEBSTORE.md) - Store details
- [MARKETING.md](./MARKETING.md) - Growth strategy
- [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) - Full verification
