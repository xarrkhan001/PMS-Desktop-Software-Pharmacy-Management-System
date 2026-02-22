import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";
import { logActivity } from "../utils/logger";

const router = express.Router();
const prisma = new PrismaClient();

// Get settings for a pharmacy
router.get("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        if (!pharmacyId) return res.status(404).json({ error: "Pharmacy not found" });

        let settings = await prisma.pharmacySettings.findUnique({
            where: { pharmacyId }
        });

        // If no settings exist yet, create default settings
        if (!settings) {
            settings = await prisma.pharmacySettings.create({
                data: { pharmacyId }
            });
        }

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update settings
router.put("/", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const {
            billHeader,
            billFooter,
            showPharmacyLogo,
            showTaxId,
            showLicense,
            defaultTaxRate,
            nearExpiryDays,
            lowStockThreshold
        } = req.body;

        if (!pharmacyId) return res.status(404).json({ error: "Pharmacy not found" });

        const settings = await prisma.pharmacySettings.upsert({
            where: { pharmacyId },
            update: {
                billHeader,
                billFooter,
                showPharmacyLogo,
                showTaxId,
                showLicense,
                defaultTaxRate: parseFloat(defaultTaxRate) || 0,
                nearExpiryDays: parseInt(nearExpiryDays) || 30,
                lowStockThreshold: parseInt(lowStockThreshold) || 10
            },
            create: {
                pharmacyId,
                billHeader,
                billFooter,
                showPharmacyLogo,
                showTaxId,
                showLicense,
                defaultTaxRate: parseFloat(defaultTaxRate) || 0,
                nearExpiryDays: parseInt(nearExpiryDays) || 30,
                lowStockThreshold: parseInt(lowStockThreshold) || 10
            }
        });

        // Log the activity
        await logActivity({
            type: "system",
            action: "Settings Updated",
            detail: "System configurations and billing preferences were updated.",
            status: "info",
            userId: req.user.id,
            pharmacyId: pharmacyId
        });

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
