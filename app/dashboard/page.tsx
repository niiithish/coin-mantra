"use client";

import MarketOverview from "@/components/dashboard/market-overview";
import HeatMap from "@/components/dashboard/heatmap";
import TopStories from "@/components/dashboard/top-stories";
import MarketData from "@/components/dashboard/market-data";
const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-12 px-8 py-6">
      <div className="flex min-h-[60vh] gap-10">
        <div className="flex flex-2">
          <MarketOverview />
        </div>
        <div className="flex flex-4">
          <HeatMap />
        </div>
      </div>
      <div className="flex min-h-[60vh] gap-10">
        <div className="flex flex-2">
          <TopStories />
        </div>
        <div className="flex flex-4">
          <MarketData />
        </div>
      </div>
      <div />
    </div>
  );
};

export default DashboardPage;
