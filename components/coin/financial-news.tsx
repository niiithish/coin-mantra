"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useCryptoNews } from "@/hooks/use-news";

interface FinancialNewsProps {
  coinName?: string;
}

const FinancialNews = ({ coinName }: FinancialNewsProps) => {
  const { data: news = [], error, isLoading } = useCryptoNews(coinName);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString.split("T")[0]; // Fallback to original format
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="h-full overflow-y-scroll">
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="overflow-y-scroll">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive text-sm">
              Error: {error instanceof Error ? error.message : "Failed to load news"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (news.length === 0) {
    return (
      <Card className="h-full overflow-y-scroll">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">No news available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-y-scroll">
      <CardContent className="flex flex-col gap-3">
        {news.map((item) =>
          item.urlToImage ? (
            <div
              className="flex flex-col gap-2 border-foreground/20 border-b py-1"
              key={item.url}
            >
              <div className="flex flex-row justify-start gap-5">
                <p className="text-muted-foreground text-xs">
                  {item.source.name}
                </p>
                <p className="text-muted-foreground text-xs"> • </p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(item.publishedAt)}
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
                    alt="No Image"
                    className="h-16 w-24 rounded-sm object-cover"
                    height={64}
                    src={item.urlToImage}
                    unoptimized
                    width={96}
                  />
                )}
              </div>
            </div>
          ) : null
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialNews;
