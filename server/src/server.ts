import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
console.log("Auth Secret:", process.env.JWT_SECRET ? "Loaded from .env" : "Using fallback secret");

// Routes & Utilities
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import medicineRoutes from './routes/medicineRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import saleRoutes from './routes/saleRoutes';
import supplierRoutes from './routes/supplierRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import customerRoutes from './routes/customerRoutes';
import financeRoutes from './routes/financeRoutes';
import reportRoutes from './routes/reportRoutes';
import logRoutes from './routes/logRoutes';
import settingRoutes from './routes/settingRoutes';
import { seedSystem } from './utils/seed';

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
app.use('/api/inventory', inventoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingRoutes);

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
