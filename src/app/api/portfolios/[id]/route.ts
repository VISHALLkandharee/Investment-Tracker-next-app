// src/app/api/portfolios/[id]/route.ts
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/apiAuth";
import { updatePortfolioSchema, formatZodErrors } from "@/lib/validators/schemas";

// PUT - Update portfolio name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;
    const body = await request.json();

    // Validate with Zod
    const parsed = updatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    const existing = await prisma.portfolio.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: { name },
      include: { investments: true },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Update portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed updating portfolio" },
      { status: 500 }
    );
  }
}

// GET - Get single portfolio
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id, userId },
      include: {
        investments: {
          orderBy: { purchaseDate: "desc" },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id, success: true, portfolio });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed getting the portfolio" },
      { status: 500 }
    );
  }
}

// DELETE - Delete portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId, id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    await prisma.portfolio.delete({
      where: { id, userId },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error) {
    console.error("Delete portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed deleting the portfolio" },
      { status: 500 }
    );
  }
}
