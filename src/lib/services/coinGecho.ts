// src/lib/services/coinGecko.ts
import axios from "axios";

const BASE_URL = "https://api.coingecko.com/api/v3";

export interface CryptoQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume: number;
}

// Simple in-memory cache: symbol -> { price, timestamp }
const priceCache: { [key: string]: { data: CryptoQuote; timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function getCryptoPrices(symbols: string[]): Promise<{ [symbol: string]: CryptoQuote | null }> {
  const uniqueSymbols = [...new Set(symbols.map(s => s.toUpperCase()))];
  const result: { [symbol: string]: CryptoQuote | null } = {};
  const symbolsToFetch: string[] = [];

  // Check cache first
  const now = Date.now();
  for (const symbol of uniqueSymbols) {
    const cached = priceCache[symbol];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      result[symbol] = cached.data;
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  if (symbolsToFetch.length === 0) {
    return result;
  }

  try {
    // Convert symbols to CoinGecko IDs
    const coinIds = symbolsToFetch.map(symbol => symbolToCoinId(symbol));
    
    // Join IDs with commas for the API request
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

    // Map responses back to symbols
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
            priceCache[symbol] = { data: quote, timestamp: now };
        } else {
            console.warn(`No data found for crypto: ${symbol} (ID: ${coinId})`);
            result[symbol] = null;
        }
    }

  } catch (error) {
    console.error(`Error fetching crypto prices for ${symbolsToFetch.join(", ")}:`, error);
    // return whatever we have from cache, others null
  }
  
  return result;
}

export async function getCryptoPrice(symbol: string): Promise<CryptoQuote | null> {
    const prices = await getCryptoPrices([symbol]);
    return prices[symbol.toUpperCase()] || null;
}

export async function searchCrypto(query: string) {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { query },
    });

    return response.data.coins || [];
  } catch (error) {
    console.error("Error searching crypto:", error);
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