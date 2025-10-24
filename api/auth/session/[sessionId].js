import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Define User schema inline to avoid import path issues
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sessionId: { type: String, unique: true, sparse: true },
    portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to generate a simple session ID
userSchema.methods.generateSession = function () {
    this.sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return this.sessionId;
};

const User = mongoose.model('User', userSchema);

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://oneclickfolio-new-git-master-giris-projects-75c3dbe7.vercel.app',
    'https://oneclickfolio-6v6y8viox-giris-projects-75c3dbe7.vercel.app',
    /^https:\/\/oneclickfolio-.*-giris-projects-75c3dbe7\.vercel\.app$/,
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

// Export the handler for Vercel
export default app;
