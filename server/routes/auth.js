import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Simple login/register - creates user or logs in existing user
router.post('/login', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name });
    } else {
      // Update name if provided
      user.name = name;
    }

    // Generate session
    const sessionId = user.generateSession();
    await user.save();

    res.json({
      success: true,
      message: user.isNew ? 'User registered successfully' : 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        sessionId: sessionId
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Validate session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const user = await User.findOne({ sessionId: req.params.sessionId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        sessionId: user.sessionId
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Session validation failed',
      error: error.message
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      await User.updateOne({ sessionId }, { $unset: { sessionId: 1 } });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

export default router;
