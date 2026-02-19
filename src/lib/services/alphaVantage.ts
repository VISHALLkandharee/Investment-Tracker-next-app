// src/lib/services/alphaVantage.ts
import axios from "axios";
import { cache } from "@/lib/utils/cache";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// Cache stock prices for 5 minutes (AlphaVantage free tier = 5 calls/min)
const STOCK_CACHE_TTL = 300;

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export async function getStockPrice(symbol: string): Promise<StockQuote | null> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `stock_price_${upperSymbol}`;

  // 1. Try cache first
  const cached = cache.get<StockQuote>(cacheKey);
  if (cached) {
    return cached;
  }

  // 2. Fetch from API
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: upperSymbol,
        apikey: API_KEY,
      },
    });

    const quote = response.data["Global Quote"];

    if (!quote || Object.keys(quote).length === 0) {
      console.warn(`AlphaVantage: No data found for symbol: ${upperSymbol}`);
      return null;
    }

    const stockQuote: StockQuote = {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
    };

    // 3. Save to cache
    cache.set(cacheKey, stockQuote, STOCK_CACHE_TTL);

    return stockQuote;
  } catch (error) {
    console.error(`AlphaVantage: Error fetching price for ${upperSymbol}:`, error);
    return null;
  }
}

export async function searchStocks(keywords: string) {
  const cacheKey = `stock_search_${keywords.toLowerCase()}`;

  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "SYMBOL_SEARCH",
        keywords,
        apikey: API_KEY,
      },
    });

    const results = response.data.bestMatches || [];

    // Cache search results for 10 minutes
    cache.set(cacheKey, results, 600);

    return results;
  } catch (error) {
    console.error("AlphaVantage: Error searching stocks:", error);
    return [];
  }
}