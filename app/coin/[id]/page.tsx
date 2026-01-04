"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CoinDetails from "@/components/coin/coin-details";
import CoinOverview from "@/components/coin/coin-overview";
import FinancialNews from "@/components/coin/financial-news";
import PriceChart from "@/components/coin/price-chart";
import TrendingCoins from "@/components/coin/trending-coins";

interface MarketData {
  current_price: { [key: string]: number };
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  total_supply: number;
  ath: { [key: string]: number };
  atl: { [key: string]: number };
  high_24h: { [key: string]: number };
  low_24h: { [key: string]: number };
}

interface CoinPageData {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  description: {
    en: string;
  };
  links: {
    homepage: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    repos_url: {
      github: string[];
    };
    whitepaper: string;
    blockchain_site: string[];
  };
  contract_address: string;
  categories: string[];
  market_cap_rank: number;
  market_data: MarketData;
}

const CoinPage = () => {
  const { id } = useParams();
  const [coinData, setCoinData] = useState<CoinPageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!id) {
        return;
      }

      try {
        const response = await fetch(`/api/coingecko?endpoint=/coins/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch coin data");
        }
        const data = await response.json();
        setCoinData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching coin data:", err);
        setError("Error loading coin details. Please try again later.");
      }
    };
    fetchCoinData();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-destructive">
        <p className="mb-4 font-semibold text-xl">{error}</p>
      </div>
    );
  }

  return (
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
          <CoinOverview coinData={coinData} />
        </div>
      </div>
      <div className="flex h-[60vh] gap-8">
        <div className="flex w-full flex-1 flex-col gap-8">
          <CoinDetails coinData={coinData} />
        </div>
        <div className="flex flex-2 flex-col gap-8">
          <FinancialNews coinName={coinData?.name} />
        </div>
        <div className="flex w-full flex-1 flex-col gap-8">
          <TrendingCoins currentCoinId={coinData?.id} />
        </div>
      </div>
    </div>
  );
};
export default CoinPage;
