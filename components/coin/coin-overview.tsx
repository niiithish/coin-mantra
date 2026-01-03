"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleIcon } from "@hugeicons/core-free-icons";

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
    if (value === undefined) return "N/A";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    }).format(value);
};

const formatNumber = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US").format(value);
};

const CoinOverview = ({ coinData }: CoinOverviewProps) => {
    if (!coinData) {
        return (
            <div className="w-full">
                <Card>
                    <CardHeader className="flex items-center justify-between border-b pb-4">
                        <h1 className="text-xl font-medium">Overview</h1>
                        <Button disabled>Create Alert</Button>
                    </CardHeader>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Loading overview data...
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { market_data } = coinData;
    const currentPrice = market_data.current_price.usd;
    const high24h = market_data.high_24h.usd;
    const low24h = market_data.low_24h.usd;
    // Open calculation: current_price - price_change_24h
    const openPrice = currentPrice - market_data.price_change_24h;

    return (
        <div className="w-full">
            <Card>
                <CardHeader className="flex items-center justify-between border-b pb-4">
                    <h1 className="text-xl font-medium">Overview</h1>
                    <Button>Create Alert</Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 border-b py-4">
                    <h1 className="flex text-base font-bold">Today’s Range</h1>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#FDD458"
                                    className="bg-[#FDD458] rounded-full"
                                />
                                Open
                            </div>
                            <span className="font-medium">{formatCurrency(openPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#0FEDBE"
                                    className="bg-[#0FEDBE] rounded-full"
                                />
                                High
                            </div>
                            <span className="font-medium">{formatCurrency(high24h)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#FF495B"
                                    className="bg-[#FF495B] rounded-full"
                                />
                                Low
                            </div>
                            <span className="font-medium">{formatCurrency(low24h)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardContent className="flex flex-col gap-4 py-4">
                    <h1 className="flex text-base font-bold">More Info</h1>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#5862FF"
                                    className="bg-[#5862FF] rounded-full"
                                />
                                Market Cap
                            </div>
                            <span className="font-medium">
                                {formatCurrency(market_data.market_cap.usd)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#FF8243"
                                    className="bg-[#FF8243] rounded-full"
                                />
                                24hr Volume
                            </div>
                            <span className="font-medium">
                                {formatCurrency(market_data.total_volume.usd)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#FDD458"
                                    className="bg-[#FDD458] rounded-full"
                                />
                                Total Supply
                            </div>
                            <span className="font-medium">
                                {formatNumber(market_data.total_supply)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#D13BFF"
                                    className="bg-[#D13BFF] rounded-full"
                                />
                                ATH
                            </div>
                            <span className="font-medium">{formatCurrency(market_data.ath.usd)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                    icon={CircleIcon}
                                    size={8}
                                    strokeWidth={0}
                                    color="#0FEDBE"
                                    className="bg-[#0FEDBE] rounded-full"
                                />
                                ATL
                            </div>
                            <span className="font-medium">{formatCurrency(market_data.atl.usd)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CoinOverview;