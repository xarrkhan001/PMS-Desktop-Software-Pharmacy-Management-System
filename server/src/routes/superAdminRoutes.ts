import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to ensure only Super Admin can access these routes
const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Only Super Admin can do this' });
    }
    next();
};

router.use(authenticateToken);
router.use(isSuperAdmin);

// Get All Pharmacies
router.get('/pharmacies', async (req, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            include: { users: { where: { role: 'ADMIN' }, select: { email: true } } }
        });
        res.json(pharmacies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pharmacies' });
    }
});

// Create Pharmacy
router.post('/create-pharmacy', async (req, res) => {
    const { pharmacyName, ownerEmail, ownerPassword, ownerName, licenseMonths, paidAmount } = req.body;

    try {
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (licenseMonths || 12));

        const result = await prisma.$transaction(async (tx) => {
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

            const hashedPassword = await bcrypt.hash(ownerPassword, 10);
            await tx.user.create({
                data: {
                    email: ownerEmail,
                    password: hashedPassword,
                    name: ownerName,
                    role: 'ADMIN',
                    pharmacyId: pharmacy.id
                },
            });

            return { pharmacy };
        });

        res.json({ message: 'Pharmacy onboarded successfully', data: result });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create pharmacy. Email might be in use.' });
    }
});

// Renew/Manage License
router.post('/renew-license', async (req, res) => {
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

// Permanent Delete
router.delete('/pharmacy/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.pharmacy.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Pharmacy and all data permanently deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete pharmacy' });
    }
});

export default router;
