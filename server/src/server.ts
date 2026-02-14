import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes & Utilities
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import medicineRoutes from './routes/medicineRoutes';
import { seedSystem } from './utils/seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize System
seedSystem();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super', superAdminRoutes);
app.use('/api/medicines', medicineRoutes);

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'API is running', version: '1.0.0' });
});

app.listen(PORT, () => {
    console.log(`
    ========================================
     🚀 PHARMPRO SERVER IS LIVE
     📡 URL: http://localhost:${PORT}
     🏗️  Architecture: Modular (Refactored)
    ========================================
    `);
});
