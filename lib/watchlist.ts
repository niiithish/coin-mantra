// Watchlist types and API management
import { authClient } from "./auth-client";

export interface WatchlistItem {
  id: string;
  coinId: string;
  addedAt: string;
}

const LOCAL_WATCHLIST_KEY = "coinwatch_watchlist";

/**
 * Get local watchlist from localStorage
 */
function getLocalWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem(LOCAL_WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save to local watchlist
 */
function saveLocalWatchlist(items: WatchlistItem[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(items));
}

/**
 * Get all watchlist items
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const session = await authClient.getSession();

    // If not logged in, use localStorage
    if (!session.data) {
      return getLocalWatchlist();
    }

    const response = await fetch("/api/watchlist");
    if (!response.ok) {
      if (response.status === 401) {
        return getLocalWatchlist();
      }
      throw new Error("Failed to fetch watchlist");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return getLocalWatchlist();
  }
}

/**
 * Add a coin to the watchlist
 */
export async function addToWatchlist(
  coinId: string
): Promise<WatchlistItem | null> {
  try {
    const session = await authClient.getSession();

    if (!session.data) {
      const localWatchlist = getLocalWatchlist();
      if (localWatchlist.some((item) => item.coinId === coinId.toLowerCase())) {
        return null; // Already exists
      }

      const newItem: WatchlistItem = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        coinId: coinId.toLowerCase(),
        addedAt: new Date().toISOString(),
      };

      const updatedList = [...localWatchlist, newItem];
      saveLocalWatchlist(updatedList);
      return newItem;
    }

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
    const session = await authClient.getSession();

    if (!session.data) {
      const localWatchlist = getLocalWatchlist();
      const updatedList = localWatchlist.filter(
        (item) => item.coinId !== coinId.toLowerCase()
      );
      saveLocalWatchlist(updatedList);
      return true;
    }

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
 * Clear the local watchlist
 */
export function clearLocalWatchlist(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_WATCHLIST_KEY);
  }
}

/**
 * Sync local watchlist to database
 */
export async function syncWatchlistToDb(): Promise<void> {
  const localWatchlist = getLocalWatchlist();
  if (localWatchlist.length === 0) {
    return;
  }

  const session = await authClient.getSession();
  if (!session.data) {
    return;
  }

  console.log("Syncing local watchlist to DB...");

  for (const item of localWatchlist) {
    await addToWatchlist(item.coinId);
  }

  clearLocalWatchlist();
}
