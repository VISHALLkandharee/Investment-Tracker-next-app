// src/app/api/portfolios/[id]/investments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authMiddleware } from "@/lib/utils/middleware";

// GET - Get all investments in a portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);
    if (decoded instanceof NextResponse) return decoded;

    const userId = decoded.userId;
    const { id } = await params;

    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    // Get all investments
    const investments = await prisma.investment.findMany({
      where: { portfolioId: id },
      orderBy: { purchaseDate: "desc" },
    });

    return NextResponse.json({ success: true, investments });
  } catch (error) {
    console.error("Get investments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Add investment to portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);
    if (decoded instanceof NextResponse) return decoded;


    
        const userId = decoded.userId;
    const { id } = await params;


    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: id,
        userId:userId,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    const {
      symbol,
      assetType,
      transactionType,
      shares,
      purchasePrice,
      purchaseDate,
    } = await request.json();

    // Validate required fields
    if (
      !symbol ||
      !assetType ||
      !transactionType ||
      !shares ||
      !purchasePrice
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate assetType
    if (!["stock", "crypto"].includes(assetType)) {
      return NextResponse.json(
        { error: "Asset type must be 'stock' or 'crypto'" },
        { status: 400 },
      );
    }

    // Validate transactionType
    if (!["buy", "sell"].includes(transactionType)) {
      return NextResponse.json(
        { error: "Transaction type must be 'buy' or 'sell'" },
        { status: 400 },
      );
    }

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        symbol: symbol.toUpperCase(),
        assetType,
        transactionType,
        shares: parseFloat(shares),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        portfolioId:id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Investment added successfully",
        investment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create investment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
