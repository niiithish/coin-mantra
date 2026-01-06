"use client";

import {
  Cancel01Icon,
  Search01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useWatchlist } from "@/hooks/use-watchlist";

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
  const [_isDefault, setIsDefault] = useState(true);
  const { isInWatchlist, addCoin, removeCoin } = useWatchlist();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle watchlist status
  const handleToggleWatchlist = async (
    e: React.MouseEvent,
    coin: CoinResult
  ) => {
    e.stopPropagation(); // Prevent navigation to coin page

    if (isInWatchlist(coin.id)) {
      await removeCoin(coin.id);
    } else {
      await addCoin(coin.id);
    }
  };

  const fetchTrending = useCallback(async () => {
    try {
      const response = await fetch("/api/coingecko?endpoint=/search/trending");
      const data = await response.json();
      const trendingCoins: CoinResult[] = data.coins
        .slice(0, 10)
        .map((c: TrendingCoin) => ({
          id: c.item.id,
          name: c.item.name,
          symbol: c.item.symbol,
          image: c.item.large,
          rank: c.item.market_cap_rank,
          price_change_percentage_24h:
            c.item.data.price_change_percentage_24h.usd,
        }));
      setResults(trendingCoins);
      setIsDefault(true);
    } catch (error) {
      console.error("Error fetching trending coins:", error);
    }
  }, []);

  const searchCoins = useCallback(
    async (query: string) => {
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
        const searchResults: CoinResult[] = data.coins
          .slice(0, 10)
          .map((c: SearchCoin) => ({
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
    },
    [fetchTrending]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCoins(value);
    }, 300);
  };

  // Load trending coins on mount
  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger className="cursor-pointer">Search</DialogTrigger>
      <DialogContent
        className="w-lg gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search Coins</DialogTitle>
        <DialogHeader className="bg-card px-4 py-4">
          <div className="flex items-center gap-3">
            {isSearching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={Search01Icon}
                size={22}
              />
            )}
            <Input
              autoFocus
              className="border-none bg-transparent p-0 text-base focus-visible:outline-none focus-visible:ring-0 md:text-base dark:bg-transparent"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchChange(e.target.value)
              }
              placeholder="Search by symbol or coin name"
              value={searchQuery}
            />
            <DialogClose className="cursor-pointer">
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={Cancel01Icon}
                size={22}
              />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="bg-card">
          <div className="max-h-[40vh] overflow-y-auto">
            {(() => {
              if (results.length > 0) {
                return (
                  <div className="flex flex-col">
                    {results.map((coin) => (
                      <div
                        className="group flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                        key={coin.id}
                      >
                        <button
                          className="flex flex-1 cursor-pointer items-center gap-3 text-left"
                          onClick={() => {
                            router.push(`/coin/${coin.id}`);
                            setOpen(false);
                          }}
                          type="button"
                        >
                          <div className="relative h-8 w-8 flex-shrink-0">
                            <Image
                              alt={coin.name}
                              className="rounded-full object-contain"
                              fill
                              src={coin.image}
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-sm uppercase">
                              {coin.name}
                            </span>
                            <span className="truncate text-muted-foreground text-xs">
                              {coin.symbol}
                            </span>
                          </div>
                        </button>
                        <button
                          className="cursor-pointer rounded-full p-1 transition-colors hover:bg-accent"
                          onClick={(e) => handleToggleWatchlist(e, coin)}
                          title={
                            isInWatchlist(coin.id)
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                          type="button"
                        >
                          <HugeiconsIcon
                            className={
                              isInWatchlist(coin.id)
                                ? "#63a401"
                                : "text-muted-foreground"
                            }
                            color="#63a401"
                            fill={isInWatchlist(coin.id) ? "#63a401" : "none"}
                            icon={StarIcon}
                            size={20}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              }
              if (!isSearching && searchQuery) {
                return (
                  <div className="p-8 text-center text-muted-foreground">
                    No coins found matching &quot;{searchQuery}&quot;
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
