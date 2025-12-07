# LinkLock Deployment Checklist

## Pre-Deployment (Local)

### Code & Config
- [ ] Update API_URL in `packages/extension/src/config.js`
- [ ] Update WEB_URL in `packages/extension/src/config.js`
- [ ] Review `.env.example` - all variables documented
- [ ] `npm run build` for web app works
- [ ] `npm run build` for extension works
- [ ] Test API locally: `npm start --workspace=@link-lock/api`
- [ ] Test web app locally: `npm run dev --workspace=@link-lock/web`

### Security
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] No secrets in git (check .gitignore)
- [ ] No hardcoded API URLs in code
- [ ] CORS configured correctly (only your domain)

### Testing
- [ ] Extension login/save works locally
- [ ] Web app login works
- [ ] Link saving + retrieval works
- [ ] Search functionality works
- [ ] Free tier limit (500) tested
- [ ] Pro features gated correctly
- [ ] Stripe test payment works

---

## Stripe Setup

### Stripe Dashboard
- [ ] Create Stripe account
- [ ] Add billing details
- [ ] Enable "Testing mode" initially

### Products & Pricing
- [ ] Create "Pro Plan" product
- [ ] Set price: $3.99/month (recurring)
- [ ] Add description: "Unlimited links + Pro features"

### API Keys
- [ ] Copy `sk_live_*` → STRIPE_SECRET_KEY env var
- [ ] Copy `pk_live_*` → STRIPE_PUBLISHABLE_KEY env var

### Webhooks
- [ ] Go to Webhooks section
- [ ] Create endpoint: `https://your-api.railway.app/api/billing/webhook`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Copy signing secret → STRIPE_WEBHOOK_SECRET env var
- [ ] Test webhook locally (use Stripe CLI)

### Payment Testing
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Test valid payment
- [ ] Test failed payment
- [ ] Test subscription cancellation
- [ ] Check database: user.plan = 'pro'

---

## Railway Setup

### Account & Project
- [ ] Create Railway account
- [ ] Create new project "linklock"
- [ ] Invite team members (if applicable)

### Database Service
- [ ] Add PostgreSQL service
- [ ] Wait for database creation
- [ ] Copy `DATABASE_URL` to clipboard

### Migration (Important!)
```bash
# Local machine
DATABASE_URL="<paste-railway-url>" node migrate-to-postgres.js
# Verify: should show "Migration completed successfully!"
```

- [ ] Run migration script successfully
- [ ] Verify user/link counts match
- [ ] Check data integrity in Railway console

### API Service
- [ ] Click "New Service" → GitHub
- [ ] Select `link-lock` repository
- [ ] Railway auto-detects Dockerfile
- [ ] Set environment variables:
  - [ ] NODE_ENV=production
  - [ ] API_URL=https://your-api.railway.app
  - [ ] DATABASE_URL=<from-postgres-service>
  - [ ] JWT_SECRET=<generate-random>
  - [ ] STRIPE_SECRET_KEY=sk_live_*
  - [ ] STRIPE_PUBLISHABLE_KEY=pk_live_*
  - [ ] STRIPE_WEBHOOK_SECRET=whsec_*
- [ ] Deploy branch: main
- [ ] Wait for build/deploy (~3 minutes)

### Health Check
- [ ] Test `https://your-api.railway.app/health` → `{"status":"ok"}`
- [ ] Test `https://your-api.railway.app/api/auth/register` (should fail nicely)
- [ ] Check logs for errors

### Domain (Optional)
- [ ] Add custom domain in Railway settings
- [ ] Update DNS records
- [ ] SSL certificate auto-generated

---

## Web App Deployment (Choose One)

### Option A: Railway (Same Project)
- [ ] Create new service in same Railway project
- [ ] Point to `packages/web` directory
- [ ] Environment: `VITE_API_URL=<your-api-url>`
- [ ] Build command: `npm run build --workspace=@link-lock/web`
- [ ] Start command: `npm run preview --workspace=@link-lock/web`
- [ ] Deploy

### Option B: Vercel (Recommended)
- [ ] Go to vercel.com
- [ ] Import git repository
- [ ] Root directory: `packages/web`
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output: `dist`
- [ ] Environment: `VITE_API_URL=<your-api-url>`
- [ ] Deploy
- [ ] Test: website loads, login works

### Option C: Netlify
- [ ] Connect GitHub repo
- [ ] Build settings:
  - Base directory: `packages/web`
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Environment: `VITE_API_URL=<your-api-url>`
- [ ] Deploy

**Choose ONE** → Test thoroughly before moving to extension

---

## Extension Configuration

### Update Config
Edit `packages/extension/src/config.js`:
```javascript
export const API_URL = 'https://your-api.railway.app';
export const WEB_URL = 'https://your-web-domain.com'; // or linklock.app
```

### Build Package
```bash
cd packages/extension
npm run build
# Creates: linklock-extension.zip
```

- [ ] Verify ZIP contains all files:
  - [ ] src/popup.js, popup.html, popup.css
  - [ ] src/background.js, content.js, config.js
  - [ ] manifest.json

### Local Testing
- [ ] Load unpacked extension in Chrome: `chrome://extensions`
- [ ] Enable "Developer mode"
- [ ] Load `packages/extension` directory
- [ ] Test save link → works
- [ ] Test view links → navigates correctly
- [ ] Check console for errors

---

## Chrome Web Store Submission

### Preparation
- [ ] Design 5 screenshots (1280x800)
- [ ] Create 128x128, 48x48, 16x16 icons
- [ ] Write compelling description (see CHROME_WEBSTORE.md)
- [ ] Create privacy policy page
- [ ] Build final ZIP package

### Store Listing
- [ ] Register as Chrome Web Store developer ($5)
- [ ] Create new item
- [ ] Upload ZIP
- [ ] Fill all required fields:
  - [ ] Name: "LinkLock - Save & Organize Links"
  - [ ] Summary: "Smart link management"
  - [ ] Description: (detailed, see guide)
  - [ ] Category: Productivity
  - [ ] Language: English
  - [ ] Permissions justification: (filled)
  - [ ] Privacy policy: linked
  - [ ] Support email: valid
- [ ] Upload all assets (screenshots, icons)
- [ ] Submit for review

### Review Process
- [ ] Monitor email for approval/rejection
- [ ] **If rejected:** read feedback, fix issues, resubmit
- [ ] **If approved:** extension goes live immediately
- [ ] Note EXTENSION_ID from store
- [ ] Update EXTENSION_ID in config if needed

---

## Post-Launch Verification

### API Functionality
- [ ] Health check endpoint works
- [ ] Register new user → works
- [ ] Login → returns JWT token
- [ ] Save link with screenshot → works
- [ ] Retrieve links → correct user only
- [ ] Search links → finds by title/URL
- [ ] Move link to folder → works
- [ ] Delete link → works
- [ ] Pro limit enforced → works
- [ ] Stripe webhook processes payments → works

### Web App
- [ ] Login/register form works
- [ ] Link dashboard displays
- [ ] Search filters correctly
- [ ] Folder organization works
- [ ] Pro upgrade button works (Stripe modal opens)
- [ ] Settings/profile works
- [ ] Logout works

### Extension
- [ ] Icon appears in Chrome toolbar
- [ ] Popup opens when clicked
- [ ] Can log in via popup
- [ ] Save link button saves
- [ ] "View links" button navigates to web app
- [ ] Screenshot capture works
- [ ] Works on all websites
- [ ] No console errors

### Database
- [ ] PostgreSQL data persists after restart
- [ ] Backups are being taken (Railway auto-backups)
- [ ] Indexes created (fast searches)

### Security
- [ ] HTTPS enforced everywhere
- [ ] JWT tokens expire appropriately
- [ ] Passwords hashed (not plain text)
- [ ] No sensitive logs in console
- [ ] CORS headers set correctly
- [ ] SQL injection prevention working

---

## Marketing Launch

### 24 Hours Before
- [ ] Social media posts scheduled
- [ ] Email template ready
- [ ] TikTok videos pre-recorded
- [ ] Reddit posts written (not posted yet)
- [ ] Product Hunt account ready

### Launch Day
- [ ] TikTok video #1 posted at 8am
- [ ] Twitter thread posted
- [ ] Product Hunt posted at 12:01am PST (tomorrow)
- [ ] Email sent to waitlist
- [ ] Reddit posts published (with 30min spacing)
- [ ] Monitor comments/feedback actively

### Week 1
- [ ] Daily TikTok content
- [ ] Respond to all comments
- [ ] Monitor Chrome store ratings
- [ ] Track analytics (users, signups, conversions)
- [ ] Fix any critical bugs immediately

### Week 2+
- [ ] Continue content schedule
- [ ] Iterate based on feedback
- [ ] Feature on social
- [ ] Monitor churn rate
- [ ] Plan next features

---

## Critical Issues (Fix Immediately)

- [ ] Extension won't save links
- [ ] Login not working
- [ ] API returns 500 errors
- [ ] Database connection lost
- [ ] Stripe payments failing
- [ ] Links disappearing
- [ ] Screenshot feature broken

---

## Post-Launch Monitoring

### Daily
- [ ] Check API error logs
- [ ] Verify Stripe webhooks processed
- [ ] Monitor user feedback/reviews

### Weekly
- [ ] Analytics review (users, conversion, churn)
- [ ] Stripe MRR growth
- [ ] Chrome store rating
- [ ] Feature requests summary

### Monthly
- [ ] Performance review
- [ ] Infrastructure costs
- [ ] Database optimization
- [ ] Plan next features

---

## Success Metrics (3-Month Target)

```
✅ 1000+ total installs
✅ 500+ monthly active users
✅ 50+ Pro subscribers ($150+ MRR)
✅ 4.5+ star rating
✅ 0 critical bugs
✅ <5% monthly churn
```

---

**Estimated total time: 8-12 hours setup + 1-3 days for review**

**Go live checklist: Just follow this sequentially ✅**
