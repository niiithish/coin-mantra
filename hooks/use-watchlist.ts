import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addToWatchlist as apiAddToWatchlist,
  removeFromWatchlist as apiRemoveFromWatchlist,
  getWatchlist,
} from "@/lib/watchlist";

export const WATCHLIST_QUERY_KEY = ["watchlist"];

export function useWatchlist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: WATCHLIST_QUERY_KEY,
    queryFn: getWatchlist,
    staleTime: 60 * 1000, // 1 minute
  });

  const addMutation = useMutation({
    mutationFn: (coinId: string) => apiAddToWatchlist(coinId),
    onSuccess: (data, coinId) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY });
        toast.success(`Added ${coinId} to watchlist!`);
      } else {
        toast.error("Coin is already in your watchlist.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to watchlist");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (coinId: string) => apiRemoveFromWatchlist(coinId),
    onSuccess: (success, coinId) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY });
        toast.success(`Removed ${coinId} from watchlist`);
      } else {
        toast.error("Failed to remove from watchlist");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove from watchlist");
    },
  });

  return {
    watchlist: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCoin: addMutation.mutateAsync,
    removeCoin: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    // Add a helper for coin IDs for easy lookups
    watchlistCoinIds: (query.data || []).map((item) => item.coinId),
    isInWatchlist: (coinId: string) =>
      (query.data || []).some((item) => item.coinId === coinId.toLowerCase()),
    // Expose queryClient for manual invalidations if needed
    refresh: () => queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY }),
  };
}
