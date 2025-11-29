import { api } from './api';

export interface SpendingTrend {
    month: string;
    label: string;
    total: number;
    subscriptionCount: number;
}

export interface SpendingTrendsResponse {
    range: string;
    currency: string;
    data: SpendingTrend[];
    summary: {
        average: number;
        highest: {
            month: string;
            amount: number;
        };
        total: number;
    };
}

export interface CategoryBreakdownItem {
    id: string;
    name: string;
    total: number;
    percentage: number;
    color: string;
    count: number;
}

export interface CategoryBreakdownResponse {
    categories: CategoryBreakdownItem[];
    uncategorized: {
        total: number;
        percentage: number;
        count: number;
    };
    totalMonthly: number;
}

export interface YearOverYearMonth {
    month: string;
    year1Total: number;
    year2Total: number;
    change: number;
    percentageChange: number;
}

export interface YearOverYearResponse {
    year1: number;
    year2: number;
    monthlyComparison: YearOverYearMonth[];
    summary: {
        year1Annual: number;
        year2Annual: number;
        annualChange: number;
        annualPercentageChange: number;
    };
}

export interface UpcomingRenewal {
    id: string;
    name: string;
    cost: number;
    renewalDate: string;
    daysUntil: number;
    category: string | null;
}

export interface UpcomingCostsResponse {
    days: number;
    upcomingRenewals: UpcomingRenewal[];
    totalUpcoming: number;
    count: number;
}

export interface InsightsResponse {
    totalSubscriptions: number;
    totalMonthly: number;
    totalAnnual: number;
    averageCost: number;
    mostExpensive: {
        id: string;
        name: string;
        cost: number;
        frequency: string;
        category: string | null;
    } | null;
    cheapest: {
        id: string;
        name: string;
        cost: number;
        frequency: string;
        category: string | null;
    } | null;
    frequencyDistribution: Record<string, number>;
}

export const analyticsService = {
    getSpendingTrends: async (range: number = 12) => {
        const response = await api.get<SpendingTrendsResponse>(`/analytics/spending-trends?range=${range}`);
        return response;
    },

    getCategoryBreakdown: async () => {
        const response = await api.get<CategoryBreakdownResponse>('/analytics/category-breakdown');
        return response;
    },

    getYearOverYear: async (year1?: number, year2?: number) => {
        let query = '';
        if (year1) query += `?year1=${year1}`;
        if (year2) query += `${query ? '&' : '?'}year2=${year2}`;

        const response = await api.get<YearOverYearResponse>(`/analytics/year-over-year${query}`);
        return response;
    },

    getUpcomingCosts: async (days: number = 30) => {
        const response = await api.get<UpcomingCostsResponse>(`/analytics/upcoming-costs?days=${days}`);
        return response;
    },

    getInsights: async () => {
        const response = await api.get<InsightsResponse>('/analytics/insights');
        return response;
    }
};
