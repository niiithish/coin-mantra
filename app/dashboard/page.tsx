"use client";

import HeatMap from "@/components/dashboardv2/heatmap";
import MarketData from "@/components/dashboardv2/market-data";
import MarketOverview from "@/components/dashboardv2/market-overview";
import TopStories from "@/components/dashboardv2/top-stories";

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
