import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { UpcomingRenewal } from '../../services/analytics';

interface UpcomingCostsTimelineProps {
    data: UpcomingRenewal[];
    days: number;
    isLoading: boolean;
}

const UpcomingCostsTimeline: React.FC<UpcomingCostsTimelineProps> = ({
    data,
    days,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm border border-[var(--border)] h-full">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Upcoming Renewals</h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-[var(--muted)] rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-[var(--muted)] rounded w-1/3"></div>
                                <div className="h-3 bg-[var(--muted)] rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm border border-[var(--border)] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Upcoming Renewals</h3>
                <span className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] px-3 py-1 rounded-full">
                    Next {days} Days
                </span>
            </div>

            {data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-[var(--success)]/10 text-[var(--success)] rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h4 className="text-[var(--foreground)] font-medium mb-1">No upcoming payments</h4>
                    <p className="text-[var(--muted-foreground)] text-sm">You're all clear for the next {days} days!</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {data.map((item) => {
                        const renewalDate = new Date(item.renewalDate);
                        const isToday = differenceInDays(renewalDate, new Date()) === 0;
                        const isUrgent = item.daysUntil <= 3;

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isUrgent
                                    ? 'bg-[var(--destructive)]/10 border-[var(--destructive)]/20'
                                    : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--foreground)]/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        flex flex-col items-center justify-center w-12 h-12 rounded-lg border
                                        ${isUrgent ? 'bg-[var(--card)] border-[var(--destructive)]/20 text-[var(--destructive)]' : 'bg-[var(--muted)] border-[var(--border)] text-[var(--foreground)]'}
                                    `}>
                                        <span className="text-xs font-medium uppercase">
                                            {format(renewalDate, 'MMM')}
                                        </span>
                                        <span className="text-lg font-bold leading-none">
                                            {format(renewalDate, 'd')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[var(--foreground)]">{item.name}</h4>
                                        <p className="text-sm text-[var(--foreground)] opacity-80">
                                            {isToday ? 'Renews today' : `In ${item.daysUntil} days`}
                                            {item.category && ` • ${item.category}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-[var(--foreground)]">
                                        ${item.cost.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UpcomingCostsTimeline;
