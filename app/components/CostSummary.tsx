"use client";

import { CostBreakdown, formatCurrency } from "../lib/calculations";

interface CostSummaryProps {
  breakdown: CostBreakdown;
}

export default function CostSummary({ breakdown }: CostSummaryProps) {
  const hasData = breakdown.total > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          비용 요약 (Cost Summary)
        </h2>

        {!hasData ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            정보를 입력해주세요 :)
          </div>
        ) : (
          <div className="space-y-3">
            {breakdown.fuelCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  연료비 (Fuel Cost)
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.fuelCost)}
                </span>
              </div>
            )}

            {breakdown.tollFee > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  통행료 (Toll Fees)
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.tollFee)}
                </span>
              </div>
            )}

            {breakdown.parking > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">주차비 (Parking)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.parking)}
                </span>
              </div>
            )}

            {breakdown.meals > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">식비 (Meals)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.meals)}
                </span>
              </div>
            )}

            {breakdown.accommodation > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  숙박비 (Accommodation)
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.accommodation)}
                </span>
              </div>
            )}

            {breakdown.other > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">기타 (Other)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(breakdown.other)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                총액 (TOTAL)
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(breakdown.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

