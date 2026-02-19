// src/app/api/portfolios/[id]/investments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthUserId } from "@/lib/utils/apiAuth";
import { addInvestmentSchema, formatZodErrors } from "@/lib/validators/schemas";

// GET - Get all investments in a portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findUnique({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const investments = await prisma.investment.findMany({
      where: { portfolioId: id },
      orderBy: { purchaseDate: "desc" },
    });

    return NextResponse.json({ success: true, investments });
  } catch (error) {
    console.error("Get investments error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add investment to portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    // Verify portfolio belongs to user
    const portfolio = await prisma.portfolio.findUnique({
      where: { id, userId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate with Zod
    const parsed = addInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { symbol, assetType, transactionType, shares, purchasePrice, purchaseDate } = parsed.data;

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        symbol,
        assetType,
        transactionType,
        shares,
        purchasePrice,
        purchaseDate,
        portfolioId: id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Investment added successfully",
        investment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create investment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
