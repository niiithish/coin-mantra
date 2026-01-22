"use client";

import type { ChartData } from "chart.js";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoinsByCategory, useCoinMarketChart } from "@/hooks/use-coins";
import { Badge } from "../ui/badge";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const MarketSummary = () => {
  const [categoryId, setCategoryId] = useState("smart-contract-platform");
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

  // Helper for keyboard navigation
  const handleKeyPress = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  // Fetch coins by category
  const { data: coins = [] } = useCoinsByCategory(categoryId);

  // Set initial selected coin when coins load
  const coinToChart = selectedCoin || (coins.length > 0 ? coins[0].id : null);

  // Fetch chart data for selected coin
  const { data: chartResult } = useCoinMarketChart(
    coinToChart || undefined,
    "7",
    "daily"
  );

  // Build chart data
  const chartData: ChartData<"line"> = useMemo(() => {
    if (!chartResult) {
      return {
        labels: [],
        datasets: [
          {
            label: "Price",
            data: [],
            fill: false,
            borderColor: "#46B49E",
            backgroundColor: "#46B49E",
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      };
    }

    return {
      labels: chartResult.labels,
      datasets: [
        {
          label: "Price",
          data: chartResult.prices,
          fill: false,
          borderColor: "#46B49E",
          backgroundColor: "#46B49E",
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  }, [chartResult]);

  const handleCategoryChange = (newCategoryId: string) => {
    setCategoryId(newCategoryId);
    setSelectedCoin(null); // Reset selected coin when category changes
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Market Summary</h1>
      </div>
      <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <Tabs
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          value={categoryId}
        >
          <CardHeader>
            <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto shadow-sm md:flex-nowrap md:justify-center">
              <TabsTrigger
                onClick={() => handleCategoryChange("smart-contract-platform")}
                value="smart-contract-platform"
              >
                Layer 1
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleCategoryChange("artificial-intelligence")}
                value="artificial-intelligence"
              >
                Artificial Intelligence
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleCategoryChange("decentralized-perpetuals")}
                value="decentralized-perpetuals"
              >
                Perpetuals Platform
              </TabsTrigger>
              <TabsTrigger
                onClick={() => handleCategoryChange("proof-of-stake-pos")}
                value="proof-of-stake-pos"
              >
                Proof of Stake (PoS)
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TabsContent
              className="flex w-full flex-col gap-4"
              value={categoryId}
            >
              <div className="relative h-[200px] w-full md:h-[280px]">
                <LineChart className="h-full w-full" data={chartData} />
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-3">
                {coins.map((item: Coin) => (
                  <Card
                    aria-label={`Select ${item.name} to view chart`}
                    aria-pressed={item.id === (selectedCoin || coins[0]?.id)}
                    className={`w-full cursor-pointer border-0 ${item.id === (selectedCoin || coins[0]?.id) ? "bg-secondary/50 shadow-sm" : ""}`}
                    key={item.id}
                    onClick={() => {
                      setSelectedCoin(item.id);
                    }}
                    onKeyDown={handleKeyPress(() => setSelectedCoin(item.id))}
                    role="button"
                    tabIndex={0}
                  >
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          alt={`${item.name} logo`}
                          height={20}
                          src={item.image}
                          style={{ height: "auto" }}
                          width={20}
                        />
                        <p className="max-w-[100px] truncate">{item.name}</p>
                      </div>
                      <Badge className="uppercase" variant="secondary">
                        {item.symbol}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-lg">
                          ${item.current_price}
                        </p>
                        <p
                          className={`${item.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          <span aria-hidden="true">
                            {item.price_change_percentage_24h > 0 ? "▲" : "▼"}
                          </span>{" "}
                          {item.price_change_percentage_24h.toFixed(2)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MarketSummary;
