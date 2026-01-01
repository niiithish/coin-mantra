"use client";

import { useRef, useEffect, useState } from "react";
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
    type ChartData,
    type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
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

interface LineChartProps {
    data: ChartData<"line">;
    options?: ChartOptions<"line">;
    className?: string;
    gradientColor?: string; // The main color for the gradient (defaults to line color)
}

export function LineChart({
    data,
    options,
    className,
    gradientColor = "#46B49E",
}: LineChartProps) {
    const chartRef = useRef<ChartJS<"line">>(null);
    const [chartData, setChartData] = useState<ChartData<"line">>(data);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        // Create gradient
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        if (!chartArea) return;

        const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
        );
        gradient.addColorStop(0, `${gradientColor}40`); // 25% opacity at top
        gradient.addColorStop(0.5, `${gradientColor}20`); // 12% opacity in middle
        gradient.addColorStop(1, `${gradientColor}00`); // 0% opacity at bottom

        // Update dataset with gradient
        const updatedData = {
            ...data,
            datasets: data.datasets.map((dataset) => ({
                ...dataset,
                fill: true,
                backgroundColor: gradient,
            })),
        };

        setChartData(updatedData);
    }, [data, gradientColor]);

    const defaultOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(45, 212, 191, 0.5)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                position: "bottom",
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: "#CCDADC",
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                position: "right", // Price on the right side
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: "#CCDADC",
                    font: {
                        size: 14,
                    },
                    maxTicksLimit: 5, // Limit to 5 ticks on Y-axis
                    callback: (value) => value.toLocaleString(),
                },
            },
        },
        elements: {
            line: {
                tension: 0, // Angular lines like the reference
                borderWidth: 3
            },
            point: {
                radius: 0,
                hoverRadius: 0,
                hoverBackgroundColor: "#2dd4bf",
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        ...options,
    };

    return (
        <div className={className}>
            <Line ref={chartRef} data={chartData} options={defaultOptions} />
        </div>
    );
}
