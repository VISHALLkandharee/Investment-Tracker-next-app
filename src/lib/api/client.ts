// src/lib/api/client.ts
const API_BASE = "/api";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // ✅ ADD this to send cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

// API methods stay the same
export const api = {
  // Dashboard
  getDashboardStats: () => apiRequest("/dashboard/stats"),

  // Portfolios
  getPortfolios: () => apiRequest("/portfolios"),
  
  createPortfolio: (name: string) =>
    apiRequest("/portfolios", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getPortfolio: (id: string) => apiRequest(`/portfolios/${id}`),

  updatePortfolio: (id: string, name: string) =>
    apiRequest(`/portfolios/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  deletePortfolio: (id: string) =>
    apiRequest(`/portfolios/${id}`, {
      method: "DELETE",
    }),

  getPortfolioAnalytics: (id: string) =>
    apiRequest(`/portfolios/${id}/analytics`),

  // Investments
  addInvestment: (portfolioId: string, data: any) =>
    apiRequest(`/portfolios/${portfolioId}/investments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteInvestment: (id: string) =>
    apiRequest(`/investments/${id}`, {
      method: "DELETE",
    }),

  // Market Data
  search: (query: string, type?: string) =>
    apiRequest(`/search?q=${query}${type ? `&type=${type}` : ""}`),
};