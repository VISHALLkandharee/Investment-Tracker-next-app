// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import toast from "react-hot-toast";
import { StatCardSkeleton, PortfolioCardSkeleton } from "@/components/ui/LoadingSkeleton";

interface User {
  id: string;
  name: string;
  email: string;
}

interface DashboardStats {
  totalPortfolios: number;
  totalInvestments: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  investments: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data.stats);
      setPortfolios(data.portfolios);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast.error("Please enter a portfolio name");
      return;
    }

    setCreating(true);
    try {
      await api.createPortfolio(newPortfolioName);
      toast.success("Portfolio created successfully!");
      setNewPortfolioName("");
      setShowCreateModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to create portfolio:", error);
      toast.error("Failed to create portfolio");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const isProfit = (stats?.totalProfit || 0) >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">InvestTrack</h1>
            <p className="text-xs sm:text-sm text-gray-500">Investment Portfolio Tracker</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-indigo-100">Track your investments and grow your wealth.</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Portfolios</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats?.totalPortfolios || 0}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Investments</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats?.totalInvestments || 0}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Portfolio Value</p>
              <p className={`text-xl sm:text-4xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                ${(stats?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Total Profit/Loss</p>
              <p className={`text-xl sm:text-4xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                {isProfit ? "+" : ""}${(stats?.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs sm:text-sm font-medium ${isProfit ? "text-green-600" : "text-red-600"} mt-1`}>
                {isProfit ? "+" : ""}{(stats?.totalProfitPercent || 0).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Portfolios Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">My Portfolios</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              + Create Portfolio
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
              <PortfolioCardSkeleton />
            </div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl sm:text-6xl mb-4">📊</div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">No portfolios yet</h4>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Create your first portfolio to start tracking investments</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Create Your First Portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {portfolios.map((portfolio) => {
                const portfolioProfit = portfolio.totalProfit >= 0;
                return (
                  <div
                    key={portfolio.id}
                    onClick={() => router.push(`/portfolio/${portfolio.id}`)}
                    className="border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer"
                  >
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-4 truncate">{portfolio.name}</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-semibold text-gray-800">
                          ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Cost:</span>
                        <span className="font-semibold text-gray-800">
                          ${portfolio.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Profit/Loss:</span>
                        <span className={`font-semibold ${portfolioProfit ? "text-green-600" : "text-red-600"}`}>
                          {portfolioProfit ? "+" : ""}${portfolio.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolioProfit ? "+" : ""}{portfolio.totalProfitPercent.toFixed(2)}%)
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-500">Investments:</span>
                        <span className="font-semibold text-gray-800">
                          {portfolio.investments.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Create New Portfolio</h3>
            
            <input
              type="text"
              placeholder="Portfolio name (e.g., Tech Stocks)"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreatePortfolio()}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition text-base sm:text-lg mb-6"
              autoFocus
              disabled={creating}
            />

            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePortfolio}
                disabled={creating}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
