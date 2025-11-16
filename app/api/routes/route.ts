import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { start, goal } = await request.json();

    if (!start || !goal) {
      return NextResponse.json(
        { error: "Start and goal are required" },
        { status: 400 }
      );
    }

    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;

    // For development: return mock data if credentials are not configured
    if (!clientId || !clientSecret) {
      // Return mock routes for testing
      const mockRoutes = [
        {
          distance: Math.floor(Math.random() * 100) + 200, // 200-300 km
          duration: Math.floor(Math.random() * 60) + 120, // 120-180 min
          tollFee: Math.floor(Math.random() * 10000) + 10000, // 10000-20000 KRW
          path: [],
        },
        {
          distance: Math.floor(Math.random() * 100) + 250,
          duration: Math.floor(Math.random() * 60) + 150,
          tollFee: Math.floor(Math.random() * 10000) + 15000,
          path: [],
        },
        {
          distance: Math.floor(Math.random() * 100) + 300,
          duration: Math.floor(Math.random() * 60) + 180,
          tollFee: Math.floor(Math.random() * 10000) + 8000,
          path: [],
        },
      ];
      return NextResponse.json({ 
        routes: mockRoutes,
        mock: true, // Flag to indicate this is mock data
      });
    }

    // Naver Directions API endpoint
    const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${encodeURIComponent(start)}&goal=${encodeURIComponent(goal)}&option=trafast`;

    const response = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Naver API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch routes from Naver API" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Naver API response to our format
    const routes = data.route?.trafast?.map((route: any) => ({
      distance: Math.round(route.summary.distance / 1000), // Convert to km
      duration: Math.round(route.summary.duration / 60000), // Convert to minutes
      tollFee: route.summary.tollFare || 0,
      path: route.path || [],
    })) || [];

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Error in route API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

