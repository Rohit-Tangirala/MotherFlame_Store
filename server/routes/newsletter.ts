import express from 'express';
import pool from '../db';

const router = express.Router();

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Insert into database
    try {
      await pool.query(
        'INSERT INTO newsletters (email) VALUES (?)',
        [email.trim()]
      );
      return res.status(200).json({
        success: true,
        message: 'Successfully subscribed to our newsletter!',
      });
    } catch (dbErr: any) {
      const errorMsg = dbErr.message || '';
      if (
        dbErr.code === 'ER_DUP_ENTRY' ||
        errorMsg.toLowerCase().includes('already subscribed') ||
        errorMsg.toLowerCase().includes('duplicate entry')
      ) {
        return res.status(400).json({
          error: 'This email is already subscribed to our newsletter.',
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

export default router;
