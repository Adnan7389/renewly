import { PrismaClient, Subscription, SubscriptionFrequency } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normalize subscription cost to monthly equivalent
 */
export const normalizeToMonthly = (cost: number, frequency: SubscriptionFrequency): number => {
    switch (frequency) {
        case 'WEEKLY':
            return cost * 4.33; // Average weeks per month
        case 'MONTHLY':
            return cost;
        case 'QUARTERLY':
            return cost / 3;
        case 'YEARLY':
            return cost / 12;
        default:
            return cost;
    }
};

/**
 * Calculate monthly spending for a given time range
 */
export const calculateMonthlySpending = async (userId: string, months: number = 12) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
            category: true,
        },
    });

    const now = new Date();
    const monthlyData: Array<{
        month: string;
        label: string;
        total: number;
        subscriptionCount: number;
    }> = [];

    // Generate data for the last N months
    for (let i = months - 1; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        let monthTotal = 0;
        let activeSubscriptions = 0;

        subscriptions.forEach(sub => {
            // Check if subscription was created before or during this month
            if (new Date(sub.createdAt) <= targetDate) {
                monthTotal += normalizeToMonthly(sub.cost, sub.frequency);
                activeSubscriptions++;
            }
        });

        monthlyData.push({
            month: monthKey,
            label: monthLabel,
            total: Math.round(monthTotal * 100) / 100,
            subscriptionCount: activeSubscriptions,
        });
    }

    // Calculate summary statistics
    const totals = monthlyData.map(m => m.total);
    const average = totals.reduce((a, b) => a + b, 0) / totals.length;
    const highest = Math.max(...totals);
    const highestMonth = monthlyData.find(m => m.total === highest);

    return {
        range: `last_${months}_months`,
        currency: 'USD',
        data: monthlyData,
        summary: {
            average: Math.round(average * 100) / 100,
            highest: {
                month: highestMonth?.label || '',
                amount: highest,
            },
            total: Math.round(totals.reduce((a, b) => a + b, 0) * 100) / 100,
        },
    };
};

/**
 * Get spending breakdown by category
 */
export const getCategoryBreakdown = async (userId: string) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
            category: true,
        },
    });

    const categoryTotals: Record<string, { name: string; total: number; color: string; count: number }> = {};
    let uncategorizedTotal = 0;
    let uncategorizedCount = 0;
    let grandTotal = 0;

    subscriptions.forEach(sub => {
        const monthlyCost = normalizeToMonthly(sub.cost, sub.frequency);
        grandTotal += monthlyCost;

        if (sub.category) {
            if (!categoryTotals[sub.category.id]) {
                categoryTotals[sub.category.id] = {
                    name: sub.category.name,
                    total: 0,
                    color: sub.category.color || '#3B82F6',
                    count: 0,
                };
            }
            categoryTotals[sub.category.id].total += monthlyCost;
            categoryTotals[sub.category.id].count++;
        } else {
            uncategorizedTotal += monthlyCost;
            uncategorizedCount++;
        }
    });

    const categories = Object.entries(categoryTotals).map(([id, data]) => ({
        id,
        name: data.name,
        total: Math.round(data.total * 100) / 100,
        percentage: Math.round((data.total / grandTotal) * 100),
        color: data.color,
        count: data.count,
    }));

    return {
        categories,
        uncategorized: {
            total: Math.round(uncategorizedTotal * 100) / 100,
            percentage: grandTotal > 0 ? Math.round((uncategorizedTotal / grandTotal) * 100) : 0,
            count: uncategorizedCount,
        },
        totalMonthly: Math.round(grandTotal * 100) / 100,
    };
};

/**
 * Compare spending year-over-year
 */
export const getYearOverYearComparison = async (userId: string, year1: number, year2: number) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
    });

    const monthlyComparison: Array<{
        month: string;
        year1Total: number;
        year2Total: number;
        change: number;
        percentageChange: number;
    }> = [];

    for (let month = 0; month < 12; month++) {
        const monthName = new Date(2000, month, 1).toLocaleDateString('en-US', { month: 'short' });

        let year1Total = 0;
        let year2Total = 0;

        subscriptions.forEach(sub => {
            const createdDate = new Date(sub.createdAt);
            const monthlyCost = normalizeToMonthly(sub.cost, sub.frequency);

            // Check if subscription was active in year1
            if (createdDate.getFullYear() <= year1 ||
                (createdDate.getFullYear() === year1 && createdDate.getMonth() <= month)) {
                year1Total += monthlyCost;
            }

            // Check if subscription was active in year2
            if (createdDate.getFullYear() <= year2 ||
                (createdDate.getFullYear() === year2 && createdDate.getMonth() <= month)) {
                year2Total += monthlyCost;
            }
        });

        const change = year2Total - year1Total;
        const percentageChange = year1Total > 0 ? ((change / year1Total) * 100) : 0;

        monthlyComparison.push({
            month: monthName,
            year1Total: Math.round(year1Total * 100) / 100,
            year2Total: Math.round(year2Total * 100) / 100,
            change: Math.round(change * 100) / 100,
            percentageChange: Math.round(percentageChange * 100) / 100,
        });
    }

    const year1Annual = monthlyComparison.reduce((sum, m) => sum + m.year1Total, 0);
    const year2Annual = monthlyComparison.reduce((sum, m) => sum + m.year2Total, 0);
    const annualChange = year2Annual - year1Annual;
    const annualPercentageChange = year1Annual > 0 ? ((annualChange / year1Annual) * 100) : 0;

    return {
        year1,
        year2,
        monthlyComparison,
        summary: {
            year1Annual: Math.round(year1Annual * 100) / 100,
            year2Annual: Math.round(year2Annual * 100) / 100,
            annualChange: Math.round(annualChange * 100) / 100,
            annualPercentageChange: Math.round(annualPercentageChange * 100) / 100,
        },
    };
};

/**
 * Calculate upcoming costs for the next N days
 */
export const getUpcomingCosts = async (userId: string, days: number = 30) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
            category: true,
        },
    });

    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const upcomingRenewals: Array<{
        id: string;
        name: string;
        cost: number;
        renewalDate: Date;
        daysUntil: number;
        category: string | null;
    }> = [];

    let totalUpcoming = 0;

    subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewalDate);

        if (renewalDate >= now && renewalDate <= endDate) {
            const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            upcomingRenewals.push({
                id: sub.id,
                name: sub.name,
                cost: sub.cost,
                renewalDate: renewalDate,
                daysUntil,
                category: sub.category?.name || null,
            });

            totalUpcoming += sub.cost;
        }
    });

    // Sort by renewal date
    upcomingRenewals.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

    return {
        days,
        upcomingRenewals,
        totalUpcoming: Math.round(totalUpcoming * 100) / 100,
        count: upcomingRenewals.length,
    };
};

/**
 * Generate insights and key metrics
 */
export const generateInsights = async (userId: string) => {
    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
            category: true,
        },
    });

    if (subscriptions.length === 0) {
        return {
            totalSubscriptions: 0,
            totalMonthly: 0,
            totalAnnual: 0,
            averageCost: 0,
            mostExpensive: null,
            cheapest: null,
            frequencyDistribution: {},
        };
    }

    let totalMonthly = 0;
    let mostExpensive = subscriptions[0];
    let cheapest = subscriptions[0];
    const frequencyDistribution: Record<string, number> = {
        WEEKLY: 0,
        MONTHLY: 0,
        QUARTERLY: 0,
        YEARLY: 0,
    };

    subscriptions.forEach(sub => {
        const monthlyCost = normalizeToMonthly(sub.cost, sub.frequency);
        totalMonthly += monthlyCost;

        // Track frequency distribution
        frequencyDistribution[sub.frequency]++;

        // Find most expensive (by actual cost, not normalized)
        if (sub.cost > mostExpensive.cost) {
            mostExpensive = sub;
        }

        // Find cheapest
        if (sub.cost < cheapest.cost) {
            cheapest = sub;
        }
    });

    const totalAnnual = totalMonthly * 12;
    const averageCost = totalMonthly / subscriptions.length;

    return {
        totalSubscriptions: subscriptions.length,
        totalMonthly: Math.round(totalMonthly * 100) / 100,
        totalAnnual: Math.round(totalAnnual * 100) / 100,
        averageCost: Math.round(averageCost * 100) / 100,
        mostExpensive: {
            id: mostExpensive.id,
            name: mostExpensive.name,
            cost: mostExpensive.cost,
            frequency: mostExpensive.frequency,
            category: mostExpensive.category?.name || null,
        },
        cheapest: {
            id: cheapest.id,
            name: cheapest.name,
            cost: cheapest.cost,
            frequency: cheapest.frequency,
            category: cheapest.category?.name || null,
        },
        frequencyDistribution,
    };
};
