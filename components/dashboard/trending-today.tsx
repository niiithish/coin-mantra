"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: {
    price: number;
    price_btc: string;
    price_change_percentage_24h: Record<string, number>;
    market_cap: string;
    market_cap_btc: string;
    total_volume: string;
    total_volume_btc: string;
    sparkline: string;
    content: string | null;
  };
}

interface TrendingCoin {
  item: TrendingCoinItem;
}

interface TrendingResponse {
  coins: TrendingCoin[];
}

const TrendingToday = () => {
  const [trending, setTrending] = useState<TrendingCoin[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(
          "/api/coingecko?endpoint=/search/trending"
        );
        const result: TrendingResponse = await response.json();
        setTrending(result.coins);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="max-h-[60vh] overflow-y-scroll">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead>24 Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trending.map((coin) => (
                <TableRow className="text-sm" key={coin.item.id}>
                  <TableCell className="align-center">
                    <div className="flex flex-row items-center gap-2">
                      <Image
                        alt={coin.item.name}
                        className="rounded-full"
                        height={24}
                        src={coin.item.small}
                        style={{ height: "auto" }}
                        width={24}
                      />
                      {coin.item.name}
                    </div>
                  </TableCell>
                  <TableCell className="align-center">
                    {coin.item.symbol}
                  </TableCell>
                  <TableCell className="align-center">
                    ${coin.item.data.price.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`align-center ${coin.item.data.price_change_percentage_24h.usd > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {coin.item.data.price_change_percentage_24h.usd.toFixed(2)}%
                  </TableCell>
                  <TableCell className="align-center">
                    <Image
                      alt={coin.item.name}
                      className="rounded-full"
                      height={120}
                      src={coin.item.data.sparkline}
                      style={{ width: "auto", height: "auto" }}
                      width={120}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingToday;
