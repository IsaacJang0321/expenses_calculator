"use client";

import { useState, useEffect } from "react";
import RouteSelector from "./components/RouteSelector";
import DateSelector from "./components/DateSelector";
import VehicleForm from "./components/VehicleForm";
import AdditionalExpenses from "./components/AdditionalExpenses";
import CostSummary from "./components/CostSummary";
import ExpenseList from "./components/ExpenseList";
import {
  calculateTotalCost,
  RouteInfo,
  VehicleDetails,
  AdditionalExpenses as AdditionalExpensesType,
  CostBreakdown,
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

interface ExpenseItem {
  id: string;
  date: string;
  breakdown: CostBreakdown;
  route?: RouteOption;
  vehicle?: VehicleDetails;
  additionalExpenses: AdditionalExpensesType;
}

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [tripDate, setTripDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
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
  const [expenseList, setExpenseList] = useState<ExpenseItem[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

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

  const [manualFuelPrice, setManualFuelPrice] = useState<number | null>(null);

  // Fetch fuel price when vehicle is selected (only if not using manual price)
  useEffect(() => {
    if (vehicle && manualFuelPrice === null) {
      getFuelPrices().then((prices) => {
        const price = getFuelPriceByType(vehicle.fuelType, prices);
        setFuelPrice(price);
      });
    } else if (manualFuelPrice !== null) {
      setFuelPrice(manualFuelPrice);
    }
  }, [vehicle, manualFuelPrice]);

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
    additionalExpenses,
    tripDate
  );

  const handleAddClick = () => {
    setShowCalculator(true);
    setEditingItemId(null);
    // Reset form when adding new
    setSelectedRoute(null);
    setVehicle(null);
    setAdditionalExpenses({
      parking: 0,
      meals: 0,
      accommodation: 0,
      other: 0,
    });
    setTripDate(new Date().toISOString().split("T")[0]);
    setManualFuelPrice(null);
  };

  const handleItemClick = (item: ExpenseItem) => {
    setEditingItemId(item.id);
    setShowCalculator(true);
    // Restore form data
    if (item.route) {
      setSelectedRoute(item.route);
    }
    if (item.vehicle) {
      setVehicle(item.vehicle);
    }
    setAdditionalExpenses(item.additionalExpenses);
    setTripDate(item.date);
  };

  const handleItemDelete = (id: string) => {
    setExpenseList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#1f1f1f] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {formatBilingualText("경비 계산기 (Trip Expenses Calculator)")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatBilingualText("경로와 차량 정보로 출장비를 계산하세요 (Calculate trip expenses with route and vehicle information)")}
          </p>
        </div>

        <div className={`flex transition-all duration-500 ease-in-out ${showCalculator ? "gap-6" : "justify-center"}`}>
          {/* Left: Calculator */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showCalculator
                ? "flex-1 opacity-100 max-h-none"
                : "w-0 opacity-0 max-h-0 pointer-events-none"
            }`}
          >
            <div className={`space-y-6 transition-opacity duration-500 ${showCalculator ? "opacity-100" : "opacity-0"}`}>
          {/* Date Selector - Always visible */}
          <div>
            <DateSelector date={tripDate} onDateChange={setTripDate} />
          </div>

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
                  onFuelPriceChange={setManualFuelPrice}
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

                {/* Cost Summary */}
                <div className="mt-6">
                  <CostSummary breakdown={breakdown} />
                </div>

                {/* Complete Button */}
                <div className="mt-6 w-full max-w-2xl mx-auto">
                  <button
                    onClick={() => {
                      const newItem: ExpenseItem = {
                        id: editingItemId || `expense-${Date.now()}`,
                        date: tripDate,
                        breakdown,
                        route: selectedRoute || undefined,
                        vehicle: vehicle || undefined,
                        additionalExpenses,
                      };

                      if (editingItemId) {
                        // Update existing item
                        setExpenseList((prev) =>
                          prev.map((item) =>
                            item.id === editingItemId ? newItem : item
                          )
                        );
                      } else {
                        // Add new item
                        setExpenseList((prev) => [...prev, newItem]);
                      }

                      // Hide calculator and reset
                      setShowCalculator(false);
                      setEditingItemId(null);
                      setSelectedRoute(null);
                      setVehicle(null);
                      setAdditionalExpenses({
                        parking: 0,
                        meals: 0,
                        accommodation: 0,
                        other: 0,
                      });
                      setTripDate(new Date().toISOString().split("T")[0]);
                      setManualFuelPrice(null);
                    }}
                    disabled={breakdown.total === 0}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formatBilingualText(
                      editingItemId
                        ? "수정 완료 (Update)"
                        : "완료 (Complete)"
                    )}
                  </button>
                </div>
            </div>
          </div>

          {/* Right: Expense List */}
          <div 
            className="w-80 flex-shrink-0 transition-all duration-500 ease-in-out"
          >
            <ExpenseList
              items={expenseList}
              onItemClick={handleItemClick}
              onItemDelete={handleItemDelete}
              onAddClick={handleAddClick}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <small>© 2025 Isaac — 경비 계산기</small> <br />
          <small>본 서비스는 어떠한 개인정보도 수집하지 않습니다.</small>
          <div>
            <a
              target="_blank"
              href="https://github.com/IsaacJang0321/expenses_calculator"
            >
              Click here to see the GitHub repository
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
