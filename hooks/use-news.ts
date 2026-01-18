import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// Types
export interface News {
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

// Fetch functions
const fetchNews = async (query?: string): Promise<NewsResponse> => {
    const searchQuery = query ? encodeURIComponent(query) : "";
    const url = searchQuery ? `/api/newsapi?q=${searchQuery}` : "/api/newsapi";

    const response = await fetch(url);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch news");
    }

    return response.json();
};

const fetchNewsPaginated = async ({
    pageParam = 1,
    query = "crypto",
    pageSize = 12,
}: {
    pageParam?: number;
    query?: string;
    pageSize?: number;
}): Promise<NewsResponse> => {
    const response = await fetch(
        `/api/newsapi?q=${encodeURIComponent(query)}&page=${pageParam}&pageSize=${pageSize}`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch news");
    }

    return response.json();
};

// Hooks
export function useNews(query?: string) {
    return useQuery({
        queryKey: ["news", query],
        queryFn: () => fetchNews(query),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data) => data.articles || [],
    });
}

export function useCryptoNews(coinName?: string) {
    const query = coinName ? `${coinName}-crypto` : "crypto";

    return useQuery({
        queryKey: ["news", "crypto", coinName],
        queryFn: () => fetchNews(query),
        enabled: coinName !== undefined,
        staleTime: 5 * 60 * 1000,
        select: (data) => data.articles || [],
    });
}

export function useInfiniteNews(query = "crypto", pageSize = 12) {
    return useInfiniteQuery({
        queryKey: ["news", "infinite", query],
        queryFn: ({ pageParam }) => fetchNewsPaginated({ pageParam, query, pageSize }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const totalPages = Math.ceil(lastPage.totalResults / lastPage.pageSize);
            const nextPage = lastPage.page + 1;
            return nextPage <= totalPages ? nextPage : undefined;
        },
        staleTime: 5 * 60 * 1000,
    });
}
