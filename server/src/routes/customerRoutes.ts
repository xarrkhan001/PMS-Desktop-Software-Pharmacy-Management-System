import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// 1. Get all customers for the active pharmacy
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const customers = await prisma.customer.findMany({
            where: { pharmacyId },
            include: {
                sales: {
                    include: {
                        items: {
                            include: {
                                medicine: {
                                    select: { name: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform data for frontend (calculate visits and spent)
        const transformedData = customers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone || "N/A",
            address: c.address,
            totalDue: c.totalDue,
            loyaltyPoints: c.loyaltyPoints,
            visits: c.sales.length,
            totalSpent: c.sales.reduce((sum, s) => sum + s.netAmount, 0),
            lastVisit: c.sales.length > 0 ? c.sales[0].createdAt : null,
            sales: c.sales
        }));

        res.json(transformedData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Add New Customer
router.post("/", authenticateToken, async (req: any, res) => {
    try {
        const { name, phone, address } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                address,
                pharmacyId
            }
        });

        res.status(201).json(customer);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Update Customer Info
router.put("/:id", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const customer = await prisma.customer.updateMany({
            where: { id: Number(id), pharmacyId },
            data: { name, phone, address }
        });

        res.json({ message: "Customer updated successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Record Debt Payment (Customer paying back Udhaar)
router.post("/:id/pay", authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const customer = await prisma.customer.findFirst({
            where: { id: Number(id), pharmacyId }
        });

        if (!customer) return res.status(404).json({ error: "Customer not found" });

        await prisma.customer.update({
            where: { id: Number(id) },
            data: { totalDue: { decrement: parseFloat(amount) } }
        });

        res.json({ message: `Payment of Rs. ${amount} recorded successfully.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete Single Customer
router.delete("/:id", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const customerId = parseInt(req.params.id);

        await prisma.customer.delete({
            where: {
                id: customerId,
                pharmacyId // Security check
            }
        });

        res.json({ message: "Customer deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Bulk Delete Customers
router.post("/bulk-delete", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "No IDs provided" });
        }

        await prisma.customer.deleteMany({
            where: {
                id: { in: ids.map((id: any) => parseInt(id)) },
                pharmacyId
            }
        });

        res.json({ message: `${ids.length} customers deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
