# LinkLock 🔐

> The inbox for links. Save any link with a screenshot in one click.

**Status:** MVP Complete ✅ | Ready for Production Deploy 🚀

## Quick Links

- **[Deploy Guide](./DEPLOY.md)** - Step-by-step Railway + PostgreSQL setup
- **[Chrome Web Store](./CHROME_WEBSTORE.md)** - Submit to Chrome store
- **[Marketing Strategy](./MARKETING.md)** - TikTok, Reddit, Twitter launch
- **[Deploy Checklist](./DEPLOY_CHECKLIST.md)** - Complete pre-launch checklist

## Architecture

```
link-lock/                    # Monorepo (npm workspaces)
├── packages/
│   ├── api/                  # Express.js + PostgreSQL
│   │   ├── src/
│   │   │   ├── index.js      # API routes
│   │   │   ├── db.js         # SQLite (dev)
│   │   │   ├── db-postgres.js # PostgreSQL (prod)
│   │   │   ├── auth.js       # JWT + bcrypt
│   │   │   └── stripe.js     # Stripe integration
│   │   └── data/             # SQLite database (dev only)
│   │
│   ├── web/                  # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── App.jsx       # Main component
│   │   │   └── main.jsx      # Entry point
│   │   └── dist/             # Built files
│   │
│   └── extension/            # Chrome Manifest v3
│       ├── src/
│       │   ├── popup.js      # Extension UI logic
│       │   ├── background.js # Service worker
│       │   ├── content.js    # Content script
│       │   ├── config.js     # API URLs
│       │   └── popup.html    # Extension popup
│       └── manifest.json     # Extension manifest
│
├── Dockerfile                # Production container
├── railway.json              # Railway deployment config
├── migrate-to-postgres.js    # SQLite → PostgreSQL migration
├── DEPLOY.md                 # Deployment guide
├── CHROME_WEBSTORE.md        # Web store submission
├── MARKETING.md              # Launch strategy
└── DEPLOY_CHECKLIST.md       # Pre-launch checklist
```

## Features

### Free Tier (500 links/month)
- ✅ Save links with one-click extension
- ✅ Automatic screenshot capture
- ✅ Organize into folders
- ✅ Full-text search
- ✅ Visual grid layout
- ✅ Public profiles

### Pro Tier ($3.99/month)
- ✅ Unlimited links
- ✅ Private folders
- ✅ Export CSV/JSON
- ✅ Advanced search
- ✅ Priority support

## Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js 4.18
- **Database:** SQLite (dev) → PostgreSQL (prod)
- **Auth:** JWT + bcryptjs
- **Payments:** Stripe
- **Cloud:** Railway

### Frontend
- **Framework:** React 18
- **Build:** Vite 5
- **Styling:** Tailwind CSS 3
- **HTTP:** Axios
- **Layout:** React Grid Layout

### Extension
- **Format:** Chrome Manifest v3
- **Language:** Vanilla JavaScript
- **Storage:** Chrome local storage
- **Permissions:** Minimal (activeTab, scripting, storage)

## Development

### Prerequisites
```bash
Node.js 20+
npm 9+
Git
```

### Setup

```bash
# Clone and install
git clone https://github.com/yourusername/link-lock.git
cd link-lock
npm install

# Create .env for local development
cp .env.example .env
# Edit .env with local values
```

### Run Services

**Terminal 1 - API Server**
```bash
npm start --workspace=@link-lock/api
# Server: http://localhost:3000
```

**Terminal 2 - Web App**
```bash
npm run dev --workspace=@link-lock/web
# App: http://localhost:5173
```

**Terminal 3 - Extension**
```bash
# Load unpacked in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Load unpacked → select packages/extension/
```

### Available Commands

```bash
# Development
npm run dev --workspace=@link-lock/api      # Start API with auto-reload
npm run dev --workspace=@link-lock/web      # Start web with Vite HMR

# Production
npm start --workspace=@link-lock/api        # Start API
npm run build --workspace=@link-lock/web    # Build web app
npm run preview --workspace=@link-lock/web  # Preview production build

# Extension
npm run build --workspace=@link-lock/extension  # Build ZIP for Web Store

# Utilities
node migrate-to-postgres.js                 # Migrate SQLite → PostgreSQL
node scripts/generate-jwt-secret.js         # Generate JWT secret
node scripts/verify-deployment.js           # Verify production API
```

## API Endpoints

### Authentication
```
POST /api/auth/register          # Create account
POST /api/auth/login             # Get JWT token
GET  /api/auth/me                # Current user + stats
PATCH /api/auth/profile          # Update username/visibility
```

### Links (Protected)
```
GET  /api/links                  # Get user's links
POST /api/links                  # Save new link
PATCH /api/links/:id/folder      # Move to folder
PATCH /api/links/:id/privacy     # Toggle private
DELETE /api/links/:id            # Delete link
GET  /api/export/:format         # Export CSV/JSON (Pro)
```

### Billing
```
POST /api/billing/checkout       # Create Stripe session
POST /api/billing/webhook        # Stripe webhook
```

### Public
```
GET  /api/public/:username       # Public profile
GET  /health                     # Health check
```

## Database Schema

### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  plan TEXT DEFAULT 'free',        -- 'free' or 'pro'
  username TEXT UNIQUE,
  isPublic INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Links
```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  url TEXT NOT NULL,
  screenshot BLOB,                 -- Base64 image
  title TEXT,
  folder TEXT DEFAULT 'default',
  isPrivate INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Environment Variables

### API
```env
NODE_ENV=production
PORT=3000
API_URL=https://api.linklock.app
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<generate-with-scripts/generate-jwt-secret.js>
STRIPE_SECRET_KEY=sk_live_*
STRIPE_PUBLISHABLE_KEY=pk_live_*
STRIPE_WEBHOOK_SECRET=whsec_*
```

### Web
```env
VITE_API_URL=https://api.linklock.app
```

### Extension
```javascript
// src/config.js
export const API_URL = 'https://api.linklock.app';
export const WEB_URL = 'https://linklock.app';
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for complete guide.

**Quick Start:**
```bash
1. Create Railway account
2. Add PostgreSQL service
3. Set environment variables
4. Deploy API (Railway auto-detects Dockerfile)
5. Deploy web (Vercel or Railway)
6. Submit extension to Chrome Web Store
```

**Estimated time:** 2-4 hours setup + 1-3 days review

## Chrome Web Store

See [CHROME_WEBSTORE.md](./CHROME_WEBSTORE.md).

**Submission:**
1. Design 5 screenshots
2. Create store listing
3. Upload ZIP to Dev Console
4. Submit for review (1-3 days)
5. Goes live immediately after approval

## Marketing & Launch

See [MARKETING.md](./MARKETING.md).

**Launch channels:**
- TikTok (organic + ads)
- Twitter (thread + engagement)
- Reddit (r/productivity, r/chrome, r/SideProject)
- Product Hunt (#1 goal)
- Email newsletter

**Target metrics (3 months):**
- 1000+ installs
- 500+ monthly active users
- 50+ Pro subscribers ($150+ MRR)
- 4.5+ star rating

## Pricing

### Free
- 500 links/month
- Basic folders
- Basic search
- Public profiles (optional)
- **Price:** $0/month

### Pro
- Unlimited links
- Private folders
- Export CSV/JSON
- Advanced search
- Priority support
- **Price:** $3.99/month

*Stripe handles all billing. No credit card required for free tier.*

## Security

- **Passwords:** bcryptjs (salted + hashed)
- **Auth:** JWT tokens (expires in 24h)
- **Transport:** HTTPS everywhere
- **Database:** SQL injection prevention
- **Permissions:** Minimal Chrome permissions
- **Data:** Encrypted at rest in transit
- **Privacy:** No tracking, no data sharing

## Monitoring

### Production
- API logs in Railway dashboard
- Stripe webhook delivery status
- Chrome Web Store analytics
- Error tracking (consider Sentry)

### Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- Free → Pro conversion rate
- Churn rate
- Average revenue per user (ARPU)

## Contributing

PRs welcome. Follow existing code style:
- ES modules
- Async/await
- No external CSS frameworks (use Tailwind)
- Minimal dependencies

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] AI-powered search
- [ ] Browser sync across devices
- [ ] Link analytics
- [ ] Team collaboration
- [ ] API for third-party apps

## License

MIT

## Contact

- **Website:** https://linklock.app
- **Email:** support@linklock.app
- **Twitter:** @linklock_app

---

**Built with ❤️ by developers who save links a lot.**

Made to be simple, fast, and actually useful.
