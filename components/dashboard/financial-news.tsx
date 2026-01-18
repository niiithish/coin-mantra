"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNews } from "@/hooks/use-news";

const FinancialNews = () => {
  const router = useRouter();
  const { data: news = [], error, isLoading } = useNews("crypto");

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-bold text-lg">Today's Financial News</h1>
        <Button onClick={() => router.push("/news")} variant="link">
          View All
        </Button>
      </div>
      <Card className="min-h-0 flex-1 overflow-y-auto">
        <CardContent className="flex flex-col gap-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive text-sm">
                {error instanceof Error ? error.message : "Failed to load news"}
              </p>
            </div>
          )}
          {!isLoading && !error && news.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">No news available</p>
            </div>
          )}
          {news.map((item) => (
            <div
              className="flex flex-col gap-2 border-foreground/20 border-b py-2"
              key={item.url}
            >
              <div className="flex flex-row justify-start gap-5">
                <p className="text-muted-foreground text-xs">
                  {item.source.name}
                </p>
                <p className="text-muted-foreground text-xs"> • </p>
                <p className="text-muted-foreground text-xs">
                  {item.publishedAt.split("T")[0].split("-")[2] +
                    "/" +
                    item.publishedAt.split("T")[0].split("-")[1] +
                    "/" +
                    item.publishedAt.split("T")[0].split("-")[0]}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between gap-2">
                <a
                  className="cursor-pointer font-medium text-sm hover:underline"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.title}
                </a>
                {item.urlToImage && (
                  <Image
                    alt={item.title}
                    className="h-20 w-32 rounded-sm object-cover"
                    height={80}
                    src={item.urlToImage}
                    unoptimized
                    width={128}
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialNews;
