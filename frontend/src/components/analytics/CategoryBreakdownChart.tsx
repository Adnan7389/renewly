import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CategoryBreakdownItem } from '../../services/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
    categories: CategoryBreakdownItem[];
    uncategorized: {
        total: number;
        percentage: number;
        count: number;
    };
    totalMonthly: number;
    isLoading: boolean;
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
    categories,
    uncategorized,
    totalMonthly,
    isLoading
}) => {
    const chartData = useMemo(() => {
        const labels = [...categories.map(c => c.name)];
        const data = [...categories.map(c => c.total)];

        // Helper to get computed CSS variable value
        const getChartColor = (index: number) => {
            const variableName = `--chart-${(index % 5) + 1}`;
            const root = document.documentElement;
            const color = getComputedStyle(root).getPropertyValue(variableName).trim();
            // Fallback if variable is not found or empty
            return color || `hsl(${(index * 360) / 5}, 70%, 50%)`;
        };

        const bgColors = categories.map((_, index) => getChartColor(index));

        if (uncategorized.total > 0) {
            labels.push('Uncategorized');
            data.push(uncategorized.total);
            // Resolve muted-foreground as well
            const mutedColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--muted-foreground').trim();
            bgColors.push(mutedColor || '#9CA3AF');
        }

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: bgColors,
                    borderWidth: 0,
                    hoverOffset: 4,
                },
            ],
        };
    }, [categories, uncategorized]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => {
                        const value = context.parsed;
                        const percentage = Math.round((value / totalMonthly) * 100);
                        return ` $${value.toFixed(2)} (${percentage}%)`;
                    }
                }
            },
        },
    };

    // Prepare list items for custom legend
    const legendItems = useMemo(() => {
        const getChartColor = (index: number) => {
            const variableName = `--chart-${(index % 5) + 1}`;
            const root = document.documentElement;
            return getComputedStyle(root).getPropertyValue(variableName).trim();
        };

        const items = categories.map((c, index) => ({
            name: c.name,
            percentage: c.percentage,
            color: getChartColor(index),
            amount: c.total
        }));

        if (uncategorized.total > 0) {
            const mutedColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--muted-foreground').trim();

            items.push({
                name: 'Uncategorized',
                percentage: uncategorized.percentage,
                color: mutedColor || '#9CA3AF',
                amount: uncategorized.total
            });
        }

        return items.sort((a, b) => b.amount - a.amount);
    }, [categories, uncategorized]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative h-[240px] w-[240px] flex-shrink-0">
                    {isLoading ? (
                        <div className="h-full w-full rounded-full border-8 border-gray-100 animate-pulse" />
                    ) : totalMonthly > 0 ? (
                        <>
                            <Doughnut options={options} data={chartData} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm text-gray-500">Total</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ${totalMonthly.toFixed(0)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="h-full w-full rounded-full border-8 border-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No data</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                            {legendItems.map((item) => (
                                <div key={item.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-900">
                                            ${item.amount.toFixed(2)}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full min-w-[40px] text-center">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryBreakdownChart;
