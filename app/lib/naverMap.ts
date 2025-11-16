export interface NaverRoute {
  summary: {
    distance: number; // meters
    duration: number; // milliseconds
    tollFare: number; // KRW
    taxiFare: number; // KRW
    fuelPrice: number; // KRW
  };
  path: number[][]; // coordinates
}

export interface RouteOption {
  distance: number; // km
  duration: number; // minutes
  tollFee: number; // KRW
  path: number[][];
}

export async function searchRoutes(
  start: string,
  goal: string
): Promise<RouteOption[]> {
  try {
    const response = await fetch("/api/routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start, goal }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch routes");
    }

    const data = await response.json();
    return data.routes || [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
}

