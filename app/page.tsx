"use client";

import { useState, useEffect } from "react";
import RouteSelector from "./components/RouteSelector";
import DateSelector from "./components/DateSelector";
import VehicleForm from "./components/VehicleForm";
import AdditionalExpenses from "./components/AdditionalExpenses";
import MemoSection from "./components/MemoSection";
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
import {
  generateExportData,
  exportToCSV,
  exportToXLSX,
  exportToPNG,
  exportToPDF,
} from "./lib/exportUtils";

const CACHE_KEY = "trip_expenses_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const EXPENSE_LIST_KEY = "expense_list";

interface CacheData {
  vehicle: VehicleDetails | null;
  timestamp: number;
}

interface RouteSelectorState {
  useNaverMap: boolean;
  useAddressInput: boolean;
  isRoundTrip: boolean;
  departure: string;
  destination: string;
  manualDistance: string;
  manualTollFee: string;
  manualDuration: string;
}

interface VehicleFormState {
  useManualEfficiency: boolean;
  useManualFuelPrice: boolean;
  manualEfficiency: string;
  manualFuelType: "gasoline" | "diesel" | "lpg" | "electric";
  manualFuelPrice: string;
  brand: string;
  model: string;
  selectedVariantIndex: number;
}

export interface ExpenseItem {
  id: string;
  date: string;
  breakdown: CostBreakdown;
  route?: RouteOption;
  vehicle?: VehicleDetails;
  additionalExpenses: AdditionalExpensesType;
  routeSelectorState?: RouteSelectorState;
  vehicleFormState?: VehicleFormState;
  memo?: string;
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
  const [showMemoSection, setShowMemoSection] = useState(false);
  const [memo, setMemo] = useState<string>("");
  const [expenseList, setExpenseList] = useState<ExpenseItem[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [calculatorKey, setCalculatorKey] = useState(0);

  // RouteSelector states
  const [routeUseNaverMap, setRouteUseNaverMap] = useState(true);
  const [routeUseAddressInput, setRouteUseAddressInput] = useState(false);
  const [routeIsRoundTrip, setRouteIsRoundTrip] = useState(false);
  const [routeDeparture, setRouteDeparture] = useState("");
  const [routeDestination, setRouteDestination] = useState("");
  const [routeManualDistance, setRouteManualDistance] = useState("");
  const [routeManualTollFee, setRouteManualTollFee] = useState("");
  const [routeManualDuration, setRouteManualDuration] = useState("");

  // VehicleForm states
  const [vehicleUseManualEfficiency, setVehicleUseManualEfficiency] = useState(false);
  const [vehicleUseManualFuelPrice, setVehicleUseManualFuelPrice] = useState(false);
  const [vehicleManualEfficiency, setVehicleManualEfficiency] = useState("");
  const [vehicleManualFuelType, setVehicleManualFuelType] = useState<"gasoline" | "diesel" | "lpg" | "electric">("gasoline");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleSelectedVariantIndex, setVehicleSelectedVariantIndex] = useState(0);

  // Load cached vehicle preference and expense list on mount
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

    // Load expense list
    try {
      const savedList = localStorage.getItem(EXPENSE_LIST_KEY);
      if (savedList) {
        const list: ExpenseItem[] = JSON.parse(savedList);
        setExpenseList(list);
      }
    } catch (error) {
      console.error("Failed to load expense list:", error);
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

  // Save expense list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(EXPENSE_LIST_KEY, JSON.stringify(expenseList));
    } catch (error) {
      console.error("Failed to save expense list:", error);
    }
  }, [expenseList]);

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

  // Show memo section when additional expenses are shown
  useEffect(() => {
    setShowMemoSection(showAdditionalExpenses);
  }, [showAdditionalExpenses]);

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
    setCalculatorKey(prev => prev + 1); // Force remount by changing key
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
    setMemo("");
    
    // Reset RouteSelector states
    setRouteUseNaverMap(true);
    setRouteUseAddressInput(false);
    setRouteIsRoundTrip(false);
    setRouteDeparture("");
    setRouteDestination("");
    setRouteManualDistance("");
    setRouteManualTollFee("");
    setRouteManualDuration("");
    
    // Reset VehicleForm states
    setVehicleUseManualEfficiency(false);
    setVehicleUseManualFuelPrice(false);
    setVehicleManualEfficiency("");
    setVehicleManualFuelType("gasoline");
    setVehicleBrand("");
    setVehicleModel("");
    setVehicleSelectedVariantIndex(0);
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
    setMemo(item.memo || "");
    
    // Restore RouteSelector states
    if (item.routeSelectorState) {
      setRouteUseNaverMap(item.routeSelectorState.useNaverMap);
      setRouteUseAddressInput(item.routeSelectorState.useAddressInput);
      setRouteIsRoundTrip(item.routeSelectorState.isRoundTrip);
      setRouteDeparture(item.routeSelectorState.departure);
      setRouteDestination(item.routeSelectorState.destination);
      setRouteManualDistance(item.routeSelectorState.manualDistance);
      setRouteManualTollFee(item.routeSelectorState.manualTollFee);
      setRouteManualDuration(item.routeSelectorState.manualDuration);
    } else {
      // Fallback to defaults if state not saved
      setRouteUseNaverMap(true);
      setRouteUseAddressInput(false);
      setRouteIsRoundTrip(false);
      setRouteDeparture("");
      setRouteDestination("");
      setRouteManualDistance("");
      setRouteManualTollFee("");
      setRouteManualDuration("");
    }
    
    // Restore VehicleForm states
    if (item.vehicleFormState) {
      setVehicleUseManualEfficiency(item.vehicleFormState.useManualEfficiency);
      setVehicleUseManualFuelPrice(item.vehicleFormState.useManualFuelPrice);
      setVehicleManualEfficiency(item.vehicleFormState.manualEfficiency);
      setVehicleManualFuelType(item.vehicleFormState.manualFuelType);
      setVehicleBrand(item.vehicleFormState.brand);
      setVehicleModel(item.vehicleFormState.model);
      setVehicleSelectedVariantIndex(item.vehicleFormState.selectedVariantIndex);
      
      // Restore manual fuel price if applicable
      if (item.vehicleFormState.useManualFuelPrice && item.vehicleFormState.manualFuelPrice) {
        setManualFuelPrice(parseFloat(item.vehicleFormState.manualFuelPrice));
      } else {
        setManualFuelPrice(null);
      }
    } else {
      // Fallback to defaults if state not saved
      setVehicleUseManualEfficiency(false);
      setVehicleUseManualFuelPrice(false);
      setVehicleManualEfficiency("");
      setVehicleManualFuelType("gasoline");
      setVehicleBrand("");
      setVehicleModel("");
      setVehicleSelectedVariantIndex(0);
      setManualFuelPrice(null);
    }
  };

  const handleItemDelete = (id: string) => {
    setExpenseList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteAll = () => {
    setExpenseList([]);
    try {
      localStorage.removeItem(EXPENSE_LIST_KEY);
    } catch (error) {
      console.error("Failed to delete expense list from localStorage:", error);
    }
  };

  const handleExport = async (exportData: {
    author: string;
    createdDate: string;
    startDate: string;
    endDate: string;
    format: "csv" | "xlsx" | "png" | "pdf";
  }) => {
    const { rows, summary } = generateExportData(
      expenseList,
      exportData.author,
      exportData.createdDate,
      exportData.startDate,
      exportData.endDate
    );

    if (rows.length === 0) {
      alert(
        formatBilingualText(
          "선택한 기간에 해당하는 경비 내역이 없습니다. (No expenses found for the selected period)"
        )
      );
      return;
    }

    const filename = `경비내역_${exportData.startDate}_${exportData.endDate}`;

    try {
      switch (exportData.format) {
        case "csv":
          exportToCSV(rows, summary, filename);
          break;
        case "xlsx":
          exportToXLSX(rows, summary, filename);
          break;
        case "png":
          await exportToPNG(rows, summary, filename);
          break;
        case "pdf":
          await exportToPDF(rows, summary, filename);
          break;
      }
    } catch (error) {
      console.error("Export error:", error);
      alert(
        formatBilingualText(
          "내보내기 중 오류가 발생했습니다. (An error occurred during export)"
        )
      );
    }
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
            <div key={`calculator-${calculatorKey}`} className={`space-y-6 transition-opacity duration-500 ${showCalculator ? "opacity-100" : "opacity-0"}`}>
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
              key={`route-selector-${calculatorKey}`}
              onRouteSelect={(route) => {
                setSelectedRoute(route);
              }}
              selectedRoute={selectedRoute}
              initialUseNaverMap={routeUseNaverMap}
              initialUseAddressInput={routeUseAddressInput}
              initialIsRoundTrip={routeIsRoundTrip}
              initialDeparture={routeDeparture}
              initialDestination={routeDestination}
              initialManualDistance={routeManualDistance}
              initialManualTollFee={routeManualTollFee}
              initialManualDuration={routeManualDuration}
              onStateChange={(state) => {
                setRouteUseNaverMap(state.useNaverMap);
                setRouteUseAddressInput(state.useAddressInput);
                setRouteIsRoundTrip(state.isRoundTrip);
                setRouteDeparture(state.departure);
                setRouteDestination(state.destination);
                setRouteManualDistance(state.manualDistance);
                setRouteManualTollFee(state.manualTollFee);
                setRouteManualDuration(state.manualDuration);
              }}
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
                  key={`vehicle-form-${editingItemId || 'new'}-${vehicleBrand}-${vehicleModel}`}
                  onVehicleChange={(v) => {
                    setVehicle(v);
                  }}
                  onFuelPriceChange={setManualFuelPrice}
                  initialUseManualEfficiency={vehicleUseManualEfficiency}
                  initialUseManualFuelPrice={vehicleUseManualFuelPrice}
                  initialManualEfficiency={vehicleManualEfficiency}
                  initialManualFuelType={vehicleManualFuelType}
                  initialManualFuelPrice={vehicleUseManualFuelPrice && manualFuelPrice !== null ? manualFuelPrice.toString() : ""}
                  initialBrand={vehicleBrand}
                  initialModel={vehicleModel}
                  initialSelectedVariantIndex={vehicleSelectedVariantIndex}
                  onStateChange={(state) => {
                    setVehicleUseManualEfficiency(state.useManualEfficiency);
                    setVehicleUseManualFuelPrice(state.useManualFuelPrice);
                    setVehicleManualEfficiency(state.manualEfficiency);
                    setVehicleManualFuelType(state.manualFuelType);
                    setVehicleBrand(state.brand);
                    setVehicleModel(state.model);
                    setVehicleSelectedVariantIndex(state.selectedVariantIndex);
                    if (state.useManualFuelPrice && state.manualFuelPrice) {
                      setManualFuelPrice(parseFloat(state.manualFuelPrice));
                    } else if (!state.useManualFuelPrice) {
                      setManualFuelPrice(null);
                    }
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

          {/* Memo Section - Expands after additional expenses */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showMemoSection
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {showMemoSection && (
              <div className="mt-6">
                <MemoSection
                  memo={memo}
                  onMemoChange={setMemo}
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
                      const routeSelectorState: RouteSelectorState = {
                        useNaverMap: routeUseNaverMap,
                        useAddressInput: routeUseAddressInput,
                        isRoundTrip: routeIsRoundTrip,
                        departure: routeDeparture,
                        destination: routeDestination,
                        manualDistance: routeManualDistance,
                        manualTollFee: routeManualTollFee,
                        manualDuration: routeManualDuration,
                      };

                      const vehicleFormState: VehicleFormState = {
                        useManualEfficiency: vehicleUseManualEfficiency,
                        useManualFuelPrice: vehicleUseManualFuelPrice,
                        manualEfficiency: vehicleManualEfficiency,
                        manualFuelType: vehicleManualFuelType,
                        manualFuelPrice: vehicleUseManualFuelPrice && manualFuelPrice !== null ? manualFuelPrice.toString() : "",
                        brand: vehicleBrand,
                        model: vehicleModel,
                        selectedVariantIndex: vehicleSelectedVariantIndex,
                      };

                      const newItem: ExpenseItem = {
                        id: editingItemId || `expense-${Date.now()}`,
                        date: tripDate,
                        breakdown,
                        route: selectedRoute || undefined,
                        vehicle: vehicle || undefined,
                        additionalExpenses,
                        routeSelectorState,
                        vehicleFormState,
                        memo: memo || undefined,
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
                      setMemo("");
                      
                      // Reset RouteSelector states
                      setRouteUseNaverMap(true);
                      setRouteUseAddressInput(false);
                      setRouteIsRoundTrip(false);
                      setRouteDeparture("");
                      setRouteDestination("");
                      setRouteManualDistance("");
                      setRouteManualTollFee("");
                      setRouteManualDuration("");
                      
                      // Reset VehicleForm states
                      setVehicleUseManualEfficiency(false);
                      setVehicleUseManualFuelPrice(false);
                      setVehicleManualEfficiency("");
                      setVehicleManualFuelType("gasoline");
                      setVehicleBrand("");
                      setVehicleModel("");
                      setVehicleSelectedVariantIndex(0);
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
              onDeleteAll={handleDeleteAll}
              onExport={handleExport}
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
