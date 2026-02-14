import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pms_default_secret_fallback';

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        // 🚨 CRITICAL: Check if user or pharmacy still exists (for Terminal Purge)
        try {
            const userExists = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { pharmacy: true }
            });

            // If user is gone or their pharmacy is gone (unless they are SUPER_ADMIN)
            if (!userExists || (userExists.role !== 'SUPER_ADMIN' && !userExists.pharmacy)) {
                return res.status(401).json({ error: 'Account has been removed' });
            }

            req.user = decoded;
            next();
        } catch (dbErr) {
            return res.status(500).json({ error: 'System check failed' });
        }
    });
};

// --- Seed System (Super Admin) ---
const seedSystem = async () => {
    const superAdminExists = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!superAdminExists) {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        await prisma.user.create({
            data: {
                email: 'superadmin@pharmpro.com',
                password: hashedPassword,
                name: 'PharmPro Master',
                role: 'SUPER_ADMIN',
            },
        });
        console.log('👑 Super Admin Created: superadmin@pharmpro.com / superadmin123');
    }
};
seedSystem();

// --- Auth Routes ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { pharmacy: true }
        });
        if (!user) return res.status(400).json({ error: 'Account not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        // --- License Check for Pharmacy Users ---
        if (user.role !== 'SUPER_ADMIN' && user.pharmacy) {
            const now = new Date();
            if (!user.pharmacy.isActive) {
                return res.status(403).json({ error: 'Your pharmacy account has been deactivated. Contact Super Admin.' });
            }
            if (user.pharmacy.licenseExpiresAt && new Date(user.pharmacy.licenseExpiresAt) < now) {
                return res.status(403).json({
                    error: 'Your license has expired. Please make payment to renew your access.',
                    expiredAt: user.pharmacy.licenseExpiresAt
                });
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, pharmacyId: user.pharmacyId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                pharmacyId: user.pharmacyId,
                pharmacyName: user.pharmacy?.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Check Session Status (Real-time logout support)
app.get('/api/auth/status', authenticateToken, (req: any, res) => {
    res.json({ valid: true, user: req.user });
});

// --- Super Admin Only: Onboard New Pharmacy ---
app.post('/api/super/create-pharmacy', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Only Super Admin can do this' });

    const { pharmacyName, ownerEmail, ownerPassword, ownerName, licenseMonths, paidAmount } = req.body;

    try {
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (licenseMonths || 12));

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Pharmacy
            const pharmacy = await tx.pharmacy.create({
                data: {
                    name: pharmacyName,
                    licenseStartedAt: startDate,
                    licenseExpiresAt: expiryDate,
                    isActive: true,
                    subscriptionFee: Number(paidAmount) || 0,
                    totalPaid: Number(paidAmount) || 0
                },
            });

            // 2. Create Owner (Admin) for this Pharmacy
            const hashedPassword = await bcrypt.hash(ownerPassword, 10);
            const user = await tx.user.create({
                data: {
                    email: ownerEmail,
                    password: hashedPassword,
                    name: ownerName,
                    role: 'ADMIN',
                    pharmacyId: pharmacy.id
                },
            });

            return { pharmacy, user };
        });

        res.json({ message: 'Pharmacy onboarded successfully', data: result });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create pharmacy. Email might be in use.' });
    }
});

// --- Super Admin Only: Get All Pharmacies ---
app.get('/api/super/pharmacies', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Only Super Admin can do this' });
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            include: { users: { where: { role: 'ADMIN' }, select: { email: true } } }
        });
        res.json(pharmacies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pharmacies' });
    }
});

// --- Super Admin Only: Renew/Manage License ---
app.post('/api/super/renew-license', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Only Super Admin can do this' });

    const { pharmacyId, extraMonths, isActive, paidAmount } = req.body;

    try {
        const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
        if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

        const now = new Date();
        let newExpiry = new Date(now);

        if (extraMonths) {
            newExpiry.setMonth(newExpiry.getMonth() + extraMonths);
        }

        const amountToAdd = Number(paidAmount) || 0;

        const updated = await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: {
                licenseExpiresAt: newExpiry,
                licenseStartedAt: now,
                isActive: isActive !== undefined ? isActive : pharmacy.isActive,
                subscriptionFee: amountToAdd > 0 ? amountToAdd : pharmacy.subscriptionFee,
                totalPaid: { increment: amountToAdd }
            }
        });

        res.json({
            message: 'License updated successfully',
            newExpiry: updated.licenseExpiresAt,
            newStart: updated.licenseStartedAt
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update license' });
    }
});

// --- Super Admin Only: PERMANENTLY DELETE PHARMACY ---
app.delete('/api/super/pharmacy/:id', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Only Super Admin can do this' });
    const { id } = req.params;

    try {
        await prisma.pharmacy.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Pharmacy and all associated data permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pharmacy' });
    }
});

// --- Medicine Routes (Filtered by Pharmacy) ---
app.get('/api/medicines', authenticateToken, async (req: any, res) => {
    try {
        if (!req.user.pharmacyId) return res.status(400).json({ error: 'User not associated with a pharmacy' });

        const medicines = await prisma.medicine.findMany({
            where: { pharmacyId: req.user.pharmacyId }
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
});

app.post('/api/medicines', authenticateToken, async (req: any, res) => {
    if (req.user.role === 'STAFF') return res.status(403).json({ error: 'Sales staff cannot add medicines' });

    const { name, category, price, stock, expiryDate } = req.body;
    try {
        const medicine = await prisma.medicine.create({
            data: {
                name,
                category,
                price,
                stock,
                expiryDate: new Date(expiryDate),
                pharmacyId: req.user.pharmacyId
            },
        });
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add medicine' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
