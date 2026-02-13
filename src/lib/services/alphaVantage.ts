import axios from "axios";

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

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
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: symbol.toUpperCase(),
        apikey: API_KEY,
      },
    });

    console.log("AlphaVantage response.data : ", response.data)

    const quote = response.data["Global Quote"];


    if (!quote || Object.keys(quote).length === 0) {
      console.error(`No data found for symbol: ${symbol}`);
      return null;
    }

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function searchStocks(keywords: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "SYMBOL_SEARCH",
        keywords,
        apikey: API_KEY,
      },
    });

    return response.data.bestMatches || [];
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}