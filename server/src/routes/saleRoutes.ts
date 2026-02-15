import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// 1. Search Medicines for POS (includes batches)
router.get("/search", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const query = (req.query.q as string) || "";

        if (!query || query.length < 2) {
            return res.json([]);
        }

        const medicines = await prisma.medicine.findMany({
            where: {
                pharmacyId,
                AND: [
                    {
                        OR: [
                            { name: { contains: query } },
                            { genericName: { contains: query } },
                            { id: { equals: parseInt(query) || undefined } }
                        ]
                    },
                    {
                        batches: {
                            some: {
                                quantity: { gt: 0 },
                                expiryDate: { gt: new Date() }
                            }
                        }
                    }
                ]
            },
            include: {
                batches: {
                    where: {
                        quantity: { gt: 0 },
                        expiryDate: { gt: new Date() }
                    },
                    orderBy: { expiryDate: 'asc' }
                }
            },
            take: 10
        });

        res.json(medicines);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Process Sale (Transaction)
router.post("/process", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const {
            customerId,
            items,
            discount,
            paymentMethod,
            totalAmount,
            netAmount,
            paidAmount,
            manualCustomerName,
            manualCustomerAddress
        } = req.body;

        // Start Transaction
        const sale = await prisma.$transaction(async (tx) => {
            // 1. Create Sale Record
            const newSale = await tx.sale.create({
                data: {
                    pharmacy: { connect: { id: pharmacyId } },
                    customer: customerId ? { connect: { id: customerId } } : undefined,
                    totalAmount: totalAmount || 0,
                    discount: discount || 0,
                    netAmount: netAmount || 0,
                    paidAmount: paidAmount || 0,
                    dueAmount: Math.max(0, (netAmount || 0) - (paidAmount || 0)),
                    paymentMethod: paymentMethod || "CASH",
                    manualCustomerName: manualCustomerName || null,
                    manualCustomerAddress: manualCustomerAddress || null,
                    invoiceNo: `INV-${Date.now()}`
                }
            });

            // 2. Process Each Item
            for (const item of items) {
                const { medicineId, batchId, quantity, price } = item;

                // Create SaleItem
                await tx.saleItem.create({
                    data: {
                        saleId: newSale.id,
                        medicineId,
                        quantity,
                        price,
                        total: price * quantity
                    }
                });

                // Update StockBatch
                await tx.stockBatch.update({
                    where: { id: batchId },
                    data: {
                        quantity: { decrement: quantity }
                    }
                });

                // Update Medicine Total Stock
                await tx.medicine.update({
                    where: { id: medicineId },
                    data: {
                        stock: { decrement: quantity }
                    }
                });
            }

            // 3. Update Customer Due if applicable
            if (customerId && netAmount > paidAmount) {
                await tx.customer.update({
                    where: { id: customerId },
                    data: {
                        totalDue: { increment: netAmount - paidAmount }
                    }
                });
            }

            return newSale;
        });

        res.json({ message: "Sale processed successfully", sale });
    } catch (error: any) {
        console.error("Sale processing error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Recent Sales
router.get("/recent", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const sales = await prisma.sale.findMany({
            where: { pharmacyId },
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json(sales);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get Full Sales History
router.get("/history", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const sales = await prisma.sale.findMany({
            where: { pharmacyId },
            include: {
                customer: true,
                items: {
                    include: { medicine: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sales);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
