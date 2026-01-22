"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTrendingCoins } from "@/hooks/use-trending";

const TrendingToday = () => {
  const { data: trending = [], isLoading } = useTrendingCoins();

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Trending Today</h1>
      </div>
      <Card className="min-h-0 w-full flex-1 overflow-auto px-0 py-0">
        <CardContent className="w-full px-0 py-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="min-w-[600px]">
              <Table>
                <TableHeader className="bg-secondary/20">
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
                      <TableCell className="max-w-[150px] align-center">
                        <Link href={`/coin/${coin.item.slug}`}>
                          <div className="flex flex-row items-center gap-2">
                            <Image
                              alt={`${coin.item.name} logo`}
                              className="flex-shrink-0 rounded-full"
                              height={24}
                              src={coin.item.small}
                              style={{ height: "auto" }}
                              width={24}
                            />
                            <p className="overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
                              {coin.item.name}
                            </p>
                          </div>
                        </Link>
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
                        <span aria-hidden="true">
                          {coin.item.data.price_change_percentage_24h.usd > 0
                            ? "▲"
                            : "▼"}
                        </span>{" "}
                        {coin.item.data.price_change_percentage_24h.usd.toFixed(2)}%
                      </TableCell>
                      <TableCell className="align-center">
                        <Image
                          alt={`24-hour price chart for ${coin.item.name}`}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingToday;
