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
}

export default function VehicleForm({ onVehicleChange }: VehicleFormProps) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState<
    "gasoline" | "diesel" | "lpg" | "electric" | null
  >(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [fuelPrices, setFuelPrices] = useState<{
    gasoline: number;
    diesel: number;
    lpg: number;
  } | null>(null);

  const brands = getBrands();
  const models = brand ? getModels(brand) : [];
  const variants = brand && model ? getVehicleVariants(brand, model) : [];
  const hasMultipleVariants = variants.length > 1;

  useEffect(() => {
    // Fetch fuel prices on mount
    getFuelPrices().then((prices) => {
      setFuelPrices({
        gasoline: prices.gasoline,
        diesel: prices.diesel,
        lpg: prices.lpg,
      });
    });
  }, []);

  useEffect(() => {
    // Reset model when brand changes
    setModel("");
    setSelectedFuelType(null);
    setVehicleInfo(null);
    onVehicleChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  useEffect(() => {
    // Reset variant when model changes
    if (brand && model) {
      setSelectedVariantIndex(0);
      const vehicleModel = getVehicleModel(brand, model);
      if (vehicleModel && vehicleModel.variants[0]) {
        setSelectedFuelType(vehicleModel.variants[0].fuelType);
      }
    } else {
      setSelectedFuelType(null);
      setSelectedVariantIndex(0);
    }
  }, [brand, model]);

  useEffect(() => {
    if (brand && model && variants.length > 0 && selectedVariantIndex >= 0) {
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
  }, [brand, model, selectedVariantIndex]);

  const currentFuelPrice = vehicleInfo && fuelPrices
    ? getFuelPriceByType(vehicleInfo.fuelType, {
        gasoline: fuelPrices.gasoline,
        diesel: fuelPrices.diesel,
        lpg: fuelPrices.lpg,
        timestamp: Date.now(),
      })
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {formatBilingualText("차량 정보 (Vehicle Details)")}
        </h2>

        <div className="space-y-4">
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

              {currentFuelPrice !== null && vehicleInfo.fuelType !== "electric" && (
                <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBilingualText("오늘의 연료 가격 (Today's Fuel Price)")}
                  </div>
                  <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    ₩{currentFuelPrice.toLocaleString()}/L ({vehicleInfo.fuelType})
                  </div>
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

          {fuelPrices && !vehicleInfo && (
            <div className="p-4 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {formatBilingualText("오늘의 연료 가격 (Today's Fuel Prices)")}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>{formatBilingualText("휘발유 (Gasoline)")}: ₩{fuelPrices.gasoline.toLocaleString()}/L</div>
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

