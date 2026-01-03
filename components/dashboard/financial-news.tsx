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

const FinancialNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/newsapi");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch news");
        }

        setNews(data.articles || []);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err instanceof Error ? err.message : "Failed to load news");
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);
  return (
    <div className="max-h-[60vh] overflow-y-scroll">
      <Card>
        <CardContent className="flex flex-col gap-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">Loading news...</p>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-8">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          {!isLoading && !error && news.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">No news available</p>
            </div>
          )}
          {!isLoading && !error && news.map((item) => (
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
