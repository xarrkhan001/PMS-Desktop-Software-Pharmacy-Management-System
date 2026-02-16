import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get supplier stats for analytics cards
router.get("/stats", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const [suppliersCount, activeOrders, totals] = await Promise.all([
            prisma.supplier.count({ where: { pharmacyId } }),
            prisma.purchase.count({
                where: {
                    pharmacyId,
                    status: "PENDING"
                }
            }),
            prisma.purchase.aggregate({
                where: { pharmacyId },
                _sum: {
                    totalAmount: true,
                    paidAmount: true
                }
            })
        ]);

        const wholesaleValue = totals._sum.totalAmount || 0;
        const totalPaid = totals._sum.paidAmount || 0;
        const pendingPayables = wholesaleValue - totalPaid;

        res.json({
            partnerNetwork: suppliersCount,
            activeOrders: activeOrders,
            wholesaleValue: wholesaleValue,
            pendingPayables: pendingPayables,
            procurementRatio: suppliersCount > 0 ? 100 : 0 // Placeholder logic for now
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all suppliers for the active pharmacy
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const suppliers = await prisma.supplier.findMany({
            where: { pharmacyId },
            include: {
                _count: {
                    select: { purchases: true }
                },
                purchases: {
                    select: {
                        totalAmount: true,
                        paidAmount: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Calculate balance for each supplier
        const suppliersWithBalance = suppliers.map(s => {
            const totalOwed = s.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
            const totalPaid = s.purchases.reduce((sum, p) => sum + p.paidAmount, 0);
            return {
                ...s,
                balance: totalOwed - totalPaid,
                purchases: undefined // Don't send full purchase list here
            };
        });

        res.json(suppliersWithBalance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add new supplier
router.post("/", authenticateToken, async (req: any, res) => {
    try {
        const { name, contactPerson, contact, email, address } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const supplier = await prisma.supplier.create({
            data: {
                name,
                contactPerson,
                contact,
                email,
                address,
                pharmacyId
            }
        });

        res.json(supplier);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update supplier
router.put("/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { name, contactPerson, contact, email, address } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const supplier = await prisma.supplier.update({
            where: { id: Number(id), pharmacyId },
            data: {
                name,
                contactPerson,
                contact,
                email,
                address
            }
        });

        res.json(supplier);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete supplier
router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const pharmacyId = req.user.pharmacyId;

        // Check if supplier has purchases
        const supplier = await prisma.supplier.findUnique({
            where: { id: Number(id), pharmacyId },
            include: { _count: { select: { purchases: true } } }
        });

        if (supplier && supplier._count.purchases > 0) {
            return res.status(400).json({ error: "Cannot delete supplier with transaction history." });
        }

        await prisma.supplier.delete({
            where: { id: Number(id), pharmacyId }
        });

        res.json({ message: "Supplier removed successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
