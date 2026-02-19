import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const prisma = new PrismaClient();

import { getMachineId, verifyLicenseKey } from '../utils/license';

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

/**
 * Public endpoint to get Machine ID for activation
 */
router.get("/machine-id", async (req, res) => {
    try {
        const machineId = getMachineId();
        res.json({ machineId });
    } catch (error) {
        res.status(500).json({ error: "Failed to get machine identification." });
    }
});

/**
 * Activate Pharmacy License
 */
router.post("/license/activate", async (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
        return res.status(400).json({ error: "License key is required." });
    }

    try {
        const machineId = getMachineId();
        const payload = verifyLicenseKey(licenseKey, machineId);

        if (!payload) {
            return res.status(400).json({ error: "Invalid license key or machine mismatch." });
        }

        // Check if pharmacy exists
        const pharmacy = await prisma.pharmacy.findUnique({
            where: { id: payload.pharmacyId }
        });

        if (!pharmacy) {
            return res.status(404).json({ error: "Pharmacy associated with this license not found." });
        }

        // Update pharmacy with license info
        const updated = await prisma.pharmacy.update({
            where: { id: pharmacy.id },
            data: {
                licenseNo: licenseKey,
                licenseExpiresAt: new Date(payload.expiresAt),
                isActive: true
            }
        });

        res.json({
            message: "License activated successfully!",
            expiresAt: updated.licenseExpiresAt
        });
    } catch (error) {
        console.error("Activation error:", error);
        res.status(500).json({ error: "License activation failed." });
    }
});

// Update Pharmacy Profile (Allow updating name, location, contact)
router.put("/profile", authenticateToken, async (req: any, res) => {
    try {
        const pharmacyId = req.user.pharmacyId;
        const { name, location, contact } = req.body;

        if (!pharmacyId) {
            return res.status(404).json({ error: "Pharmacy not found for this user context." });
        }

        const updatedPharmacy = await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: {
                name,
                location,
                contact
            }
        });

        res.json(updatedPharmacy);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
