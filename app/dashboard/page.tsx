"use client";

import FinancialNews from "@/components/dashboard/financial-news";
import MarkerSummary from "@/components/dashboard/marker-summary";
import TrendingToday from "@/components/dashboard/trending-today";
import Watchlist from "@/components/dashboard/watchlist";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-10 p-8">
      <div className="flex h-[60vh] gap-8">
        <div className="flex flex-1 flex-col gap-4">
          <MarkerSummary />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <Watchlist />
        </div>
      </div>
      <div className="flex h-[60vh] gap-8">
        <div className="flex flex-1 flex-col gap-4 min-h-0">
          <TrendingToday />
        </div>
        <div className="flex flex-1 flex-col gap-4 min-h-0">
          <FinancialNews />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
