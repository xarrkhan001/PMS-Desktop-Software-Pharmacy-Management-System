/**
 * MediCore Pre-Build Database Cleaner
 * 
 * Resets dev.db to a clean production state:
 * - Deletes ALL test/development data
 * - Keeps only the Super Admin user
 * 
 * Run before building the installer to ensure fresh installs
 * don't come pre-loaded with development data.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log('🧹 Cleaning database for production build...');

    try {
        // Delete in order to respect FK constraints (children first, parents last)
        const deleteOrder = [
            'auditLog', 'paymentHistory', 'saleItem', 'sale',
            'purchaseItem', 'purchase', 'stockBatch', 'medicine',
            'expenseCategory', 'expense', 'customer', 'supplier',
            'pharmacySettings', 'pharmacy', 'user'
        ];

        for (const model of deleteOrder) {
            if (!prisma[model]) continue;
            try {
                const result = await prisma[model].deleteMany({});
                console.log(`   ✅ Cleared ${model}: ${result.count} records deleted`);
            } catch (e) {
                console.log(`   ⚠️  Skipped ${model}: ${e.message.split('\n')[0]}`);
            }
        }

        // Re-create ONLY the Super Admin
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        await prisma.user.create({
            data: {
                email: 'superadmin01@pharmacy.com',
                password: hashedPassword,
                name: 'PharmPro Master',
                role: 'SUPER_ADMIN',
            }
        });
        console.log('   👑 Super Admin re-created: superadmin01@pharmacy.com / superadmin123');
        console.log('\n✅ Database is clean and ready for production build!');
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDatabase();
