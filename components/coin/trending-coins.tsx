"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTrendingCoins } from "@/hooks/use-trending";

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
  const { data: coins = [], isLoading, error } = useTrendingCoins({
    excludeCoinId: currentCoinId,
    limit: 8,
  });

  if (isLoading) {
    return (
      <Card className="h-full overflow-y-scroll">
        <CardHeader>
          <h2 className="font-bold text-base text-foreground">Trending Coins</h2>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full overflow-y-scroll">
        <CardHeader>
          <h2 className="font-bold text-base text-foreground">Trending Coins</h2>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-destructive text-sm">Failed to load trending coins</p>
        </CardContent>
      </Card>
    );
  }

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
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/30 ${index !== coins.length - 1
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
                      className={`font-medium text-xs ${isPositive ? "text-emerald-400" : "text-red-400"
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
