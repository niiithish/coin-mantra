"use client";

import { AddIcon, CircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import CreateAlertDialog from "../create-alert-dialog";
import { Card, CardContent, CardHeader } from "../ui/card";

interface MarketData {
  current_price: { [key: string]: number };
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  total_supply: number;
  ath: { [key: string]: number };
  atl: { [key: string]: number };
  high_24h: { [key: string]: number };
  low_24h: { [key: string]: number };
}

interface CoinOverviewProps {
  coinData: {
    id: string;
    symbol: string;
    name: string;
    market_data: MarketData;
  } | null;
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) {
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value !== undefined && value < 1 ? 8 : 2,
  }).format(value);
};

const formatNumber = (value: number | undefined) => {
  if (value === undefined) {
    return "N/A";
  }
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US").format(value);
};

const CoinOverview = ({ coinData }: CoinOverviewProps) => {
  if (!coinData) {
    return (
      <Card className="h-full overflow-y-scroll">
        <CardHeader className="flex items-center justify-between border-b">
          <h1 className="font-medium text-base">Overview</h1>
          <Button disabled size="sm">
            <HugeiconsIcon icon={AddIcon} size={16} />
            Create Alert
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const { market_data } = coinData;
  const currentPrice = market_data.current_price.usd;
  const high24h = market_data.high_24h.usd;
  const low24h = market_data.low_24h.usd;
  const openPrice = currentPrice - market_data.price_change_24h;

  return (
    <Card className="h-full overflow-y-scroll">
      <CardHeader className="flex items-center justify-between border-b">
        <h1 className="font-medium text-base">Overview</h1>
        <CreateAlertDialog
          coinId={coinData.id}
          coinName={coinData.name}
          coinSymbol={coinData.symbol.toUpperCase()}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 border-b pb-4">
        <h1 className="flex font-bold text-base">Today’s Range</h1>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#FDD458]"
                color="#FDD458"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              Open
            </div>
            <span className="font-medium">{formatCurrency(openPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#0FEDBE]"
                color="#0FEDBE"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              High
            </div>
            <span className="font-medium">{formatCurrency(high24h)}</span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#FF495B]"
                color="#FF495B"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              Low
            </div>
            <span className="font-medium">{formatCurrency(low24h)}</span>
          </div>
        </div>
      </CardContent>
      <CardContent className="flex flex-col gap-2">
        <h1 className="flex font-bold text-base">More Info</h1>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#5862FF]"
                color="#5862FF"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              Market Cap
            </div>
            <span className="font-medium">
              {formatCurrency(market_data.market_cap.usd)}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#FF8243]"
                color="#FF8243"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              24hr Volume
            </div>
            <span className="font-medium">
              {formatCurrency(market_data.total_volume.usd)}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#FDD458]"
                color="#FDD458"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              Total Supply
            </div>
            <span className="font-medium uppercase">
              {formatNumber(market_data.total_supply)} {coinData.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#D13BFF]"
                color="#D13BFF"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              ATH
            </div>
            <span className="font-medium">
              {formatCurrency(market_data.ath.usd)}
            </span>
          </div>
          <div className="flex items-center justify-between text-foreground text-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <HugeiconsIcon
                className="rounded-full bg-[#0FEDBE]"
                color="#0FEDBE"
                icon={CircleIcon}
                size={8}
                strokeWidth={0}
              />
              ATL
            </div>
            <span className="font-medium">
              {formatCurrency(market_data.atl.usd)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinOverview;
