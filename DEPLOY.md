# LinkLock Deploy Guide

## 1. Railway Setup

### Create a Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

### Add PostgreSQL Service
1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL"
3. Copy the `DATABASE_URL` from the config tab

### Add API Service
1. In the same project, click "New Service"
2. Select "GitHub repo" and connect `link-lock`
3. Railway auto-detects the `Dockerfile`
4. Add environment variables:

```
NODE_ENV=production
API_URL=https://your-api-domain.railway.app
VITE_API_URL=https://your-api-domain.railway.app
JWT_SECRET=<generate-a-long-random-string>
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## 2. Database Migration

### Before Deploying
1. Install dependencies locally:
   ```bash
   npm install
   ```

2. Run migration script:
   ```bash
   DATABASE_URL="postgresql://user:pass@host:5432/db" node migrate-to-postgres.js
   ```

3. Verify migration succeeded with counts

## 3. Environment Variables (Production)

Set in Railway dashboard:
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - Create webhook at https://dashboard.stripe.com/webhooks

## 4. Stripe Webhook Configuration

1. Go to https://dashboard.stripe.com/webhooks
2. Create endpoint: `https://your-api.railway.app/api/billing/webhook`
3. Select events:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 5. Web Deployment (Optional - Separate)

If you want web frontend separate:

### Option A: Railway
1. Create separate service in same project
2. Deploy from `packages/web` directory
3. Build command: `npm run build`
4. Start command: `npm run preview`

### Option B: Vercel (Recommended for React)
1. Go to https://vercel.com
2. Connect GitHub repo
3. Root directory: `packages/web`
4. Set `VITE_API_URL` in env vars
5. Auto-deploys on push

## 6. Chrome Extension Configuration

Update `packages/extension/src/config.js`:

```javascript
export const API_URL = 'https://your-api.railway.app';
```

## 7. Chrome Web Store Submission

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "New item"
3. Upload extension ZIP file
4. Fill metadata:
   - Name: "LinkLock - Save & Organize Links"
   - Description: "Smart link management with AI search"
   - Screenshots (3-5)
   - Icons (128x128, 48x48, 16x16)
5. Review for 1-3 days
6. Once approved, update `EXTENSION_ID` in API config

## 8. Verification Checklist

- [ ] API deployed and running
- [ ] PostgreSQL connected and migrated
- [ ] Stripe webhook configured
- [ ] Web app accessible
- [ ] Chrome extension tests pass
- [ ] Public profile pages working
- [ ] Free tier limits enforced
- [ ] Pro features gated correctly

## 9. Monitoring

### Railway Logs
- Check API logs: Dashboard → Services → API → Logs
- Watch for errors in real-time

### Stripe Dashboard
- Monitor webhook deliveries
- Check subscription events

### Chrome Store
- Monitor user reviews
- Check crash reports

## 10. Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED
```
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running in Railway
- Ensure firewall allows connections

### Stripe Webhook Not Working
```
Error: Invalid signature
```
- Verify `STRIPE_WEBHOOK_SECRET` matches webhook setting
- Check request is coming from Stripe IP ranges

### Extension Not Connecting
```
Error: API_URL not accessible
```
- Update extension config.js with correct URL
- Check CORS headers in API (should be enabled)
- Rebuild and reload extension

---

**Deploy Time**: ~10-15 minutes
**Cost**: $5-10/month (PostgreSQL + API server)
