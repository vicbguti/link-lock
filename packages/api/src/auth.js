import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByEmail, getUserById } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const TOKEN_EXPIRY = '30d';

export async function registerUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Check if user already exists
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const userId = uuidv4();
  createUser(userId, email, hashedPassword);

  // Return token
  const token = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return { userId, email, token };
}

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare passwords
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Return token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return { userId: user.id, email: user.email, token, plan: user.plan };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}
