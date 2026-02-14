import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Get All Medicines for current Pharmacy
router.get('/', async (req: any, res) => {
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

// Add New Medicine
router.post('/', async (req: any, res) => {
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

export default router;
