import express from "express";
import prisma from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

const router = express.Router();

// Get Comprehensive Reports Data
router.get("/analytics", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { period } = req.query; // 'this-month' or 'last-month'

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === 'last-month') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        } else {
            // Default: This Month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        // Fetch Pharmacy Info for branding/stamp
        const pharmacy = await prisma.pharmacy.findUnique({
            where: { id: pharmacyId },
            select: { name: true, location: true, contact: true }
        });

        // 1. Summary Cards (Filtered by period)
        const totalRevenue = await prisma.sale.aggregate({
            where: { pharmacyId, createdAt: { gte: startDate, lte: endDate } },
            _sum: { netAmount: true }
        });

        const totalExpenses = await prisma.expense.aggregate({
            where: { pharmacyId, date: { gte: startDate, lte: endDate } },
            _sum: { amount: true }
        });

        const newCustomersPeriod = await prisma.customer.count({
            where: {
                pharmacyId,
                createdAt: { gte: startDate, lte: endDate }
            }
        });

        const medicinesSold = await prisma.saleItem.aggregate({
            where: { sale: { pharmacyId, createdAt: { gte: startDate, lte: endDate } } },
            _sum: { quantity: true }
        });

        // 2. Sales Trend (Dynamic based on period)
        // For trend, we show daily data of that month
        const trendSales = await prisma.sale.findMany({
            where: { pharmacyId, createdAt: { gte: startDate, lte: endDate } },
            select: { netAmount: true, createdAt: true }
        });

        // Generate data points for the trend
        const daysInMonth = endDate.getDate();
        const dailyTrend = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dStart = new Date(startDate.getFullYear(), startDate.getMonth(), i, 0, 0, 0);
            const dEnd = new Date(startDate.getFullYear(), startDate.getMonth(), i, 23, 59, 59);

            const daySales = trendSales.filter(s => {
                const sDate = new Date(s.createdAt);
                return sDate >= dStart && sDate <= dEnd;
            });

            dailyTrend.push({
                name: i.toString(),
                sales: daySales.reduce((sum, s) => sum + (s.netAmount || 0), 0),
                orders: daySales.length
            });
        }

        // 3. Category Distribution (Based on period sales)
        const soldItems = await prisma.saleItem.findMany({
            where: { sale: { pharmacyId, createdAt: { gte: startDate, lte: endDate } } },
            include: { medicine: true }
        });

        const categoryMap: Record<string, number> = {};
        soldItems.forEach(item => {
            const cat = item.medicine.category;
            categoryMap[cat] = (categoryMap[cat] || 0) + item.quantity;
        });

        const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
        const formattedCategoryData = categoryDistribution.map((item, index) => ({
            ...item,
            color: colors[index % colors.length]
        }));

        res.json({
            pharmacy,
            period: period === 'last-month' ? format(startDate, 'MMMM yyyy') : 'Current Month',
            summary: {
                totalRevenue: totalRevenue._sum.netAmount || 0,
                netProfit: (totalRevenue._sum.netAmount || 0) - (totalExpenses._sum.amount || 0),
                newCustomers: newCustomersPeriod,
                medicinesSold: medicinesSold._sum.quantity || 0
            },
            salesTrend: dailyTrend,
            categoryData: formattedCategoryData
        });

    } catch (error: any) {
        console.error("Reports Error:", error);
        res.status(500).json({ error: "Failed to generate report data." });
    }
});

export default router;
