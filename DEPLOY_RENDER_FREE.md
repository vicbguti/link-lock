# Deploy LinkLock en Render (Gratis)

Render tiene free tier mejor que Railway. Sigue esto en lugar del QUICKSTART Step 4.

## Step 4B: Render Setup (Gratis)

### 1. Crea cuenta en Render
1. Go to https://render.com
2. Sign up with GitHub
3. Connect tu repo `link-lock`

### 2. Crea PostgreSQL Database

1. Dashboard → "New +"
2. Select "PostgreSQL"
3. Name: `linklock-db`
4. Region: Dallas (más cercano a Ecuador)
5. Click "Create Database"
6. Espera ~2 min
7. Copia `Internal Database URL` (usarás esto)

### 3. Deploy API

1. Dashboard → "New +"
2. Select "Web Service"
3. Connect repo: `link-lock`
4. Settings:
   - Name: `linklock-api`
   - Root Directory: (leave empty)
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start --workspace=@link-lock/api`
   - Instance Type: **Free**

5. Environment Variables (importante):
   ```
   NODE_ENV              production
   PORT                  3000
   API_URL               https://linklock-api-xxxxx.onrender.com
   DATABASE_URL          (paste Internal Database URL from step 2)
   JWT_SECRET            (paste from generate-jwt-secret.js)
   STRIPE_SECRET_KEY     sk_test_xxx (test keys for now)
   STRIPE_PUBLISHABLE_KEY pk_test_xxx
   STRIPE_WEBHOOK_SECRET whsec_xxx (you'll get this)
   ```

6. Click "Create Web Service"
7. Espera deploy (~3 min)
8. Copia tu domain: `https://linklock-api-xxxxx.onrender.com`

### 4. Test API

```bash
API_URL=https://linklock-api-xxxxx.onrender.com npm run verify-deployment
```

Should show: ✅ Health check, ✅ Auth endpoint, ✅ Database connection

### 5. Migrate Database

```bash
DATABASE_URL="<paste Internal Database URL>" node migrate-to-postgres.js
```

### 6. Deploy Web App

1. Dashboard → "New +"
2. Select "Static Site"
3. Connect repo: `link-lock`
4. Settings:
   - Name: `linklock-web`
   - Root Directory: `packages/web`
   - Build Command: `npm run build --workspace=@link-lock/web`
   - Publish Directory: `dist`
   - Environment: `VITE_API_URL=https://linklock-api-xxxxx.onrender.com`

5. Click "Create Static Site"
6. Espera deploy
7. Copia domain: `https://linklock-web-xxxxx.onrender.com`

### 7. Update Extension Config

Edit `packages/extension/src/popup.js`:

```javascript
const API_URL = 'https://linklock-api-xxxxx.onrender.com';
const WEB_URL = 'https://linklock-web-xxxxx.onrender.com';
```

### 8. Stripe Setup

1. Go to https://stripe.com
2. Test mode (no pagar, solo testing)
3. Copy test keys:
   - `sk_test_*` → STRIPE_SECRET_KEY in Render
   - `pk_test_*` → STRIPE_PUBLISHABLE_KEY in Render

For webhook:
1. Dashboard → Webhooks
2. Add endpoint: `https://linklock-api-xxxxx.onrender.com/api/billing/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy `whsec_test_*` → STRIPE_WEBHOOK_SECRET in Render

### 9. Build Extension

```bash
cd packages/extension
npm run build
# Creates: linklock-extension.zip
```

### 10. Submit to Chrome Store

Use `linklock-extension.zip` - rest is same as QUICKSTART

---

## Render Free Limits

- ✅ API: Free tier (0.5 vCPU, 512MB RAM)
- ✅ Database: Free tier (10GB storage)
- ✅ Web: Free tier (bandwidth limits but ok)
- ⚠️ Services sleep after 15min inactivity (wake up on request)

**For MVP this is fine.** When you get users, upgrade ($7/month for API, $15/month for DB).

---

## Alternative: Supabase (Also Free)

If Render has issues, use Supabase for database only:

1. Go to https://supabase.com
2. Create project
3. Get `postgresql://...` connection string
4. Use in Render API service
5. Unlimited free tier (1GB)

---

## Costs

- Render Free: $0/month
- Stripe Test: $0/month
- Domain (optional): $10/year

**Total: $0 to launch**

---

**Continue from Step 5 of QUICKSTART (migrate database)**

Rest is the same!
