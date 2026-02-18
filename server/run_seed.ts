import { seedSystem } from './src/utils/seed';
import prisma from './src/lib/prisma';

async function main() {
    console.log('Running seed...');
    try {
        await seedSystem();
        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
