import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { logActivity } from "../utils/logger";

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
            isDeleted: false,
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

// Add new medicine (with optional initial stock)
router.post("/medicines", authenticateToken, async (req: any, res) => {
    try {
        const {
            name, category, genericName, manufacturer, price, salePrice,
            reorderLevel, rackNo, unitPerPack, unitType,
            initialBatchNo, initialQuantity, initialExpiryDate
        } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the medicine
            const medicine = await tx.medicine.create({
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
                    stock: initialQuantity ? parseInt(initialQuantity.toString()) : 0,
                    initialBatchNo,
                    initialQuantity: initialQuantity?.toString(),
                    initialExpiryDate
                }
            });

            // 2. Create initial batch if stock data is provided
            if (initialBatchNo && initialQuantity) {
                await tx.stockBatch.create({
                    data: {
                        medicineId: medicine.id,
                        batchNo: initialBatchNo,
                        quantity: parseInt(initialQuantity.toString()),
                        purchasePrice: parseFloat(price.toString()), // Default cost to trade price
                        expiryDate: new Date(initialExpiryDate)
                    }
                });
            }

            return medicine;
        });

        // Log medicine creation
        await logActivity({
            type: "inventory",
            action: "Medicine Registered",
            detail: `${result.name} was registered with ${req.body.initialQuantity || 0} initial units.`,
            status: "success",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json(result);
    } catch (error: any) {
        console.error("Add medicine error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update medicine details
router.put("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const {
            name, category, genericName, manufacturer, price, salePrice,
            reorderLevel, rackNo, unitPerPack, unitType, stock,
            initialBatchNo, initialQuantity, initialExpiryDate
        } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the medicine (handling every single field)
            const medicine = await tx.medicine.update({
                where: { id: Number(id), pharmacyId },
                data: {
                    name,
                    category,
                    genericName,
                    manufacturer,
                    price: price !== undefined ? parseFloat(price.toString()) : undefined,
                    salePrice: salePrice !== undefined ? parseFloat(salePrice.toString()) : undefined,
                    reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel.toString()) : undefined,
                    unitPerPack: unitPerPack !== undefined ? parseInt(unitPerPack.toString()) : undefined,
                    unitType: unitType,
                    rackNo: rackNo,
                    initialBatchNo,
                    initialQuantity: initialQuantity?.toString(),
                    initialExpiryDate,
                    // Handle both direct stock edit AND new batch increment
                    stock: initialQuantity
                        ? { increment: parseInt(initialQuantity.toString()) }
                        : (stock !== undefined ? parseInt(stock.toString()) : undefined)
                }
            });

            // 2. Create batch if new stock entry data is provided
            if (initialBatchNo && initialQuantity && initialExpiryDate) {
                await tx.stockBatch.create({
                    data: {
                        medicineId: medicine.id,
                        batchNo: initialBatchNo,
                        quantity: parseInt(initialQuantity.toString()),
                        purchasePrice: price ? parseFloat(price.toString()) : medicine.price,
                        expiryDate: new Date(initialExpiryDate)
                    }
                });
            }

            return medicine;
        });

        // Log medicine update
        await logActivity({
            type: "inventory",
            action: "Medicine Proper Update",
            detail: `Full update performed for ${result.name}. All fields synchronized.`,
            status: "info",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json(result);
    } catch (error: any) {
        console.error("Update medicine error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Soft Delete medicine
router.delete("/medicines/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const medicineId = Number(id);
        const pharmacyId = req.user.pharmacyId;

        await prisma.medicine.update({
            where: { id: medicineId, pharmacyId },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        // Log medicine deletion
        await logActivity({
            type: "inventory",
            action: "Medicine Moved to Trash",
            detail: `Item ID ${medicineId} was moved to recycle bin.`,
            status: "warning",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: "Medicine moved to recycle bin successfully" });
    } catch (error: any) {
        console.error("Delete medicine error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Bulk Soft Delete medicines
router.post("/medicines/bulk-delete", authenticateToken, async (req: any, res) => {
    try {
        const { ids } = req.body;
        const pharmacyId = req.user.pharmacyId;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No medicines selected for deletion." });
        }

        const medicineIds = ids.map(id => Number(id));

        await prisma.medicine.updateMany({
            where: {
                id: { in: medicineIds },
                pharmacyId
            },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });

        // Log bulk deletion
        await logActivity({
            type: "inventory",
            action: "Bulk Medicines Moved to Trash",
            detail: `${medicineIds.length} items were moved to recycle bin.`,
            status: "warning",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: `${medicineIds.length} medicines moved to recycle bin successfully` });
    } catch (error: any) {
        console.error("Bulk delete medicine error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get deleted medicines (Recycle Bin)
router.get("/medicines/deleted", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const medicines = await prisma.medicine.findMany({
            where: { pharmacyId, isDeleted: true },
            orderBy: { deletedAt: 'desc' }
        });
        res.json(medicines);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Restore medicine
router.post("/medicines/restore/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const medicineId = Number(id);
        const pharmacyId = req.user.pharmacyId;

        await prisma.medicine.update({
            where: { id: medicineId, pharmacyId },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });

        await logActivity({
            type: "inventory",
            action: "Medicine Restored",
            detail: `Item ID ${medicineId} was restored from recycle bin.`,
            status: "success",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: "Medicine restored successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk Restore medicines
router.post("/medicines/bulk-restore", authenticateToken, async (req: any, res) => {
    try {
        const { ids } = req.body;
        const pharmacyId = req.user.pharmacyId;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No medicines selected for restoration." });
        }

        const medicineIds = ids.map(id => Number(id));

        await prisma.medicine.updateMany({
            where: {
                id: { in: medicineIds },
                pharmacyId
            },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        });

        await logActivity({
            type: "inventory",
            action: "Bulk Medicines Restored",
            detail: `${medicineIds.length} items were restored from recycle bin.`,
            status: "success",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: "Medicines restored successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Permanent Delete (Hard Delete)
router.delete("/medicines/permanent/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const medicineId = Number(id);
        const pharmacyId = req.user.pharmacyId;

        await prisma.$transaction(async (tx) => {
            // Delete all related records
            await tx.stockBatch.deleteMany({ where: { medicineId } });
            await tx.saleItem.deleteMany({ where: { medicineId } });
            await tx.purchaseItem.deleteMany({ where: { medicineId } });
            await tx.medicine.delete({ where: { id: medicineId, pharmacyId } });
        });

        await logActivity({
            type: "inventory",
            action: "Medicine Permanently Deleted",
            detail: `Item ID ${medicineId} was permanently removed from the system.`,
            status: "error",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: "Medicine permanently deleted" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Clear Trash (Empty Recycle Bin)
router.post("/medicines/clear-trash", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const deletedMedicines = await prisma.medicine.findMany({
            where: { pharmacyId, isDeleted: true },
            select: { id: true }
        });

        const medicineIds = deletedMedicines.map(m => m.id);

        if (medicineIds.length === 0) {
            return res.json({ message: "Recycle bin is already empty." });
        }

        await prisma.$transaction(async (tx) => {
            await tx.stockBatch.deleteMany({ where: { medicineId: { in: medicineIds } } });
            await tx.saleItem.deleteMany({ where: { medicineId: { in: medicineIds } } });
            await tx.purchaseItem.deleteMany({ where: { medicineId: { in: medicineIds } } });
            await tx.medicine.deleteMany({ where: { id: { in: medicineIds }, pharmacyId } });
        });

        await logActivity({
            type: "inventory",
            action: "Recycle Bin Cleared",
            detail: `All ${medicineIds.length} items in the recycle bin were permanently deleted.`,
            status: "error",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({ message: "Recycle bin cleared successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all master medicines with already-owned status for current pharmacy
router.get("/master-list", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const search = (req.query.search as string) || "";
        const category = (req.query.category as string) || "";

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { genericName: { contains: search } },
                { manufacturer: { contains: search } }
            ];
        }
        if (category) {
            where.category = category;
        }

        const [masterMedicines, pharmacyMedicines] = await Promise.all([
            prisma.masterMedicine.findMany({
                where,
                orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }]
            }),
            prisma.medicine.findMany({
                where: { pharmacyId },
                select: { name: true }
            })
        ]);

        const pharmacyMedicineNames = new Set(pharmacyMedicines.map((m: any) => m.name.toLowerCase()));

        const result = masterMedicines.map((med: any) => ({
            ...med,
            alreadyImported: pharmacyMedicineNames.has(med.name.toLowerCase())
        }));

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Import medicines from master database into pharmacy inventory
router.post("/import-from-master", authenticateToken, async (req: any, res) => {
    try {
        const { medicineIds } = req.body; // Array of masterMedicine IDs to import
        const pharmacyId = req.user.pharmacyId;

        if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
            return res.status(400).json({ error: "No medicines selected for import." });
        }

        // Fetch the selected master medicines
        const masterMedicines = await prisma.masterMedicine.findMany({
            where: { id: { in: medicineIds } }
        });

        // Get existing pharmacy medicines to avoid duplicates
        const existingMedicines = await prisma.medicine.findMany({
            where: { pharmacyId },
            select: { name: true }
        });
        const existingNames = new Set(existingMedicines.map((m: any) => m.name.toLowerCase()));

        const toImport = masterMedicines.filter((m: any) => !existingNames.has(m.name.toLowerCase()));

        if (toImport.length === 0) {
            return res.json({ imported: 0, skipped: medicineIds.length, message: "All selected medicines are already in your inventory." });
        }

        // Bulk create medicines
        await prisma.medicine.createMany({
            data: toImport.map((med: any) => ({
                name: med.name,
                genericName: med.genericName || "",
                manufacturer: med.manufacturer || "",
                category: med.category || "Tablet",
                unitType: med.unitType || "Tablet",
                price: 0,
                salePrice: 0,
                stock: 0,
                reorderLevel: 10,
                unitPerPack: 1,
                rackNo: null,
                pharmacyId
            }))
        });

        // Log all imports
        await logActivity({
            type: "inventory",
            action: "Bulk Import from Master",
            detail: `${toImport.length} medicines imported from Master Database. ${medicineIds.length - toImport.length} skipped (already owned).`,
            status: "success",
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json({
            imported: toImport.length,
            skipped: medicineIds.length - toImport.length,
            importedNames: toImport.map((m: any) => m.name),
            message: `${toImport.length} medicines imported successfully!`
        });
    } catch (error: any) {
        console.error("Import from master error:", error);
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
            where: { pharmacyId, isDeleted: false },
            include: { batches: true }
        });

        const totalItems = medicines.length;
        const totalStockValue = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);
        const lowStockCount = medicines.filter(m => m.stock < m.reorderLevel).length;

        const batches = await prisma.stockBatch.findMany({
            where: {
                medicine: {
                    pharmacyId,
                    isDeleted: false
                }
            }
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
