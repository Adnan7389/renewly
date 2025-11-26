import { SubscriptionFrequency } from '@prisma/client';

/**
 * Calculate the next renewal date based on the current renewal date and frequency
 * @param currentDate - The current renewal date
 * @param frequency - The billing frequency (WEEKLY, MONTHLY, QUARTERLY, YEARLY)
 * @returns The next renewal date
 */
export function calculateNextRenewalDate(
    currentDate: Date,
    frequency: SubscriptionFrequency
): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
        case 'WEEKLY':
            // Add 7 days
            nextDate.setDate(nextDate.getDate() + 7);
            break;

        case 'MONTHLY':
            // Add 1 month
            // Handle edge case: if current date is the last day of the month,
            // the next renewal should be the last day of the next month
            const currentDay = currentDate.getDate();
            nextDate.setMonth(nextDate.getMonth() + 1);

            // If the day changed (e.g., Jan 31 -> Mar 3), set to last day of previous month
            if (nextDate.getDate() !== currentDay) {
                nextDate.setDate(0); // Sets to last day of previous month
            }
            break;

        case 'QUARTERLY':
            // Add 3 months
            const currentDayQuarterly = currentDate.getDate();
            nextDate.setMonth(nextDate.getMonth() + 3);

            // Handle month-end edge cases
            if (nextDate.getDate() !== currentDayQuarterly) {
                nextDate.setDate(0);
            }
            break;

        case 'YEARLY':
            // Add 1 year
            const currentMonth = currentDate.getMonth();
            const currentDayYearly = currentDate.getDate();

            nextDate.setFullYear(nextDate.getFullYear() + 1);

            // Handle leap year edge case (Feb 29 -> Feb 28 in non-leap years)
            if (currentMonth === 1 && currentDayYearly === 29) {
                // Check if next year is not a leap year
                const nextYear = nextDate.getFullYear();
                const isLeapYear = (nextYear % 4 === 0 && nextYear % 100 !== 0) || (nextYear % 400 === 0);

                if (!isLeapYear && nextDate.getDate() !== 29) {
                    nextDate.setMonth(1); // February
                    nextDate.setDate(28);
                }
            }
            break;

        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDate;
}

/**
 * Calculate the next renewal date by advancing from the current date
 * until it's in the future. Handles cases where multiple periods have passed.
 * @param currentDate - The current renewal date (possibly in the past)
 * @param frequency - The billing frequency
 * @returns The next renewal date in the future
 */
export function calculateNextFutureRenewalDate(
    currentDate: Date,
    frequency: SubscriptionFrequency
): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextDate = new Date(currentDate);

    // Keep advancing the renewal date until it's in the future
    while (nextDate <= today) {
        nextDate = calculateNextRenewalDate(nextDate, frequency);
    }

    return nextDate;
}
