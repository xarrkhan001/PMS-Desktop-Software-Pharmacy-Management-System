import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { logActivity } from "../utils/logger";

const router = express.Router();
const prisma = new PrismaClient();

// --- CATEGORIES ---

// Get all expense categories
router.get("/categories", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const categories = await prisma.expenseCategory.findMany({
            where: { pharmacyId },
            include: { _count: { select: { expenses: true } } }
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create category
router.post("/categories", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { name, description } = req.body;
        const category = await prisma.expenseCategory.create({
            data: { name, description, pharmacyId }
        });
        res.json(category);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete category (and its expenses)
router.delete("/categories/:id", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const categoryId = Number(req.params.id);

        await prisma.$transaction([
            prisma.expense.deleteMany({ where: { categoryId, pharmacyId } }),
            prisma.expenseCategory.delete({ where: { id: categoryId, pharmacyId } })
        ]);

        res.json({ message: "Category and related expenses deleted" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- EXPENSES ---

// Get all expenses
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const expenses = await prisma.expense.findMany({
            where: { pharmacyId },
            include: { category: true },
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add expense
router.post("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { title, amount, categoryId, description, paymentMethod, date } = req.body;
        const expense = await prisma.expense.create({
            data: {
                title,
                amount: Number(amount),
                categoryId: Number(categoryId),
                description,
                paymentMethod: paymentMethod || "CASH",
                date: date ? new Date(date) : new Date(),
                pharmacyId
            }
        });

        // Log the expense
        await logActivity({
            type: "finance",
            action: "Expense Recorded",
            detail: `${expense.title} — PKR ${expense.amount.toLocaleString()} paid via ${expense.paymentMethod}.`,
            amount: expense.amount,
            status: "warning", // Expenses are outflows, marked as warning/info for visibility
            userId: req.user.userId,
            pharmacyId: req.user.pharmacyId
        });

        res.json(expense);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete expense
router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        await prisma.expense.delete({
            where: { id: Number(req.params.id), pharmacyId }
        });
        res.json({ message: "Expense deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// --- LEDGERS / PAYMENTS ---

// Get Customers with outstanding dues
router.get("/ledgers/customers", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const customers = await prisma.customer.findMany({
            where: {
                pharmacyId,
                totalDue: { gt: 0 }
            },
            include: {
                sales: {
                    where: { dueAmount: { gt: 0 } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        res.json(customers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Suppliers with outstanding dues (Purchases not fully paid)
router.get("/ledgers/suppliers", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const suppliers = await prisma.supplier.findMany({
            where: { pharmacyId },
            include: {
                purchases: {
                    where: {
                        paidAmount: { lt: prisma.purchase.fields.totalAmount }
                    },
                    // Unfortunately Prisma Sqlite doesn't support complex field comparisons in 'where' directly easily without raw SQL or client side filter
                    // We'll fetch and filter if needed, or use a simpler approach
                }
            }
        });

        // Simpler approach for Sqlite: fetch purchases and calculate dues
        const allPurchases = await prisma.purchase.findMany({
            where: { pharmacyId },
            include: { supplier: true }
        });

        const suppliersWithDuesMap = new Map();

        allPurchases.forEach(p => {
            const due = p.totalAmount - p.paidAmount;
            if (due > 0) {
                if (!suppliersWithDuesMap.has(p.supplierId)) {
                    suppliersWithDuesMap.set(p.supplierId, {
                        ...p.supplier,
                        totalDue: 0,
                        purchases: []
                    });
                }
                const entry = suppliersWithDuesMap.get(p.supplierId);
                entry.totalDue += due;
                entry.purchases.push({ ...p, dueAmount: due });
            }
        });

        res.json(Array.from(suppliersWithDuesMap.values()));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Finance Summary Stats
router.get("/stats/summary", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        const totalRevenue = await prisma.sale.aggregate({
            where: { pharmacyId },
            _sum: { netAmount: true }
        });

        const totalExpenses = await prisma.expense.aggregate({
            where: { pharmacyId },
            _sum: { amount: true }
        });

        const customerDues = await prisma.customer.aggregate({
            where: { pharmacyId },
            _sum: { totalDue: true }
        });

        // Calculate Supplier Dues
        const purchases = await prisma.purchase.findMany({
            where: { pharmacyId },
            select: { totalAmount: true, paidAmount: true }
        });
        const supplierDues = purchases.reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);

        const rev = totalRevenue._sum.netAmount || 0;
        const exp = totalExpenses._sum.amount || 0;

        res.json({
            totalIncome: rev,
            totalExpense: exp,
            netProfit: rev - exp,
            customerPending: customerDues._sum.totalDue || 0,
            supplierPending: supplierDues
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get Payment History for a specific Sale or Purchase
router.get("/payments", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { saleId, purchaseId } = req.query;
        const payments = await prisma.paymentHistory.findMany({
            where: {
                pharmacyId,
                saleId: saleId ? Number(saleId) : undefined,
                purchaseId: purchaseId ? Number(purchaseId) : undefined,
            },
            orderBy: { paymentDate: 'desc' }
        });
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Record a payment (Ledger settlement)
router.post("/payments", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { amount, paymentMethod, note, saleId, purchaseId } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.paymentHistory.create({
                data: {
                    amount: Number(amount),
                    paymentMethod,
                    note,
                    saleId: saleId ? Number(saleId) : null,
                    purchaseId: purchaseId ? Number(purchaseId) : null,
                    pharmacyId
                }
            });

            // If it's for a sale, update customer totalDue
            if (saleId) {
                const sale = await tx.sale.findUnique({ where: { id: Number(saleId) } });
                if (sale) {
                    await tx.sale.update({
                        where: { id: Number(saleId) },
                        data: {
                            paidAmount: { increment: Number(amount) },
                            dueAmount: { decrement: Number(amount) }
                        }
                    });
                    if (sale.customerId) {
                        await tx.customer.update({
                            where: { id: sale.customerId },
                            data: { totalDue: { decrement: Number(amount) } }
                        });
                    }
                }
            }

            // If it's for a purchase, update purchase paidAmount
            if (purchaseId) {
                await tx.purchase.update({
                    where: { id: Number(purchaseId) },
                    data: { paidAmount: { increment: Number(amount) } }
                });
            }

            return payment;
        });

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
