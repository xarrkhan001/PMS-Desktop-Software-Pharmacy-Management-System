import express from "express";
import prisma from "../lib/prisma"; // Use Singleton
import { authenticateToken } from "../middleware/auth";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

const router = express.Router();

// Get Dashboard Stats
router.get("/stats", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const now = new Date();
        const startOfToday = startOfDay(now);
        const endOfToday = endOfDay(now);

        // 1. Quick Stats
        const totalRevenueResult = await prisma.sale.aggregate({
            where: { pharmacyId },
            _sum: { netAmount: true }
        });

        const ordersToday = await prisma.sale.count({
            where: {
                pharmacyId,
                createdAt: { gte: startOfToday, lte: endOfToday }
            }
        });

        const activeSkus = await prisma.medicine.count({
            where: { pharmacyId }
        });

        const medicines = await prisma.medicine.findMany({
            where: { pharmacyId },
        });

        // 2. Alerts (Low Stock, Near Expiry)
        const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;

        const allBatches = await prisma.stockBatch.findMany({
            where: { medicine: { pharmacyId } }
        });

        const nearExpiryCount = allBatches.filter(b => {
            const expiry = new Date(b.expiryDate);
            const diffTime = expiry.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        }).length;

        const expiredCount = allBatches.filter(b => new Date(b.expiryDate) < now).length;

        // 3. Profit & Revenue Trends (Last 7 Days)
        const sevenDaysAgo = subDays(startOfToday, 6);
        const recentSales = await prisma.sale.findMany({
            where: {
                pharmacyId,
                createdAt: { gte: sevenDaysAgo }
            },
            select: {
                netAmount: true,
                createdAt: true
            }
        });

        const dailyStats = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(now, 6 - i);
            const dayStart = startOfDay(d);
            const dayEnd = endOfDay(d);

            const salesForDay = recentSales.filter(s => {
                const sDate = new Date(s.createdAt);
                return sDate >= dayStart && sDate <= dayEnd;
            });

            const totalSales = salesForDay.reduce((sum, s) => sum + (s.netAmount || 0), 0);

            return {
                name: format(d, 'MMM dd'),
                sales: totalSales,
                profit: totalSales * 0.25 // Mock 25% profit margin for now
            };
        });

        // 4. Top Movers
        const topMovedItems = await prisma.saleItem.groupBy({
            by: ['medicineId'],
            where: { sale: { pharmacyId } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        const topProducts = await Promise.all(topMovedItems.map(async (item) => {
            const med = await prisma.medicine.findUnique({
                where: { id: item.medicineId }
            });
            return {
                name: med?.name || 'Unknown Item',
                sales: item._sum.quantity || 0,
                status: (item._sum.quantity || 0) > 50 ? "High Velocity" : "Use Caution"
            };
        }));

        // 5. Recent Activity Mock-up/Fetch
        const recentTrans = await prisma.sale.findMany({
            where: { pharmacyId },
            take: 15,
            orderBy: { createdAt: 'desc' },
            include: { customer: true }
        });

        const formattedActivity = recentTrans.map(t => ({
            id: t.id,
            name: t.manualCustomerName || t.customer?.name || "Walk-in Customer",
            email: "N/A",
            amount: t.netAmount,
            status: "Completed",
            time: format(new Date(t.createdAt), 'hh:mm a')
        }));

        res.json({
            stats: {
                totalRevenue: totalRevenueResult._sum.netAmount || 0,
                ordersToday,
                activeSkus,
                alerts: lowStockCount + nearExpiryCount + expiredCount,
                lowStockCount,
                nearExpiryCount,
                expiredCount
            },
            revenueTrend: dailyStats,
            topProducts: topProducts.length > 0 ? topProducts : [],
            recentActivity: formattedActivity
        });

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Failed to load dashboard metrics." });
    }
});

// Get Comprehensive System Alerts for All Sections
router.get("/system-alerts", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [lowStock, expiring, expired, unpaidSales, pendingPurchases, criticalLogs, pharmacy] = await Promise.all([
            // 1. Inventory: Low Stock
            prisma.medicine.findMany({
                where: { pharmacyId, stock: { lte: prisma.medicine.fields.reorderLevel } },
                select: { id: true, name: true, stock: true, reorderLevel: true }
            }),
            // 2. Inventory: Near Expiry
            prisma.stockBatch.findMany({
                where: {
                    medicine: { pharmacyId },
                    expiryDate: { gte: now, lte: thirtyDaysFromNow }
                },
                include: { medicine: { select: { name: true } } }
            }),
            // 3. Inventory: Expired
            prisma.stockBatch.findMany({
                where: {
                    medicine: { pharmacyId },
                    expiryDate: { lt: now }
                },
                include: { medicine: { select: { name: true } } }
            }),
            // 4. Finance: Customer Dues (Unpaid Sales)
            prisma.sale.findMany({
                where: { pharmacyId, dueAmount: { gt: 0 } },
                select: { id: true, invoiceNo: true, dueAmount: true, manualCustomerName: true, customer: { select: { name: true } } },
                take: 5
            }),
            // 5. Finance: Pending Supplier Payments
            prisma.purchase.findMany({
                where: { pharmacyId, status: "PENDING" },
                include: { supplier: { select: { name: true } } },
                take: 5
            }),
            // 6. Security/Operations: Critical Logs
            prisma.auditLog.findMany({
                where: { pharmacyId, status: "error" },
                orderBy: { createdAt: 'desc' },
                take: 3
            }),
            // 7. Compliance: Pharmacy License
            prisma.pharmacy.findUnique({
                where: { id: pharmacyId },
                select: { licenseExpiresAt: true, name: true }
            })
        ]);

        const alerts: any[] = [];

        // Inventory Alerts
        lowStock.forEach(m => alerts.push({
            id: `low-${m.id}`, section: 'Inventory', type: 'danger',
            title: 'Critical Low Stock',
            description: `${m.name} is at ${m.stock} units (Threshold: ${m.reorderLevel}).`,
            timestamp: now
        }));

        expiring.forEach(b => alerts.push({
            id: `exp-${b.id}`, section: 'Inventory', type: 'warning',
            title: 'Expiry Approaching',
            description: `${b.medicine.name} (Batch ${b.batchNo}) expires in ${Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days.`,
            timestamp: now
        }));

        expired.forEach(b => alerts.push({
            id: `dead-${b.id}`, section: 'Inventory', type: 'danger',
            title: 'Medicine Expired',
            description: `${b.medicine.name} (Batch ${b.batchNo}) has expired. Remove immediately.`,
            timestamp: now
        }));

        // Finance Alerts
        unpaidSales.forEach(s => alerts.push({
            id: `due-${s.id}`, section: 'Finance', type: 'warning',
            title: 'Pending Customer Due',
            description: `Payment of PKR ${s.dueAmount} is pending for ${s.manualCustomerName || s.customer?.name || 'Customer'} (Inv: ${s.invoiceNo}).`,
            timestamp: now
        }));

        pendingPurchases.forEach(p => alerts.push({
            id: `pur-${p.id}`, section: 'Purchases', type: 'info',
            title: 'Unpaid Supplier Bill',
            description: `Invoice ${p.invoiceNo || 'N/A'} for ${p.supplier.name} is still marked as PENDING.`,
            timestamp: now
        }));

        // Security Alerts
        criticalLogs.forEach(l => alerts.push({
            id: `log-${l.id}`, section: 'System', type: 'danger',
            title: 'System Error Logged',
            description: `${l.action}: ${l.detail}`,
            timestamp: l.createdAt
        }));

        // Compliance Alerts
        if (pharmacy?.licenseExpiresAt) {
            const daysLeft = Math.ceil((new Date(pharmacy.licenseExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 15) {
                alerts.push({
                    id: 'license-alert', section: 'Compliance', type: daysLeft <= 5 ? 'danger' : 'warning',
                    title: 'PMS License Expiring',
                    description: `Your terminal license for ${pharmacy.name} expires in ${daysLeft} days.`,
                    timestamp: now
                });
            }
        }

        res.json(alerts);
    } catch (error: any) {
        console.error("Alerts Error:", error);
        res.status(500).json({ error: "Failed to generate system-wide alerts." });
    }
});

export default router;
