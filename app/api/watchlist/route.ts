import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { watchlist } from "@/lib/schema";

// GET - Fetch all watchlist items for the current user
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, session.user.id))
      .orderBy(watchlist.addedAt);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST - Add a coin to the watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { coinId } = await request.json();

    if (!coinId) {
      return NextResponse.json(
        { error: "coinId is required" },
        { status: 400 }
      );
    }

    // Check if coin already exists in user's watchlist
    const existing = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, session.user.id),
          eq(watchlist.coinId, coinId.toLowerCase())
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Coin already in watchlist" },
        { status: 409 }
      );
    }

    const newItem = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      coinId: coinId.toLowerCase(),
    };

    await db.insert(watchlist).values(newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a coin from the watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get("coinId");

    if (!coinId) {
      // Fallback to body for backward compatibility if needed, or just require query param
      try {
        const body = await request.json();
        if (body.coinId) {
          await db
            .delete(watchlist)
            .where(
              and(
                eq(watchlist.userId, session.user.id),
                eq(watchlist.coinId, body.coinId.toLowerCase())
              )
            );
          return NextResponse.json({ success: true });
        }
      } catch (_e) {
        // body might not be JSON
      }
      return NextResponse.json(
        { error: "coinId is required" },
        { status: 400 }
      );
    }

    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, session.user.id),
          eq(watchlist.coinId, coinId.toLowerCase())
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
