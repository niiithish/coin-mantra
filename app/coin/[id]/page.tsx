"use client";
import { useParams } from "next/navigation";
import CoinDetails from "@/components/coin/coin-details";
import CoinOverview from "@/components/coin/coin-overview";
import { ErrorBoundary } from "@/components/error-boundary";
import FinancialNews from "@/components/coin/financial-news";
import PriceChart from "@/components/coin/price-chart";
import TrendingCoins from "@/components/coin/trending-coins";
import { useCoinData } from "@/hooks/use-coins";

const CoinPage = () => {
  const { id } = useParams();
  const { data: coinData, error, isLoading } = useCoinData(id as string);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Loading coin details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-destructive">
        <p className="mb-4 font-semibold text-xl">
          {error instanceof Error ? error.message : "Error loading coin details. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-8 p-8">
        <div className="flex h-[60vh] gap-8">
          <div className="flex w-full flex-3 flex-col gap-8">
            <PriceChart
              coinId={id as string}
              coinImage={coinData?.image?.large}
              coinName={coinData?.name}
              coinSymbol={coinData?.symbol}
              currentPrice={coinData?.market_data?.current_price?.usd}
              priceChange24h={coinData?.market_data?.price_change_24h}
              priceChangePercentage24h={
                coinData?.market_data?.price_change_percentage_24h
              }
            />
          </div>
          <div className="flex flex-1 flex-col gap-8">
            <CoinOverview coinData={coinData ?? null} />
          </div>
        </div>
        <div className="flex h-[60vh] gap-8">
          <div className="flex w-full flex-1 flex-col gap-8">
            <CoinDetails coinData={coinData ?? null} />
          </div>
          <div className="flex flex-2 flex-col gap-8">
            <FinancialNews coinName={coinData?.name} />
          </div>
          <div className="flex w-full flex-1 flex-col gap-8">
            <TrendingCoins currentCoinId={coinData?.id} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default CoinPage;
