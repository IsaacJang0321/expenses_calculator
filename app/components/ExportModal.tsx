"use client";

import { useState, useEffect } from "react";
import { formatBilingualText } from "../lib/textUtils";
import { ExpenseItem } from "../page";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExpenseItem[];
  onExport: (exportData: {
    author: string;
    createdDate: string;
    startDate: string;
    endDate: string;
    format: "csv" | "xlsx" | "png" | "pdf";
  }) => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  items,
  onExport,
}: ExportModalProps) {
  const [author, setAuthor] = useState("");
  const [createdDate, setCreatedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<"csv" | "xlsx" | "png" | "pdf">("csv");

  // Calculate min/max dates from items
  useEffect(() => {
    if (items.length > 0) {
      const dates = items.map((item) => item.date).sort();
      setStartDate(dates[0]);
      setEndDate(dates[dates.length - 1]);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    }
  }, [items]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!author.trim()) {
      alert(formatBilingualText("작성자를 입력해주세요. (Please enter author name)"));
      return;
    }
    if (!startDate || !endDate) {
      alert(formatBilingualText("기간을 선택해주세요. (Please select date range)"));
      return;
    }
    if (startDate > endDate) {
      alert(formatBilingualText("시작일이 종료일보다 늦을 수 없습니다. (Start date cannot be later than end date)"));
      return;
    }

    onExport({
      author: author.trim(),
      createdDate,
      startDate,
      endDate,
      format,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-[#2d2d2d] rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatBilingualText("내보내기 (Export)")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formatBilingualText("작성자 (Author)")} *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={formatBilingualText("작성자 이름을 입력하세요 (Enter author name)")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Created Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formatBilingualText("작성 일자 (Created Date)")}
            </label>
            <input
              type="date"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formatBilingualText("기간 (Period)")} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {formatBilingualText("시작일 (Start Date)")}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {formatBilingualText("종료일 (End Date)")}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {formatBilingualText("내보내기 형식 (Export Format)")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["csv", "xlsx", "png", "pdf"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    format === fmt
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors"
          >
            {formatBilingualText("취소 (Cancel)")}
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {formatBilingualText("내보내기 (Export)")}
          </button>
        </div>
      </div>
    </div>
  );
}

