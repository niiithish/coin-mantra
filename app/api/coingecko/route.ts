import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "Endpoint is required" },
      { status: 400 }
    );
  }

  // Build the CoinGecko API URL with remaining query params
  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "endpoint") {
      params.append(key, value);
    }
  });

  const url = `https://api.coingecko.com/api/v3${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY || "",
      },
      // Add cache control to help with rate limiting
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("CoinGecko proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from CoinGecko" },
      { status: 500 }
    );
  }
}
