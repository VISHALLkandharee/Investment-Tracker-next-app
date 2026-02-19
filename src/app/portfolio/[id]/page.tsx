// src/app/portfolio/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { api } from "@/lib/api/client";
import toast from "react-hot-toast";
import { TableRowSkeleton, StatCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { addInvestmentSchema } from "@/lib/validators/schemas";
import InvestmentTable from "@/components/portfolio/InvestmentTable";

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

interface PortfolioData {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  investments: Investment[];
}

export default function PortfolioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const portfolioId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    symbol: "",
    assetType: "stock" as "stock" | "crypto",
    transactionType: "buy" as "buy" | "sell",
    shares: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolioAnalytics(portfolioId);
      setPortfolio(data.portfolio);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      toast.error("Failed to load portfolio");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [portfolioId, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchPortfolio();
    }
  }, [status, fetchPortfolio, router]);

  const handleAddInvestment = async () => {
    // Validate with Zod
    const validationData = {
      ...formData,
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      symbol: formData.symbol.toUpperCase(),
    };

    const parsed = addInvestmentSchema.safeParse(validationData);

    if (!parsed.success) {
      // Show the first error message
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const { symbol, assetType, transactionType, shares, purchasePrice, purchaseDate } = parsed.data;

    setSubmitting(true);
    try {
      await api.addInvestment(portfolioId, {
        symbol,
        assetType,
        transactionType,
        shares,
        purchasePrice,
        purchaseDate,
      });

      toast.success(`${symbol} added successfully!`);

      setFormData({
        symbol: "",
        assetType: "stock",
        transactionType: "buy",
        shares: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });

      setShowAddModal(false);
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to add investment:", error);
      const message = error instanceof Error ? error.message : "Failed to add investment";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvestment = async (
    investmentId: string,
    symbol: string,
  ) => {
    if (!confirm(`Are you sure you want to delete ${symbol}?`)) return;

    try {
      await api.deleteInvestment(investmentId);
      toast.success(`${symbol} deleted successfully`);
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to delete investment:", error);
      const message = error instanceof Error ? error.message : "Failed to delete investment";
      toast.error(message);
    }
  };

  const handleUpdatePortfolioName = async () => {
    if (!editingName.trim()) {
      toast.error("Please enter a portfolio name");
      return;
    }

    setSubmitting(true);
    try {
      await api.updatePortfolio(portfolioId, editingName);
      toast.success("Portfolio name updated!");
      setShowEditModal(false);
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to update portfolio:", error);
      const message = error instanceof Error ? error.message : "Failed to update portfolio name";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entire portfolio? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.deletePortfolio(portfolioId);
      toast.success("Portfolio deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
      const message = error instanceof Error ? error.message : "Failed to delete portfolio";
      toast.error(message);
    }
  };

  const handleRefresh = () => {
    toast.loading("Refreshing prices...", { duration: 1000 });
    fetchPortfolio();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm">Symbol</th>
                  <th className="text-left py-3 px-4 text-sm">Type</th>
                  <th className="text-right py-3 px-4 text-sm">Shares</th>
                  <th className="text-right py-3 px-4 text-sm">Purchase</th>
                  <th className="text-right py-3 px-4 text-sm">Current</th>
                  <th className="text-right py-3 px-4 text-sm">Value</th>
                  <th className="text-right py-3 px-4 text-sm">P/L</th>
                  <th className="text-center py-3 px-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </tbody>
            </table>
          </div>
        </main>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl font-semibold text-gray-600 mb-4">
            Portfolio not found
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isProfit = portfolio.totalProfit >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-800 transition"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {portfolio.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {portfolio.investments.length} investments
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => {
                  setEditingName(portfolio.name);
                  setShowEditModal(true);
                }}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDeletePortfolio}
                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Total Value
            </p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">
              $
              {portfolio.totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Total Cost
            </p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">
              $
              {portfolio.totalCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Profit/Loss
            </p>
            <p
              className={`text-xl sm:text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}
            >
              {isProfit ? "+" : ""}$
              {portfolio.totalProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
              Return %
            </p>
            <p
              className={`text-xl sm:text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}
            >
              {isProfit ? "+" : ""}
              {portfolio.totalProfitPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Investments Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Investments</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Add Investment
            </button>
          </div>

          <InvestmentTable
            investments={portfolio.investments}
            onDelete={handleDeleteInvestment}
          />
        </div>
      </main>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black opacity-83 z-50 flex items-center text-black justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md my-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Add Investment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Symbol (e.g., AAPL, BTC)
                </label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      symbol: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, assetType: "stock" })
                    }
                    disabled={submitting}
                    className={`py-3 rounded-xl font-medium transition ${
                      formData.assetType === "stock"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    Stock
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, assetType: "crypto" })
                    }
                    disabled={submitting}
                    className={`py-3 rounded-xl font-medium transition ${
                      formData.assetType === "crypto"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    Crypto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, transactionType: "buy" })
                    }
                    disabled={submitting}
                    className={`py-3 rounded-xl font-medium transition ${
                      formData.transactionType === "buy"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, transactionType: "sell" })
                    }
                    disabled={submitting}
                    className={`py-3 rounded-xl font-medium transition ${
                      formData.transactionType === "sell"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } disabled:opacity-50`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shares/Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={formData.shares}
                  onChange={(e) =>
                    setFormData({ ...formData, shares: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.50"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvestment}
                disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Investment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Portfolio Name Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Edit Portfolio Name
            </h3>

            <input
              type="text"
              placeholder="Portfolio name"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleUpdatePortfolioName()
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg mb-6"
              autoFocus
              disabled={submitting}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePortfolioName}
                disabled={submitting}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
