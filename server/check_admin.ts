import prisma from './src/lib/prisma';

async function check() {
    console.log('Starting check...');
    try {
        const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
        console.log('Super Admin User Found:', user ? user.email : 'NONE');
    } catch (error) {
        console.error('Error during check:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Check finished.');
    }
}

check();
