"use client";

import { Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import CreateAlertDialog from "@/components/create-alert-dialog";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCoinMarketData } from "@/hooks/use-coins";
import { useCoinSearch } from "@/hooks/use-coin-search";
import { useWatchlist } from "@/hooks/use-watchlist";

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
  const {
    watchlist: watchlistItems,
    isLoading: watchlistLoading,
    addCoin,
    removeCoin,
  } = useWatchlist();

  // Fetch coin market data for all watchlist items
  const coinIds = watchlistItems.map((item) => item.coinId);
  const { data: coinData = [], isLoading: coinsLoading } = useCoinMarketData(coinIds);

  const loading = watchlistLoading || coinsLoading;
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use the shared search hook
  const {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
  } = useCoinSearch({ excludeCoinIds: coinIds });

  // Helper for keyboard navigation
  const handleKeyPress = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  const handleAddCoin = async (coinId: string) => {
    const success = await addCoin(coinId.toLowerCase());
    if (success) {
      setDialogOpen(false);
      clearSearch();
    }
  };

  const handleRemoveCoin = async (coinId: string, _coinName: string) => {
    await removeCoin(coinId);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
    } else {
      setDialogOpen(false);
      clearSearch();
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Watchlist</h1>
        <Dialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
          <DialogTrigger className="group/button inline-flex h-7 shrink-0 cursor-pointer select-none items-center justify-center gap-1 whitespace-nowrap rounded-md border border-transparent bg-primary bg-clip-padding px-2 font-medium text-primary-foreground text-xs/relaxed text-xs/relaxed outline-none transition-all hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
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
                <div className="max-h-64 gap-2 overflow-y-auto rounded-sm" role="listbox">
                  {searchResults.map((coin) => (
                    <Card
                      aria-label={`Add ${coin.name} (${coin.symbol}) to watchlist`}
                      className="cursor-pointer rounded-none"
                      key={coin.id}
                      onClick={() => handleAddCoin(coin.id)}
                      onKeyDown={handleKeyPress(() => handleAddCoin(coin.id))}
                      role="option"
                      tabIndex={0}
                    >
                      <CardContent className="flex gap-4">
                        <Image
                          alt={`${coin.name} logo`}
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
      <Card className="h-full w-full overflow-y-scroll px-0 py-0">
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
                    <TableCell className="py-4 align-center">
                      <Button
                        aria-label={`Remove ${coin.name} from watchlist`}
                        className="rounded-full"
                        onClick={() => handleRemoveCoin(coin.id, coin.name)}
                        variant="ghost"
                      >
                        <HugeiconsIcon
                          color="#63a401"
                          fill="#63a401"
                          icon={StarIcon}
                          size={12}
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="py-4 align-center">
                      <Link href={`/coin/${coin.id}`}>
                        <div className="flex flex-row items-center gap-2">
                          <Image
                            alt={`${coin.name} logo`}
                            className="rounded-full"
                            height={24}
                            src={coin.image}
                            width={24}
                          />
                          <p className="hover:underline">{coin.name}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 align-center uppercase">
                      {coin.symbol}
                    </TableCell>
                    <TableCell className="py-4 align-center">
                      {formatCurrency(coin.current_price)}
                    </TableCell>
                    <TableCell
                      className={`py-4 align-center ${coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      <span aria-hidden="true">
                        {coin.price_change_percentage_24h >= 0 ? "▲" : "▼"}
                      </span>{" "}
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </TableCell>
                    <TableCell className="py-4 align-center">
                      {formatCurrency(coin.market_cap)}
                    </TableCell>
                    <TableCell className="py-4 align-center">
                      {formatCurrency(coin.total_volume)}
                    </TableCell>
                    <TableCell className="px-4 py-4 align-center">
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
