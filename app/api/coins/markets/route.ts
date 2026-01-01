import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "smart-contract-platform";
    const vs_currency = searchParams.get("vs_currency") || "usd";
    const per_page = searchParams.get("per_page") || "3";
    const page = searchParams.get("page") || "1";

    try {
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&category=${category}&per_page=${per_page}&page=${page}`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
            // Cache the response for 60 seconds to reduce API calls and avoid rate limiting
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            // Handle rate limiting specifically
            if (response.status === 429) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again later." },
                    { status: 429 }
                );
            }
            return NextResponse.json(
                { error: `API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching coin data:", error);
        return NextResponse.json(
            { error: "Failed to fetch coin data" },
            { status: 500 }
        );
    }
}
