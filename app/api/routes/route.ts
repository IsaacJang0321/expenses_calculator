import { NextRequest, NextResponse } from "next/server";
import { formatBilingualError } from "../../lib/textUtils";

export async function POST(request: NextRequest) {
  try {
    const { start, goal } = await request.json();

    if (!start || !goal) {
      return NextResponse.json(
        { error: "Start and goal are required" },
        { status: 400 }
      );
    }

    // Check if start and goal are the same
    if (start.trim() === goal.trim()) {
      return NextResponse.json(
        { 
          error: formatBilingualError("출발지와 도착지가 같습니다. 다른 위치를 입력해주세요. (Departure and destination are the same. Please enter different locations.)")
        },
        { status: 400 }
      );
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    // Debug: Check if credentials are loaded (don't log actual values)
    console.log("API Credentials check:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0,
    });

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { 
          error: formatBilingualError("Naver Map API 인증 정보가 설정되지 않았습니다. .env.local 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 추가해주세요. (Naver Map API credentials not configured. Please add NAVER_CLIENT_ID and NAVER_CLIENT_SECRET to your .env.local file.)")
        },
        { status: 400 }
      );
    }

    // Helper function to geocode address to coordinates
    async function geocodeAddress(address: string): Promise<string | null> {
      try {
        const geocodeUrl = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
        const response = await fetch(geocodeUrl, {
          headers: {
            "X-NCP-APIGW-API-KEY-ID": clientId!,
            "X-NCP-APIGW-API-KEY": clientSecret!,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Geocoding API error for "${address}":`, {
            status: response.status,
            error: errorText
          });
          return null;
        }

        const data = await response.json();
        console.log(`Geocoding response for "${address}":`, JSON.stringify(data, null, 2));
        
        // Check different possible response formats
        if (data.addresses && data.addresses.length > 0) {
          const addr = data.addresses[0];
          // x is longitude, y is latitude
          return `${addr.x},${addr.y}`;
        }
        
        // Alternative format
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          if (result.location) {
            return `${result.location.lng},${result.location.lat}`;
          }
        }
        
        console.warn(`No coordinates found in geocoding response for "${address}"`);
        return null;
      } catch (error) {
        console.error("Geocoding error:", error);
        return null;
      }
    }

    // Check if start/goal are coordinates (format: "lng,lat" or "lat,lng")
    // If not, try to geocode them
    let startCoord = start;
    let goalCoord = goal;
    
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    const isStartCoord = coordPattern.test(start);
    const isGoalCoord = coordPattern.test(goal);

    if (!isStartCoord) {
      console.log(`Geocoding start address: ${start}`);
      const geocoded = await geocodeAddress(start);
      if (geocoded) {
        startCoord = geocoded;
        console.log(`Geocoded start to: ${startCoord}`);
      } else {
        console.warn(`Failed to geocode start address: ${start}, will try with original address`);
        // Keep original address, Directions API might accept it
      }
    }

    if (!isGoalCoord) {
      console.log(`Geocoding goal address: ${goal}`);
      const geocoded = await geocodeAddress(goal);
      if (geocoded) {
        goalCoord = geocoded;
        console.log(`Geocoded goal to: ${goalCoord}`);
      } else {
        console.warn(`Failed to geocode goal address: ${goal}, will try with original address`);
        // Keep original address, Directions API might accept it
      }
    }
    
    // If geocoding failed for both, return error
    if (!isStartCoord && !coordPattern.test(startCoord)) {
      return NextResponse.json(
        { 
          error: formatBilingualError(`출발지 "${start}"를 찾을 수 없습니다. 더 구체적인 주소를 입력해주세요. (Could not find departure location "${start}". Please enter a more specific address.)`)
        },
        { status: 400 }
      );
    }
    
    if (!isGoalCoord && !coordPattern.test(goalCoord)) {
      return NextResponse.json(
        { 
          error: formatBilingualError(`도착지 "${goal}"를 찾을 수 없습니다. 더 구체적인 주소를 입력해주세요. (Could not find destination location "${goal}". Please enter a more specific address.)`)
        },
        { status: 400 }
      );
    }

    // Naver Maps API Directions endpoint
    // Directions 5: https://maps.apigw.ntruss.com/map-direction/v1
    // Directions 15: https://maps.apigw.ntruss.com/map-direction-15/v1
    const baseUrls = [
      "https://maps.apigw.ntruss.com/map-direction-15/v1/driving",  // Directions 15 (try first)
      "https://maps.apigw.ntruss.com/map-direction/v1/driving",     // Directions 5 (fallback)
    ];
    const options = ["trafast", "tracomfort", "traoptimal", "traavoidtoll"];
    
    // Fetch all route options in parallel
    // Try Directions 15 first, then fallback to Directions 5 if needed
    const routePromises = options.map(async (option) => {
      // Try each base URL until one works
      for (const baseUrl of baseUrls) {
        const url = `${baseUrl}?start=${encodeURIComponent(startCoord)}&goal=${encodeURIComponent(goalCoord)}&option=${option}`;
        
        try {
          const response = await fetch(url, {
            headers: {
              "X-NCP-APIGW-API-KEY-ID": clientId,
              "X-NCP-APIGW-API-KEY": clientSecret,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            
            // Try to parse error JSON
            try {
              const errorData = JSON.parse(errorText);
              
              // If it's a 210 error, try next URL
              if (errorData.error?.errorCode === "210") {
                console.log(`[${option}] Error 210 with ${baseUrl}, trying next URL...`);
                continue; // Try next baseUrl
              }
            } catch (e) {
              // Not JSON, continue to next URL
            }
            
            // If we've tried all URLs, log the error
            if (baseUrl === baseUrls[baseUrls.length - 1]) {
              console.error(`Naver API error for ${option}:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
                url: url,
                headers: {
                  hasClientId: !!clientId,
                  hasClientSecret: !!clientSecret,
                }
              });
              
              try {
                const errorData = JSON.parse(errorText);
                console.error(`Parsed error data:`, errorData);
                
                if (errorData.error?.errorCode === "210") {
                  return { 
                    __subscriptionError: true,
                    errorDetails: errorData.error 
                  };
                }
              } catch (e) {
                // Not JSON or different error
              }
            }
            
            // If not the last URL, continue to next
            if (baseUrl !== baseUrls[baseUrls.length - 1]) {
              continue;
            }
            
            return null;
          }

          const data = await response.json();
          
          // Check if API returned an error in response body
          if (data.error) {
            if (data.error.errorCode === "210") {
              // Try next URL
              continue;
            }
            console.error(`Naver API error:`, data.error);
            if (baseUrl === baseUrls[baseUrls.length - 1]) {
              return null;
            }
            continue;
          }
          
          // Check if API returned an error code
          if (data.code !== undefined && data.code !== 0) {
            console.error(`Naver API error code ${data.code}:`, {
              code: data.code,
              message: data.message,
              url: url,
              start: start,
              goal: goal,
              option: option
            });
            if (baseUrl === baseUrls[baseUrls.length - 1]) {
              return null;
            }
            continue;
          }

          // Naver API returns routes in data.route[option] array
          const routeData = data.route?.[option];
          
          if (!routeData || !Array.isArray(routeData) || routeData.length === 0) {
            if (baseUrl === baseUrls[baseUrls.length - 1]) {
              return null;
            }
            continue;
          }

          // Success! Return the first route from each option
          console.log(`[${option}] Successfully fetched route from ${baseUrl}`);
          return routeData[0];
        } catch (error) {
          console.error(`Error fetching ${option} route from ${baseUrl}:`, error);
          // If this is the last URL, return null
          if (baseUrl === baseUrls[baseUrls.length - 1]) {
            return null;
          }
          // Otherwise continue to next URL
          continue;
        }
      }
      
      // If we've tried all URLs and none worked, return null
      return null;
    });

    const routeResults = await Promise.all(routePromises);
    
    // Check if any result indicates subscription error
    const hasSubscriptionError = routeResults.some(
      (result: any) => result && result.__subscriptionError
    );
    
    if (hasSubscriptionError) {
      const errorDetails = routeResults.find((r: any) => r?.__subscriptionError)?.errorDetails;
      const errorText = "Naver Directions API 접근 권한이 없습니다. 다음을 확인해주세요:\n1. Naver Cloud Platform 콘솔에서 Directions API가 구독되어 있는지 확인\n2. 사용 중인 API 키(Client ID/Secret)가 Directions API를 구독한 Application에 속해 있는지 확인\n3. API 키가 올바르게 설정되었는지 확인\n\n(Naver Directions API access denied. Please check:\n1. Directions API is subscribed in Naver Cloud Platform console\n2. The API keys (Client ID/Secret) belong to an Application that has subscribed to Directions API\n3. API keys are correctly configured)";
      return NextResponse.json(
        { 
          error: formatBilingualError(errorText),
          errorCode: errorDetails?.errorCode,
          errorMessage: errorDetails?.message
        },
        { status: 403 }
      );
    }
    
    // Filter out null results and subscription errors, then transform to our format
    const routes = routeResults
      .filter((route: any): route is any => route !== null && !route.__subscriptionError)
      .map((route: any) => ({
        distance: Math.round(route.summary.distance / 1000), // Convert to km
        duration: Math.round(route.summary.duration / 60000), // Convert to minutes
        tollFee: route.summary.tollFare || 0,
        path: route.path || [],
      }))
      // Remove duplicates (same distance and duration)
      .filter((route, index, self) => 
        index === self.findIndex((r) => 
          r.distance === route.distance && r.duration === route.duration
        )
      )
      // Sort by duration (fastest first)
      .sort((a, b) => a.duration - b.duration);

    if (routes.length === 0) {
      return NextResponse.json(
        { error: formatBilingualError("경로를 찾을 수 없습니다. 출발지와 도착지를 확인해주세요. (No routes found. Please check your departure and destination locations.)") },
        { status: 404 }
      );
    }

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Error in route API:", error);
    return NextResponse.json(
      { 
        error: formatBilingualError("경로를 찾을 수 없습니다. 주소를 다시 확인해주세요. (Could not find route. Please check your addresses again.)")
      },
      { status: 500 }
    );
  }
}

