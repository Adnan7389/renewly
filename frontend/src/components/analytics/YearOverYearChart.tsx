import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { YearOverYearMonth } from '../../services/analytics';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface YearOverYearChartProps {
    data: YearOverYearMonth[];
    year1: number;
    year2: number;
    isLoading: boolean;
}

const YearOverYearChart: React.FC<YearOverYearChartProps> = ({
    data,
    year1,
    year2,
    isLoading
}) => {
    const chartData = useMemo(() => {
        return {
            labels: data.map(d => d.month),
            datasets: [
                {
                    label: `${year1}`,
                    data: data.map(d => d.year1Total),
                    backgroundColor: '#E5E7EB', // gray-200
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                },
                {
                    label: `${year2}`,
                    data: data.map(d => d.year2Total),
                    backgroundColor: '#3B82F6', // blue-500
                    borderRadius: 4,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                },
            ],
        };
    }, [data, year1, year2]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 500
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context: any) => {
                        return ` ${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
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
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#F3F4F6',
                    drawBorder: false,
                },
                ticks: {
                    color: '#6B7280',
                    callback: (value: any) => `$${value}`,
                    font: {
                        size: 11
                    }
                },
                border: {
                    display: false
                }
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Year over Year Comparison</h3>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
                        <div className="text-gray-400">Loading comparison data...</div>
                    </div>
                ) : (
                    <Bar options={options as any} data={chartData} />
                )}
            </div>
        </div>
    );
};

export default YearOverYearChart;
