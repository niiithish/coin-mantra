"use client";

import { ArrowRight02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "react-query";
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

interface NewsResponse {
  articles: News[];
  totalResults: number;
  page: number;
  pageSize: number;
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
    return `${diffInMinutes}m ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  return `${diffInDays}d ago`;
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

const NewsCard = ({ news }: { news: News }) => {
  const hasImage = news.urlToImage && news.urlToImage.length > 0;

  return (
    <Link
      className="group block h-full"
      href={news.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Card className="relative flex h-full flex-col overflow-hidden pt-0">
        {/* Image Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {hasImage ? (
            /* biome-ignore lint/performance/noImgElement: External news images from many domains cannot be whitelisted */
            <img
              alt={news.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              height={200}
              loading="lazy"
              src={news.urlToImage}
              width={400}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-4xl text-primary/30">📰</div>
            </div>
          )}
        </div>

        <CardHeader className="gap-2 pb-2">
          {/* Source Badge */}
          <div className="flex items-center justify-between gap-2">
            <Badge
              className="max-w-fit truncate rounded-md bg-primary/10 text-primary hover:bg-primary/20"
              variant="secondary"
            >
              {news.source.name}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {formatTimeAgo(news.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <CardTitle className="line-clamp-2 font-semibold text-sm leading-snug transition-colors group-hover:text-primary">
            {truncateText(news.title, 80)}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 pb-2">
          {/* Description */}
          <CardDescription className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {truncateText(news.description || news.content, 120)}
          </CardDescription>
        </CardContent>

        <CardFooter className="pt-2">
          {/* Read More Link */}
          <span className="inline-flex items-center gap-1.5 font-medium text-primary text-xs transition-all duration-200">
            Read Article
            <HugeiconsIcon
              className="h-3.5 w-3.5 transition-transform duration-200"
              icon={ArrowRight02Icon}
            />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

// Skeleton card for loading state
const NewsCardSkeleton = () => {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="aspect-video w-full animate-pulse bg-muted" />
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-muted" />
      </CardContent>
      <CardFooter className="pt-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  );
};

// Fetch news with pagination
const fetchNews = async ({
  pageParam = 1,
}: {
  pageParam?: number;
}): Promise<NewsResponse> => {
  const response = await fetch(
    `/api/newsapi?q=${encodeURIComponent("crypto")}&page=${pageParam}&pageSize=12`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch news");
  }

  return response.json();
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
    <HugeiconsIcon className="h-5 w-5 animate-spin" icon={Loading03Icon} />
    <span className="text-sm">Loading more news...</span>
  </div>
);

// Error State Component
const NewsErrorState = ({ error }: { error: string }) => (
  <div className="mx-auto w-full max-w-7xl px-4 py-8">
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-4xl">😕</div>
        <p className="text-center text-destructive text-sm">{error}</p>
      </CardContent>
    </Card>
  </div>
);

// Empty State Component
const NewsEmptyState = () => (
  <div className="mx-auto w-full max-w-7xl px-4 py-8">
    <Card className="bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="text-4xl">📭</div>
        <p className="text-center text-muted-foreground text-sm">
          No news available at the moment
        </p>
      </CardContent>
    </Card>
  </div>
);

const News = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<NewsResponse, Error>("news", fetchNews, {
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalResults / lastPage.pageSize);
      const nextPage = lastPage.page + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) {
      return;
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // All news articles from all pages
  const allNews = data?.pages.flatMap((page) => page.articles) || [];

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-lg text-transparent tracking-tight md:text-4xl">
            Crypto News
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated with the latest cryptocurrency news and insights
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <NewsCardSkeleton key={`skeleton-${index + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <NewsErrorState error={error.message} />;
  }

  if (allNews.length === 0) {
    return <NewsEmptyState />;
  }

  return (
    <div className="mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Crypto News</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Stay updated with the latest cryptocurrency news and insights
        </p>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allNews.map((news, index) => (
          <NewsCard key={`${news.url}-${index}`} news={news} />
        ))}
      </div>

      {/* Load More Trigger */}
      <div className="mt-8" ref={loadMoreRef}>
        {(() => {
          if (isFetchingNextPage) {
            return <LoadingSpinner />;
          }
          if (hasNextPage) {
            return (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">
                  Scroll for more news
                </span>
              </div>
            );
          }
          if (allNews.length > 0) {
            return (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">
                  You've reached the end
                </span>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default News;
