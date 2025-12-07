#!/usr/bin/env node
/**
 * Generate a secure JWT secret
 * Usage: node scripts/generate-jwt-secret.js
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n✅ Generated secure JWT secret:\n');
console.log(secret);
console.log('\nAdd this to your .env file:');
console.log(`JWT_SECRET=${secret}\n`);
