"use client";

import { useState } from "react";
import { formatCurrency } from "../lib/calculations";
import { formatBilingualText } from "../lib/textUtils";
import { ExpenseItem } from "../page";
import ExportModal from "./ExportModal";

interface ExpenseListProps {
  items: ExpenseItem[];
  onItemClick: (item: ExpenseItem) => void;
  onItemDelete: (id: string) => void;
  onAddClick: () => void;
  onDeleteAll: () => void;
  onExport?: (exportData: {
    author: string;
    createdDate: string;
    startDate: string;
    endDate: string;
    format: "csv" | "xlsx" | "png" | "pdf";
  }) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export default function ExpenseList({
  items,
  onItemClick,
  onItemDelete,
  onAddClick,
  onDeleteAll,
  onExport,
}: ExpenseListProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="w-full">
      <div className="bg-gray-50 dark:bg-[#2d2d2d] rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col h-auto max-h-[calc(100vh-200px)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatBilingualText("경비 내역 (Expense List)")}
          </h2>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(formatBilingualText("전체 내역을 삭제하시겠습니까? (Delete all expenses?)"))) {
                  onDeleteAll();
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              {formatBilingualText("내역 전체 삭제 (Delete All)")}
            </button>
          )}
        </div>

        <div className={`space-y-2 mb-4 ${items.length > 5 ? "flex-1 overflow-y-auto min-h-0" : ""}`}>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {formatBilingualText("경비 내역이 없습니다. (No expenses yet)")}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#1f1f1f] rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors relative group"
                onClick={() => onItemClick(item)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(item.date)}
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {formatCurrency(item.breakdown.total)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemDelete(item.id);
                    }}
                    className="ml-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onAddClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
        >
          {formatBilingualText("추가 (Add)")}
        </button>

        {onExport && (
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {formatBilingualText("내보내기 (Export)")}
          </button>
        )}
      </div>

      {onExport && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          items={items}
          onExport={onExport}
        />
      )}
    </div>
  );
}

