// src/app/api/market-data/[symbol]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getStockPrice } from "@/lib/services/alphaVantage";
import { getCryptoPrice } from "@/lib/services/coinGecho";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const assetType = searchParams.get("type"); // 'stock' or 'crypto'

    if (!assetType || !["stock", "crypto"].includes(assetType)) {
      return NextResponse.json(
        { error: "Asset type must be 'stock' or 'crypto'" },
        { status: 400 },
      );
    }

    const {symbol} = await params;

    let priceData;

    
    if (assetType === "stock") {
      priceData = await getStockPrice(symbol);
    } else {
      priceData = await getCryptoPrice(symbol);
    }

    if (!priceData) {
      return NextResponse.json(
        { error: "Failed to fetch price data" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
