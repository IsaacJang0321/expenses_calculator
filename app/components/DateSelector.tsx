"use client";

import { formatBilingualText } from "../lib/textUtils";

interface DateSelectorProps {
  date: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ date, onDateChange }: DateSelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formatBilingualText("날짜 (Date)")}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

