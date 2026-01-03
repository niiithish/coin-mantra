"use client";
import { useEffect, useState } from "react";
import CoinOverview from "@/components/coin/coin-overview";
import FinancialNews from "@/components/coin/financial-news";
import TrendingCoins from "@/components/coin/trending-coins";
import { useParams } from "next/navigation";

const CoinPage = () => {
    const { id } = useParams();
    const [coinData, setCoinData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoinData = async () => {
            if (!id) return;

            setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoinData();
    }, [id]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-[50vh] text-destructive">
                <p className="text-xl font-semibold mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex gap-8">
                <div className="flex flex-3 w-full flex-col gap-8">
                </div>
                <div className="flex flex-1 flex-col gap-8">
                    <CoinOverview coinData={coinData} />
                </div>
            </div>
            <div className="flex gap-8">
                <div className="flex flex-1 w-full flex-col gap-8">
                </div>
                <div className="flex flex-2 flex-col gap-8">
                    <FinancialNews coinName={coinData?.name} />
                </div>
                <div className="flex flex-1 w-full flex-col gap-8 ">
                    <TrendingCoins currentCoinId={coinData?.id} />
                </div>
            </div>
        </div>
    );
};
export default CoinPage;