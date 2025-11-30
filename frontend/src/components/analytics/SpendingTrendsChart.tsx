import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SpendingTrend } from '../../services/analytics';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SpendingTrendsChartProps {
    data: SpendingTrend[];
    range: number;
    onRangeChange: (range: number) => void;
    isLoading: boolean;
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
    data,
    range,
    onRangeChange,
    isLoading
}) => {
    const chartData = useMemo(() => {
        return {
            labels: data.map(d => d.label),
            datasets: [
                {
                    label: 'Monthly Spending',
                    data: data.map(d => d.total),
                    fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500 with opacity
                    borderColor: 'rgb(59, 130, 246)', // blue-500
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)',
                },
            ],
        };
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context: any) => {
                        return `$${context.parsed.y.toFixed(2)}`;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6B7280',
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F3F4F6',
                },
                ticks: {
                    color: '#6B7280',
                    callback: (value: any) => `$${value}`,
                }
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="bg-[var(--card)] p-6 rounded-xl shadow-sm border border-[var(--border)]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Spending Trends</h3>
                <div className="flex space-x-2 bg-[var(--muted)] p-1 rounded-lg">
                    {[6, 12, 24].map((r) => (
                        <button
                            key={r}
                            onClick={() => onRangeChange(r)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${range === r
                                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            {r} Months
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center bg-[var(--muted)] rounded-lg animate-pulse">
                        <div className="text-[var(--muted-foreground)]">Loading chart data...</div>
                    </div>
                ) : data.length > 0 ? (
                    <Line options={options} data={chartData} />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[var(--muted)] rounded-lg">
                        <div className="text-[var(--muted-foreground)]">No spending data available</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpendingTrendsChart;
