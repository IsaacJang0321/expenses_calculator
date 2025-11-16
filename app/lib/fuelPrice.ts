// Korean fuel price API integration
// Using a mock API structure - replace with actual Korean fuel price API

export interface FuelPrices {
  gasoline: number;
  diesel: number;
  lpg: number;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

let cachedPrices: FuelPrices | null = null;

// Mock fuel prices - replace with actual API call
// For production, use Korean fuel price API like Opinet API
export async function getFuelPrices(): Promise<FuelPrices> {
  // Check cache first
  if (cachedPrices) {
    const now = Date.now();
    if (now - cachedPrices.timestamp < CACHE_DURATION) {
      return cachedPrices;
    }
  }

  try {
    // TODO: Replace with actual Korean fuel price API
    // Example: Opinet API or similar service
    // For now, using mock data with realistic Korean fuel prices
    const mockPrices: FuelPrices = {
      gasoline: 1850, // ₩/L
      diesel: 1650, // ₩/L
      lpg: 950, // ₩/L
      timestamp: Date.now(),
    };

    cachedPrices = mockPrices;
    return mockPrices;
  } catch (error) {
    console.error("Failed to fetch fuel prices:", error);
    // Return default prices if API fails
    return {
      gasoline: 1850,
      diesel: 1650,
      lpg: 950,
      timestamp: Date.now(),
    };
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




