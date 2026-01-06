// Watchlist types and localStorage management

export interface WatchlistItem {
  id: string;
  coinId: string;
  addedAt: string;
}

const WATCHLIST_STORAGE_KEY = "coinwatch_watchlist";

/**
 * Get all watchlist items from localStorage
 */
export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const watchlistJson = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return watchlistJson ? JSON.parse(watchlistJson) : [];
  } catch (error) {
    console.error("Error reading watchlist from localStorage:", error);
    return [];
  }
}

/**
 * Add a coin to the watchlist
 */
export function addToWatchlist(coinId: string): WatchlistItem | null {
  const watchlist = getWatchlist();

  // Check if coin is already in watchlist
  if (watchlist.some((item) => item.coinId === coinId)) {
    return null;
  }

  const newItem: WatchlistItem = {
    id: crypto.randomUUID(),
    coinId,
    addedAt: new Date().toISOString(),
  };

  watchlist.push(newItem);

  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error("Error saving to watchlist:", error);
    return null;
  }

  return newItem;
}

/**
 * Remove a coin from the watchlist by coinId
 */
export function removeFromWatchlist(coinId: string): boolean {
  const watchlist = getWatchlist();
  const filteredWatchlist = watchlist.filter((item) => item.coinId !== coinId);

  if (filteredWatchlist.length === watchlist.length) {
    // Coin was not in watchlist
    return false;
  }

  try {
    localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      JSON.stringify(filteredWatchlist)
    );
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }

  return true;
}

/**
 * Check if a coin is in the watchlist
 */
export function isInWatchlist(coinId: string): boolean {
  const watchlist = getWatchlist();
  return watchlist.some((item) => item.coinId === coinId);
}

/**
 * Get all coin IDs in the watchlist
 */
export function getWatchlistCoinIds(): string[] {
  const watchlist = getWatchlist();
  return watchlist.map((item) => item.coinId);
}

/**
 * Clear the entire watchlist
 */
export function clearWatchlist(): void {
  try {
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing watchlist:", error);
  }
}
