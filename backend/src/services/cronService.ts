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

    async sendDailyReminders() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all users with their reminder preferences
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    reminderDays: true,
                },
            });

            if (users.length === 0) {
                console.log('📭 No users found');
                return;
            }

            let totalReminders = 0;
            const emailPromises: Promise<void>[] = [];

            // Process each user with their custom reminder days
            for (const user of users) {
                // Calculate the target renewal date based on user's preference
                const targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() + user.reminderDays);

                const nextDay = new Date(targetDate);
                nextDay.setDate(nextDay.getDate() + 1);

                // Find ALL subscriptions for this user
                const allSubscriptions = await prisma.subscription.findMany({
                    where: {
                        userId: user.id,
                    },
                });

                // Filter subscriptions that have their dynamic future renewal date fall on the target date
                const renewingSubscriptions = allSubscriptions.filter(sub => {
                    const nextRenewalDate = calculateNextFutureRenewalDate(sub.startDate, sub.frequency);
                    return nextRenewalDate >= targetDate && nextRenewalDate < nextDay;
                });

                // If user has subscriptions renewing on their preferred reminder day
                if (renewingSubscriptions.length > 0) {
                    // Map the subscriptions to include the dynamically calculated renewal date 
                    // so the email service can correctly display it if needed.
                    const mappedSubscriptions = renewingSubscriptions.map(sub => ({
                        ...sub,
                        renewalDate: calculateNextFutureRenewalDate(sub.startDate, sub.frequency)
                    }));

                    emailPromises.push(
                        (async () => {
                            try {
                                await emailService.sendRenewalReminder(
                                    user.email,
                                    user.name,
                                    mappedSubscriptions as any // Type override due to our dynamic injection of renewalDate
                                );
                                console.log(
                                    `✅ Sent reminder to ${user.email} for ${renewingSubscriptions.length} subscription(s) ` +
                                    `(${user.reminderDays} day${user.reminderDays > 1 ? 's' : ''} before renewal)`
                                );
                                totalReminders++;
                            } catch (error) {
                                console.error(`❌ Failed to send reminder to ${user.email}:`, error);
                            }
                        })()
                    );
                }
            }

            await Promise.all(emailPromises);

            if (totalReminders === 0) {
                console.log('📭 No subscriptions requiring reminders today');
            } else {
                console.log(`📧 Daily reminder job completed. Sent ${totalReminders} reminder(s).`);
            }
        } catch (error) {
            console.error('❌ Error in daily reminder job:', error);
        }
    }

    // Method to manually trigger reminders (for testing)
    async sendTestReminders() {
        console.log('🧪 Sending test reminders...');
        await this.sendDailyReminders();
    }
}

export default new CronService();