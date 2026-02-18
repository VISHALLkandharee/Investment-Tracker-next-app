// src/lib/services/analytics.ts
import { Decimal } from "@prisma/client/runtime/client";
import { getStockPrice } from "./alphaVantage";
import { getCryptoPrice, getCryptoPrices } from "./coinGecho";

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

  // 1. Separate investments by type
  const cryptoInvestments = investments.filter(i => i.assetType !== "stock");
  const stockInvestments = investments.filter(i => i.assetType === "stock");

  // 2. Fetch all crypto prices in parallel (one batch request)
  const cryptoSymbols = [...new Set(cryptoInvestments.map(i => i.symbol))];
  const cryptoPrices = await getCryptoPrices(cryptoSymbols);

  // 3. Process all investments
  const enrichedInvestments = await Promise.all(
    investments.map(async (investment) => {
      let currentPrice = 0;

      if (investment.assetType === "stock") {
        // Still optional: could batch stocks too if Alpha Vantage supports it, 
        // but sticking to CoinGecko fix for now.
        const stockData = await getStockPrice(investment.symbol);
        currentPrice = stockData?.price || 0;
      } else {
        // Use the pre-fetched crypto price
        const symbol = investment.symbol.toUpperCase();
        const cryptoData = cryptoPrices[symbol];
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
