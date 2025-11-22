import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
        },
    });

    // Create sample subscriptions
    const subscriptions = [
        {
            name: 'Netflix',
            cost: 15.99,
            renewalDate: new Date('2024-12-28'),
            frequency: 'MONTHLY',
            description: 'Streaming service',
            userId: user.id,
        },
        {
            name: 'Spotify',
            cost: 9.99,
            renewalDate: new Date('2024-12-25'),
            frequency: 'MONTHLY',
            description: 'Music streaming',
            userId: user.id,
        },
        {
            name: 'Adobe Creative Cloud',
            cost: 52.99,
            renewalDate: new Date('2025-01-15'),
            frequency: 'MONTHLY',
            description: 'Design software suite',
            userId: user.id,
        },
    ];

    for (const subscription of subscriptions) {
        await prisma.subscription.create({ data: subscription });
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });