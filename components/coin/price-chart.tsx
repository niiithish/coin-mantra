"use client";

import type { ChartData } from "chart.js";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";

interface PriceChartProps {
  coinId: string;
  coinName?: string;
  coinSymbol?: string;
  coinImage?: string;
  currentPrice?: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
}

type TimeFrame = "1" | "7" | "30" | "365";

const timeFrameLabels: Record<TimeFrame, string> = {
  "1": "1D",
  "7": "5D",
  "30": "1M",
  "365": "1Y",
};

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 8 : 2,
  }).format(value);
};

const formatPriceChange = (value: number | undefined) => {
  if (value === undefined) {
    return { text: "N/A", isPositive: true };
  }
  const isPositive = value >= 0;
  const text = `${isPositive ? "+" : ""}${value.toFixed(2)}`;
  return { text, isPositive };
};

const formatPercentage = (value: number | undefined) => {
  if (value === undefined) {
    return { text: "N/A", isPositive: true };
  }
  const isPositive = value >= 0;
  const text = `(${isPositive ? "+" : ""}${value.toFixed(2)}%)`;
  return { text, isPositive };
};

const PriceChart = ({
  coinId,
  coinName,
  coinSymbol,
  coinImage,
  currentPrice,
  priceChange24h,
  priceChangePercentage24h,
}: PriceChartProps) => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("1");
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [
      {
        label: "Price",
        data: [],
        fill: false,
        borderColor: "#0FEDBE",
        backgroundColor: "#0FEDBE",
      },
    ],
  });

  const fetchChartData = useCallback(async () => {
    if (!coinId) {
      return;
    }

    try {
      setError(null);

      // Determine interval based on timeframe
      const interval = selectedTimeFrame === "1" ? "" : "&interval=daily";

      const response = await fetch(
        `/api/coingecko?endpoint=/coins/${coinId}/market_chart&vs_currency=usd&days=${selectedTimeFrame}${interval}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }

      const result = await response.json();

      if (!(result.prices && Array.isArray(result.prices))) {
        throw new Error("Invalid response format");
      }

      // Format labels based on timeframe
      let labels = result.prices.map((item: [number, number]) => {
        const date = new Date(item[0]);
        if (selectedTimeFrame === "1") {
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      });

      let prices = result.prices.map((item: [number, number]) => item[1]);

      // Remove duplicate last data point if it has same date as previous
      if (labels.length > 1 && labels.at(-1) === labels.at(-2)) {
        labels = labels.slice(0, -1);
        prices = prices.slice(0, -1);
      }

      const lineColor = "#0FEDBE";

      setChartData({
        labels,
        datasets: [
          {
            label: "Price",
            data: prices,
            fill: false,
            borderColor: lineColor,
            backgroundColor: lineColor,
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to load chart data");
    }
  }, [coinId, selectedTimeFrame]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const priceChangeFormatted = formatPriceChange(priceChange24h);
  const percentageFormatted = formatPercentage(priceChangePercentage24h);
  const _isPositive =
    priceChangePercentage24h !== undefined
      ? priceChangePercentage24h >= 0
      : true;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        {/* Left side - Coin info */}
        <div className="flex items-center gap-4">
          {coinImage && (
            <Image
              alt={coinName ?? "Coin"}
              className="h-12 w-12 rounded-lg"
              height={48}
              src={coinImage}
              width={48}
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="font-medium text-foreground">{coinName}</span>
              <span>•</span>
              <span className="uppercase">{coinSymbol}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-foreground">
                {formatCurrency(currentPrice)}
              </span>
              <span
                className={`font-medium text-sm ${
                  priceChangeFormatted ? "text-[#0FEDBE]" : "text-[#FF495B]"
                }`}
              >
                {priceChangeFormatted.text} {percentageFormatted.text}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Time frame selector */}
        <div className="flex items-center gap-1 rounded-lg bg-background/50 p-1">
          {(Object.keys(timeFrameLabels) as TimeFrame[]).map((timeFrame) => (
            <button
              className={`cursor-pointer rounded-md px-2 py-1 font-medium text-xs transition-all duration-200 ${
                selectedTimeFrame === timeFrame
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={timeFrame}
              onClick={() => setSelectedTimeFrame(timeFrame)}
              type="button"
            >
              {timeFrameLabels[timeFrame]}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col">
        {error && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="font-medium text-destructive text-lg">{error}</p>
              <button
                className="mt-2 text-primary text-sm hover:underline"
                onClick={() => fetchChartData()}
                type="button"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!error && (
          <div className="min-h-0 flex-1">
            <LineChart
              className="h-full w-full"
              data={chartData}
              gradientColor="#0FEDBE"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChart;
