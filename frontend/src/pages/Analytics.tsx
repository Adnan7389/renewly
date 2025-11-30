import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics';
import SpendingTrendsChart from '../components/analytics/SpendingTrendsChart';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';
import YearOverYearChart from '../components/analytics/YearOverYearChart';
import InsightCards from '../components/analytics/InsightCards';
import UpcomingCostsTimeline from '../components/analytics/UpcomingCostsTimeline';

const Analytics: React.FC = () => {
    // State for all data
    const [insights, setInsights] = useState<any>(null);
    const [spendingTrends, setSpendingTrends] = useState<any>(null);
    const [categoryBreakdown, setCategoryBreakdown] = useState<any>(null);
    const [yearOverYear, setYearOverYear] = useState<any>(null);
    const [upcomingCosts, setUpcomingCosts] = useState<any>(null);

    // Loading states
    const [loading, setLoading] = useState({
        insights: true,
        trends: true,
        categories: true,
        yoy: true,
        upcoming: true
    });

    // Filters
    const [trendRange, setTrendRange] = useState(12);
    const [yoyYears] = useState({
        year1: new Date().getFullYear() - 1,
        year2: new Date().getFullYear()
    });

    // Fetch Insights
    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await analyticsService.getInsights();
                setInsights(data);
            } catch (error) {
                console.error('Failed to fetch insights', error);
            } finally {
                setLoading(prev => ({ ...prev, insights: false }));
            }
        };
        fetchInsights();
    }, []);

    // Fetch Spending Trends
    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(prev => ({ ...prev, trends: true }));
            try {
                const data = await analyticsService.getSpendingTrends(trendRange);
                setSpendingTrends(data);
            } catch (error) {
                console.error('Failed to fetch trends', error);
            } finally {
                setLoading(prev => ({ ...prev, trends: false }));
            }
        };
        fetchTrends();
    }, [trendRange]);

    // Fetch Category Breakdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await analyticsService.getCategoryBreakdown();
                setCategoryBreakdown(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setLoading(prev => ({ ...prev, categories: false }));
            }
        };
        fetchCategories();
    }, []);

    // Fetch Year Over Year
    useEffect(() => {
        const fetchYoY = async () => {
            try {
                const data = await analyticsService.getYearOverYear(yoyYears.year1, yoyYears.year2);
                setYearOverYear(data);
            } catch (error) {
                console.error('Failed to fetch YoY', error);
            } finally {
                setLoading(prev => ({ ...prev, yoy: false }));
            }
        };
        fetchYoY();
    }, [yoyYears]);

    // Fetch Upcoming Costs
    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const data = await analyticsService.getUpcomingCosts(30);
                setUpcomingCosts(data);
            } catch (error) {
                console.error('Failed to fetch upcoming costs', error);
            } finally {
                setLoading(prev => ({ ...prev, upcoming: false }));
            }
        };
        fetchUpcoming();
    }, []);

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
            <InsightCards data={insights} isLoading={loading.insights} />

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Trends - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <SpendingTrendsChart
                        data={spendingTrends?.data || []}
                        range={trendRange}
                        onRangeChange={setTrendRange}
                        isLoading={loading.trends}
                    />
                </div>

                {/* Category Breakdown - Spans 1 column */}
                <div className="lg:col-span-1">
                    <CategoryBreakdownChart
                        categories={categoryBreakdown?.categories || []}
                        uncategorized={categoryBreakdown?.uncategorized || { total: 0, percentage: 0, count: 0 }}
                        totalMonthly={categoryBreakdown?.totalMonthly || 0}
                        isLoading={loading.categories}
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
                        isLoading={loading.yoy}
                    />
                </div>

                {/* Upcoming Costs Timeline */}
                <div className="h-[400px]">
                    <UpcomingCostsTimeline
                        data={upcomingCosts?.upcomingRenewals || []}
                        days={30}
                        isLoading={loading.upcoming}
                    />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
