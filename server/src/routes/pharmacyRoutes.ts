import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

// Get Pharmacy Profile Details (Read-only for owner)
router.get("/profile", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;

        if (!pharmacyId) {
            return res.status(404).json({ error: "Pharmacy not found for this user context." });
        }

        const pharmacy = await prisma.pharmacy.findUnique({
            where: { id: pharmacyId },
            include: {
                users: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                        id: true
                    }
                }
            }
        });

        if (!pharmacy) {
            return res.status(404).json({ error: "Pharmacy not found." });
        }

        res.json(pharmacy);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
