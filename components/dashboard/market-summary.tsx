"use client";

import type { ChartData } from "chart.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [id, setId] = useState("smart-contract-platform");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [coin, setCoin] = useState("bitcoin");

  const [chartData, setChartData] = useState<ChartData<"line">>({
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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/coingecko?endpoint=/coins/markets&category=${id}&vs_currency=usd&per_page=3&page=1`
        );
        const result = await response.json();
        // Validate that result is an array before setting state
        if (Array.isArray(result)) {
          setCoins(result);
          if (result.length > 0) {
            setCoin(result[0].id);
          }
        } else {
          console.error("API returned non-array response:", result);
          setCoins([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.log(id);
        setCoins([]);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchPrice = async (coin: string) => {
      try {
        const response = await fetch(
          `/api/coingecko?endpoint=/coins/${coin}/market_chart&vs_currency=usd&days=7&interval=daily`
        );
        const result = await response.json();

        // Validate that result.prices exists before mapping
        if (!(result.prices && Array.isArray(result.prices))) {
          console.error("API returned unexpected response:", result);
          return;
        }

        let labels = result.prices.map((item: [number, number]) => {
          const date = new Date(item[0]);
          return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          });
        });

        let prices = result.prices.map((item: [number, number]) => item[1]);

        // Remove last data point if it has same date as previous (API returns duplicate for current day)
        if (labels.length > 1 && labels.at(-1) === labels.at(-2)) {
          labels = labels.slice(0, -1);
          prices = prices.slice(0, -1);
        }

        setChartData({
          labels,
          datasets: [
            {
              label: "Price",
              data: prices,
              fill: false,
              borderColor: "#46B49E",
              backgroundColor: "#46B49E",
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchPrice(coin);
  }, [coin]);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Market Summary</h1>
      </div>
      <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <Tabs
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          value={id}
        >
          <CardHeader>
            <TabsList className="shadow-sm">
              <TabsTrigger
                onClick={() => setId("smart-contract-platform")}
                value="smart-contract-platform"
              >
                Layer 1
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setId("artificial-intelligence")}
                value="artificial-intelligence"
              >
                Artificial Intelligence
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setId("decentralized-perpetuals")}
                value="decentralized-perpetuals"
              >
                Perpetuals Platform
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setId("proof-of-stake-pos")}
                value="proof-of-stake-pos"
              >
                Proof of Stake (PoS)
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TabsContent
              className="flex h-full w-full flex-col gap-4"
              value={id}
            >
              <div className="h-[calc(100%-115px)]">
                <LineChart className="h-full w-full" data={chartData} />
              </div>
              <div className="flex items-stretch justify-between gap-5">
                {coins.map((item: Coin) => (
                  <Card
                    className={`w-full cursor-pointer border-0 ${item.id === coin ? "bg-secondary/50 shadow-sm" : ""}`}
                    key={item.id}
                    onClick={() => {
                      setCoin(item.id);
                    }}
                  >
                    <CardHeader className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          alt={item.name}
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
