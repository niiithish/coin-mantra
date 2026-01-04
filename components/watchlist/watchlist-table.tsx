"use client";

import { Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";
import CreateAlertDialog from "@/components/create-alert-dialog";

// Coin market data from CoinGecko markets endpoint
interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

interface SearchCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

interface SearchResponse {
  coins: SearchCoin[];
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

const WatchlistTable = () => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [coinData, setCoinData] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load watchlist from localStorage
  const loadWatchlist = useCallback(() => {
    const items = getWatchlist();
    setWatchlistItems(items);
  }, []);

  // Fetch coin market data for watchlist items
  const fetchCoinData = useCallback(async () => {
    if (watchlistItems.length === 0) {
      setCoinData([]);
      setLoading(false);
      return;
    }

    try {
      const coinIds = watchlistItems.map((item) => item.coinId).join(",");
      const response = await fetch(
        `/api/coingecko?endpoint=/coins/markets&vs_currency=usd&ids=${coinIds}&price_change_percentage=24h`
      );

      if (response.ok) {
        const data: CoinMarketData[] = await response.json();
        setCoinData(data);
      }
    } catch (error) {
      console.error("Error fetching coin data:", error);
    } finally {
      setLoading(false);
    }
  }, [watchlistItems]);

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
          setSearchResults([]);
          return;
        }

        const data: SearchResponse = await response.json();
        // Filter out coins already in watchlist
        const filteredCoins = data.coins.filter(
          (coin) => !watchlistItems.some((item) => item.coinId === coin.id)
        );
        setSearchResults(filteredCoins.slice(0, 10));
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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCoins(value);
    }, 300);
  };

  const handleAddCoin = (coinId: string) => {
    const result = addToWatchlist(coinId.toLowerCase());

    if (result) {
      toast.success(`Added ${coinId} to watchlist!`);
      handleDialogClose();
      loadWatchlist();
    } else {
      toast.error("Coin is already in your watchlist.");
    }
  };

  const handleRemoveCoin = (coinId: string, coinName: string) => {
    const result = removeFromWatchlist(coinId);

    if (result) {
      toast.success(`Removed ${coinName} from watchlist`);
      loadWatchlist();
    } else {
      toast.error("Failed to remove coin from watchlist");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
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

  // Initial load
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Fetch coin data when watchlist changes
  useEffect(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-lg font-bold">Watchlist</h1>
        <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
          <DialogTrigger className="bg-primary text-primary-foreground hover:bg-primary/80 h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-clip-padding font-medium text-xs/relaxed outline-none transition-all focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
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
      <Card className="w-full h-full overflow-y-scroll px-0 py-0">
        <CardContent className="px-0 py-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : coinData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <p className="text-muted-foreground text-sm">
                Your watchlist is empty
              </p>
              <p className="text-muted-foreground text-sm">
                Add coins to start tracking
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead />
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>24h Volume</TableHead>
                  <TableHead>Alert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coinData.map((coin) => (
                  <TableRow className="text-sm" key={coin.id}>
                    <TableCell className="align-center py-4">
                      <Button
                        className="rounded-full"
                        variant="ghost"
                        onClick={() => handleRemoveCoin(coin.id, coin.name)}
                      >
                        <HugeiconsIcon
                          icon={StarIcon}
                          size={12}
                          fill="#63a401"
                          color="#63a401"
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="align-center py-4">
                      <Link href={`/coin/${coin.id}`}>
                        <div className="flex flex-row items-center gap-2">
                          <Image
                            alt={coin.name}
                            className="rounded-full"
                            height={24}
                            src={coin.image}
                            width={24}
                          />
                          <p className="hover:underline">{coin.name}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="align-center py-4 uppercase">
                      {coin.symbol}
                    </TableCell>
                    <TableCell className="align-center py-4">
                      {formatCurrency(coin.current_price)}
                    </TableCell>
                    <TableCell
                      className={`align-center py-4 ${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </TableCell>
                    <TableCell className="align-center py-4">
                      {formatCurrency(coin.market_cap)}
                    </TableCell>
                    <TableCell className="align-center py-4">
                      {formatCurrency(coin.total_volume)}
                    </TableCell>
                    <TableCell className="align-center py-4 px-4">
                      <CreateAlertDialog
                        coinId={coin.id}
                        coinName={coin.name}
                        coinSymbol={coin.symbol}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WatchlistTable;
