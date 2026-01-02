import { SubscriptionFrequency } from '@prisma/client';

/**
 * Calculate the next renewal date based on the current date and frequency.
 * This is a one-step advancement.
 * @param currentDate - The date to advance from
 * @param frequency - The billing frequency
 * @returns The next renewal date (1 period later)
 */
export function calculateNextRenewalDate(
    currentDate: Date,
    frequency: SubscriptionFrequency
): Date {
    const nextDate = new Date(currentDate);
    nextDate.setHours(0, 0, 0, 0);

    switch (frequency) {
        case 'WEEKLY':
            nextDate.setDate(nextDate.getDate() + 7);
            break;

        case 'MONTHLY': {
            const currentDay = nextDate.getDate();
            nextDate.setMonth(nextDate.getMonth() + 1);
            // Handle end-of-month drift
            if (nextDate.getDate() !== currentDay) {
                nextDate.setDate(0);
            }
            break;
        }

        case 'QUARTERLY': {
            const currentDay = nextDate.getDate();
            nextDate.setMonth(nextDate.getMonth() + 3);
            if (nextDate.getDate() !== currentDay) {
                nextDate.setDate(0);
            }
            break;
        }

        case 'YEARLY': {
            const currentMonth = nextDate.getMonth();
            const currentDay = nextDate.getDate();
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            // Handle leap year (Feb 29 -> Feb 28)
            if (currentMonth === 1 && currentDay === 29 && nextDate.getMonth() !== 1) {
                nextDate.setDate(0);
            }
            break;
        }

        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDate;
}

/**
 * Calculate the next valid renewal date in the future based on an anchor start date.
 * Avoids iterative loops to prevent date drift.
 * @param anchorDate - The original start date of the subscription
 * @param frequency - The billing frequency
 * @returns The next renewal date in the future
 */
export function calculateNextFutureRenewalDate(
    anchorDate: Date,
    frequency: SubscriptionFrequency
): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const anchor = new Date(anchorDate);
    anchor.setHours(0, 0, 0, 0);

    // If anchor is already in the future, return it
    if (anchor > today) {
        return new Date(anchor);
    }

    let nextDate = new Date(anchor);

    switch (frequency) {
        case 'WEEKLY': {
            const daysDiff = Math.floor((today.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
            const weeksDiff = Math.floor(daysDiff / 7);
            
            nextDate.setDate(anchor.getDate() + (weeksDiff * 7));
            if (nextDate <= today) {
                nextDate.setDate(nextDate.getDate() + 7);
            }
            break;
        }

        case 'MONTHLY': {
            const monthsDiff = (today.getFullYear() - anchor.getFullYear()) * 12 + (today.getMonth() - anchor.getMonth());
            
            nextDate.setMonth(anchor.getMonth() + monthsDiff);
            
            if (nextDate <= today) {
                nextDate = new Date(anchor);
                nextDate.setMonth(anchor.getMonth() + monthsDiff + 1);
            }
            
            // Handle end-of-month edge cases (e.g., Jan 31 -> Feb 28)
            if (nextDate.getDate() !== anchor.getDate()) {
                nextDate.setDate(0); 
            }
            break;
        }

        case 'QUARTERLY': {
            const monthsDiff = (today.getFullYear() - anchor.getFullYear()) * 12 + (today.getMonth() - anchor.getMonth());
            const quartersDiff = Math.floor(monthsDiff / 3);
            
            nextDate.setMonth(anchor.getMonth() + (quartersDiff * 3));
            
            if (nextDate <= today) {
                nextDate = new Date(anchor);
                nextDate.setMonth(anchor.getMonth() + ((quartersDiff + 1) * 3));
            }
            
            // Handle end-of-month edge cases
            if (nextDate.getDate() !== anchor.getDate()) {
                nextDate.setDate(0); 
            }
            break;
        }

        case 'YEARLY': {
            const yearsDiff = today.getFullYear() - anchor.getFullYear();
            
            nextDate.setFullYear(anchor.getFullYear() + yearsDiff);
            
            if (nextDate <= today) {
                nextDate = new Date(anchor);
                nextDate.setFullYear(anchor.getFullYear() + yearsDiff + 1);
            }
            
            // Handle leap year edge case (Feb 29 -> Feb 28 in non-leap years)
            if (anchor.getMonth() === 1 && anchor.getDate() === 29) {
                if (nextDate.getMonth() !== 1) {
                    nextDate.setDate(0); // Sets to Feb 28
                }
            }
            break;
        }

        default:
            throw new Error(`Unknown frequency: ${frequency}`);
    }

    return nextDate;
}
