// src/lib/utils/validation.ts

// Common stock symbols (you can expand this)
const KNOWN_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "AMD",
  "NFLX", "DIS", "BA", "IBM", "INTC", "CSCO", "ORCL", "ADBE",
  "CRM", "PYPL", "UBER", "LYFT", "COIN", "SQ", "SHOP", "SPOT"
];

const KNOWN_CRYPTO = [
  "BTC", "ETH", "USDT", "BNB", "SOL", "XRP", "ADA", "DOGE",
  "MATIC", "DOT", "AVAX", "LINK", "UNI"
];

export function validateSymbol(symbol: string, assetType: "stock" | "crypto"): {
  valid: boolean;
  message?: string;
} {
  const cleaned = symbol.trim().toUpperCase();

  // Check if empty
  if (!cleaned) {
    return {
      valid: false,
      message: "Symbol cannot be empty"
    };
  }

  // Check length (most symbols are 2-5 characters)
  if (cleaned.length < 1 || cleaned.length > 6) {
    return {
      valid: false,
      message: "Symbol must be 1-6 characters"
    };
  }

  // Check if contains only letters
  if (!/^[A-Z]+$/.test(cleaned)) {
    return {
      valid: false,
      message: "Symbol must contain only letters"
    };
  }

  // Warn if not in known list (but don't block it)
  if (assetType === "stock" && !KNOWN_STOCKS.includes(cleaned)) {
    return {
      valid: true,
      message: `⚠️ "${cleaned}" is not a commonly known stock symbol. Please verify it's correct.`
    };
  }

  if (assetType === "crypto" && !KNOWN_CRYPTO.includes(cleaned)) {
    return {
      valid: true,
      message: `⚠️ "${cleaned}" is not a commonly known crypto symbol. Please verify it's correct.`
    };
  }

  return { valid: true };
}

export function validateShares(shares: number): {
  valid: boolean;
  message?: string;
} {
  if (shares <= 0) {
    return {
      valid: false,
      message: "Shares must be greater than 0"
    };
  }

  if (shares > 1000000) {
    return {
      valid: false,
      message: "Shares cannot exceed 1,000,000"
    };
  }

  return { valid: true };
}

export function validatePrice(price: number): {
  valid: boolean;
  message?: string;
} {
  if (price <= 0) {
    return {
      valid: false,
      message: "Price must be greater than 0"
    };
  }

  if (price > 1000000) {
    return {
      valid: false,
      message: "Price cannot exceed $1,000,000"
    };
  }

  return { valid: true };
}