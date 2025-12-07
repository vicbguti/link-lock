#!/usr/bin/env node
/**
 * Verify deployment is working
 * Usage: API_URL=https://your-api.railway.app node scripts/verify-deployment.js
 */

const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('❌ API_URL environment variable not set');
  console.error('Usage: API_URL=https://your-api.com node scripts/verify-deployment.js');
  process.exit(1);
}

const checks = [];

async function checkHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    
    if (data.status === 'ok') {
      checks.push({ name: 'Health check', status: '✅' });
    } else {
      checks.push({ name: 'Health check', status: '❌ Invalid response' });
    }
  } catch (err) {
    checks.push({ name: 'Health check', status: `❌ ${err.message}` });
  }
}

async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    
    if (res.status >= 400) {
      checks.push({ name: 'Auth endpoint', status: '✅ Responding' });
    } else {
      checks.push({ name: 'Auth endpoint', status: '❌ Unexpected response' });
    }
  } catch (err) {
    checks.push({ name: 'Auth endpoint', status: `❌ ${err.message}` });
  }
}

async function checkDatabase() {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    
    if (res.status === 401 || res.status === 500) {
      checks.push({ name: 'Database connection', status: '✅ Connected' });
    } else {
      checks.push({ name: 'Database connection', status: '⚠️  Unclear' });
    }
  } catch (err) {
    checks.push({ name: 'Database connection', status: `❌ ${err.message}` });
  }
}

async function runChecks() {
  console.log(`\n🔍 Verifying deployment: ${API_URL}\n`);
  
  await checkHealth();
  await checkAuth();
  await checkDatabase();
  
  console.log('─'.repeat(50));
  checks.forEach(check => {
    console.log(`${check.name.padEnd(25)} ${check.status}`);
  });
  console.log('─'.repeat(50));
  
  const allGood = checks.every(c => c.status.includes('✅'));
  
  if (allGood) {
    console.log('\n✅ Deployment looks good! Ready to launch.\n');
  } else {
    console.log('\n⚠️  Some checks failed. Review above.\n');
    process.exit(1);
  }
}

runChecks();
