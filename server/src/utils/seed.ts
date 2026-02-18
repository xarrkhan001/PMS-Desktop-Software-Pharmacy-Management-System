import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export const seedSystem = async () => {
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const targetEmail = 'superadmin01@pharmacy.com';
    const defaultPassword = 'superadmin123';

    if (!superAdmin) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await prisma.user.create({
            data: {
                email: targetEmail,
                password: hashedPassword,
                name: 'PharmPro Master',
                role: 'SUPER_ADMIN',
            },
        });
        console.log(`👑 Super Admin Created: ${targetEmail} / ${defaultPassword}`);
    } else if (superAdmin.email !== targetEmail) {
        // Update existing super admin email if it's different
        await prisma.user.update({
            where: { id: superAdmin.id },
            data: { email: targetEmail }
        });
        console.log(`👑 Super Admin Email Updated: ${targetEmail}`);
    }
};
