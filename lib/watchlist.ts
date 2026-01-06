// Watchlist types and API management

export interface WatchlistItem {
  id: string;
  coinId: string;
  addedAt: string;
}

/**
 * Get all watchlist items from API
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const response = await fetch("/api/watchlist");
    if (!response.ok) {
      if (response.status === 401) {
        return []; // Not logged in
      }
      throw new Error("Failed to fetch watchlist");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
}

/**
 * Add a coin to the watchlist
 */
export async function addToWatchlist(
  coinId: string
): Promise<WatchlistItem | null> {
  try {
    const response = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinId: coinId.toLowerCase() }),
    });

    if (!response.ok) {
      if (response.status === 409) {
        return null; // Already exists
      }
      throw new Error("Failed to add to watchlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return null;
  }
}

/**
 * Remove a coin from the watchlist by coinId
 */
export async function removeFromWatchlist(coinId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/watchlist?coinId=${coinId.toLowerCase()}`,
      {
        method: "DELETE",
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
}

/**
 * Check if a coin is in the watchlist
 */
export async function isInWatchlist(coinId: string): Promise<boolean> {
  const watchlist = await getWatchlist();
  return watchlist.some((item) => item.coinId === coinId.toLowerCase());
}

/**
 * Get all coin IDs in the watchlist
 */
export async function getWatchlistCoinIds(): Promise<string[]> {
  const watchlist = await getWatchlist();
  return watchlist.map((item) => item.coinId);
}

/**
 * Clear the entire watchlist
 * Note: This might need a specific API endpoint if implemented,
 * for now we just return as it's not commonly used.
 */
export function clearWatchlist(): void {
  // Not implemented on server yet
  console.warn("clearWatchlist not implemented on server");
}
