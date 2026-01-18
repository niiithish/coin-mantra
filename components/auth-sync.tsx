"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ALERTS_QUERY_KEY } from "@/hooks/use-alerts";
import { WATCHLIST_QUERY_KEY } from "@/hooks/use-watchlist";
import { syncAlertsToDb } from "@/lib/alerts";
import { authClient } from "@/lib/auth-client";
import { syncWatchlistToDb } from "@/lib/watchlist";

export function AuthSync() {
  const { data: session, isPending } = authClient.useSession();
  const queryClient = useQueryClient();
  const prevSessionRef = useRef(session);

  useEffect(() => {
    // If we transitioned from no session to a session, sync data
    if (!prevSessionRef.current && session && !isPending) {
      const syncData = async () => {
        try {
          await Promise.all([syncWatchlistToDb(), syncAlertsToDb()]);
          // Refresh queries to show synced data
          queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: ALERTS_QUERY_KEY });
        } catch (error) {
          console.error("Failed to sync local data to DB:", error);
        }
      };
      syncData();
    }
    prevSessionRef.current = session;
  }, [session, isPending, queryClient]);

  return null;
}
