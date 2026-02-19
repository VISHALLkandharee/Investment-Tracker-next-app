// src/components/dashboard/PortfolioCard.tsx
"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";

interface PortfolioCardProps {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  investmentCount: number;
}

/**
 * A reusable portfolio card for the dashboard.
 * Wrapped in `memo` to prevent re-renders when other dashboard state changes.
 */
const PortfolioCard = memo(function PortfolioCard({
  id,
  name,
  totalValue,
  totalCost,
  totalProfit,
  totalProfitPercent,
  investmentCount,
}: PortfolioCardProps) {
  const router = useRouter();
  const isProfit = totalProfit >= 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      onClick={() => router.push(`/portfolio/${id}`)}
      className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer"
    >
      <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4 truncate">
        {name}
      </h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Value:</span>
          <span className="font-semibold text-gray-800">
            ${formatCurrency(totalValue)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Cost:</span>
          <span className="font-semibold text-gray-800">
            ${formatCurrency(totalCost)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Profit/Loss:</span>
          <span
            className={`font-semibold ${isProfit ? "text-green-600" : "text-red-600"}`}
          >
            {isProfit ? "+" : ""}${formatCurrency(totalProfit)} (
            {isProfit ? "+" : ""}
            {totalProfitPercent.toFixed(2)}%)
          </span>
        </div>

        <div className="flex justify-between pt-2 border-t">
          <span className="text-gray-500">Investments:</span>
          <span className="font-semibold text-gray-800">
            {investmentCount}
          </span>
        </div>
      </div>
    </div>
  );
});

export default PortfolioCard;
