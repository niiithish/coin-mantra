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

  useEffect(() => {
    const fetchNews = async () => {
      const response = await fetch(
        "https://newsapi.org/v2/everything?q=crypto&pageSize=10&apiKey=af434bb97adf42e98541c390110e0201"
      );
      const data = await response.json();
      setNews(data.articles);
    };
    fetchNews();
  }, []);
  return (
    <div className="max-h-[60vh] overflow-y-scroll">
      <Card>
        <CardContent className="flex flex-col gap-3">
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
