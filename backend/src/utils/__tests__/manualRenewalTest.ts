/**
 * Manual test script for renewal update functionality
 * This script creates a test subscription with a past renewal date
 * and then triggers the renewal update to verify it works correctly.
 * 
 * Run with: npx ts-node src/utils/__tests__/manualRenewalTest.ts
 */

import { PrismaClient } from '@prisma/client';
import { calculateNextFutureRenewalDate } from '../renewalUtils';

const prisma = new PrismaClient();

async function runManualTest() {
    console.log('🧪 Manual Renewal Update Test\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Find or create a test user
        console.log('\n📝 Step 1: Finding test user...');
        let testUser = await prisma.user.findFirst({
            where: { email: 'test@example.com' }
        });

        if (!testUser) {
            console.log('⚠️  Test user not found. Please run the seed script first:');
            console.log('   npm run db:seed');
            return;
        }

        console.log(`✅ Found test user: ${testUser.email}`);

        // Step 2: Create test subscriptions with past dates
        console.log('\n📝 Step 2: Creating test subscriptions with past dates...');

        const testSubscriptions = [
            {
                name: 'Test Monthly Subscription',
                cost: 9.99,
                startDate: new Date('2024-10-15'), // Past date
                frequency: 'MONTHLY' as const,
                userId: testUser.id
            },
            {
                name: 'Test Weekly Subscription',
                cost: 4.99,
                startDate: new Date('2024-11-01'), // Past date
                frequency: 'WEEKLY' as const,
                userId: testUser.id
            },
            {
                name: 'Test Yearly Subscription',
                cost: 99.99,
                startDate: new Date('2023-11-26'), // Past date (1 year ago)
                frequency: 'YEARLY' as const,
                userId: testUser.id
            }
        ];

        // Delete any existing test subscriptions
        await prisma.subscription.deleteMany({
            where: {
                userId: testUser.id,
                name: {
                    startsWith: 'Test '
                }
            }
        });

        // Create new test subscriptions
        for (const sub of testSubscriptions) {
            await prisma.subscription.create({ data: sub });
            console.log(`   ✅ Created: ${sub.name} (${sub.frequency}) - ${sub.startDate.toISOString().split('T')[0]}`);
        }

        // Step 3: Display subscriptions before update
        console.log('\n📝 Step 3: Subscriptions BEFORE renewal update:');
        const beforeSubs = await prisma.subscription.findMany({
            where: { userId: testUser.id, name: { startsWith: 'Test ' } },
            orderBy: { name: 'asc' }
        });

        beforeSubs.forEach(sub => {
            console.log(`   📅 ${sub.name}: ${sub.startDate.toISOString().split('T')[0]} (${sub.frequency})`);
        });

        // Step 4: The system now calculates renewals dynamically
        console.log('\n📝 Step 4: Projecting dynamic renewal dates...');
        console.log('   (No database mutation required, projecting next dates from startDate anchor)');
        console.log('-'.repeat(60));

        const projectedSubs = beforeSubs.map(sub => ({
            ...sub,
            nextRenewalDate: calculateNextFutureRenewalDate(sub.startDate, sub.frequency)
        }));

        projectedSubs.forEach(sub => {
            const isFuture = sub.nextRenewalDate > new Date();
            const icon = isFuture ? '✅' : '❌';
            console.log(`   ${icon} ${sub.name}: ${sub.nextRenewalDate.toISOString().split('T')[0]} (${sub.frequency})`);
        });

        // Step 6: Verify all projected dates are in the future
        console.log('\n📝 Step 6: Verification:');
        const allFuture = projectedSubs.every(sub => sub.nextRenewalDate > new Date());

        if (allFuture) {
            console.log('   ✅ SUCCESS: All renewal dates are now in the future!');
        } else {
            console.log('   ❌ FAILURE: Some renewal dates are still in the past');
        }

        // Cleanup
        console.log('\n📝 Step 7: Cleanup (deleting test subscriptions)...');
        await prisma.subscription.deleteMany({
            where: {
                userId: testUser.id,
                name: { startsWith: 'Test ' }
            }
        });
        console.log('   ✅ Test subscriptions deleted');

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Manual test completed!\n');

    } catch (error) {
        console.error('\n❌ Error during manual test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
runManualTest();
