"use client";

import { useState, useEffect } from "react";
import RouteSelector from "./components/RouteSelector";
import DateSelector from "./components/DateSelector";
import VehicleForm from "./components/VehicleForm";
import AdditionalExpenses from "./components/AdditionalExpenses";
import MemoSection from "./components/MemoSection";
import CostSummary from "./components/CostSummary";
import ExpenseList from "./components/ExpenseList";
import ConfirmModal from "./components/ConfirmModal";
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  // Initialize Kakao AdFit ads after script loads
  useEffect(() => {
    const initAds = () => {
      if (typeof window === 'undefined') return;
      
      // Check if Kakao AdFit script is loaded
      const kas = (window as any).kas;
      const scriptElement = document.getElementById('kakao-adfit-script');
      const isScriptLoaded = scriptElement && scriptElement.getAttribute('data-loaded') === 'true';
      
      if (kas || isScriptLoaded) {
        console.log('Kakao AdFit script loaded, initializing ads...');
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
          const adElements = document.querySelectorAll('.kakao_ad_area');
          console.log(`Found ${adElements.length} ad elements`);
          
          adElements.forEach((el, index) => {
            const adUnit = el.getAttribute('data-ad-unit');
            const adId = el.id || `ad-${index}`;
            console.log(`Ad element ${index + 1} (${adId}): ${adUnit}`);
            
            // Check if ad is visible
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            const isVisible = rect.width > 0 && rect.height > 0 && 
                             computedStyle.display !== 'none' && 
                             computedStyle.visibility !== 'hidden' &&
                             computedStyle.opacity !== '0';
            console.log(`Ad ${index + 1} visible: ${isVisible}, size: ${rect.width}x${rect.height}, display: ${computedStyle.display}, opacity: ${computedStyle.opacity}`);
            
            // Only initialize visible ads
            if (isVisible) {
              // Force re-initialization by removing and re-adding
              const parent = el.parentElement;
              if (parent) {
                const clone = el.cloneNode(true) as HTMLElement;
                parent.replaceChild(clone, el);
                console.log(`Re-initialized ad ${index + 1} (${adId})`);
              }
            } else {
              console.log(`Skipping ad ${index + 1} (${adId}) - not visible`);
            }
          });
        }, 1000);
      } else {
        console.log('Kakao AdFit script not loaded yet, retrying...');
        setTimeout(initAds, 500);
      }
    };

    // Check script load status
    const checkScriptLoad = () => {
      const scriptElement = document.getElementById('kakao-adfit-script');
      if (scriptElement && (window as any).kas) {
        scriptElement.setAttribute('data-loaded', 'true');
        initAds();
      }
    };

    if (typeof window !== 'undefined') {
      // Check if script is already loaded
      checkScriptLoad();
      
      // Listen for window load
      window.addEventListener('load', () => {
        checkScriptLoad();
        setTimeout(initAds, 1000);
      });
      
      // Also try periodically
      const intervalId = setInterval(() => {
        if ((window as any).kas) {
          clearInterval(intervalId);
          checkScriptLoad();
        }
      }, 500);

      // Cleanup
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  // Re-initialize ads when calculator visibility changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const kas = (window as any).kas;
    if (!kas) {
      // If script not loaded, wait and retry
      const retryTimeout = setTimeout(() => {
        const kasRetry = (window as any).kas;
        if (kasRetry) {
          // Retry initialization
          const event = new Event('retry-ad-init');
          window.dispatchEvent(event);
        }
      }, 1000);
      return () => clearTimeout(retryTimeout);
    }

    const initAd = (adId: string, delay: number = 800) => {
      setTimeout(() => {
        const adElement = document.getElementById(adId);
        if (adElement) {
          // 요소가 실제로 화면에 보이는지 확인
          const rect = adElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(adElement);
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           computedStyle.display !== 'none' && 
                           computedStyle.visibility !== 'hidden' &&
                           computedStyle.opacity !== '0';
          
          // For expense list ad, check parent visibility instead
          const parentElement = adElement.parentElement;
          const parentVisible = parentElement ? 
            window.getComputedStyle(parentElement).display !== 'none' &&
            window.getComputedStyle(parentElement).opacity !== '0' : true;
          
          if (isVisible && parentVisible) {
            console.log(`Re-initializing ${adId}... (visible: ${rect.width}x${rect.height})`);
            const parent = adElement.parentElement;
            if (parent) {
              const clone = adElement.cloneNode(true) as HTMLElement;
              parent.replaceChild(clone, adElement);
              
              // Force kas to recognize the new ad element
              setTimeout(() => {
                // Also try to trigger kas refresh if available
                if (kas && typeof kas.refresh === 'function') {
                  try {
                    kas.refresh();
                  } catch (e) {
                    console.log('kas.refresh not available');
                  }
                }
                // Try to manually trigger ad loading
                const newAdElement = document.getElementById(adId);
                if (newAdElement && (window as any).kas) {
                  // Force kas to scan for new ads
                  const event = new Event('DOMContentLoaded');
                  window.dispatchEvent(event);
                }
              }, 500);
            }
          } else {
            console.log(`${adId} is not visible, skipping initialization (display: ${computedStyle.display}, opacity: ${computedStyle.opacity}, parentVisible: ${parentVisible})`);
            // If not visible but it's main ad, retry
            if (adId === 'kakao-ad-main') {
              setTimeout(() => initAd(adId, 0), 1000);
            }
          }
        } else {
          console.log(`${adId} element not found in DOM`);
        }
      }, delay);
    };

    // Always initialize main ad (below subtitle)
    initAd('kakao-ad-main', 800);
    
    // Retry after DOM fully updates
    setTimeout(() => {
      initAd('kakao-ad-main', 0);
    }, 1500);
  }, [showCalculator]);

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

  const resetCalculatorForm = () => {
    setEditingItemId(null);
    setCalculatorKey(prev => prev + 1); // Force remount by changing key
    // Reset form
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

  const handleAddClick = () => {
    setShowCalculator(true);
    resetCalculatorForm();
  };

  const handleCancelConfirm = () => {
    setShowCalculator(false);
    resetCalculatorForm();
    setShowCancelConfirm(false);
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

  // Scroll position tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if page is scrollable
      const isScrollable = documentHeight > windowHeight;
      
      // Show button if page is scrollable (always show if scrollable, even at top)
      setShowScrollButton(isScrollable);
      
      // Determine if we're closer to top or bottom
      // If at top or scrolled less than 30% of page, show "go to bottom" button
      // Otherwise, show "go to top" button
      if (scrollY === 0) {
        setIsScrolledDown(true); // At top, show "go to bottom"
      } else {
        const scrollPercentage = scrollY / (documentHeight - windowHeight);
        setIsScrolledDown(scrollPercentage < 0.3);
      }
    };

    // Initial check immediately
    handleScroll();

    // Also check after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    // Check on window load
    window.addEventListener("load", handleScroll);
    
    // Check on scroll
    window.addEventListener("scroll", handleScroll);
    
    // Check on resize (content might change)
    window.addEventListener("resize", handleScroll);

    // Use MutationObserver to detect DOM changes (e.g., when calculator appears)
    const observer = new MutationObserver(() => {
      // Debounce the check to avoid too many calls
      setTimeout(handleScroll, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("load", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
    };
  }, [showCalculator]); // Re-check when calculator visibility changes

  // Also check scroll when calculator visibility changes (with delay for animation)
  useEffect(() => {
    if (showCalculator) {
      // Check after animation completes (500ms transition duration)
      const timeoutId = setTimeout(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const isScrollable = documentHeight > windowHeight;
        setShowScrollButton(isScrollable);
        if (scrollY === 0) {
          setIsScrolledDown(true);
        }
      }, 600); // Slightly longer than animation duration

      return () => clearTimeout(timeoutId);
    }
  }, [showCalculator]);

  const handleScrollClick = () => {
    if (isScrolledDown) {
      // Scroll to bottom
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    } else {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="mb-8 relative">
          {/* Title - always centered */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {formatBilingualText("출장 경비 계산기 (Trip Expenses Calculator)")}
            </h1>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400">
            {formatBilingualText("경로와 차량 정보로 출장비를 계산하세요 (Calculate trip expenses with route and vehicle information)")}
          </p>
          
          {/* Back button - positioned to align with calculator content */}
          {showCalculator && (
            <div className="flex transition-all duration-500 ease-in-out justify-center">
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="absolute left-0 flex items-center justify-center w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-colors"
                    aria-label={formatBilingualText("뒤로가기 (Back)")}
                    style={{ top: '-2.5rem' }}
                  >
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`flex transition-all duration-500 ease-in-out ${showCalculator ? "gap-6" : ""}`}>
          {/* Left: Calculator */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showCalculator
                ? "flex-1 flex justify-center opacity-100 max-h-none"
                : "w-0 opacity-0 max-h-0 pointer-events-none"
            }`}
          >
            <div className={`w-full max-w-2xl ${showCalculator ? "" : "hidden"}`}>
            
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
              <div className="mt-6" key={`additional-expenses-${calculatorKey}-${editingItemId || 'new'}`}>
                <AdditionalExpenses
                  initialExpenses={additionalExpenses}
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
          </div>

          {/* Right: Expense List */}
          {!showCalculator && (
          <div className="flex-1 flex justify-center items-start">
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
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="max-w-3xl mx-auto mb-6 space-y-2">
            <p>
              이 서비스는 출장비를 쉽고 빠르게 계산할 수 있는 무료 <strong>출장 경비 계산기</strong>입니다.
            </p>
            <p>
              교통비, 식비, 숙박비, 일비 등 다양한 항목을 자동으로 합산하여 <strong>출장비 정산</strong>을 간편하게 도와줍니다.
            </p>
            <small>본 서비스는 어떠한 개인정보도 수집하지 않습니다.</small>
          </div>
        </div>

        {/* Mobile Ad Banner - below footer */}
        <div className="mt-6 flex justify-center" style={{ minHeight: '100px' }}>
          <ins 
            id="kakao-ad-main"
            className="kakao_ad_area" 
            data-ad-unit="DAN-lDFTdJU8A7ESFd0a"
            data-ad-width="320"
            data-ad-height="100"
          ></ins>
        </div>
      </div>

      {/* Kakao AdFit Advertisement - fixed position at 75% from left, aligned with calculator/expense list start (Desktop only) */}
      <div className="fixed left-[75%] top-[calc(2rem+2.5rem+0.5rem+1.5rem+2rem)] z-40 flex-shrink-0 opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto">
        <ins 
          className="kakao_ad_area" 
          data-ad-unit="DAN-BgQvbkqypOLiGNZu"
          data-ad-width="160"
          data-ad-height="600"
        ></ins>
      </div>

      {/* Scroll to top/bottom button */}
      {showScrollButton && (
        <button
          onClick={handleScrollClick}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center w-14 h-14"
          aria-label={isScrolledDown ? formatBilingualText("맨 아래로 (Go to bottom)") : formatBilingualText("맨 위로 (Go to top)")}
        >
          {isScrolledDown ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          )}
        </button>
      )}

      {/* Cancel confirmation modal */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelConfirm}
        title={formatBilingualText("확인 (Confirmation)")}
        message={formatBilingualText("계산을 중단하시겠습니까? (Cancel calculation?)")}
        confirmText={formatBilingualText("중단 (Cancel)")}
        cancelText={formatBilingualText("계속 (Continue)")}
      />
    </main>
  );
}
