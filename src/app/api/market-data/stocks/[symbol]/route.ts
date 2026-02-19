// src/app/api/market-data/stocks/[symbol]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStockPrice } from "@/lib/services/alphaVantage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const priceData = await getStockPrice(symbol);

    if (!priceData) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch stock data" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: priceData });
  } catch (error) {
    console.error("Stock market data error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
