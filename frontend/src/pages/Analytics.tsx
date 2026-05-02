import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics';
import SpendingTrendsChart from '../components/analytics/SpendingTrendsChart';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';
import YearOverYearChart from '../components/analytics/YearOverYearChart';
import InsightCards from '../components/analytics/InsightCards';
import UpcomingCostsTimeline from '../components/analytics/UpcomingCostsTimeline';

const Analytics: React.FC = () => {
    // Filters
    const [trendRange, setTrendRange] = useState(12);
    const [yoyYears] = useState({
        year1: new Date().getFullYear() - 1,
        year2: new Date().getFullYear()
    });

    const { data: insights, isLoading: loadingInsights } = useQuery({
        queryKey: ['analytics', 'insights'],
        queryFn: () => analyticsService.getInsights()
    });

    const { data: spendingTrends, isLoading: loadingTrends } = useQuery({
        queryKey: ['analytics', 'trends', trendRange],
        queryFn: () => analyticsService.getSpendingTrends(trendRange)
    });

    const { data: categoryBreakdown, isLoading: loadingCategories } = useQuery({
        queryKey: ['analytics', 'categories'],
        queryFn: () => analyticsService.getCategoryBreakdown()
    });

    const { data: yearOverYear, isLoading: loadingYoy } = useQuery({
        queryKey: ['analytics', 'yoy', yoyYears.year1, yoyYears.year2],
        queryFn: () => analyticsService.getYearOverYear(yoyYears.year1, yoyYears.year2)
    });

    const { data: upcomingCosts, isLoading: loadingUpcoming } = useQuery({
        queryKey: ['analytics', 'upcoming', 30],
        queryFn: () => analyticsService.getUpcomingCosts(30)
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics & Insights</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">Track your spending patterns and subscription habits</p>
                </div>
                <div className="text-sm text-[var(--muted-foreground)] bg-[var(--card)] px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <InsightCards data={insights} isLoading={loadingInsights} />

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Trends - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <SpendingTrendsChart
                        data={spendingTrends?.data || []}
                        range={trendRange}
                        onRangeChange={setTrendRange}
                        isLoading={loadingTrends}
                    />
                </div>

                {/* Category Breakdown - Spans 1 column */}
                <div className="lg:col-span-1">
                    <CategoryBreakdownChart
                        categories={categoryBreakdown?.categories || []}
                        uncategorized={categoryBreakdown?.uncategorized || { total: 0, percentage: 0, count: 0 }}
                        totalMonthly={categoryBreakdown?.totalMonthly || 0}
                        isLoading={loadingCategories}
                    />
                </div>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Year Over Year Comparison */}
                <div className="h-[400px]">
                    <YearOverYearChart
                        data={yearOverYear?.monthlyComparison || []}
                        year1={yearOverYear?.year1 || yoyYears.year1}
                        year2={yearOverYear?.year2 || yoyYears.year2}
                        isLoading={loadingYoy}
                    />
                </div>

                {/* Upcoming Costs Timeline */}
                <div className="h-[400px]">
                    <UpcomingCostsTimeline
                        data={upcomingCosts?.upcomingRenewals || []}
                        days={30}
                        isLoading={loadingUpcoming}
                    />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
