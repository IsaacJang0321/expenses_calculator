"use client";

import { useState } from "react";

interface AdditionalExpensesProps {
  onExpensesChange: (expenses: {
    parking: number;
    meals: number;
    accommodation: number;
    other: number;
  }) => void;
}

export default function AdditionalExpenses({
  onExpensesChange,
}: AdditionalExpensesProps) {
  const [expenses, setExpenses] = useState({
    parking: { enabled: false, amount: 0 },
    meals: { enabled: false, amount: 0 },
    accommodation: { enabled: false, amount: 0 },
    other: { enabled: false, amount: 0 },
  });

  const updateExpense = (
    key: keyof typeof expenses,
    enabled: boolean,
    amount: number = 0
  ) => {
    const newExpenses = {
      ...expenses,
      [key]: { enabled, amount },
    };
    setExpenses(newExpenses);

    onExpensesChange({
      parking: newExpenses.parking.enabled ? newExpenses.parking.amount : 0,
      meals: newExpenses.meals.enabled ? newExpenses.meals.amount : 0,
      accommodation: newExpenses.accommodation.enabled
        ? newExpenses.accommodation.amount
        : 0,
      other: newExpenses.other.enabled ? newExpenses.other.amount : 0,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          추가 비용 (Additional Expenses)
        </h2>

        <div className="space-y-4">
          {(
            [
              { key: "parking", label: "주차비", labelEn: "Parking" },
              { key: "meals", label: "식비", labelEn: "Meals" },
              { key: "accommodation", label: "숙박비", labelEn: "Accommodation" },
              { key: "other", label: "기타", labelEn: "Other" },
            ] as const
          ).map(({ key, label, labelEn }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
            >
              <input
                type="checkbox"
                id={key}
                checked={expenses[key].enabled}
                onChange={(e) =>
                  updateExpense(key, e.target.checked, expenses[key].amount)
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-[#1f1f1f] dark:border-gray-600"
              />
              <label
                htmlFor={key}
                className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {label} ({labelEn})
              </label>
              {expenses[key].enabled && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">₩</span>
                  <input
                    type="number"
                    value={expenses[key].amount || ""}
                    onChange={(e) =>
                      updateExpense(
                        key,
                        true,
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min="0"
                    className="w-32 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

