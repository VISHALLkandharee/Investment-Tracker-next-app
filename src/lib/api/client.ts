import { errorHandlerMiddleware } from "../utils/middleware";

// src/lib/api/client.ts
const API_BASE = "/api";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    errorHandlerMiddleware(data);
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// API methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

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
  getInvestments: (portfolioId: string) =>
    apiRequest(`/portfolios/${portfolioId}/investments`),

  addInvestment: (portfolioId: string, data: any) =>
    apiRequest(`/portfolios/${portfolioId}/investments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateInvestment: (id: string, data: any) =>
    apiRequest(`/investments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteInvestment: (id: string) =>
    apiRequest(`/investments/${id}`, {
      method: "DELETE",
    }),

  // Market Data
  getPrice: (symbol: string, type: "stock" | "crypto") =>
    apiRequest(`/market-data/${symbol}?type=${type}`),

  search: (query: string, type?: string) =>
    apiRequest(`/search?q=${query}${type ? `&type=${type}` : ""}`),
};