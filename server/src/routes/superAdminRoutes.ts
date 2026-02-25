import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to ensure only Super Admin can access these routes
const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Only Super Admin can do this' });
    }
    next();
};

router.use(authenticateToken);
router.use(isSuperAdmin);

// Get All Pharmacies
router.get('/pharmacies', async (req: any, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            include: { users: { where: { role: 'ADMIN' }, select: { id: true, name: true, email: true } } }
        });
        res.json(pharmacies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pharmacies' });
    }
});

// Get Pharmacy Analytics & Activity Data
router.get('/pharmacy-analytics', async (req: any, res) => {
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            include: {
                users: {
                    where: { role: 'ADMIN' },
                    select: { id: true, name: true, email: true }
                }
            }
        });

        const analyticsData = await Promise.all(
            pharmacies.map(async (pharmacy) => {
                // Get sales data
                const totalSales = await prisma.sale.count({
                    where: { pharmacyId: pharmacy.id }
                });

                const todaySales = await prisma.sale.count({
                    where: {
                        pharmacyId: pharmacy.id,
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                });

                // Get revenue data
                const totalRevenue = await prisma.sale.aggregate({
                    where: { pharmacyId: pharmacy.id },
                    _sum: { totalAmount: true }
                });

                const todayRevenue = await prisma.sale.aggregate({
                    where: {
                        pharmacyId: pharmacy.id,
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    },
                    _sum: { totalAmount: true }
                });

                // Get inventory stats
                const totalMedicines = await prisma.medicine.count({
                    where: { pharmacyId: pharmacy.id }
                });

                const lowStockItems = await prisma.medicine.count({
                    where: {
                        pharmacyId: pharmacy.id,
                        stock: { lte: 10 }
                    }
                });

                // Get customer count
                const totalCustomers = await prisma.customer.count({
                    where: { pharmacyId: pharmacy.id }
                });

                // Get recent transactions (last 5)
                const recentTransactions = await prisma.sale.findMany({
                    where: { pharmacyId: pharmacy.id },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        customer: {
                            select: { name: true }
                        }
                    }
                });

                // Get last activity timestamp
                const lastActivity = await prisma.sale.findFirst({
                    where: { pharmacyId: pharmacy.id },
                    orderBy: { createdAt: 'desc' },
                    select: { createdAt: true }
                });

                return {
                    pharmacyId: pharmacy.id,
                    pharmacyName: pharmacy.name,
                    isActive: pharmacy.isActive,
                    licenseExpiry: pharmacy.licenseExpiresAt,
                    owner: pharmacy.users[0],
                    stats: {
                        totalSales,
                        todaySales,
                        totalRevenue: totalRevenue._sum.totalAmount || 0,
                        todayRevenue: todayRevenue._sum.totalAmount || 0,
                        totalMedicines,
                        lowStockItems,
                        totalCustomers
                    },
                    recentTransactions,
                    lastActivity: lastActivity?.createdAt || null
                };
            })
        );

        res.json(analyticsData);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch pharmacy analytics' });
    }
});


// Create Pharmacy
router.post('/create-pharmacy', async (req: any, res) => {
    const { pharmacyName, ownerEmail, ownerPassword, ownerName, licenseMonths, paidAmount } = req.body;

    // Comprehensive Validation
    const errors: string[] = [];

    // Validate Pharmacy Name
    if (!pharmacyName || typeof pharmacyName !== 'string' || pharmacyName.trim().length < 3) {
        errors.push('Pharmacy name must be at least 3 characters');
    } else if (pharmacyName.trim().length > 50) {
        errors.push('Pharmacy name cannot exceed 50 characters');
    }

    // Validate Owner Name
    if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 3) {
        errors.push('Owner name must be at least 3 characters');
    } else if (ownerName.trim().length > 50) {
        errors.push('Owner name cannot exceed 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(ownerName.trim())) {
        errors.push('Owner name can only contain letters and spaces');
    }

    // Validate Email
    if (!ownerEmail || typeof ownerEmail !== 'string' || ownerEmail.trim().length === 0) {
        errors.push('Email is required');
    } else if (!ownerEmail.includes('@')) {
        errors.push('Invalid email format');
    } else {
        const emailUsername = ownerEmail.split('@')[0];
        if (emailUsername.length < 3) {
            errors.push('Email username must be at least 3 characters');
        } else if (emailUsername.length > 30) {
            errors.push('Email username cannot exceed 30 characters');
        } else if (!/^[a-z0-9]+$/.test(emailUsername)) {
            errors.push('Email username can only contain lowercase letters and numbers');
        }
    }

    // Validate Password
    if (!ownerPassword || typeof ownerPassword !== 'string' || ownerPassword.length < 8) {
        errors.push('Password must be at least 8 characters');
    } else if (ownerPassword.length > 20) {
        errors.push('Password cannot exceed 20 characters');
    }

    // Validate License Months
    if (!req.body.licenseMinutes) {
        const months = Number(licenseMonths);
        if (isNaN(months) || months < 1) {
            errors.push('License months must be at least 1');
        } else if (months > 36) {
            errors.push('License months cannot exceed 36');
        }
    }

    // Validate Paid Amount
    const amount = Number(paidAmount);
    if (isNaN(amount) || amount < 0) {
        errors.push('Payment amount cannot be negative');
    } else if (amount > 1000000) {
        errors.push('Payment amount cannot exceed Rs. 1,000,000');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    try {
        const startDate = new Date();
        const expiryDate = new Date();

        if (req.body.licenseMinutes) {
            expiryDate.setMinutes(expiryDate.getMinutes() + Number(req.body.licenseMinutes));
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + (Number(licenseMonths) || 12));
        }

        const result = await prisma.$transaction(async (tx) => {
            // Generate a temporary first-time activation key
            // Note: We'll calculate expiry here and use it for the key
            const firstTimeKey = generateLicenseKey(9999, expiryDate, 'OPEN'); // Temp ID, will replace below

            const pharmacy = await tx.pharmacy.create({
                data: {
                    name: pharmacyName.trim(),
                    licenseStartedAt: startDate,
                    licenseExpiresAt: expiryDate,
                    isActive: false, // Must be activated with the key
                    licenseNo: firstTimeKey, // Store it initially so Admin can retrieve it
                    subscriptionFee: Number(paidAmount) || 0,
                    totalPaid: Number(paidAmount) || 0
                },
            });

            // Regenerate key with ACTUAL pharmacy ID for security
            const finalKey = generateLicenseKey(pharmacy.id, expiryDate, 'OPEN');

            // Update with the final ID-linked key
            const updatedPharmacy = await tx.pharmacy.update({
                where: { id: pharmacy.id },
                data: { licenseNo: finalKey }
            });

            const hashedPassword = await bcrypt.hash(ownerPassword, 10);
            await tx.user.create({
                data: {
                    email: ownerEmail.toLowerCase().trim(),
                    password: hashedPassword,
                    name: ownerName.trim(),
                    role: 'ADMIN',
                    pharmacyId: pharmacy.id
                },
            });

            // Log the creation in Audit Logs for Super Admin history
            await tx.auditLog.create({
                data: {
                    type: 'system',
                    action: 'Pharmacy Created',
                    detail: `New pharmacy "${pharmacyName}" created with key: ${finalKey}`,
                    status: 'success',
                    pharmacyId: pharmacy.id,
                    userId: req.user.id // The Super Admin who created it
                }
            });

            return { pharmacy: updatedPharmacy, activationKey: finalKey };
        });

        res.json({
            message: 'Pharmacy onboarded successfully. Please provide the activation key to the pharmacy owner.',
            data: result
        });
    } catch (error: any) {
        console.error("Pharmacy creation error:", error);
        res.status(400).json({
            error: 'Failed to create pharmacy',
            details: error.message || 'Unknown database error'
        });
    }
});

import { generateLicenseKey } from '../utils/license';

// Generate License Key for a Machine
router.post('/generate-license', async (req: any, res) => {
    const { pharmacyId, extraMonths, machineId } = req.body;

    try {
        const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
        if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (Number(extraMonths) || 12));

        const licenseKey = generateLicenseKey(pharmacyId, expiryDate, machineId);

        res.json({
            message: 'License key generated successfully',
            key: licenseKey,
            expiryDate: expiryDate
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate license key' });
    }
});

// Renew/Manage License
router.post('/renew-license', async (req: any, res) => {
    const { pharmacyId, extraMonths, isActive, paidAmount, machineId } = req.body;

    try {
        const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
        if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

        const now = new Date();
        const newExpiry = new Date(pharmacy.licenseExpiresAt || now);

        if (req.body.extraMinutes) {
            newExpiry.setMinutes(newExpiry.getMinutes() + Number(req.body.extraMinutes));
        } else if (extraMonths) {
            newExpiry.setMonth(newExpiry.getMonth() + Number(extraMonths));
        }

        const amountToAdd = Number(paidAmount) || 0;

        // If machineId is provided, generate a new key and save it automatically
        let licenseKey = pharmacy.licenseNo;
        if (machineId) {
            licenseKey = generateLicenseKey(pharmacyId, newExpiry, machineId);
        }

        const updated = await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: {
                licenseExpiresAt: newExpiry,
                licenseStartedAt: now,
                licenseNo: licenseKey,
                isActive: isActive !== undefined ? isActive : pharmacy.isActive,
                subscriptionFee: amountToAdd > 0 ? amountToAdd : pharmacy.subscriptionFee,
                totalPaid: { increment: amountToAdd }
            }
        });

        res.json({
            message: 'License biological updated successfully',
            newExpiry: updated.licenseExpiresAt,
            newStart: updated.licenseStartedAt,
            newKey: licenseKey
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update license' });
    }
});

// Update Pharmacy Credentials (Name, Email, Password)
router.put('/update-pharmacy-credentials', async (req: any, res) => {
    const { pharmacyId, pharmacyName, ownerEmail, ownerPassword, ownerName } = req.body;

    try {
        // 1. Update Pharmacy Details
        await prisma.pharmacy.update({
            where: { id: pharmacyId },
            data: { name: pharmacyName }
        });

        // 2. Update Admin User Credentials
        const adminUser = await prisma.user.findFirst({
            where: { pharmacyId: pharmacyId, role: 'ADMIN' }
        });

        if (adminUser) {
            const dataToUpdate: any = {
                email: ownerEmail,
                name: ownerName
            };

            if (ownerPassword && ownerPassword.trim().length > 0) {
                const hashedPassword = await bcrypt.hash(ownerPassword, 10);
                dataToUpdate.password = hashedPassword;
            }

            await prisma.user.update({
                where: { id: adminUser.id },
                data: {
                    ...dataToUpdate,
                    tokenVersion: { increment: 1 }
                }
            });
        }

        res.json({ message: 'Pharmacy credentials updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update credentials. Email might be in use.' });
    }
});

// Permanent Delete
router.delete('/pharmacy/:id', async (req: any, res) => {
    const { id } = req.params;
    const pharmacyId = Number(id);

    try {
        // Use a transaction to ensure everything is deleted correctly and safely
        await prisma.$transaction(async (tx) => {
            // 1. Delete all SaleItems related to sales of this pharmacy
            // SaleItems are linked to Sales, and Sales are linked to Pharmacy
            await tx.saleItem.deleteMany({
                where: {
                    sale: { pharmacyId: pharmacyId }
                }
            });

            // 2. Delete all Sales
            await tx.sale.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 3. Delete all PurchaseItems related to purchases of this pharmacy
            await tx.purchaseItem.deleteMany({
                where: {
                    purchase: { pharmacyId: pharmacyId }
                }
            });

            // 4. Delete all Purchases
            await tx.purchase.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 5. Delete all StockBatches
            await tx.stockBatch.deleteMany({
                where: {
                    medicine: { pharmacyId: pharmacyId }
                }
            });

            // 6. Delete all Medicines
            await tx.medicine.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 7. Delete all Customers
            await tx.customer.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 8. Delete all Suppliers
            await tx.supplier.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 9. Delete all Users
            await tx.user.deleteMany({
                where: { pharmacyId: pharmacyId }
            });

            // 10. Finally, delete the Pharmacy itself
            await tx.pharmacy.delete({
                where: { id: pharmacyId }
            });
        });

        res.json({ message: 'Pharmacy and all related data permanently deleted' });
    } catch (error) {
        console.error('Delete pharmacy error:', error);
        res.status(500).json({ error: 'Failed to delete pharmacy' });
    }
});

// Database Explorer - Fetch raw data from any table
router.get('/explorer/:table', async (req: any, res) => {
    const { table } = req.params;

    // Mapping of table names to prisma models
    const modelMapping: { [key: string]: any } = {
        'pharmacies': prisma.pharmacy,
        'users': prisma.user,
        'medicines': prisma.medicine,
        'batches': prisma.stockBatch,
        'sales': prisma.sale,
        'sale-items': prisma.saleItem,
        'purchases': prisma.purchase,
        'purchase-items': prisma.purchaseItem,
        'suppliers': prisma.supplier,
        'customers': prisma.customer,
        'expenses': prisma.expense,
        'expense-categories': prisma.expenseCategory,
        'logs': prisma.auditLog,
        'settings': prisma.pharmacySettings,
        'payments': prisma.paymentHistory
    };

    const model = modelMapping[table];

    if (!model) {
        return res.status(400).json({ error: 'Invalid table name' });
    }

    try {
        const data = await model.findMany({
            take: 200, // Limit for safety
            orderBy: { id: 'desc' }
        });
        res.json(data);
    } catch (error: any) {
        console.error(`Explorer error (${table}):`, error);
        res.status(500).json({ error: `Failed to fetch data from ${table}: ${error.message}` });
    }
});

export default router;
