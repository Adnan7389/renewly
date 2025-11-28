/**
 * Subscription Type Definitions
 * 
 * These types define the structure of subscription data.
 * IMPORTANT: These match the ACTUAL Prisma schema field names:
 * - cost (not price)
 * - renewalDate (not nextBillingDate)
 * - frequency (not billingCycle)
 * - description (not category)
 */

export interface Category {
    id: string;
    name: string;
    color: string | null;
    userId: string;
}

export interface Tag {
    id: string;
    name: string;
    userId: string;
}

export interface Subscription {
    id: string;              // Prisma uses cuid() which returns string
    name: string;
    cost: number;            // Actual Prisma field name
    currency: string;
    renewalDate: string;     // Actual Prisma field name (ISO date string from backend)
    frequency: SubscriptionFrequency;  // Actual Prisma field name
    description: string | null;        // Actual Prisma field name (optional)
    userId: string;          // Prisma uses string for user ID

    categoryId: string | null;
    category?: Category;
    tags?: Tag[];

    createdAt: string;       // ISO date string from backend
    updatedAt: string;       // ISO date string from backend
}

/**
 * Subscription frequency options (matches Prisma enum)
 */
export type SubscriptionFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

// Alias for backward compatibility
export type BillingCycle = SubscriptionFrequency;

/**
 * Data required to create a new subscription
 * (excludes auto-generated fields like id, userId, createdAt, updatedAt)
 */
export interface CreateSubscriptionData {
    name: string;
    cost: number;
    renewalDate: string;     // ISO date string
    frequency: SubscriptionFrequency;
    description?: string;
    categoryId?: string;
    tags?: string[];         // Array of Tag IDs
}

/**
 * Data for updating an existing subscription
 * All fields are optional since you might only update some fields
 */
export interface UpdateSubscriptionData {
    name?: string;
    cost?: number;
    renewalDate?: string;
    frequency?: SubscriptionFrequency;
    description?: string;
    categoryId?: string;
    tags?: string[];         // Array of Tag IDs
}
