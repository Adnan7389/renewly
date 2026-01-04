import { PrismaClient } from '@prisma/client';
import cronService from './src/services/cronService';

const prisma = new PrismaClient();

async function testCronPreferences() {
    console.log('🧪 Starting Cron Preference Test...');

    try {
        // 1. Create a test user with 3-day reminder preference
        const email = `cron_test_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                name: 'Cron Test User',
                password: 'hashed_password',
                reminderDays: 3
            }
        });
        console.log(`👤 Created test user: ${user.email} with reminderDays: ${user.reminderDays}`);

        // 2. Create a subscription renewing in 3 days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const renewalDate = new Date(today);
        renewalDate.setDate(renewalDate.getDate() + 3); // 3 days from now

        const subscription = await prisma.subscription.create({
            data: {
                name: 'Test Subscription (3 days)',
                cost: 9.99,
                currency: 'USD',
                frequency: 'MONTHLY',
                startDate: renewalDate,
                userId: user.id
            }
        });
        console.log(`Hz Created subscription renewing on: ${subscription.startDate.toISOString().split('T')[0]}`);

        // 3. Run the cron job
        console.log('🚀 Running sendDailyReminders()...');

        // Capture console.log to verify output
        const originalLog = console.log;
        let logOutput = '';
        console.log = (...args) => {
            logOutput += args.join(' ') + '\n';
            originalLog(...args);
        };

        await cronService.sendDailyReminders();

        // Restore console.log
        console.log = originalLog;

        // 4. Verify the output
        if (logOutput.includes(`Sent reminder to ${user.email}`)) {
            console.log('✅ SUCCESS: Reminder sent correctly!');
        } else {
            console.log('❌ FAILURE: Reminder NOT sent.');
            console.log('Debug Output:', logOutput);
            process.exit(1);
        }

        // Cleanup
        await prisma.subscription.delete({ where: { id: subscription.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log('🧹 Cleanup complete');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testCronPreferences();
