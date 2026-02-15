import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all medicines with pagination, search and filters
router.get("/medicines", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const search = (req.query.search as string) || "";
        const filter = (req.query.filter as string) || "all";
        const skip = (page - 1) * limit;

        const where: any = {
            pharmacyId,
            AND: [
                {
                    OR: [
                        { name: { contains: search } },
                        { genericName: { contains: search } },
                        { manufacturer: { contains: search } }
                    ]
                }
            ]
        };

        // Add Filter Logic
        if (filter === "lowStock") {
            where.AND.push({ stock: { lt: prisma.medicine.fields.reorderLevel } });
        } else if (filter === "nearExpiry") {
            where.AND.push({
                batches: {
                    some: {
                        expiryDate: {
                            gte: new Date(),
                            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                }
            });
        } else if (filter === "expired") {
            where.AND.push({
                batches: {
                    some: {
                        expiryDate: { lt: new Date() }
                    }
                }
            });
        }

        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                include: {
                    batches: {
                        orderBy: { expiryDate: 'asc' }
                    }
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit
            }),
            prisma.medicine.count({ where })
        ]);

        // Calculate alerts
        const medicinesWithAlerts = medicines.map(med => {
            const nearExpiry = med.batches.filter(batch => {
                const daysToExpiry = Math.floor((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return daysToExpiry <= 30 && daysToExpiry > 0;
            });

            const expired = med.batches.filter(batch => {
                return new Date(batch.expiryDate) < new Date();
            });

            return {
                ...med,
                lowStock: med.stock < med.reorderLevel,
                nearExpiryCount: nearExpiry.length,
                expiredCount: expired.length,
                alerts: {
                    lowStock: med.stock < med.reorderLevel,
                    nearExpiry: nearExpiry.length > 0,
                    expired: expired.length > 0
                }
            };
        });

        res.json({
            data: medicinesWithAlerts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get stock alerts summary
router.get("/alerts", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const medicines = await prisma.medicine.findMany({
            where: { pharmacyId },
            include: { batches: true }
        });

        const lowStockItems = medicines.filter(m => m.stock < m.reorderLevel);

        const nearExpiryBatches = await prisma.stockBatch.findMany({
            where: {
                medicine: { pharmacyId },
                expiryDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            },
            include: { medicine: true }
        });

        const expiredBatches = await prisma.stockBatch.findMany({
            where: {
                medicine: { pharmacyId },
                expiryDate: { lt: new Date() }
            },
            include: { medicine: true }
        });

        res.json({
            lowStock: {
                count: lowStockItems.length,
                items: lowStockItems.map(m => ({
                    id: m.id,
                    name: m.name,
                    stock: m.stock,
                    reorderLevel: m.reorderLevel
                }))
            },
            nearExpiry: {
                count: nearExpiryBatches.length,
                batches: nearExpiryBatches.map(b => ({
                    id: b.id,
                    medicineName: b.medicine.name,
                    batchNo: b.batchNo,
                    quantity: b.quantity,
                    expiryDate: b.expiryDate,
                    daysLeft: Math.floor((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                }))
            },
            expired: {
                count: expiredBatches.length,
                batches: expiredBatches.map(b => ({
                    id: b.id,
                    medicineName: b.medicine.name,
                    batchNo: b.batchNo,
                    quantity: b.quantity,
                    expiryDate: b.expiryDate
                }))
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add new medicine
router.post("/medicines", authenticateToken, async (req: any, res) => {
    try {
        const { name, category, genericName, manufacturer, price, salePrice, reorderLevel, rackNo, unitPerPack, unitType } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const medicine = await prisma.medicine.create({
            data: {
                name,
                category,
                genericName,
                manufacturer,
                price: parseFloat(price.toString()),
                salePrice: parseFloat(salePrice.toString()),
                reorderLevel: reorderLevel ? parseInt(reorderLevel.toString()) : 10,
                unitPerPack: unitPerPack ? parseInt(unitPerPack.toString()) : 1,
                unitType: unitType || "Tablet",
                rackNo,
                pharmacyId,
                stock: 0
            }
        });

        res.json(medicine);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update medicine details
router.put("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { name, category, genericName, manufacturer, price, salePrice, reorderLevel, rackNo, unitPerPack, unitType } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const medicine = await prisma.medicine.update({
            where: { id: Number(id), pharmacyId },
            data: {
                name,
                category,
                genericName,
                manufacturer,
                price: parseFloat(price.toString()),
                salePrice: parseFloat(salePrice.toString()),
                reorderLevel: parseInt(reorderLevel.toString()),
                unitPerPack: parseInt(unitPerPack.toString()),
                unitType: unitType,
                rackNo
            }
        });

        res.json(medicine);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete medicine
router.delete("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const pharmacyId = req.user.pharmacyId;

        await prisma.medicine.delete({
            where: { id: Number(id), pharmacyId }
        });

        res.json({ message: "Medicine deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add stock batch
router.post("/batches", authenticateToken, async (req: any, res) => {
    try {
        const { medicineId, batchNo, quantity, purchasePrice, expiryDate } = req.body;

        const batch = await prisma.stockBatch.create({
            data: {
                medicineId,
                batchNo,
                quantity,
                purchasePrice,
                expiryDate: new Date(expiryDate)
            }
        });

        // Update medicine stock
        await prisma.medicine.update({
            where: { id: medicineId },
            data: {
                stock: {
                    increment: quantity
                }
            }
        });

        res.json(batch);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get stock analytics
router.get("/analytics", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const medicines = await prisma.medicine.findMany({
            where: { pharmacyId },
            include: { batches: true }
        });

        const totalItems = medicines.length;
        const totalStockValue = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);
        const lowStockCount = medicines.filter(m => m.stock < m.reorderLevel).length;

        const batches = await prisma.stockBatch.findMany({
            where: { medicine: { pharmacyId } }
        });

        const nearExpiryCount = batches.filter(b => {
            const daysToExpiry = Math.floor((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysToExpiry <= 30 && daysToExpiry > 0;
        }).length;

        const expiredCount = batches.filter(b => new Date(b.expiryDate) < new Date()).length;

        // Category-wise breakdown
        const categoryBreakdown = medicines.reduce((acc: any, m) => {
            if (!acc[m.category]) {
                acc[m.category] = { count: 0, value: 0 };
            }
            acc[m.category].count++;
            acc[m.category].value += m.stock * m.price;
            return acc;
        }, {});

        res.json({
            totalItems,
            totalStockValue,
            lowStockCount,
            nearExpiryCount,
            expiredCount,
            categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]: any) => ({
                category,
                count: data.count,
                value: data.value
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
