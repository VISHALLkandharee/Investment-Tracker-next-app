// src/lib/services/analytics.ts
import { Decimal } from "@prisma/client/runtime/client";
import { getStockPrice } from "./alphaVantage";
import { getCryptoPrice } from "./coinGecho";

interface Investment {
  symbol: string;
  assetType: string;
  shares:Decimal;
  purchasePrice: Decimal;
}

export async function calculatePortfolioValue(investments: Investment[]) {
  let totalValue = 0;
  let totalCost = 0;
  let totalProfit = 0;

  const enrichedInvestments = await Promise.all(
    investments.map(async (investment) => {
      let currentPrice = 0;

      // Fetch current price
      if (investment.assetType === "stock") {
        const stockData = await getStockPrice(investment.symbol);
        currentPrice = stockData?.price || 0;
      } else {
        const cryptoData = await getCryptoPrice(investment.symbol);
        currentPrice = cryptoData?.price || 0;
      }

      const shares = parseFloat(investment.shares.toString());
      const purchasePrice = parseFloat(investment.purchasePrice.toString());
      
      const currentValue = shares * currentPrice;
      const costBasis = shares * purchasePrice;
      const profit = currentValue - costBasis;
      const profitPercent = costBasis > 0 ? (profit / costBasis) * 100 : 0;

      totalValue += currentValue;
      totalCost += costBasis;
      totalProfit += profit;

      return {
        ...investment,
        currentPrice,
        currentValue,
        costBasis,
        profit,
        profitPercent,
      };
    })
  );

  return {
    investments: enrichedInvestments,
    totalValue,
    totalCost,
    totalProfit,
    totalProfitPercent: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
  };
}
