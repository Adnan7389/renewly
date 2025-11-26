import cron from 'node-cron';
import { PrismaClient, User, Subscription } from '@prisma/client';
import emailService from './emailService';
import { calculateNextFutureRenewalDate } from '../utils/renewalUtils';

const prisma = new PrismaClient();

interface UserSubscriptions {
    [key: string]: {
        user: User;
        subscriptions: Subscription[];
    };
}

class CronService {
    startDailyEmailCron() {
        // Run every day at 8:00 AM UTC
        cron.schedule('0 8 * * *', async () => {
            console.log('🕐 Running daily subscription reminder job...');
            await this.sendDailyReminders();
        });

        console.log('⏰ Daily email cron job started (8:00 AM UTC)');
    }

    startRenewalUpdateCron() {
        // Run every day at 2:00 AM UTC (before email reminders)
        cron.schedule('0 2 * * *', async () => {
            console.log('🔄 Running daily renewal update job...');
            await this.updatePastRenewals();
        });

        console.log('⏰ Renewal update cron job started (2:00 AM UTC)');
    }

    async updatePastRenewals() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find all subscriptions with renewal dates in the past
            const pastSubscriptions = await prisma.subscription.findMany({
                where: {
                    renewalDate: {
                        lt: today,
                    },
                },
            });

            if (pastSubscriptions.length === 0) {
                console.log('✅ No past renewals to update');
                return;
            }

            console.log(`📋 Found ${pastSubscriptions.length} subscription(s) with past renewal dates`);

            // Update each subscription's renewal date
            const updatePromises = pastSubscriptions.map(async (subscription) => {
                try {
                    const nextRenewalDate = calculateNextFutureRenewalDate(
                        subscription.renewalDate,
                        subscription.frequency
                    );

                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: { renewalDate: nextRenewalDate },
                    });

                    console.log(
                        `✅ Updated "${subscription.name}" (${subscription.frequency}): ` +
                        `${subscription.renewalDate.toISOString().split('T')[0]} → ` +
                        `${nextRenewalDate.toISOString().split('T')[0]}`
                    );

                    return { success: true, subscription };
                } catch (error) {
                    console.error(`❌ Failed to update subscription "${subscription.name}":`, error);
                    return { success: false, subscription, error };
                }
            });

            const results = await Promise.all(updatePromises);
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            console.log(
                `🔄 Renewal update job completed. ` +
                `✅ ${successCount} updated, ❌ ${failureCount} failed`
            );
        } catch (error) {
            console.error('❌ Error in renewal update job:', error);
        }
    }

    async sendDailyReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

            // Find all subscriptions renewing tomorrow
            const subscriptionsRenewingTomorrow = await prisma.subscription.findMany({
                where: {
                    renewalDate: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow,
                    },
                },
                include: {
                    user: true,
                },
            });

            if (subscriptionsRenewingTomorrow.length === 0) {
                console.log('📭 No subscriptions renewing tomorrow');
                return;
            }

            // Group subscriptions by user
            const userSubscriptions = subscriptionsRenewingTomorrow.reduce((acc: UserSubscriptions, subscription) => {
                const userId = subscription.userId;
                if (!acc[userId]) {
                    acc[userId] = {
                        user: subscription.user,
                        subscriptions: [],
                    };
                }
                acc[userId].subscriptions.push(subscription);
                return acc;
            }, {} as UserSubscriptions);

            // Send emails to each user
            const emailPromises = Object.values(userSubscriptions).map(async ({ user, subscriptions }) => {
                try {
                    await emailService.sendRenewalReminder(user.email, user.name, subscriptions);
                    console.log(`✅ Sent reminder to ${user.email} for ${subscriptions.length} subscription(s)`);
                } catch (error) {
                    console.error(`❌ Failed to send reminder to ${user.email}:`, error);
                }
            });

            await Promise.all(emailPromises);
            console.log(`📧 Daily reminder job completed. Processed ${Object.keys(userSubscriptions).length} users.`);
        } catch (error) {
            console.error('❌ Error in daily reminder job:', error);
        }
    }

    // Method to manually trigger reminders (for testing)
    async sendTestReminders() {
        console.log('🧪 Sending test reminders...');
        await this.sendDailyReminders();
    }

    // Method to manually trigger renewal updates (for testing)
    async testRenewalUpdates() {
        console.log('🧪 Testing renewal updates...');
        await this.updatePastRenewals();
    }
}

export default new CronService();