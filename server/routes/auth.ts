import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { verifyToken, AuthenticatedRequest } from '../middleware/verifyToken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // Check if user already exists
    const [existingUsers]: [any[], any] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine role (default to 'user', unless explicitly specified 'admin' - for testing/admin creation)
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    // Insert user
    const [result]: any = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, assignedRole]
    );

    const userId = result.insertId;

    // Generate token
    const token = jwt.sign(
      { id: userId, name, email, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role: assignedRole,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user
    const [users]: [any[], any] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [users]: [any[], any] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken as any, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const userId = req.user.id;

    // Check if email is already taken by someone else
    const [existingUsers]: [any[], any] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0 && existingUsers[0].id !== userId) {
      return res.status(400).json({ message: 'Email is already taken by another user' });
    }

    let passwordHash: string | null = null;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    if (passwordHash) {
      await pool.query(
        'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
        [name, email, passwordHash, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, userId]
      );
    }

    // Get updated user details
    const [updatedUsers]: [any[], any] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUsers[0];

    // Generate refreshed token
    const token = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      token
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
