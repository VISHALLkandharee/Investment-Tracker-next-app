// src/app/api/portfolios/route.ts
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/utils/apiAuth";
import { createPortfolioSchema, formatZodErrors } from "@/lib/validators/schemas";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        investments: true,
        _count: {
          select: { investments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, portfolios });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed getting the portfolios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUserId();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const body = await request.json();

    // Validate with Zod
    const parsed = createPortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // Check duplicate name
    const existingPortfolio = await prisma.portfolio.findFirst({
      where: { userId, name },
    });

    if (existingPortfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio name already exists!" },
        { status: 409 }
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: { name, userId },
      include: { investments: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Portfolio created successfully",
        portfolio,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed creating portfolio",
      },
      { status: 500 }
    );
  }
}
