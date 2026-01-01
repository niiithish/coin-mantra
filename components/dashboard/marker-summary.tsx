"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import type { ChartData } from "chart.js";
import { LineChart } from "@/components/ui/line-chart";

interface Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}

// Sample chart data - you can replace this with real price history data
const sampleChartData: ChartData<"line"> = {
    labels: ["21 Dec", "22 Dec", "23 Dec", "24 Dec", "25 Dec", "26 Dec", "27 Dec"],
    datasets: [
        {
            label: "Price",
            data: [5420, 5480, 5550, 5520, 5560, 5450, 5400],
            fill: false,
            borderColor: "#46B49E",
            backgroundColor: "#46B49E",
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
        },
    ],
};

const MarkerSummary = () => {
    const [id, setId] = useState("smart-contract-platform");
    const [coins, setCoins] = useState<Coin[]>([]);
    const [coin, setCoin] = useState('bitcoin');

    const fetchPrice = async () => {
        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=7&interval=daily`
            );
            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `/api/coins/markets?category=${id}&vs_currency=usd&per_page=3&page=1`
                );
                const result = await response.json();
                console.log(result);
                setCoins(result);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                console.log(id);
                setCoins([]);
            }
        };
        fetchData();
    }, [id]);

    return (
        <div className="flex-1 w-full">
            <Card className="w-full">
                <CardHeader>
                    <Tabs value={id}>
                        <TabsList className="shadow-sm">
                            <TabsTrigger
                                value="smart-contract-platform"
                                onClick={() => setId("smart-contract-platform")}
                            >
                                Smart Contract
                            </TabsTrigger>
                            <TabsTrigger value="layer-1" onClick={() => setId("layer-1")}>
                                Layer1(L1)
                            </TabsTrigger>
                            <TabsTrigger value="meme-token" onClick={() => setId("meme-token")}>
                                Memecoins
                            </TabsTrigger>
                            <TabsTrigger
                                value="proof-of-stake-pos"
                                onClick={() => setId("proof-of-stake-pos")}
                            >
                                Proof of Stake (PoS)
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value={id}>
                            <LineChart
                                data={sampleChartData}
                                className="h-52 w-full"
                            />
                            <div className="flex gap-5 mt-4 w-full">
                                {coins.map((item: Coin) => (
                                    <Card className="cursor-pointer" key={item.id} onClick={() => {
                                        setCoin(item.id);
                                        fetchPrice();
                                    }}>
                                        <CardHeader className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={20}
                                                    height={20}
                                                />
                                                <p>{item.name}</p>
                                            </div>
                                            <Badge className="uppercase" variant="secondary">
                                                {item.symbol}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 items-center mb-4">
                                                <p className="font-bold text-lg">
                                                    ${item.current_price}
                                                </p>
                                                <p
                                                    className={`${item.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                                                >
                                                    {item.price_change_percentage_24h.toFixed(2)}%
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>
        </div >
    );
};

export default MarkerSummary;