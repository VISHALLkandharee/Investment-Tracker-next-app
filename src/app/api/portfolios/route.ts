import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth.config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { sucess: false, message: "Invalid user | not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: userId },
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
    return NextResponse.json(
      { sucess: false, message: "Failed getting the portfolios" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { name } = await request.json();

    // Validate name
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Portfolio name is required" },
        { status: 400 }
      );
    }

    const existingPortfolio = await prisma.portfolio.findFirst({
      where: {
        userId: userId,
        name: name.trim(),
      },
    });

    if (existingPortfolio) {
      return NextResponse.json(
        { success: false, message: "Portfolio name already exists!" },
        { status: 409 }
      );
    }

  
    const portfolio = await prisma.portfolio.create({
      data: {
        name: name.trim(),
        userId: userId,
      },
      include: {
        investments: true,
      },
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
    console.error("Portfolio POST error:", error);  // ← Shows full error

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed creating portfolio",
      },
      { status: 500 }
    );
  }
}
