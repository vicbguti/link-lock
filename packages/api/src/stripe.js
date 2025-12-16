import * as dbSqlite from './db.js';
import * as dbPostgres from './db-postgres.js';

// Use PostgreSQL in production, SQLite in development
const db = process.env.DATABASE_URL ? dbPostgres : dbSqlite;
const { getUserById, updateUserPlan } = db;

let stripe = null;

// Only initialize Stripe if key is provided
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.warn('Stripe not available, using mock checkout');
  }
}

export async function createCheckoutSession(userId, email) {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Mock checkout for development or if Stripe not fully configured
  if (!stripe || !process.env.STRIPE_PRICE_ID) {
    // In development, immediately upgrade to pro
    await updateUserPlan(userId, 'pro');
    return {
      id: 'mock_session_' + userId,
      url: 'https://linklock-web.onrender.com/?upgraded=true'
    };
  }

  // Real Stripe checkout in production
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: 'https://linklock-web.onrender.com/?upgraded=true',
    cancel_url: 'https://linklock-web.onrender.com/pricing',
    customer_email: email,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId && subscription.status === 'active') {
        await updateUserPlan(userId, 'pro');
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      const delUserId = deletedSub.metadata?.userId;
      if (delUserId) {
        await updateUserPlan(delUserId, 'free');
      }
      break;
  }
}

export function verifyWebhookSignature(body, signature) {
  if (!stripe) {
    return { type: 'mock.event' };
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}
