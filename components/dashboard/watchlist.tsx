"use client";

import { Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";
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
  const router = useRouter();
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCoinId, setNewCoinId] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const searchCoins = useCallback(
    async (query: string) => {
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
    },
    [watchlistItems]
  );

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

  const loadWatchlist = useCallback(() => {
    const items = getWatchlist();
    setWatchlistItems(items);
  }, []);

  const fetchCoinDetails = useCallback(async () => {
    if (watchlistItems.length === 0) {
      setCoins([]);
      return;
    }

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
  }, [watchlistItems]);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    if (watchlistItems.length > 0) {
      fetchCoinDetails();
    }
  }, [watchlistItems, fetchCoinDetails]);

  const handleAddCoin = (coinId?: string) => {
    const idToAdd = coinId || newCoinId;
    if (!idToAdd.trim()) {
      return;
    }

    const result = addToWatchlist(idToAdd.toLowerCase());

    if (result) {
      toast.success(`Added ${idToAdd} to watchlist!`);
      handleDialogClose();
      loadWatchlist();
    } else {
      toast.error("Coin is already in your watchlist.");
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

  const handleRemoveCoin = (coinId: string) => {
    const result = removeFromWatchlist(coinId);

    if (result) {
      toast.success(`Removed ${coinId} from watchlist`);
      loadWatchlist();
    } else {
      toast.error("Failed to remove coin from watchlist");
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Your Watchlist</h1>
        <Button onClick={() => router.push("/watchlist")} variant="link">
          View All
        </Button>
      </div>
      <Card className="min-h-0 flex-1 content-start items-start gap-4 overflow-auto p-4">
        <div className="grid w-full grid-cols-3 gap-4">
          {coins.map((coin) => (
            <Card className="bg-secondary/20" key={coin.id}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-full">
                    <Image
                      alt={coin.name}
                      className="rounded-full"
                      height={32}
                      onClick={() => {
                        router.push(`/coin/${coin.id}`);
                      }}
                      src={getImageUrl(coin)}
                      style={{ height: "auto" }}
                      width={32}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="rounded-full">
                      <HugeiconsIcon
                        className="cursor-pointer"
                        color="#63a401"
                        fill="#63a401"
                        icon={StarIcon}
                        onClick={() => handleRemoveCoin(coin.id)}
                        size={18}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="cursor-pointer text-left font-regular text-foreground/80 text-xs hover:text-primary"
                    onClick={() => {
                      router.push(`/coin/${coin.id}`);
                    }}
                    type="button"
                  >
                    {coin.name}
                  </button>
                  {coin.market_data?.current_price?.usd ? (
                    <div className="font-semibold text-lg">
                      ${coin.market_data.current_price.usd.toFixed(2)}
                    </div>
                  ) : null}
                  {coin.market_data?.price_change_percentage_24h !==
                  undefined ? (
                    <div
                      className={`flex items-center gap-1.5 font-medium text-xs ${coin.market_data.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      <span>
                        {coin.market_data.price_change_percentage_24h > 0
                          ? "+"
                          : ""}
                        {coin.market_data.price_change_24h?.toFixed(2)}
                      </span>
                      <span className="opacity-90">
                        (
                        {coin.market_data.price_change_percentage_24h > 0
                          ? "+"
                          : ""}
                        {coin.market_data.price_change_percentage_24h.toFixed(
                          2
                        )}
                        %)
                      </span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
          <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
            <DialogTrigger>
              <Card className="group h-full cursor-pointer border-dashed bg-secondary/20 transition-all duration-300 hover:border-primary/50 hover:bg-secondary/40">
                <CardContent className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="rounded-full border p-4">
                    <svg
                      aria-labelledby="add-coin-icon-title"
                      className="h-8 w-8 text-primary/70"
                      fill="none"
                      role="img"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <title id="add-coin-icon-title">
                        Add coin to watchlist
                      </title>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground/80">Add Coin</p>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                    {isSearching ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <HugeiconsIcon icon={Search01Icon} size={14} />
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-64 gap-2 overflow-y-auto rounded-sm">
                    {searchResults.map((coin) => (
                      <Card
                        className="cursor-pointer rounded-none"
                        key={coin.id}
                        onClick={() => handleAddCoin(coin.id)}
                      >
                        <CardContent className="flex gap-4">
                          <Image
                            alt={coin.name}
                            className="rounded-full"
                            height={24}
                            src={coin.large}
                            width={34}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-foreground">
                              {coin.name}
                            </div>
                            <div className="text-muted-foreground text-xs uppercase">
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
                  <div className="py-4 text-center text-muted-foreground text-sm">
                    No coins found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export default Watchlist;
