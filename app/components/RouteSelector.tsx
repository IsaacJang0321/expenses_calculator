"use client";

import { useState } from "react";
import { searchRoutes, RouteOption } from "../lib/naverMap";

interface RouteSelectorProps {
  onRouteSelect: (route: RouteOption) => void;
  selectedRoute: RouteOption | null;
}

export default function RouteSelector({
  onRouteSelect,
  selectedRoute,
}: RouteSelectorProps) {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!departure.trim() || !destination.trim()) {
      setError("출발지와 도착지를 모두 입력해주세요 (Please enter both departure and destination)");
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);

    try {
      const results = await searchRoutes(departure, destination);
      setRoutes(results);
      if (results.length === 0) {
        setError("경로를 찾을 수 없습니다. 위치를 확인해주세요. (No routes found. Please check your locations.)");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Unknown error";
      if (errorMessage.includes("credentials") || errorMessage.includes("not configured")) {
        setError("Naver Map API 인증 정보가 설정되지 않았습니다. .env.local 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 추가해주세요. (Naver Map API credentials not configured. Please add NAVER_CLIENT_ID and NAVER_CLIENT_SECRET to your .env.local file.)");
        // Use mock data for development/testing
        setRoutes([
          {
            distance: 250,
            duration: 180,
            tollFee: 15000,
            path: [],
          },
          {
            distance: 280,
            duration: 150,
            tollFee: 20000,
            path: [],
          },
          {
            distance: 300,
            duration: 200,
            tollFee: 12000,
            path: [],
          },
        ]);
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              출발지 (Departure)
            </label>
            <input
              type="text"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              도착지 (Destination)
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "검색 중... (Searching...)" : "경로 검색 (Search Routes)"}
          </button>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>

        {routes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              추천 경로 (Recommended Routes)
            </h3>
            <div className="space-y-3">
              {routes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => onRouteSelect(route)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedRoute === route
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1f1f] hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        경로 {index + 1} (Route {index + 1})
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {route.distance}km • {route.duration}분 (min) • 통행료 (Toll): ₩
                        {route.tollFee.toLocaleString()}
                      </div>
                    </div>
                    {selectedRoute === route && (
                      <div className="text-blue-600 dark:text-blue-400">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRoute && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">
              선택된 경로 (Selected Route)
            </div>
            <div className="text-sm text-green-700 dark:text-green-400 mt-1">
              거리 (Distance): {selectedRoute.distance}km | 소요시간 (Duration):{" "}
              {selectedRoute.duration}분 (min) | 통행료 (Toll Fee): ₩
              {selectedRoute.tollFee.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

