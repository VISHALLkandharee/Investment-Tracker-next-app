// src/app/portfolio/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import toast from "react-hot-toast";
import { TableRowSkeleton, StatCardSkeleton } from "@/components/ui/LoadingSkeleton";
//validation imports
import { validateSymbol, validatePrice, validateShares } from "@/lib/utils/validations";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchPortfolio();
  }, [portfolioId, router]);

  const fetchPortfolio = async () => {
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
  };


const handleAddInvestment = async () => {
  // Validate all fields
  if (!formData.symbol || !formData.shares || !formData.purchasePrice) {
    toast.error("Please fill all required fields");
    return;
  }

  // Validate symbol
  const symbolValidation = validateSymbol(formData.symbol, formData.assetType);
  if (!symbolValidation.valid) {
    toast.error(symbolValidation.message || "Invalid symbol");
    return;
  }

  // Show warning for unknown symbols
  if (symbolValidation.message) {
    const confirmed = confirm(symbolValidation.message + "\n\nContinue anyway?");
    if (!confirmed) return;
  }

  // Validate shares
  const sharesValidation = validateShares(parseFloat(formData.shares));
  if (!sharesValidation.valid) {
    toast.error(sharesValidation.message || "Invalid shares");
    return;
  }

  // Validate price
  const priceValidation = validatePrice(parseFloat(formData.purchasePrice));
  if (!priceValidation.valid) {
    toast.error(priceValidation.message || "Invalid price");
    return;
  }

  setSubmitting(true);
  try {
    await api.addInvestment(portfolioId, {
      symbol: formData.symbol.toUpperCase(),
      assetType: formData.assetType,
      transactionType: formData.transactionType,
      shares: parseFloat(formData.shares),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: formData.purchaseDate,
    });

    toast.success(`${formData.symbol.toUpperCase()} added successfully!`);

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
    toast.error("Failed to add investment");
  } finally {
    setSubmitting(false);
  }
};


  const handleDeleteInvestment = async (investmentId: string, symbol: string) => {
    if (!confirm(`Are you sure you want to delete ${symbol}?`)) return;

    try {
      await api.deleteInvestment(investmentId);
      toast.success(`${symbol} deleted successfully`);
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast.error("Failed to delete investment");
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
      toast.error("Failed to update portfolio name");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (!confirm("Are you sure you want to delete this entire portfolio? This action cannot be undone.")) return;

    try {
      await api.deletePortfolio(portfolioId);
      toast.success("Portfolio deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
      toast.error("Failed to delete portfolio");
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
          <p className="text-xl font-semibold text-gray-600 mb-4">Portfolio not found</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{portfolio.name}</h1>
                <p className="text-xs sm:text-sm text-gray-500">{portfolio.investments.length} investments</p>
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
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Value</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">
              ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Cost</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">
              ${portfolio.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Profit/Loss</p>
            <p className={`text-xl sm:text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : ""}${portfolio.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Return %</p>
            <p className={`text-xl sm:text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : ""}{portfolio.totalProfitPercent.toFixed(2)}%
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

          {portfolio.investments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl sm:text-6xl mb-4">💼</div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No investments yet</h4>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Add your first stock or crypto investment</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Add Your First Investment
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Symbol</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Shares</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Purchase Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Current Price</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Current Value</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Profit/Loss</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.investments.map((investment) => {
                      const investmentProfit = (investment.profit || 0) >= 0;
                      return (
                        <tr key={investment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-800">{investment.symbol}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(investment.purchaseDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              investment.assetType === "stock"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}>
                              {investment.assetType}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-gray-800">
                            {investment.shares}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-gray-800">
                            ${investment.purchasePrice}
                          </td>
                          <td className="py-4 px-4 text-right font-medium text-gray-800">
                            ${(investment.currentPrice || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-800">
                            ${(investment.currentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className={`font-semibold ${investmentProfit ? "text-green-600" : "text-red-600"}`}>
                              {investmentProfit ? "+" : ""}${(investment.profit || 0).toFixed(2)}
                            </div>
                            <div className={`text-xs ${investmentProfit ? "text-green-600" : "text-red-600"}`}>
                              {investmentProfit ? "+" : ""}{(investment.profitPercent || 0).toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center cursor-pointer">
                            <button
                              onClick={() => handleDeleteInvestment(investment.id, investment.symbol)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {portfolio.investments.map((investment) => {
                  const investmentProfit = (investment.profit || 0) >= 0;
                  return (
                    <div key={investment.id} className="border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{investment.symbol}</h4>
                          <p className="text-xs text-gray-500">{new Date(investment.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          investment.assetType === "stock"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}>
                          {investment.assetType}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Shares:</span>
                          <span className="font-medium text-gray-800">{investment.shares}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Purchase Price:</span>
                          <span className="font-medium text-gray-800">${investment.purchasePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current Price:</span>
                          <span className="font-medium text-gray-800">${(investment.currentPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current Value:</span>
                          <span className="font-semibold text-gray-800">
                            ${(investment.currentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-500">Profit/Loss:</span>
                          <div className="text-right">
                            <div className={`font-semibold ${investmentProfit ? "text-green-600" : "text-red-600"}`}>
                              {investmentProfit ? "+" : ""}${(investment.profit || 0).toFixed(2)}
                            </div>
                            <div className={`text-xs ${investmentProfit ? "text-green-600" : "text-red-600"}`}>
                              {investmentProfit ? "+" : ""}{(investment.profitPercent || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteInvestment(investment.id, investment.symbol)}
                        className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition font-medium text-sm cursor-pointer"
                      >
                        Delete Investment
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center text-black justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md my-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Add Investment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Symbol (e.g., AAPL, BTC)
                </label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assetType: "stock" })}
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
                    onClick={() => setFormData({ ...formData, assetType: "crypto" })}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, transactionType: "buy" })}
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
                    onClick={() => setFormData({ ...formData, transactionType: "sell" })}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shares/Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.50"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Edit Portfolio Name</h3>

            <input
              type="text"
              placeholder="Portfolio name"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUpdatePortfolioName()}
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