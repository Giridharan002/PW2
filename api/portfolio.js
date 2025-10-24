import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Portfolio from '../../server/models/Portfolio.js';
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

// Get user's portfolio
app.get('/api/portfolio/:userId', async (req, res) => {
    try {
        await connectDB();

        const portfolio = await Portfolio.findOne({ userId: req.params.userId });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found'
            });
        }

        res.json({
            success: true,
            portfolio
        });

    } catch (error) {
        console.error('❌ Portfolio fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch portfolio',
            error: error.message
        });
    }
});

// Save/Update portfolio
app.post('/api/portfolio', async (req, res) => {
    try {
        await connectDB();

        const { userId, portfolioData } = req.body;

        if (!userId || !portfolioData) {
            return res.status(400).json({
                success: false,
                message: 'User ID and portfolio data are required'
            });
        }

        let portfolio = await Portfolio.findOne({ userId });

        if (portfolio) {
            // Update existing portfolio
            portfolio.set(portfolioData);
        } else {
            // Create new portfolio
            portfolio = new Portfolio({ userId, ...portfolioData });
        }

        await portfolio.save();

        res.json({
            success: true,
            message: 'Portfolio saved successfully',
            portfolio
        });

    } catch (error) {
        console.error('❌ Portfolio save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save portfolio',
            error: error.message
        });
    }
});

// Export the handler for Vercel
export default app;
