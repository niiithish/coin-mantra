"use client";

import { Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"
import { Badge } from "../ui/badge";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image?:
  | {
    thumb?: string;
    small?: string;
    large?: string;
  }
  | string;
  market_data?: {
    current_price?: {
      usd?: number;
    };
    price_change_24h?: number;
    price_change_percentage_24h?: number;
  };
}

interface WatchlistItem {
  id: number;
  coinId: string;
}

interface SearchCoin {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

interface SearchResponse {
  coins: SearchCoin[];
}

const Watchlist = () => {
  const [coins, setCoins] = useState<CoinData[]>([]);

  const getImageUrl = (coin: CoinData): string => {
    if (typeof coin.image === "string") {
      return coin.image;
    }
    if (coin.image) {
      return coin.image.small || coin.image.large || coin.image.thumb || "";
    }
    return "";
  };
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCoinId, setNewCoinId] = useState("");
  const [addingCoin, setAddingCoin] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchCoins = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/coingecko?endpoint=/search&query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        console.error("Search failed:", response.statusText);
        setSearchResults([]);
        return;
      }

      const data: SearchResponse = await response.json();
      // Filter out coins already in watchlist
      const filteredCoins = data.coins.filter(
        (coin) => !watchlistItems.some((item) => item.coinId === coin.id)
      );
      setSearchResults(filteredCoins.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error("Error searching coins:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [watchlistItems]);

  // Handle search input with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchCoins(value);
    }, 300);
  };

  const fetchWatchlist = async () => {
    try {
      const response = await fetch("/api/watchlist");
      const items: WatchlistItem[] = await response.json();
      setWatchlistItems(items);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  const fetchCoinDetails = async () => {
    if (watchlistItems.length === 0) {
      setCoins([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const coinPromises = watchlistItems.map(async (item) => {
      try {
        const response = await fetch(
          `/api/coingecko?endpoint=/coins/${item.coinId}`
        );

        if (!response.ok) {
          toast.error(
            `Error fetching price for coin "${item.coinId}": HTTP ${response.status} - ${response.statusText}`
          );
          return null;
        }

        const data: CoinData = await response.json();

        if (!data.market_data?.current_price?.usd) {
          toast.error(
            `Error fetching price for coin "${item.coinId}": Price data not available`
          );
        }

        return data;
      } catch (error) {
        console.error(`Error fetching price for coin "${item.coinId}":`, error);
        return null;
      }
    });

    const results = await Promise.all(coinPromises);
    const validCoins = results.filter(
      (coin): coin is CoinData =>
        coin !== null &&
        coin.id !== undefined &&
        coin.name !== undefined &&
        coin.market_data?.current_price?.usd !== undefined
    );
    setCoins(validCoins);
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (watchlistItems.length > 0) {
      fetchCoinDetails();
    } else {
      setLoading(false);
    }
  }, [watchlistItems]);

  const handleAddCoin = async (coinId?: string) => {
    const idToAdd = coinId || newCoinId;
    if (!idToAdd.trim()) return;

    setAddingCoin(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: idToAdd.toLowerCase() }),
      });

      if (response.ok) {
        toast.success(`Added ${idToAdd} to watchlist!`);
        handleDialogClose();
        await fetchWatchlist();
      } else {
        toast.error("Failed to add coin. Please check the coin ID.");
      }
    } catch (error) {
      console.error("Error adding coin:", error);
      toast.error("Error adding coin to watchlist.");
    } finally {
      setAddingCoin(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewCoinId("");
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      handleDialogClose();
    }
  };

  const handleRemoveCoin = async (coinId: string) => {
    try {
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId }),
      });

      if (response.ok) {
        toast.success(`Removed ${coinId} from watchlist`);
        await fetchWatchlist();
      } else {
        toast.error("Failed to remove coin from watchlist");
      }
    } catch (error) {
      console.error("Error removing coin:", error);
      toast.error("Error removing coin from watchlist");
    }
  };

  return (
    <Card className="grid h-full grid-cols-3 items-start gap-4 p-4">
      {coins.map((coin) => (
        <Card key={coin.id} className="bg-secondary/20">
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="rounded-sm">
                <Image
                  alt={coin.name}
                  className="rounded-sm"
                  height={32}
                  src={getImageUrl(coin)}
                  style={{ height: "auto" }}
                  width={32}
                />
              </div>
              <div className="flex gap-2">
                <div className="rounded-full">
                  <HugeiconsIcon className="cursor-pointer" icon={StarIcon} size={20} fill="#63a401" color="#63a401" onClick={() => handleRemoveCoin(coin.id)} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-regular text-foreground/80 text-xs">
                {coin.name}
              </h3>
              {coin.market_data?.current_price?.usd ? (
                <div className="font-semibold text-xl">
                  ${coin.market_data.current_price.usd.toFixed(2)}
                </div>
              ) : (
                <div className="font-semibold text-xl">Loading...</div>
              )}
              {coin.market_data?.price_change_percentage_24h !== undefined ? (
                <div
                  className={`flex items-center gap-1.5 font-medium text-xs ${coin.market_data.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                >
                  <span>
                    {coin.market_data.price_change_percentage_24h > 0 ? "+" : ""}
                    {coin.market_data.price_change_24h?.toFixed(2)}
                  </span>
                  <span className="opacity-90">
                    ({coin.market_data.price_change_percentage_24h > 0 ? "+" : ""}
                    {coin.market_data.price_change_percentage_24h.toFixed(2)}%)
                  </span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
      {watchlistItems.length < 6 && (
        <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
          <DialogTrigger className="cursor-pointer rounded-sm bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors">
            Add Coin
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>
                Search for a cryptocurrency to add to your watchlist
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative">
                <Input
                  className="pl-10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search coins (e.g., Bitcoin, Ethereum, Solana)"
                  value={searchQuery}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <HugeiconsIcon icon={Search01Icon} size={14} />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded-sm gap-2">
                  {searchResults.map((coin) => (
                    <Card
                      key={coin.id}
                      onClick={() => handleAddCoin(coin.id)}
                      className="cursor-pointer rounded-none"
                    >
                      <CardContent className="flex gap-4">
                        <Image
                          alt={coin.name}
                          className="rounded-full"
                          height={24}
                          src={coin.large}
                          width={34}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {coin.name}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {coin.symbol}
                          </div>
                        </div>
                        {coin.market_cap_rank && (
                          <Badge variant="outline">
                            #{coin.market_cap_rank}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No coins found for &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>)}
    </Card>
  );
};

export default Watchlist;
