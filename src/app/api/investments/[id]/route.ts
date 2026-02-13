// src/app/api/investments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authMiddleware } from "@/lib/utils/middleware";

// GET - Get single investment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);
    if (decoded instanceof NextResponse) return decoded;

    const userId = decoded.userId;
    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id: id },
      include: {
        portfolio: true,
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 },
      );
    }

    // Verify ownership through portfolio
    if (investment.portfolio.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, investment });
  } catch (error) {
    console.error("Get investment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update investment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);
    if (decoded instanceof NextResponse) return decoded;

    const userId = decoded.userId;

    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id: id },
      include: { portfolio: true },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 },
      );
    }

    if (investment.portfolio.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      symbol,
      assetType,
      transactionType,
      shares,
      purchasePrice,
      purchaseDate,
    } = await request.json();

    // Update investment
    const updated = await prisma.investment.update({
      where: { id: id },
      data: {
        ...(symbol && { symbol: symbol.toUpperCase() }),
        ...(assetType && { assetType }),
        ...(transactionType && { transactionType }),
        ...(shares && { shares: parseFloat(shares) }),
        ...(purchasePrice && { purchasePrice: parseFloat(purchasePrice) }),
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Investment updated successfully",
      investment: updated,
    });
  } catch (error) {
    console.error("Update investment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete investment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);
    if (decoded instanceof NextResponse) return decoded;

    const userId = decoded.userId;

    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id: id },
      include: { portfolio: true },
    });

    if (!investment) {
      return NextResponse.json(
        { error: "Investment not found" },
        { status: 404 },
      );
    }

    if (investment.portfolio.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.investment.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    console.error("Delete investment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
