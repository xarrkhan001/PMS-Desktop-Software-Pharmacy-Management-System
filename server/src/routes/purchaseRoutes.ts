import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get all purchases for the active pharmacy
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const purchases = await prisma.purchase.findMany({
            where: { pharmacyId },
            include: {
                supplier: {
                    select: { name: true, contactPerson: true }
                },
                items: {
                    include: {
                        medicine: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(purchases);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new purchase (Stock Inward)
router.post("/", authenticateToken, async (req: any, res) => {
    const {
        supplierId,
        invoiceNo,
        items, // Array of { medicineId, quantity, price, batchNo, expiryDate }
        totalAmount,
        paidAmount,
        status
    } = req.body;

    const pharmacyId = req.user.pharmacyId;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Purchase record
            const purchase = await tx.purchase.create({
                data: {
                    pharmacyId,
                    supplierId,
                    invoiceNo,
                    totalAmount: parseFloat(totalAmount),
                    paidAmount: parseFloat(paidAmount),
                    status: status || "COMPLETED",
                    items: {
                        create: items.map((item: any) => ({
                            medicineId: item.medicineId,
                            quantity: parseInt(item.quantity),
                            price: parseFloat(item.price),
                            batchNo: item.batchNo,
                            expiryDate: new Date(item.expiryDate)
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Update Medicine Stocks & Batches
            for (const item of items) {
                // Update total medicine stock
                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: {
                        stock: { increment: parseInt(item.quantity) },
                        // Optional: update the cost price of medicine if it changed
                        price: parseFloat(item.price)
                    }
                });

                // Create a new stock batch for FEFO tracking
                await tx.stockBatch.create({
                    data: {
                        medicineId: item.medicineId,
                        batchNo: item.batchNo,
                        quantity: parseInt(item.quantity),
                        purchasePrice: parseFloat(item.price),
                        expiryDate: new Date(item.expiryDate)
                    }
                });
            }

            return purchase;
        });

        res.json(result);
    } catch (error: any) {
        console.error("Purchase Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a single purchase detail
router.get("/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const pharmacyId = req.user.pharmacyId;

        const purchase = await prisma.purchase.findFirst({
            where: { id: Number(id), pharmacyId },
            include: {
                supplier: true,
                items: {
                    include: {
                        medicine: true
                    }
                }
            }
        });

        if (!purchase) return res.status(404).json({ error: "Purchase not found" });
        res.json(purchase);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete/Cancel a purchase (Reverses Inventory)
router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const pharmacyId = req.user.pharmacyId;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get purchase data to know what to reverse
            const purchase = await tx.purchase.findFirst({
                where: { id: Number(id), pharmacyId },
                include: { items: true }
            });

            if (!purchase) throw new Error("Purchase record not found");

            // 2. Reverse each item from inventory
            for (const item of purchase.items) {
                const medicine = await tx.medicine.findUnique({ where: { id: item.medicineId } });

                // Optional: Check if we have enough stock to reverse (to avoid negative stock)
                if (medicine && medicine.stock < item.quantity) {
                    throw new Error(`Cannot cancel: ${medicine.name} stock is already sold/used.`);
                }

                await tx.medicine.update({
                    where: { id: item.medicineId },
                    data: { stock: { decrement: item.quantity } }
                });

                // Delete associated batch (if batchNo exists)
                if (item.batchNo) {
                    await tx.stockBatch.deleteMany({
                        where: {
                            medicineId: item.medicineId,
                            batchNo: item.batchNo
                        }
                    });
                }
            }

            // 3. Delete items and core purchase record
            await tx.purchaseItem.deleteMany({ where: { purchaseId: Number(id) } });
            await tx.purchase.delete({ where: { id: Number(id) } });

            return { success: true };
        });

        res.json(result);
    } catch (error: any) {
        console.error("Cancellation Error:", error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
