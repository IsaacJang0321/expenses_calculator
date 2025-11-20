"use client";

import { formatBilingualText } from "../lib/textUtils";

interface MemoSectionProps {
  memo: string;
  onMemoChange: (memo: string) => void;
}

export default function MemoSection({ memo, onMemoChange }: MemoSectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {formatBilingualText("메모 (Memo)")}
        </h2>
        <div>
          <textarea
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            placeholder={formatBilingualText("Optional")}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

