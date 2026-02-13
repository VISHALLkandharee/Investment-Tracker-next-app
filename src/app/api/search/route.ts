// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/services/alphaVantage";
import { searchCrypto } from "@/lib/services/coinGecho";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // 'stock', 'crypto', or 'all'

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    let results: any = {};

    if (type === "stock" || type === "all" || !type) {
      const stocks = await searchStocks(query);
      results.stocks = stocks;
    }

    if (type === "crypto" || type === "all" || !type) {
      const crypto = await searchCrypto(query);
      results.crypto = crypto;
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}