import React from 'react';
import { InsightsResponse } from '../../services/analytics';

interface InsightCardsProps {
    data: InsightsResponse | null;
    isLoading: boolean;
}

const InsightCards: React.FC<InsightCardsProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[var(--card)] p-6 rounded-xl shadow-sm border border-[var(--border)] h-32 animate-pulse">
                        <div className="h-4 bg-[var(--muted)] rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-[var(--muted)] rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const cards = [
        {
            label: 'Total Monthly Cost',
            value: `$${data.totalMonthly.toFixed(2)}`,
            subtext: `$${data.totalAnnual.toFixed(2)} / year`,
            color: 'text-[var(--primary)]',
            bgColor: 'bg-[var(--primary)]/10',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            label: 'Active Subscriptions',
            value: data.totalSubscriptions,
            subtext: `Avg $${data.averageCost.toFixed(2)} / sub`,
            color: 'text-[var(--primary)]',
            bgColor: 'bg-[var(--primary)]/10',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            label: 'Most Expensive',
            value: data.mostExpensive ? `$${data.mostExpensive.cost.toFixed(2)}` : '-',
            subtext: data.mostExpensive?.name || 'None',
            color: 'text-[var(--destructive)]',
            bgColor: 'bg-[var(--destructive)]/10',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
        {
            label: 'Cheapest',
            value: data.cheapest ? `$${data.cheapest.cost.toFixed(2)}` : '-',
            subtext: data.cheapest?.name || 'None',
            color: 'text-[var(--success)]',
            bgColor: 'bg-[var(--success)]/10',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            )
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-[var(--card)] p-6 rounded-xl shadow-sm border border-[var(--border)] transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${card.bgColor} ${card.color}`}>
                            {card.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">{card.value}</h3>
                        <p className="text-xs font-medium text-[var(--foreground)] opacity-80">{card.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InsightCards;
