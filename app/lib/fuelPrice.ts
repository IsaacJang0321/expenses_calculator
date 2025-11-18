// Korean fuel price API integration
// Using OPINET API for real-time fuel prices

export interface FuelPrices {
  gasoline: number;
  premiumGasoline: number | null; // 고급휘발유 (B034)
  diesel: number;
  lpg: number;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

let cachedPrices: FuelPrices | null = null;

// Fetch fuel prices from OPINET API
export async function getFuelPrices(): Promise<FuelPrices> {
  // Check cache first
  if (cachedPrices) {
    const now = Date.now();
    if (now - cachedPrices.timestamp < CACHE_DURATION) {
      return cachedPrices;
    }
  }

  try {
    // Call our API route which fetches from OPINET
    const response = await fetch("/api/fuel-prices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch fuel prices: ${response.status}`);
    }

    const prices: FuelPrices = await response.json();
    
    cachedPrices = prices;
    return prices;
  } catch (error) {
    console.error("Failed to fetch fuel prices:", error);
    // Return default prices if API fails
    const defaultPrices: FuelPrices = {
      gasoline: 1850,
      premiumGasoline: null,
      diesel: 1650,
      lpg: 950,
      timestamp: Date.now(),
    };
    return defaultPrices;
  }
}

export function getFuelPriceByType(
  fuelType: "gasoline" | "diesel" | "lpg" | "electric",
  prices: FuelPrices
): number {
  if (fuelType === "electric") {
    // Electric vehicles - using average electricity cost per km
    // Approximate: 0.2 kWh/km * ₩150/kWh = ₩30/km equivalent
    return 0; // Special handling needed for electric
  }
  return prices[fuelType] || prices.gasoline;
}




