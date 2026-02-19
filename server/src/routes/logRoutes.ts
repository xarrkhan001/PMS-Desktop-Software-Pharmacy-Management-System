import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get Audit Logs for a Pharmacy
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { type, limit = 50, offset = 0 } = req.query;

        if (!pharmacyId) {
            return res.status(404).json({ error: "Pharmacy context not found." });
        }

        const where: any = { pharmacyId };
        if (type && type !== "all") {
            where.type = type;
        }

        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: Number(limit),
            skip: Number(offset)
        });

        const total = await prisma.auditLog.count({ where });

        res.json({
            logs,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all logs for a pharmacy
router.delete("/clear", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        if (!pharmacyId) return res.status(404).json({ error: "Pharmacy not found" });

        await prisma.auditLog.deleteMany({
            where: { pharmacyId }
        });

        res.json({ message: "All activity logs cleared successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
