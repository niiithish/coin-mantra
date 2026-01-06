"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInMs = now.getTime() - publishedDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength).trim()}...`;
};

const NewsCard = ({ news, ticker }: { news: News; ticker?: string }) => {
  return (
    <Card className="group flex h-full flex-col transition-all duration-300 hover:shadow-black/20 hover:shadow-lg hover:ring-foreground/20">
      <CardHeader className="gap-3">
        {/* Ticker Badge */}
        {ticker && (
          <Badge
            className={"w-fit rounded-md uppercase tracking-wide"}
            variant="outline"
          >
            {ticker}
          </Badge>
        )}

        {/* Title */}
        <CardTitle className="line-clamp-2 text-sm leading-snug transition-colors group-hover:text-foreground">
          {truncateText(news.title, 80)}
        </CardTitle>

        {/* Source and Time */}
        <CardDescription className="flex items-center gap-2">
          <span className="font-medium">{news.source.name}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{formatTimeAgo(news.publishedAt)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Description */}
        <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
          {truncateText(news.description || news.content, 150)}
        </p>
      </CardContent>

      <CardFooter>
        {/* Read More Link */}
        <Link
          className="inline-flex items-center gap-1.5 font-medium text-primary text-xs transition-all duration-200 hover:text-primary/80"
          href={news.url}
        >
          Read More
          <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} />
        </Link>
      </CardFooter>
    </Card>
  );
};

const fetchNewsFromAPI = async () => {
  const response = await fetch(
    `/api/newsapi?q=${encodeURIComponent("crypto")}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch news");
  }

  return response.json();
};

const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let loadInProgress = false;

    const handleSuccess = (data: unknown) => {
      if (!isMounted) {
        return;
      }
      setNews((data as { articles?: News[] }).articles?.slice(0, 6) || []);
    };

    const handleError = (err: unknown) => {
      if (!isMounted) {
        return;
      }
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Failed to load news");
      setNews([]);
    };

    const finishLoading = () => {
      if (!isMounted) {
        return;
      }
      setLoading(false);
    };

    const loadNews = async () => {
      if (loadInProgress || !isMounted) {
        return;
      }

      loadInProgress = true;
      setLoading(true);
      setError(null);

      try {
        const data = await fetchNewsFromAPI();
        handleSuccess(data);
      } catch (err) {
        handleError(err);
      } finally {
        finishLoading();
        loadInProgress = false;
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return { news, loading, error };
};

const NewsGrid = ({ news }: { news: News[] }) => {
  return (
    <div className="w-full">
      <h2 className="mb-6 font-semibold text-xl">Latest News</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {news.map((item) => (
          <NewsCard key={item.url} news={item} />
        ))}
      </div>
    </div>
  );
};

const NewsErrorState = ({ error }: { error: string }) => (
  <div className="w-full">
    <h2 className="mb-6 font-semibold text-xl">Latest News</h2>
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex items-center justify-center py-12">
        <p className="text-destructive text-sm">{error}</p>
      </CardContent>
    </Card>
  </div>
);

const NewsEmptyState = () => (
  <div className="w-full">
    <h2 className="mb-6 font-semibold text-xl">Latest News</h2>
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">No news available</p>
      </CardContent>
    </Card>
  </div>
);

const WatchlistNews = () => {
  const { news, error } = useNews();

  if (error) {
    return <NewsErrorState error={error} />;
  }

  if (news.length === 0) {
    return <NewsEmptyState />;
  }

  return <NewsGrid news={news} />;
};

export default WatchlistNews;
