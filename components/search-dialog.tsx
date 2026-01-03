"use client";

import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Cancel01Icon, Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";


interface SearchCoin {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
    category: string;
}

interface TrendingCoin {
    item: {
        id: string;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        small: string;
        large: string;
        category: string;
        data: {
            price_change_percentage_24h: {
                usd: number;
            };
        };
    };
}

interface CoinResult {
    id: string;
    name: string;
    symbol: string;
    image: string;
    rank: number | null;
    category: string;
    price_change_percentage_24h?: number;
}

const SearchDialog = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<CoinResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDefault, setIsDefault] = useState(true);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchTrending = useCallback(async () => {
        try {
            const response = await fetch("/api/coingecko?endpoint=/search/trending");
            if (!response.ok) return;
            const data = await response.json();
            const trendingCoins: CoinResult[] = data.coins.slice(0, 10).map((c: TrendingCoin) => ({
                id: c.item.id,
                name: c.item.name,
                symbol: c.item.symbol,
                image: c.item.large,
                rank: c.item.market_cap_rank,
                price_change_percentage_24h: c.item.data.price_change_percentage_24h.usd,
            }));
            setResults(trendingCoins);
            setIsDefault(true);
        } catch (error) {
            console.error("Error fetching trending coins:", error);
        }
    }, []);

    const searchCoins = useCallback(async (query: string) => {
        if (!query.trim()) {
            fetchTrending();
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `/api/coingecko?endpoint=/search&query=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                setResults([]);
                return;
            }

            const data = await response.json();
            const searchResults: CoinResult[] = data.coins.slice(0, 10).map((c: SearchCoin) => ({
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                image: c.large,
                rank: c.market_cap_rank,
                category: c.category,
            }));
            setResults(searchResults);
            setIsDefault(false);
        } catch (error) {
            console.error("Error searching coins:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [fetchTrending]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchCoins(value);
        }, 300);
    };

    useEffect(() => {
        fetchTrending();
    }, [fetchTrending]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="cursor-pointer">Search</DialogTrigger>
            <DialogContent showCloseButton={false} className="p-0 gap-0 min-w-lg overflow-hidden">
                <DialogTitle className="sr-only">Search Coins</DialogTitle>
                <DialogHeader className="px-4 py-4 bg-card">
                    <div className="flex items-center gap-3">
                        {isSearching ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                            <HugeiconsIcon icon={Search01Icon} size={22} className="text-muted-foreground" />
                        )}
                        <Input
                            placeholder="Search by symbol or coin name"
                            className="p-0 md:text-base bg-transparent dark:bg-transparent border-none focus-visible:ring-0 focus-visible:outline-none text-base"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                            autoFocus
                        />
                        <DialogClose className="cursor-pointer" >
                            <HugeiconsIcon icon={Cancel01Icon} size={22} className="text-muted-foreground" />
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className="bg-card">
                    <div className="max-h-[40vh] overflow-y-auto">
                        {results.length > 0 ? (
                            <div className="flex flex-col">
                                {results.map((coin) => (
                                    <div
                                        key={coin.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                                        onClick={() => {
                                            router.push(`/coin/${coin.id}`);
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="relative w-8 h-8 flex-shrink-0">
                                            <Image
                                                src={coin.image}
                                                alt={coin.name}
                                                fill
                                                className="rounded-full object-contain"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-1 gap-1">
                                            <span className="font-medium text-sm truncate uppercase">{coin.name}</span>
                                            <div className="flex items-center gap-3 min-w-[140px] justify-between max-w-[140px]">
                                                <span className="text-xs text-muted-foreground truncate">{coin.symbol}</span>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                                                    Rank: #{coin.rank}
                                                </Badge>
                                            </div>
                                        </div>
                                        <HugeiconsIcon icon={StarIcon} size={20} className="text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        ) : !isSearching && searchQuery ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No coins found matching &quot;{searchQuery}&quot;
                            </div>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchDialog;