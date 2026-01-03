import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/everything?q=crypto&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch news" },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({ articles: data.articles });
    } catch (error) {
        console.error("News API error:", error);
    }
}
