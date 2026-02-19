// src/components/portfolio/InvestmentTable.tsx
"use client";

import { memo } from "react";

interface Investment {
  id: string;
  symbol: string;
  assetType: string;
  transactionType: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue?: number;
  profit?: number;
  profitPercent?: number;
}

interface InvestmentTableProps {
  investments: Investment[];
  onDelete: (id: string, symbol: string) => void;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AssetBadge = ({ type }: { type: string }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      type === "stock"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700"
    }`}
  >
    {type}
  </span>
);

const ProfitCell = ({
  profit,
  profitPercent,
  compact = false,
}: {
  profit: number;
  profitPercent: number;
  compact?: boolean;
}) => {
  const isPos = profit >= 0;
  const sign = isPos ? "+" : "";
  const color = isPos ? "text-green-600" : "text-red-600";
  return (
    <div>
      <div className={`font-semibold ${color}`}>
        {sign}${fmt(profit)}
      </div>
      {!compact && (
        <div className={`text-xs ${color}`}>
          {sign}{profitPercent.toFixed(2)}%
        </div>
      )}
    </div>
  );
};

/**
 * Displays the investment list for a portfolio.
 * Responsive: table on desktop, cards on mobile.
 * Wrapped in memo — re-renders only when investments or onDelete change.
 */
const InvestmentTable = memo(function InvestmentTable({
  investments,
  onDelete,
}: InvestmentTableProps) {
  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl sm:text-6xl mb-4">💼</div>
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          No investments yet
        </h4>
        <p className="text-sm sm:text-base text-gray-500">
          Add your first stock or crypto investment
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop Table ───────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 text-sm font-semibold text-gray-600">
              {["Symbol", "Type", "Shares", "Purchase Price", "Current Price", "Current Value", "Profit/Loss", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`py-3 px-4 ${i <= 1 ? "text-left" : i === 7 ? "text-center" : "text-right"}`}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="font-semibold text-gray-800">{inv.symbol}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(inv.purchaseDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <AssetBadge type={inv.assetType} />
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-800">{inv.shares}</td>
                <td className="py-4 px-4 text-right font-medium text-gray-800">${inv.purchasePrice}</td>
                <td className="py-4 px-4 text-right font-medium text-gray-800">
                  ${(inv.currentPrice || 0).toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-800">
                  ${fmt(inv.currentValue || 0)}
                </td>
                <td className="py-4 px-4 text-right">
                  <ProfitCell profit={inv.profit || 0} profitPercent={inv.profitPercent || 0} />
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={() => onDelete(inv.id, inv.symbol)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ─────────────────────────────────── */}
      <div className="lg:hidden space-y-4">
        {investments.map((inv) => (
          <div key={inv.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{inv.symbol}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(inv.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <AssetBadge type={inv.assetType} />
            </div>

            <div className="space-y-2 text-sm mb-4">
              {[
                ["Shares", inv.shares],
                ["Purchase Price", `$${inv.purchasePrice}`],
                ["Current Price", `$${(inv.currentPrice || 0).toFixed(2)}`],
                ["Current Value", `$${fmt(inv.currentValue || 0)}`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-gray-500">{label}:</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Profit/Loss:</span>
                <ProfitCell profit={inv.profit || 0} profitPercent={inv.profitPercent || 0} />
              </div>
            </div>

            <button
              onClick={() => onDelete(inv.id, inv.symbol)}
              className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition font-medium text-sm"
            >
              Delete Investment
            </button>
          </div>
        ))}
      </div>
    </>
  );
});

export default InvestmentTable;
