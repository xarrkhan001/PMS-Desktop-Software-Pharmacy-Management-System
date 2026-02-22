import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get master medicines with search
router.get("/lookup", authenticateToken, async (req: any, res) => {
    try {
        const search = (req.query.search as string) || "";

        if (search.length < 2) {
            return res.json([]);
        }

        const medicines = await prisma.masterMedicine.findMany({
            where: {
                OR: [
                    { name: { contains: search } },
                    { genericName: { contains: search } }
                ]
            },
            take: 10,
            orderBy: { name: 'asc' }
        });

        res.json(medicines);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
