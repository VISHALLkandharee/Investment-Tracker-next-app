// src/app/api/market-data/crypto/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCryptoPrice } from "@/lib/services/coinGecho";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const priceData = await getCryptoPrice(id);

    if (!priceData) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch crypto data" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: priceData });
  } catch (error) {
    console.error("Crypto market data error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
