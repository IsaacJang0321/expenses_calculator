"use client";

import { useState, useEffect } from "react";
import {
  getBrands,
  getModels,
  getVehicleModel,
  getVehicleVariants,
  VehicleInfo,
} from "../lib/vehicleData";
import { getFuelPrices, getFuelPriceByType } from "../lib/fuelPrice";
import { formatBilingualText } from "../lib/textUtils";

interface VehicleFormProps {
  onVehicleChange: (vehicle: {
    brand: string;
    model: string;
    efficiency: number;
    fuelType: "gasoline" | "diesel" | "lpg" | "electric";
  } | null) => void;
  onFuelPriceChange?: (price: number | null) => void;
  initialUseManualEfficiency?: boolean;
  initialUseManualFuelPrice?: boolean;
  initialManualEfficiency?: string;
  initialManualFuelType?: "gasoline" | "diesel" | "lpg" | "electric";
  initialManualFuelPrice?: string;
  initialBrand?: string;
  initialModel?: string;
  initialSelectedVariantIndex?: number;
  onStateChange?: (state: {
    useManualEfficiency: boolean;
    useManualFuelPrice: boolean;
    manualEfficiency: string;
    manualFuelType: "gasoline" | "diesel" | "lpg" | "electric";
    manualFuelPrice: string;
    brand: string;
    model: string;
    selectedVariantIndex: number;
  }) => void;
}

export default function VehicleForm({ 
  onVehicleChange, 
  onFuelPriceChange,
  initialUseManualEfficiency = false,
  initialUseManualFuelPrice = false,
  initialManualEfficiency = "",
  initialManualFuelType = "gasoline",
  initialManualFuelPrice = "",
  initialBrand = "",
  initialModel = "",
  initialSelectedVariantIndex = 0,
  onStateChange,
}: VehicleFormProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState(initialModel);
  const [selectedFuelType, setSelectedFuelType] = useState<
    "gasoline" | "diesel" | "lpg" | "electric" | null
  >(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(initialSelectedVariantIndex);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [fuelPrices, setFuelPrices] = useState<{
    gasoline: number;
    premiumGasoline: number | null;
    diesel: number;
    lpg: number;
  } | null>(null);
  
  // Manual input states
  const [useManualEfficiency, setUseManualEfficiency] = useState(initialUseManualEfficiency);
  const [useManualFuelPrice, setUseManualFuelPrice] = useState(initialUseManualFuelPrice);
  const [manualEfficiency, setManualEfficiency] = useState(initialManualEfficiency);
  const [manualFuelType, setManualFuelType] = useState<"gasoline" | "diesel" | "lpg" | "electric">(initialManualFuelType);
  const [manualFuelPrice, setManualFuelPrice] = useState(initialManualFuelPrice);

  // Track if we're initializing from props
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync with initial values when they change (only if not user input)
  useEffect(() => {
    if (!isInitialized) {
      setUseManualEfficiency(initialUseManualEfficiency);
      setUseManualFuelPrice(initialUseManualFuelPrice);
      setManualEfficiency(initialManualEfficiency);
      setManualFuelType(initialManualFuelType);
      setManualFuelPrice(initialManualFuelPrice);
      setBrand(initialBrand);
      setModel(initialModel);
      setSelectedVariantIndex(initialSelectedVariantIndex);
      setIsInitialized(true);
    } else {
      // Only update if initial values actually changed (for restoration)
      if (initialBrand !== brand && initialBrand) {
        setBrand(initialBrand);
      }
      if (initialModel !== model && initialModel) {
        setModel(initialModel);
      }
      if (initialSelectedVariantIndex !== selectedVariantIndex && initialSelectedVariantIndex !== undefined) {
        setSelectedVariantIndex(initialSelectedVariantIndex);
      }
      if (initialUseManualEfficiency !== useManualEfficiency) {
        setUseManualEfficiency(initialUseManualEfficiency);
      }
      if (initialUseManualFuelPrice !== useManualFuelPrice) {
        setUseManualFuelPrice(initialUseManualFuelPrice);
      }
      if (initialManualEfficiency !== manualEfficiency && initialManualEfficiency) {
        setManualEfficiency(initialManualEfficiency);
      }
      if (initialManualFuelType !== manualFuelType) {
        setManualFuelType(initialManualFuelType);
      }
      if (initialManualFuelPrice !== manualFuelPrice && initialManualFuelPrice) {
        setManualFuelPrice(initialManualFuelPrice);
      }
    }
  }, [initialUseManualEfficiency, initialUseManualFuelPrice, initialManualEfficiency, initialManualFuelType, initialManualFuelPrice, initialBrand, initialModel, initialSelectedVariantIndex]);

  // Notify parent of state changes (debounced to avoid infinite loop)
  useEffect(() => {
    if (onStateChange && isInitialized) {
      const timeoutId = setTimeout(() => {
        onStateChange({
          useManualEfficiency,
          useManualFuelPrice,
          manualEfficiency,
          manualFuelType,
          manualFuelPrice,
          brand,
          model,
          selectedVariantIndex,
        });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [useManualEfficiency, useManualFuelPrice, manualEfficiency, manualFuelType, manualFuelPrice, brand, model, selectedVariantIndex, onStateChange, isInitialized]);

  const brands = getBrands();
  const models = brand ? getModels(brand) : [];
  const variants = brand && model ? getVehicleVariants(brand, model) : [];
  const hasMultipleVariants = variants.length > 1;

  useEffect(() => {
    // Fetch fuel prices on mount
    getFuelPrices().then((prices) => {
      setFuelPrices({
        gasoline: prices.gasoline,
        premiumGasoline: prices.premiumGasoline,
        diesel: prices.diesel,
        lpg: prices.lpg,
      });
    });
  }, []);

  useEffect(() => {
    // Reset model when brand changes (but not during initial restoration or when restoring from saved state)
    if (isInitialized && brand && initialBrand !== brand) {
      // Only reset if user actually changed the brand (not restoring)
      setModel("");
      setSelectedFuelType(null);
      setVehicleInfo(null);
      onVehicleChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, isInitialized, initialBrand]);

  useEffect(() => {
    // Set variant when brand and model are set
    if (brand && model) {
      const vehicleModel = getVehicleModel(brand, model);
      if (vehicleModel && vehicleModel.variants.length > 0) {
        // Use saved variant index if restoring, otherwise use first variant
        const targetIndex = (initialModel === model && initialSelectedVariantIndex !== undefined && initialSelectedVariantIndex < vehicleModel.variants.length) 
          ? initialSelectedVariantIndex 
          : 0;
        
        setSelectedVariantIndex(targetIndex);
        if (vehicleModel.variants[targetIndex]) {
          setSelectedFuelType(vehicleModel.variants[targetIndex].fuelType);
        }
      }
    } else {
      setSelectedFuelType(null);
      setSelectedVariantIndex(0);
    }
  }, [brand, model, initialModel, initialSelectedVariantIndex]);

  useEffect(() => {
    if (useManualEfficiency) {
      // Manual efficiency mode
      if (manualEfficiency && parseFloat(manualEfficiency) > 0) {
        const info: VehicleInfo = {
          efficiency: parseFloat(manualEfficiency),
          fuelType: manualFuelType,
        };
        setVehicleInfo(info);
        onVehicleChange({
          brand: "",
          model: "",
          efficiency: info.efficiency,
          fuelType: info.fuelType,
        });
      } else {
        setVehicleInfo(null);
        onVehicleChange(null);
      }
    } else if (brand && model && variants.length > 0 && selectedVariantIndex >= 0) {
      // Brand/model selection mode
      const selectedVariant = variants[selectedVariantIndex];
      if (selectedVariant) {
        setSelectedFuelType(selectedVariant.fuelType);
        const info: VehicleInfo = {
          efficiency: selectedVariant.efficiency,
          fuelType: selectedVariant.fuelType,
        };
        setVehicleInfo(info);
        onVehicleChange({
          brand,
          model,
          efficiency: info.efficiency,
          fuelType: info.fuelType,
        });
      }
    } else {
      setVehicleInfo(null);
      onVehicleChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, model, selectedVariantIndex, useManualEfficiency, manualEfficiency, manualFuelType]);

  const currentFuelPrice = vehicleInfo && !useManualFuelPrice && fuelPrices
    ? getFuelPriceByType(vehicleInfo.fuelType, {
        gasoline: fuelPrices.gasoline,
        premiumGasoline: fuelPrices.premiumGasoline,
        diesel: fuelPrices.diesel,
        lpg: fuelPrices.lpg,
        timestamp: Date.now(),
      })
    : useManualFuelPrice && manualFuelPrice && parseFloat(manualFuelPrice) > 0
    ? parseFloat(manualFuelPrice)
    : null;
  
  // Handle manual efficiency checkbox
  const handleManualEfficiencyChange = (checked: boolean) => {
    setUseManualEfficiency(checked);
    if (checked) {
      setBrand("");
      setModel("");
      setSelectedVariantIndex(0);
    } else {
      setManualEfficiency("");
      setManualFuelType("gasoline");
    }
  };
  
  // Handle manual fuel price checkbox
  const handleManualFuelPriceChange = (checked: boolean) => {
    setUseManualFuelPrice(checked);
    if (!checked) {
      setManualFuelPrice("");
      if (onFuelPriceChange) {
        onFuelPriceChange(null);
      }
    }
  };

  // Update fuel price when manual input changes
  useEffect(() => {
    if (useManualFuelPrice && manualFuelPrice && parseFloat(manualFuelPrice) > 0 && onFuelPriceChange) {
      onFuelPriceChange(parseFloat(manualFuelPrice));
    } else if (!useManualFuelPrice && onFuelPriceChange) {
      onFuelPriceChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useManualFuelPrice, manualFuelPrice]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {formatBilingualText("차량 정보 (Vehicle Details)")}
        </h2>

        <div className="space-y-4">
          {/* Manual input checkboxes */}
          <div className="flex items-center gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manual-efficiency"
                checked={useManualEfficiency}
                onChange={(e) => handleManualEfficiencyChange(e.target.checked)}
                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 dark:bg-[#1f1f1f] dark:border-gray-600 accent-green-500"
              />
              <label
                htmlFor="manual-efficiency"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {formatBilingualText("연비 직접 입력 (Enter efficiency manually)")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manual-fuel-price"
                checked={useManualFuelPrice}
                onChange={(e) => handleManualFuelPriceChange(e.target.checked)}
                className="w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-green-500 dark:bg-[#1f1f1f] dark:border-gray-600 accent-green-500"
              />
              <label
                htmlFor="manual-fuel-price"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {formatBilingualText("유가 직접 입력 (Enter fuel price manually)")}
              </label>
            </div>
          </div>

          {useManualEfficiency ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("연료 타입 (Fuel Type)")}
                </label>
                <select
                  value={manualFuelType}
                  onChange={(e) => setManualFuelType(e.target.value as "gasoline" | "diesel" | "lpg" | "electric")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                >
                  <option value="gasoline">{formatBilingualText("휘발유 (Gasoline)")}</option>
                  <option value="diesel">{formatBilingualText("경유 (Diesel)")}</option>
                  <option value="lpg">LPG</option>
                  <option value="electric">{formatBilingualText("전기 (Electric)")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("연비 (Fuel Efficiency)")} (km/L)
                </label>
                <input
                  type="number"
                  value={manualEfficiency}
                  onChange={(e) => setManualEfficiency(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formatBilingualText("브랜드 (Brand)")}
                </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
            >
              <option value="">{formatBilingualText("브랜드 선택 (Select brand)")}</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formatBilingualText("모델 (Model)")}
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!brand}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{formatBilingualText("모델 선택 (Select model)")}</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {hasMultipleVariants && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formatBilingualText("연료 타입 변형 (Fuel Type Variant)")}
              </label>
              <select
                value={selectedVariantIndex}
                onChange={(e) => setSelectedVariantIndex(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
              >
                {variants.map((variant, index) => {
                  const isHybrid =
                    variant.fuelType === "gasoline" && variant.efficiency > 15;
                  const fuelTypeNames: Record<string, string> = {
                    gasoline: "휘발유",
                    diesel: "경유",
                    lpg: "LPG",
                    electric: "전기",
                  };
                  const fuelTypeName = fuelTypeNames[variant.fuelType] || variant.fuelType;
                  const label = isHybrid
                    ? formatBilingualText(`${fuelTypeName} 하이브리드 (${variant.fuelType} Hybrid - ${variant.efficiency} km/L)`)
                    : formatBilingualText(`${fuelTypeName} (${variant.fuelType} - ${variant.efficiency} km/L)`);
                  return (
                    <option key={index} value={index}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
            </>
          )}

          {vehicleInfo && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBilingualText("연료 타입 (Fuel Type)")}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {vehicleInfo.fuelType === "gasoline"
                      ? "휘발유"
                      : vehicleInfo.fuelType === "diesel"
                      ? "경유"
                      : vehicleInfo.fuelType === "lpg"
                      ? "LPG"
                      : "전기"}
                    {vehicleInfo.fuelType === "gasoline" &&
                      vehicleInfo.efficiency > 15 &&
                      " (하이브리드)"}
                    <span className="text-xs text-gray-500 ml-1">
                      ({vehicleInfo.fuelType}
                      {vehicleInfo.fuelType === "gasoline" &&
                        vehicleInfo.efficiency > 15 &&
                        " Hybrid"}
                      )
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBilingualText("연비 (Fuel Efficiency)")}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {vehicleInfo.efficiency} km/L
                  </div>
                </div>
              </div>

              {!useManualFuelPrice && currentFuelPrice !== null && vehicleInfo.fuelType !== "electric" && (
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBilingualText("오늘의 연료 가격 (Today's Fuel Price)")}
                  </div>
                  <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    ₩{currentFuelPrice.toLocaleString()}/L ({vehicleInfo.fuelType})
                  </div>
                </div>
              )}

              {useManualFuelPrice && vehicleInfo.fuelType !== "electric" && (
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {formatBilingualText("유가 (Fuel Price)")} (₩/L)
                  </div>
                  <input
                    type="number"
                    value={manualFuelPrice}
                    onChange={(e) => setManualFuelPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                  />
                  {manualFuelPrice && parseFloat(manualFuelPrice) > 0 && (
                    <div className="mt-2 font-semibold text-lg text-blue-600 dark:text-blue-400">
                      ₩{parseFloat(manualFuelPrice).toLocaleString()}/L ({vehicleInfo.fuelType})
                    </div>
                  )}
                </div>
              )}

              {vehicleInfo.fuelType === "electric" && (
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBilingualText("전기차 (Electric Vehicle)")}
                  </div>
                  <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    {formatBilingualText("~₩30/km (추정) (estimated)")}
                  </div>
                </div>
              )}
            </div>
          )}

          {fuelPrices && !vehicleInfo && !useManualFuelPrice && (
            <div className="p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {"오늘의 연료 가격"}
                <small className="text-xs text-gray-500 dark:text-gray-400 py-1">
                {" from OPINET"}
                </small>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>{formatBilingualText("휘발유 (Gasoline)")}: ₩{fuelPrices.gasoline.toLocaleString()}/L</div>
                {fuelPrices.premiumGasoline && (
                  <div>{formatBilingualText("고급휘발유 (Premium Gasoline)")}: ₩{fuelPrices.premiumGasoline.toLocaleString()}/L</div>
                )}
                <div>{formatBilingualText("경유 (Diesel)")}: ₩{fuelPrices.diesel.toLocaleString()}/L</div>
                <div>LPG: ₩{fuelPrices.lpg.toLocaleString()}/L</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

