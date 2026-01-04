import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface News {
  source: {
    name: string;
  };
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

interface FinancialNewsProps {
  coinName?: string;
}

const FinancialNews = ({ coinName }: FinancialNewsProps) => {
  const [news, setNews] = useState<News[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (coinName === undefined) {
      return; // Wait for coinData to be available
    }

    const fetchNews = async () => {
      try {
        setError(null);
        const query = coinName ? encodeURIComponent(coinName) : "crypto";
        const response = await fetch(`/api/newsapi?q=${query}-crypto`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch news");
        }

        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err instanceof Error ? err.message : "Failed to load news");
        setNews([]);
      }
    };
    fetchNews();
  }, [coinName]);

  // Show error state
  if (error) {
    return (
      <Card className="overflow-y-scroll">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive text-sm">Error: {error}</p>
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
