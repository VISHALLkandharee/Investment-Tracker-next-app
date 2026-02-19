// src/lib/services/coinGecko.ts
import axios from "axios";
import { cache } from "@/lib/utils/cache";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Cache crypto prices for 2 minutes (CoinGecko free tier is generous)
const CRYPTO_CACHE_TTL = 120;

export interface CryptoQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume: number;
}

/**
 * Fetch prices for multiple crypto symbols in a single batch request.
 * Uses the centralized cache service for caching.
 */
export async function getCryptoPrices(symbols: string[]): Promise<{ [symbol: string]: CryptoQuote | null }> {
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  const result: { [symbol: string]: CryptoQuote | null } = {};
  const symbolsToFetch: string[] = [];

  // 1. Check cache first for each symbol
  for (const symbol of uniqueSymbols) {
    const cacheKey = `crypto_price_${symbol}`;
    const cached = cache.get<CryptoQuote>(cacheKey);
    if (cached) {
      result[symbol] = cached;
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  // All symbols were cached
  if (symbolsToFetch.length === 0) {
    return result;
  }

  // 2. Fetch uncached symbols from API
  try {
    const coinIds = symbolsToFetch.map(symbol => symbolToCoinId(symbol));
    const idsParam = coinIds.join(",");

    const response = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids: idsParam,
        vs_currencies: "usd",
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true,
      },
    });

    const data = response.data;

    // 3. Map responses back to symbols and cache them
    for (let i = 0; i < symbolsToFetch.length; i++) {
      const symbol = symbolsToFetch[i];
      const coinId = coinIds[i];
      const coinData = data[coinId];

      if (coinData) {
        const quote: CryptoQuote = {
          symbol: symbol,
          price: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          changePercent24h: coinData.usd_24h_change || 0,
          marketCap: coinData.usd_market_cap || 0,
          volume: coinData.usd_24h_vol || 0,
        };
        result[symbol] = quote;
        cache.set(`crypto_price_${symbol}`, quote, CRYPTO_CACHE_TTL);
      } else {
        console.warn(`CoinGecko: No data found for crypto: ${symbol} (ID: ${coinId})`);
        result[symbol] = null;
      }
    }
  } catch (error) {
    console.error(`CoinGecko: Error fetching prices for ${symbolsToFetch.join(", ")}:`, error);
    // Return whatever we have from cache, the rest will be null
  }

  return result;
}

/**
 * Fetch a single crypto price. Internally uses the batch function.
 */
export async function getCryptoPrice(symbol: string): Promise<CryptoQuote | null> {
  const prices = await getCryptoPrices([symbol]);
  return prices[symbol.toUpperCase()] || null;
}

export async function searchCrypto(query: string) {
  const cacheKey = `crypto_search_${query.toLowerCase()}`;

  const cached = cache.get<unknown[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { query },
    });

    const results = response.data.coins || [];
    cache.set(cacheKey, results, 600); // 10 min cache for search

    return results;
  } catch (error) {
    console.error("CoinGecko: Error searching crypto:", error);
    return [];
  }
}

// Helper function to convert symbol to CoinGecko ID
function symbolToCoinId(symbol: string): string {
  const symbolMap: { [key: string]: string } = {
    BTC: "bitcoin",
    ETH: "ethereum",
    USDT: "tether",
    BNB: "binancecoin",
    SOL: "solana",
    XRP: "ripple",
    ADA: "cardano",
    DOGE: "dogecoin",
    MATIC: "matic-network",
    DOT: "polkadot",
  };

  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
}