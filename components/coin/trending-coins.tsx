"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: {
    price: number;
    price_btc: string;
    price_change_percentage_24h: Record<string, number>;
    market_cap: string;
    market_cap_btc: string;
    total_volume: string;
    total_volume_btc: string;
    sparkline: string;
    content: string | null;
  };
}

interface TrendingCoin {
  item: TrendingCoinItem;
}

interface TrendingResponse {
  coins: TrendingCoin[];
}

interface TrendingCoinsProps {
  currentCoinId?: string;
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) {
    return "N/A";
  }
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
};

const TrendingCoins = ({ currentCoinId }: TrendingCoinsProps) => {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setError(null);

        const response = await fetch(
          "/api/coingecko?endpoint=/search/trending"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trending coins");
        }

        const data: TrendingResponse = await response.json();

        // Filter out the current coin if provided
        const filteredData = currentCoinId
          ? data.coins.filter((coin) => coin.item.id !== currentCoinId)
          : data.coins;

        setCoins(filteredData.slice(0, 8));
      } catch (err) {
        console.error("Error fetching trending coins:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load trending coins"
        );
      }
    };

    fetchTrendingCoins();
  }, [currentCoinId]);

  return (
    <Card className="h-full overflow-y-scroll">
      <CardHeader>
        <h2 className="font-bold text-base text-foreground">Trending Coins</h2>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        <div className="flex flex-col">
          {coins.map((coin, index) => {
            const priceChange =
              coin.item.data.price_change_percentage_24h?.usd ?? 0;
            const isPositive = priceChange >= 0;
            return (
              <Link
                className="block"
                href={`/coin/${coin.item.id}`}
                key={coin.item.id}
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/30 ${
                    index !== coins.length - 1
                      ? "border-border/30 border-b"
                      : ""
                  }`}
                >
                  {/* Left side: Logo, Name, Price */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center overflow-hidden rounded-lg">
                      <Image
                        alt={coin.item.name}
                        className="rounded-lg"
                        height={32}
                        src={coin.item.small}
                        unoptimized
                        width={32}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-muted-foreground text-xs">
                        {coin.item.name}
                      </span>
                      <span className="font-medium text-foreground text-sm">
                        {formatCurrency(coin.item.data.price)}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Symbol, Price Change */}
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground text-xs uppercase">
                      {coin.item.symbol}
                    </span>
                    <span
                      className={`font-medium text-xs ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingCoins;
