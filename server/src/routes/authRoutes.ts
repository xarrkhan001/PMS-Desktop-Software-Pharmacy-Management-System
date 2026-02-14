import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pms_default_secret_fallback';

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { pharmacy: true }
        });
        if (!user) return res.status(400).json({ error: 'Account not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        // License Check for Pharmacy Users
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

// Check Session Status
router.get('/status', authenticateToken, (req: any, res) => {
    res.json({ valid: true, user: req.user });
});

export default router;
