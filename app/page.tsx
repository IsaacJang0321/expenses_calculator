"use client";

import { useState, useEffect } from "react";
import RouteSelector from "./components/RouteSelector";
import VehicleForm from "./components/VehicleForm";
import AdditionalExpenses from "./components/AdditionalExpenses";
import CostSummary from "./components/CostSummary";
import {
  calculateTotalCost,
  RouteInfo,
  VehicleDetails,
  AdditionalExpenses as AdditionalExpensesType,
} from "./lib/calculations";
import { getFuelPrices, getFuelPriceByType } from "./lib/fuelPrice";
import { RouteOption } from "./lib/naverMap";
import { formatBilingualText } from "./lib/textUtils";

const CACHE_KEY = "trip_expenses_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  vehicle: VehicleDetails | null;
  timestamp: number;
}

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [additionalExpenses, setAdditionalExpenses] =
    useState<AdditionalExpensesType>({
      parking: 0,
      meals: 0,
      accommodation: 0,
      other: 0,
    });
  const [fuelPrice, setFuelPrice] = useState<number>(0);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showAdditionalExpenses, setShowAdditionalExpenses] = useState(false);

  // Load cached vehicle preference on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: CacheData = JSON.parse(cached);
        const now = Date.now();
        if (now - data.timestamp < CACHE_EXPIRY && data.vehicle) {
          setVehicle(data.vehicle);
        }
      }
    } catch (error) {
      console.error("Failed to load cache:", error);
    }
  }, []);

  // Save vehicle preference to cache
  useEffect(() => {
    if (vehicle) {
      try {
        const cacheData: CacheData = {
          vehicle,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error("Failed to save cache:", error);
      }
    }
  }, [vehicle]);

  // Fetch fuel price when vehicle is selected
  useEffect(() => {
    if (vehicle) {
      getFuelPrices().then((prices) => {
        const price = getFuelPriceByType(vehicle.fuelType, prices);
        setFuelPrice(price);
      });
    }
  }, [vehicle]);

  // Show vehicle form when route is selected
  useEffect(() => {
    setShowVehicleForm(selectedRoute !== null);
  }, [selectedRoute]);

  // Show additional expenses when vehicle is selected
  useEffect(() => {
    setShowAdditionalExpenses(vehicle !== null);
  }, [vehicle]);

  const routeInfo: RouteInfo | null = selectedRoute
    ? {
        distance: selectedRoute.distance,
        duration: selectedRoute.duration,
        tollFee: selectedRoute.tollFee,
      }
    : null;

  const breakdown = calculateTotalCost(
    routeInfo,
    vehicle,
    fuelPrice,
    additionalExpenses
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#1f1f1f] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {formatBilingualText("경비 계산기 (Trip Expenses Calculator)")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatBilingualText("경로와 차량 정보로 출장비를 계산하세요 (Calculate trip expenses with route and vehicle information)")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Route Selector - Always visible */}
          <div
            className={`transition-all duration-300 ${
              showVehicleForm ? "opacity-100" : "opacity-100"
            }`}
          >
            <RouteSelector
              onRouteSelect={(route) => {
                setSelectedRoute(route);
              }}
              selectedRoute={selectedRoute}
            />
          </div>

          {/* Vehicle Form - Expands after route selection */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showVehicleForm
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {showVehicleForm && (
              <div className="mt-6">
                <VehicleForm
                  onVehicleChange={(v) => {
                    setVehicle(v);
                  }}
                />
              </div>
            )}
          </div>

          {/* Additional Expenses - Expands after vehicle selection */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showAdditionalExpenses
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {showAdditionalExpenses && (
              <div className="mt-6">
                <AdditionalExpenses
                  onExpensesChange={(expenses) => {
                    setAdditionalExpenses(expenses);
                  }}
                />
              </div>
            )}
          </div>

          {/* Cost Summary - Always visible */}
          <div className="mt-6">
            <CostSummary breakdown={breakdown} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <small>© 2025 Isaac — 경비 계산기</small> <br />
        <small>본 서비스는 어떠한 개인정보도 수집하지 않습니다.</small>
        <div>
          <a target="_blank" href="https://github.com/IsaacJang0321/expenses_calculator">Click here to see the GitHub repository</a>
        </div>
        </div>
      </div>
    </main>
  );
}
