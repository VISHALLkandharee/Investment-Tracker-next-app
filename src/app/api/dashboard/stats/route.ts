import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth.config";
import { calculatePortfolioValue } from "@/lib/services/analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all portfolios with investments
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: userId },
      include: {
        investments: true,
      },
    });

    // Calculate total stats across all portfolios
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalInvestments = 0;

    const portfolioAnalytics = await Promise.all(
      portfolios.map(async (portfolio) => {
        const analytics = await calculatePortfolioValue(portfolio.investments);
        
        totalValue += analytics.totalValue;
        totalCost += analytics.totalCost;
        totalProfit += analytics.totalProfit;
        totalInvestments += portfolio.investments.length;

        return {
          id: portfolio.id,
          name: portfolio.name,
          ...analytics,
        };
      })
    );

    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalPortfolios: portfolios.length,
        totalInvestments,
        totalValue,
        totalCost,
        totalProfit,
        totalProfitPercent,
      },
      portfolios: portfolioAnalytics,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}