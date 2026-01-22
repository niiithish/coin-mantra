import { useQuery } from "@tanstack/react-query";

// Types
interface MarketData {
    current_price: { [currency: string]: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap: { [currency: string]: number };
    total_volume: { [currency: string]: number };
    total_supply: number;
    ath: { [currency: string]: number };
    atl: { [currency: string]: number };
    high_24h: { [currency: string]: number };
    low_24h: { [currency: string]: number };
}

export interface CoinData {
    id: string;
    name: string;
    symbol: string;
    image: {
        large: string;
        small?: string;
        thumb?: string;
    };
    description: {
        en: string;
    };
    links: {
        homepage: string[];
        twitter_screen_name: string;
        telegram_channel_identifier: string;
        repos_url: {
            github: string[];
        };
        whitepaper: string;
        blockchain_site: string[];
    };
    contract_address: string;
    categories: string[];
    market_cap_rank: number;
    market_data: MarketData;
}

export interface CoinMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_percentage_24h: number;
}

interface Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}

// Fetch functions
const fetchCoinById = async (coinId: string): Promise<CoinData> => {
    const response = await fetch(`/api/coingecko?endpoint=/coins/${coinId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch coin data");
    }
    return response.json();
};

const fetchCoinsByCategory = async (category: string): Promise<Coin[]> => {
    const response = await fetch(
        `/api/coingecko?endpoint=/coins/markets&category=${category}&vs_currency=usd&per_page=3&page=1`
    );
    const result = await response.json();
    if (Array.isArray(result)) {
        return result;
    }
    console.error("API returned non-array response:", result);
    return [];
};

const fetchCoinMarketChart = async (
    coinId: string,
    days: string,
    interval?: string
): Promise<{ labels: string[]; prices: number[] }> => {
    const intervalParam = interval ? `&interval=${interval}` : "";
    const response = await fetch(
        `/api/coingecko?endpoint=/coins/${coinId}/market_chart&vs_currency=usd&days=${days}${intervalParam}`
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
        if (days === "1") {
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

    return { labels, prices };
};

const fetchCoinMarketData = async (coinIds: string[]): Promise<CoinMarketData[]> => {
    if (coinIds.length === 0) return [];

    const idsParam = coinIds.join(",");
    const response = await fetch(
        `/api/coingecko?endpoint=/coins/markets&vs_currency=usd&ids=${idsParam}&price_change_percentage=24h`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch coin market data");
    }

    return response.json();
};

// Hooks
export function useCoinData(coinId: string | undefined) {
    return useQuery({
        queryKey: ["coin", coinId],
        queryFn: () => {
            if (!coinId) throw new Error("coinId is required");
            return fetchCoinById(coinId);
        },
        enabled: !!coinId,
        staleTime: 60 * 1000, // 1 minute
    });
}

export function useCoinsByCategory(category: string) {
    return useQuery({
        queryKey: ["coins", "category", category],
        queryFn: () => fetchCoinsByCategory(category),
        staleTime: 60 * 1000,
    });
}

export function useCoinMarketChart(
    coinId: string | undefined,
    days: string,
    interval?: string
) {
    return useQuery({
        queryKey: ["chart", coinId, days, interval],
        queryFn: () => {
            if (!coinId) throw new Error("coinId is required");
            return fetchCoinMarketChart(coinId, days, interval);
        },
        enabled: !!coinId,
        staleTime: 30 * 1000, // 30 seconds for chart data
    });
}

export function useCoinMarketData(coinIds: string[]) {
    return useQuery({
        queryKey: ["coins", "market", coinIds],
        queryFn: () => fetchCoinMarketData(coinIds),
        enabled: coinIds.length > 0,
        staleTime: 60 * 1000,
    });
}
