// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/services/alphaVantage";
import { searchCrypto } from "@/lib/services/coinGecho";
import { searchSchema, formatZodErrors } from "@/lib/validators/schemas";
import { getAuthUserId } from "@/lib/utils/apiAuth";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate query params
    const { searchParams } = new URL(request.url);
    const queryData = {
      q: searchParams.get("q"),
      type: searchParams.get("type") || "all",
    };

    const parsed = searchSchema.safeParse(queryData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { q, type } = parsed.data;
    let results: any = {};

    // 3. Conditional search with parallel execution if 'all'
    const searchPromises = [];

    if (type === "stock" || type === "all") {
      searchPromises.push(
        searchStocks(q).then((data) => (results.stocks = data))
      );
    }

    if (type === "crypto" || type === "all") {
      searchPromises.push(
        searchCrypto(q).then((data) => (results.crypto = data))
      );
    }

    await Promise.all(searchPromises);

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
