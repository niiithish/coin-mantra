"use client";

import {
  CategoryScale,
  type ChartData,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartData<"line">>(data);

  // Force chart resize when container size changes
  const handleResize = useCallback(() => {
    const chart = chartRef.current;
    if (chart) {
      // Force chart to recalculate its size
      chart.resize();
    }
  }, []);

  // ResizeObserver to detect container size changes (handles browser zoom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to debounce resize calls
      requestAnimationFrame(handleResize);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    // Create gradient
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) {
      return;
    }

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
          maxTicksLimit: 7,
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
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
          callback: (value) => {
            const num = typeof value === "number" ? value : Number(value);
            if (num === 0) {
              return "0";
            }
            if (num < 1) {
              return num.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              });
            }
            return num.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0, // Angular lines like the reference
        borderWidth: 3,
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
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      ref={containerRef}
    >
      <div className="absolute inset-0">
        <Line data={chartData} options={defaultOptions} ref={chartRef} />
      </div>
    </div>
  );
}
