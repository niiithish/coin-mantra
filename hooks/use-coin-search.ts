import { useCallback, useEffect, useRef, useState } from "react";

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

interface UseCoinSearchParams {
  excludeCoinIds?: string[];
}

export function useCoinSearch({ excludeCoinIds = [] }: UseCoinSearchParams = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
          (coin) => !excludeCoinIds.some((id) => id === coin.id)
        );
        setSearchResults(filteredCoins.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Error searching coins:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [excludeCoinIds]
  );

  // Handle search input with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchCoins(value);
      }, 300);
    },
    [searchCoins]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
  };
}
