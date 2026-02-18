import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { verifyLicenseKey, getMachineId } from '../utils/license';

const JWT_SECRET = process.env.JWT_SECRET || 'pms_default_secret_fallback';

export const checkLicense = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Bypass certain routes (Auth Login, Hardware ID, etc.)
    const bypassPaths = [
        '/api/auth/login',
        '/api/pharmacy/license/activate',
        '/api/pharmacy/machine-id',
    ];

    if (bypassPaths.some(path => req.originalUrl.includes(path))) {
        return next();
    }

    // 2. Bypass for SUPER_ADMIN
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            if (decoded && decoded.role === 'SUPER_ADMIN') {
                return next(); // Super Admin can always access
            }
        } catch (err) {
            // Ignore error here, standard auth middleware will handle invalid tokens
        }
    }

    try {
        // 3. Get the primary pharmacy record (offline single-tenant)
        const pharmacy = await prisma.pharmacy.findFirst();

        if (!pharmacy) {
            // No pharmacy record yet? Maybe it's a fresh install. 
            // Better to allow next() so they can register.
            return next();
        }

        // 4. Check simple isActive flag
        if (!pharmacy.isActive) {
            return res.status(403).json({
                error: 'Account Suspended',
                code: 'ACCOUNT_SUSPENDED',
                message: 'Your pharmacy instance has been manually suspended.'
            });
        }

        // 5. Validate License Key
        if (!pharmacy.licenseNo) {
            return res.status(403).json({
                error: 'No License Found',
                code: 'LICENSE_MISSING',
                message: 'Please enter a valid license key to continue.'
            });
        }

        const machineId = getMachineId();
        const payload = verifyLicenseKey(pharmacy.licenseNo, machineId);

        if (!payload) {
            return res.status(403).json({
                error: 'Invalid License',
                code: 'LICENSE_INVALID',
                message: 'Your license key is invalid or for a different machine.'
            });
        }

        // 6. Check Expiry
        const expiryDate = new Date(payload.expiresAt);
        const currentDate = new Date();

        if (expiryDate < currentDate) {
            return res.status(403).json({
                error: 'License Expired',
                code: 'LICENSE_EXPIRED',
                message: `Your subscription expired on ${expiryDate.toLocaleDateString()}. Please contact support for renewal.`
            });
        }

        // License is valid!
        next();
    } catch (error) {
        console.error('License Check Error:', error);
        res.status(500).json({ error: 'Internal Server Error during license check' });
    }
};
