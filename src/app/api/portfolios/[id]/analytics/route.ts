import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/utils/middleware";
import { prisma } from "@/lib/db/prisma";
import { calculatePortfolioValue } from "@/lib/services/analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const decoded = await authMiddleware(request);

    if (decoded instanceof NextResponse) return decoded;

    const userId = decoded.userId;
    const { id } = await params;

    const existingPorfolio = await prisma.portfolio.findUnique({
      where: { id: id, userId: userId},
      include:{
        investments:true
      }
    });


    if(!existingPorfolio) return NextResponse.json({
        success:false,
        message:"Potrfolio not found..."
    },{status:404})

    const analytics = await calculatePortfolioValue(existingPorfolio.investments)

       return NextResponse.json({
      success: true,
      portfolio: {
        id: existingPorfolio.id,
        name: existingPorfolio.name,
        ...analytics,
      },
    });

  } catch (error) {
    console.error("Portfolio analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
