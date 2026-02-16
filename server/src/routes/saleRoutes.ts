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
            let finalCustomerId = customerId;

            // AUTO-REGISTER CUSTOMER if a name is provided but no ID is selected
            if (!finalCustomerId && manualCustomerName && manualCustomerName !== "Walk-in Customer") {
                // Try to find existing customer by name for this pharmacy to avoid duplicates
                const existing = await tx.customer.findFirst({
                    where: { name: manualCustomerName, pharmacyId }
                });

                if (existing) {
                    finalCustomerId = existing.id;
                } else {
                    const newCust = await tx.customer.create({
                        data: {
                            name: manualCustomerName,
                            address: manualCustomerAddress || null,
                            pharmacyId
                        }
                    });
                    finalCustomerId = newCust.id;
                }
            }

            // 1. Create Sale Record
            const newSale = await tx.sale.create({
                data: {
                    pharmacy: { connect: { id: pharmacyId } },
                    customer: finalCustomerId ? { connect: { id: finalCustomerId } } : undefined,
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

            // 3. Update Customer Analytics, Due, and Loyalty if applicable
            if (finalCustomerId) {
                const pointsToEarn = Math.floor(netAmount / 100);
                await tx.customer.update({
                    where: { id: finalCustomerId },
                    data: {
                        totalDue: { increment: netAmount > paidAmount ? netAmount - paidAmount : 0 },
                        loyaltyPoints: { increment: pointsToEarn },
                        totalSpent: { increment: netAmount },
                        visits: { increment: 1 }
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

// 5. Delete Single Sale
router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const saleId = parseInt(req.params.id);

        await prisma.sale.delete({
            where: {
                id: saleId,
                pharmacyId // Security: ensure it belongs to the pharmacy
            }
        });

        res.json({ message: "Sale deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Bulk Delete Sales
router.post("/bulk-delete", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No IDs provided" });
        }

        await prisma.sale.deleteMany({
            where: {
                id: { in: ids },
                pharmacyId
            }
        });

        res.json({ message: `${ids.length} sales deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
