export interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
  tollFee: number; // KRW
}

export interface VehicleDetails {
  brand: string;
  model: string;
  efficiency: number; // km/L
  fuelType: "gasoline" | "diesel" | "lpg" | "electric";
}

export interface AdditionalExpenses {
  parking: number;
  meals: number;
  accommodation: number;
  other: number;
}

export interface CostBreakdown {
  fuelCost: number;
  tollFee: number;
  parking: number;
  meals: number;
  accommodation: number;
  other: number;
  total: number;
}

export function calculateFuelCost(
  distance: number,
  efficiency: number,
  fuelPrice: number,
  fuelType: "gasoline" | "diesel" | "lpg" | "electric"
): number {
  if (fuelType === "electric") {
    // Electric: approximate 0.2 kWh/km * ₩150/kWh
    return Math.round(distance * 0.2 * 150);
  }
  const litersNeeded = distance / efficiency;
  return Math.round(litersNeeded * fuelPrice);
}

export function calculateTotalCost(
  route: RouteInfo | null,
  vehicle: VehicleDetails | null,
  fuelPrice: number,
  additionalExpenses: AdditionalExpenses
): CostBreakdown {
  if (!route || !vehicle) {
    return {
      fuelCost: 0,
      tollFee: 0,
      parking: additionalExpenses.parking,
      meals: additionalExpenses.meals,
      accommodation: additionalExpenses.accommodation,
      other: additionalExpenses.other,
      total: Object.values(additionalExpenses).reduce((a, b) => a + b, 0),
    };
  }

  const fuelCost = calculateFuelCost(
    route.distance,
    vehicle.efficiency,
    fuelPrice,
    vehicle.fuelType
  );

  const total =
    fuelCost +
    route.tollFee +
    additionalExpenses.parking +
    additionalExpenses.meals +
    additionalExpenses.accommodation +
    additionalExpenses.other;

  return {
    fuelCost,
    tollFee: route.tollFee,
    parking: additionalExpenses.parking,
    meals: additionalExpenses.meals,
    accommodation: additionalExpenses.accommodation,
    other: additionalExpenses.other,
    total,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}




