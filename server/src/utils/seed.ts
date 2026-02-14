import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';

export const seedSystem = async () => {
    const superAdminExists = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!superAdminExists) {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        await prisma.user.create({
            data: {
                email: 'superadmin@pharmpro.com',
                password: hashedPassword,
                name: 'PharmPro Master',
                role: 'SUPER_ADMIN',
            },
        });
        console.log('👑 Super Admin Created: superadmin@pharmpro.com / superadmin123');
    }
};
