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
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { customer: true }
        });

        const formattedActivity = recentTrans.map(t => ({
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

export default router;
