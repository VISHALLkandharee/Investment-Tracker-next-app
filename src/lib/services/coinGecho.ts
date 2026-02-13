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

export async function getCryptoPrice(symbol: string): Promise<CryptoQuote | null> {
  try {
    // Convert symbol to CoinGecko ID (BTC -> bitcoin, ETH -> ethereum)
    const coinId = symbolToCoinId(symbol);

    const response = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: "usd",
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true,
      },
    });

    const data = response.data[coinId];

    if (!data) {
      console.error(`No data found for crypto: ${symbol}`);
      return null;
    }

    return {
      symbol: symbol.toUpperCase(),
      price: data.usd,
      change24h: data.usd_24h_change || 0,
      changePercent24h: data.usd_24h_change || 0,
      marketCap: data.usd_market_cap || 0,
      volume: data.usd_24h_vol || 0,
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
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