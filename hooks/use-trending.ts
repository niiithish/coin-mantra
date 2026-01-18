import { useQuery } from "@tanstack/react-query";

// Types
export interface TrendingCoinItem {
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

export interface TrendingCoin {
    item: TrendingCoinItem;
}

interface TrendingResponse {
    coins: TrendingCoin[];
}

// Fetch function
const fetchTrendingCoins = async (): Promise<TrendingCoin[]> => {
    const response = await fetch("/api/coingecko?endpoint=/search/trending");

    if (!response.ok) {
        throw new Error("Failed to fetch trending coins");
    }

    const data: TrendingResponse = await response.json();
    return data.coins;
};

// Hook
export function useTrendingCoins(options?: { excludeCoinId?: string; limit?: number }) {
    return useQuery({
        queryKey: ["trending"],
        queryFn: fetchTrendingCoins,
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data) => {
            let coins = data;

            // Filter out excluded coin if provided
            if (options?.excludeCoinId) {
                coins = coins.filter((coin) => coin.item.id !== options.excludeCoinId);
            }

            // Limit results if provided
            if (options?.limit) {
                coins = coins.slice(0, options.limit);
            }

            return coins;
        },
    });
}
