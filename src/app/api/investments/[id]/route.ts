// src/app/api/investments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthUserId } from "@/lib/utils/apiAuth";
import { updateInvestmentSchema, formatZodErrors } from "@/lib/validators/schemas";

// GET - Get single investment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { portfolio: true },
    });

    if (!investment) {
      return NextResponse.json(
        { success: false, error: "Investment not found" },
        { status: 404 }
      );
    }

    // Verify ownership through portfolio
    if (investment.portfolio.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, investment });
  } catch (error) {
    console.error("Get investment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update investment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { portfolio: true },
    });

    if (!investment) {
      return NextResponse.json(
        { success: false, error: "Investment not found" },
        { status: 404 }
      );
    }

    if (investment.portfolio.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate with Zod
    const parsed = updateInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.symbol) updateData.symbol = parsed.data.symbol;
    if (parsed.data.assetType) updateData.assetType = parsed.data.assetType;
    if (parsed.data.transactionType) updateData.transactionType = parsed.data.transactionType;
    if (parsed.data.shares) updateData.shares = parsed.data.shares;
    if (parsed.data.purchasePrice) updateData.purchasePrice = parsed.data.purchasePrice;
    if (parsed.data.purchaseDate) updateData.purchaseDate = parsed.data.purchaseDate;

    const updated = await prisma.investment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Investment updated successfully",
      investment: updated,
    });
  } catch (error) {
    console.error("Update investment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete investment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    const investment = await prisma.investment.findUnique({
      where: { id },
      include: { portfolio: true },
    });

    if (!investment) {
      return NextResponse.json(
        { success: false, error: "Investment not found" },
        { status: 404 }
      );
    }

    if (investment.portfolio.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.investment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Investment deleted successfully",
    });
  } catch (error) {
    console.error("Delete investment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
