import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from '../../server/models/User.js';

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://oneclickfolio-opal.vercel.app',
    'https://oneclickfolio-manis-projects-3c91d416.vercel.app',
    /^https:\/\/oneclickfolio-.*\.vercel\.app$/,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
    origin: process.env.NODE_ENV === 'development' ? true : function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });
        if (isAllowed) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-portfolio');
        isConnected = true;
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        await connectDB();

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

// Session validation endpoint
app.get('/api/auth/session/:sessionId', async (req, res) => {
    try {
        await connectDB();

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

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
    try {
        await connectDB();

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

// Export the handler for Vercel
export default app;
