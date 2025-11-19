"use client";

import { useState } from "react";
import { searchRoutes, RouteOption } from "../lib/naverMap";
import { formatBilingualText } from "../lib/textUtils";

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
  const [useNaverMap, setUseNaverMap] = useState(true);
  const [useAddressInput, setUseAddressInput] = useState(false);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [originalSelectedRoute, setOriginalSelectedRoute] = useState<RouteOption | null>(null);
  const [manualDistance, setManualDistance] = useState("");
  const [manualTollFee, setManualTollFee] = useState("");
  const [manualDuration, setManualDuration] = useState("");

  const handleManualSubmit = () => {
    if (!manualDistance.trim() || !manualTollFee.trim()) {
      setError(formatBilingualText("거리와 통행료를 모두 입력해주세요 (Please enter both distance and toll fee)"));
      return;
    }

    const distance = parseFloat(manualDistance);
    const tollFee = parseInt(manualTollFee);
    const duration = manualDuration.trim() ? parseInt(manualDuration) : Math.round(distance * 0.6); // 기본값: 거리(km) * 0.6분 (평균 시속 100km 기준)

    if (isNaN(distance) || distance <= 0) {
      setError(formatBilingualText("올바른 거리를 입력해주세요 (Please enter a valid distance)"));
      return;
    }

    if (isNaN(tollFee) || tollFee < 0) {
      setError(formatBilingualText("올바른 통행료를 입력해주세요 (Please enter a valid toll fee)"));
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      setError(formatBilingualText("올바른 소요시간을 입력해주세요 (Please enter a valid duration)"));
      return;
    }

    setError(null);
    const multiplier = isRoundTrip ? 2 : 1;
    const originalRoute: RouteOption = {
      distance: distance,
      duration: duration,
      tollFee: tollFee,
      path: [],
    };
    setOriginalSelectedRoute(originalRoute);
    
    const manualRoute: RouteOption = {
      distance: distance * multiplier,
      duration: duration * multiplier,
      tollFee: tollFee * multiplier,
      path: [],
    };

    setRoutes([originalRoute]);
    onRouteSelect(manualRoute);
  };

  const handleSearch = async () => {
    if (!departure.trim() || !destination.trim()) {
      setError(formatBilingualText("출발지와 도착지를 모두 입력해주세요 (Please enter both departure and destination)"));
      return;
    }

    // Check if departure and destination are the same
    if (departure.trim() === destination.trim()) {
      setError(formatBilingualText("출발지와 도착지가 같습니다. 다른 위치를 입력해주세요. (Departure and destination are the same. Please enter different locations.)"));
      return;
    }

    setLoading(true);
    setError(null);
    setRoutes([]);
    setOriginalSelectedRoute(null);

    try {
      const results = await searchRoutes(departure, destination);
      setRoutes(results);
      if (results.length === 0) {
        setError(formatBilingualText("경로를 찾을 수 없습니다. 위치를 확인해주세요. (No routes found. Please check your locations.)"));
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Unknown error";
      if (errorMessage.includes("credentials") || errorMessage.includes("not configured")) {
        setError(formatBilingualText("Naver Map API 인증 정보가 설정되지 않았습니다. .env.local 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 추가해주세요. (Naver Map API credentials not configured. Please add NAVER_CLIENT_ID and NAVER_CLIENT_SECRET to your .env.local file.)"));
      } else {
        setError(formatBilingualText("경로를 찾을 수 없습니다. 주소를 다시 확인해주세요. (Could not find route. Please check your addresses again.)"));
      }
      setRoutes([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (useNaverMap) {
        handleManualSubmit();
      } else {
        handleSearch();
      }
    }
  };

  const handleNaverMapChange = (checked: boolean) => {
    setUseNaverMap(checked);
    if (checked) {
      setUseAddressInput(false);
      setDeparture("");
      setDestination("");
    }
    setError(null);
    setRoutes([]);
  };

  // Update selected route when round trip checkbox changes
  const handleRoundTripChange = (checked: boolean) => {
    setIsRoundTrip(checked);
    if (originalSelectedRoute) {
      const multiplier = checked ? 2 : 1;
      const updatedRoute: RouteOption = {
        distance: originalSelectedRoute.distance * multiplier,
        duration: originalSelectedRoute.duration * multiplier,
        tollFee: originalSelectedRoute.tollFee * multiplier,
        path: originalSelectedRoute.path,
      };
      onRouteSelect(updatedRoute);
    }
  };

  const handleAddressInputChange = (checked: boolean) => {
    setUseAddressInput(checked);
    if (checked) {
      setUseNaverMap(false);
      setManualDistance("");
      setManualTollFee("");
      setManualDuration("");
    }
    setError(null);
    setRoutes([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {formatBilingualText("경로")}
        </h2>
        <div className="space-y-4">
          {/* Input method checkboxes */}
          <div className="flex items-center gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="naver-map"
                checked={useNaverMap}
                onChange={(e) => handleNaverMapChange(e.target.checked)}
                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 dark:bg-[#1f1f1f] dark:border-gray-600 accent-green-500"
              />
              <label
                htmlFor="naver-map"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {formatBilingualText("지도로 검색 (Search with Map)")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="address-input"
                checked={useAddressInput}
                onChange={(e) => handleAddressInputChange(e.target.checked)}
                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 dark:bg-[#1f1f1f] dark:border-gray-600 accent-green-500"
              />
              <label
                htmlFor="address-input"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {formatBilingualText("주소를 입력 (Enter address directly)")}
              </label>
            </div>
            <div className="flex-1 border-l border-gray-300 dark:border-gray-600 mx-2"></div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="round-trip"
                checked={isRoundTrip}
                onChange={(e) => handleRoundTripChange(e.target.checked)}
                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 dark:bg-[#1f1f1f] dark:border-gray-600 accent-green-500"
              />
              <label
                htmlFor="round-trip"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {formatBilingualText("왕복 (Round Trip)")}
              </label>
            </div>
          </div>

          {useAddressInput ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("출발지 (Departure)")}
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
                  {formatBilingualText("도착지 (Destination)")}
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

              <div className="text-xs text-gray-500 dark:text-gray-400 py-1">
                {formatBilingualText("네이버 지도 API를 사용합니다. (Data powered by Naver Map API)")}
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? formatBilingualText("검색 중... (Searching...)") : formatBilingualText("경로 검색 (Search Routes)")}
              </button>
            </>
          ) : (
            <>
              {/* Map links */}
              <div className="mb-4 flex flex-wrap gap-3">
                <a
                  href="https://map.naver.com/v5/directions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <span>네이버 지도</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </a>
                <a
                  href="https://map.kakao.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <span>카카오맵</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("거리")} (km)
                </label>
                <input
                  type="number"
                  value={manualDistance}
                  onChange={(e) => setManualDistance(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("통행료 (Toll Fee)")} (₩)
                </label>
                <input
                  type="number"
                  value={manualTollFee}
                  onChange={(e) => setManualTollFee(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("소요시간 (min) ")}
                </label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={formatBilingualText("Optional")}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatBilingualText("비워두면 거리 기반으로 자동 계산됩니다 (Leave empty for auto-calculation based on distance)")}
                </p>
              </div>

              <button
                onClick={handleManualSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {formatBilingualText("적용")}
              </button>
            </>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}
        </div>

        {routes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              {formatBilingualText("추천 경로 (Recommended Routes)")}
            </h3>
            <div className="space-y-3">
              {routes.map((route, index) => {
                const multiplier = isRoundTrip ? 2 : 1;
                const displayRoute = {
                  ...route,
                  distance: route.distance * multiplier,
                  duration: route.duration * multiplier,
                  tollFee: route.tollFee * multiplier,
                };
                return (
                  <button
                    key={index}
                    onClick={() => {
                      // Store original route
                      setOriginalSelectedRoute(route);
                      const selectedRouteWithMultiplier: RouteOption = {
                        distance: route.distance * multiplier,
                        duration: route.duration * multiplier,
                        tollFee: route.tollFee * multiplier,
                        path: route.path,
                      };
                      onRouteSelect(selectedRouteWithMultiplier);
                    }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedRoute && 
                      selectedRoute.distance === displayRoute.distance &&
                      selectedRoute.duration === displayRoute.duration &&
                      selectedRoute.tollFee === displayRoute.tollFee
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1f1f1f] hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatBilingualText(`경로 ${index + 1} (Route ${index + 1})`)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {displayRoute.distance}km • {displayRoute.duration}분 {formatBilingualText("(min)")} • {formatBilingualText("통행료 (Toll)")}: ₩
                          {displayRoute.tollFee.toLocaleString()}
                        </div>
                      </div>
                      {selectedRoute && 
                       selectedRoute.distance === displayRoute.distance &&
                       selectedRoute.duration === displayRoute.duration &&
                       selectedRoute.tollFee === displayRoute.tollFee && (
                        <div className="text-blue-600 dark:text-blue-400">✓</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedRoute && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">
              {formatBilingualText("선택된 경로 (Selected Route)")}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400 mt-1">
              {formatBilingualText("거리 (Distance)")}: {selectedRoute.distance}km | {formatBilingualText("소요시간 (Duration)")}:{" "}
              {selectedRoute.duration}분 {formatBilingualText("(min)")} | {formatBilingualText("통행료 (Toll Fee)")}: ₩
              {selectedRoute.tollFee.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

