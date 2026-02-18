
import { getCryptoPrices } from "../src/lib/services/coinGecho";

async function main() {
  console.log("Testing getCryptoPrices with multiple symbols...");
  
  const symbols = ["BTC", "ETH", "SOL", "DOGE"];
  console.log(`Fetching prices for: ${symbols.join(", ")}`);

  const start = Date.now();
  const prices = await getCryptoPrices(symbols);
  const duration = Date.now() - start;

  console.log(`Fetch completed in ${duration}ms`);
  console.log("Results:");
  
  for (const symbol of symbols) {
    const data = prices[symbol];
    if (data) {
      console.log(`${symbol}: $${data.price} (Change: ${data.change24h.toFixed(2)}%)`);
    } else {
      console.error(`${symbol}: Failed to fetch`);
    }
  }

  // Test caching
  console.log("\nTesting cache (should be instant)...");
  const startCache = Date.now();
  const cachedPrices = await getCryptoPrices(symbols);
  const durationCache = Date.now() - startCache;
  console.log(`Cache fetch completed in ${durationCache}ms`);
}

main().catch(console.error);
