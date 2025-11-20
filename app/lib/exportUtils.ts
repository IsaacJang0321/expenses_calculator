import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExpenseItem } from "../page";
import { koreanFontBase64 } from "./koreanFont";

export interface ExportRow {
  날짜: string;
  출발지: string;
  도착지: string;
  거리: string;
  소요시간: string;
  통행료: string;
  차량: string;
  연료비: string;
  주차비: string;
  식비: string;
  숙박비: string;
  기타: string;
  총액: string;
  비고: string;
}

export function generateExportData(
  items: ExpenseItem[],
  author: string,
  createdDate: string,
  startDate: string,
  endDate: string
): {
  rows: ExportRow[];
  summary: {
    author: string;
    createdDate: string;
    startDate: string;
    endDate: string;
    totalItems: number;
    totalAmount: number;
  };
} {
  // Filter items by date range
  const filteredItems = items.filter(
    (item) => item.date >= startDate && item.date <= endDate
  );

  const rows: ExportRow[] = filteredItems.map((item) => {
    // Get departure and destination from routeSelectorState
    const departure = item.routeSelectorState?.departure || "";
    const destination = item.routeSelectorState?.destination || "";

    // Get vehicle info
    const vehicleInfo = item.vehicle
      ? `${item.vehicle.brand} ${item.vehicle.model}`
      : "";

    // Format date
    const date = new Date(item.date);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    return {
      날짜: formattedDate,
      출발지: departure,
      도착지: destination,
      거리: item.route ? `${item.route.distance}km` : "-",
      소요시간: item.route ? `${item.route.duration}분` : "-",
      통행료: item.breakdown.tollFee
        ? `₩${item.breakdown.tollFee.toLocaleString()}`
        : "-",
      차량: vehicleInfo,
      연료비: item.breakdown.fuelCost
        ? `₩${item.breakdown.fuelCost.toLocaleString()}`
        : "-",
      주차비: item.breakdown.parking
        ? `₩${item.breakdown.parking.toLocaleString()}`
        : "-",
      식비: item.breakdown.meals
        ? `₩${item.breakdown.meals.toLocaleString()}`
        : "-",
      숙박비: item.breakdown.accommodation
        ? `₩${item.breakdown.accommodation.toLocaleString()}`
        : "-",
      기타: item.breakdown.other
        ? `₩${item.breakdown.other.toLocaleString()}`
        : "-",
      총액: `₩${item.breakdown.total.toLocaleString()}`,
      비고: item.memo || "",
    };
  });

  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + item.breakdown.total,
    0
  );

  return {
    rows,
    summary: {
      author,
      createdDate,
      startDate,
      endDate,
      totalItems: filteredItems.length,
      totalAmount,
    },
  };
}

export function exportToCSV(
  rows: ExportRow[],
  summary: { author: string; createdDate: string; startDate: string; endDate: string; totalItems: number; totalAmount: number },
  filename: string = "expenses"
) {
  // Create header row
  const headers = Object.keys(rows[0] || {});
  
  // Create CSV content
  let csvContent = "\uFEFF"; // BOM for Excel UTF-8 support
  csvContent += headers.join(",") + "\n";
  
  // Add data rows
  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header as keyof ExportRow];
      // Always wrap values in quotes to prevent Excel from splitting cells
      if (typeof value === "string") {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += values.join(",") + "\n";
  });
  
  // Add summary section
  csvContent += "\n";
  csvContent += `"작성자","${summary.author}"\n`;
  csvContent += `"작성일자","${summary.createdDate}"\n`;
  csvContent += `"기간","${summary.startDate} ~ ${summary.endDate}"\n`;
  csvContent += `"총 항목 수","${summary.totalItems}"\n`;
  csvContent += `"총액","₩${summary.totalAmount.toLocaleString()}"\n`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXLSX(
  rows: ExportRow[],
  summary: { author: string; createdDate: string; startDate: string; endDate: string; totalItems: number; totalAmount: number },
  filename: string = "expenses"
) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create worksheet from rows
  const ws = XLSX.utils.json_to_sheet(rows);

  // Ensure all cells are treated as text to prevent Excel from auto-parsing
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      // Force cell to be text type
      if (ws[cellAddress].v !== undefined) {
        ws[cellAddress].t = "s"; // 's' = shared string (text)
        ws[cellAddress].z = "@"; // '@' format code means text in Excel
      }
    }
  }

  // Add summary data below the table
  const summaryRow = rows.length + 2;
  XLSX.utils.sheet_add_aoa(ws, [
    [""],
    ["작성자", summary.author],
    ["작성일자", summary.createdDate],
    ["기간", `${summary.startDate} ~ ${summary.endDate}`],
    ["총 항목 수", summary.totalItems],
    ["총액", `₩${summary.totalAmount.toLocaleString()}`],
  ], { origin: `A${summaryRow}` });
  
  // Set summary cells to text format as well
  for (let R = summaryRow; R <= summaryRow + 5; ++R) {
    for (let C = 0; C <= 1; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellAddress] && ws[cellAddress].v !== undefined) {
        ws[cellAddress].t = "s"; // 's' = shared string (text)
        ws[cellAddress].z = "@"; // '@' format code means text in Excel
      }
    }
  }

  // Set column widths
  const colWidths = [
    { wch: 12 }, // 날짜
    { wch: 15 }, // 출발지
    { wch: 15 }, // 도착지
    { wch: 10 }, // 거리
    { wch: 10 }, // 소요시간
    { wch: 12 }, // 통행료
    { wch: 20 }, // 차량
    { wch: 12 }, // 연료비
    { wch: 12 }, // 주차비
    { wch: 12 }, // 식비
    { wch: 12 }, // 숙박비
    { wch: 12 }, // 기타
    { wch: 15 }, // 총액
    { wch: 30 }, // 비고
  ];
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "경비 내역");

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPNG(
  rows: ExportRow[],
  summary: { author: string; createdDate: string; startDate: string; endDate: string; totalItems: number; totalAmount: number },
  filename: string = "expenses"
) {
  // Create a temporary table element
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.fontFamily = "Arial, sans-serif";
  table.style.fontSize = "12px";

  // Create header row
  const headerRow = document.createElement("tr");
  headerRow.style.backgroundColor = "#f3f4f6";
  headerRow.style.fontWeight = "bold";
  
  const headers = Object.keys(rows[0] || {});
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.style.border = "1px solid #d1d5db";
    th.style.padding = "8px";
    th.style.textAlign = "left";
    th.style.color = "#000000"; // 검은색 텍스트
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create data rows
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    // Alternate row colors for better readability
    if (index % 2 === 0) {
      tr.style.backgroundColor = "#ffffff";
    } else {
      tr.style.backgroundColor = "#f9fafb";
    }
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.textContent = row[header as keyof ExportRow] || "";
      td.style.border = "1px solid #d1d5db";
      td.style.padding = "8px";
      td.style.color = "#000000"; // 검은색 텍스트
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  // Create summary section
  const summaryDiv = document.createElement("div");
  summaryDiv.style.marginTop = "20px";
  summaryDiv.style.fontSize = "12px";
  summaryDiv.style.color = "#000000"; // 검은색 텍스트
  summaryDiv.innerHTML = `
    <div style="color: #000000;"><strong style="color: #000000;">작성자:</strong> <span style="color: #000000;">${summary.author}</span></div>
    <div style="color: #000000;"><strong style="color: #000000;">작성일자:</strong> <span style="color: #000000;">${summary.createdDate}</span></div>
    <div style="color: #000000;"><strong style="color: #000000;">기간:</strong> <span style="color: #000000;">${summary.startDate} ~ ${summary.endDate}</span></div>
    <div style="color: #000000;"><strong style="color: #000000;">총 항목 수:</strong> <span style="color: #000000;">${summary.totalItems}</span></div>
    <div style="color: #000000;"><strong style="color: #000000;">총액:</strong> <span style="color: #000000;">₩${summary.totalAmount.toLocaleString()}</span></div>
  `;

  // Create container
  const container = document.createElement("div");
  container.style.padding = "20px";
  container.style.backgroundColor = "white";
  container.appendChild(table);
  container.appendChild(summaryDiv);

  // Append to body temporarily
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  try {
    // Convert to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: "#ffffff",
      scale: 2,
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.png`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
  } finally {
    // Remove temporary element
    document.body.removeChild(container);
  }
}

// Note: To properly support Korean characters in PDF, you need to:
// 1. Add a Korean font file (TTF) to your project (e.g., in public/fonts/)
// 2. Convert it to base64
// 3. Add it using doc.addFileToVFS() and doc.addFont()
// 
// For now, we'll use autoTable's built-in support which may have limited Korean character support

export async function exportToPDF(
  rows: ExportRow[],
  summary: { author: string; createdDate: string; startDate: string; endDate: string; totalItems: number; totalAmount: number },
  filename: string = "expenses"
) {
  try {
    const doc = new jsPDF("landscape", "mm", "a4");

    // Check if rows is empty
    if (rows.length === 0 || !rows[0]) {
      throw new Error("No data to export");
    }

    // Add Korean font if available
    let koreanFontLoaded = false;
    if (koreanFontBase64 && koreanFontBase64.length > 0) {
      try {
        // Add font to VFS
        doc.addFileToVFS("NanumGothic.ttf", koreanFontBase64);
        
        // Register the font
        doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
        
        // Verify font was added
        const fonts = (doc as any).getFontList();
        if (fonts && fonts["NanumGothic"]) {
          koreanFontLoaded = true;
          doc.setFont("NanumGothic", "normal");
          console.log("Korean font (NanumGothic) loaded successfully");
        } else {
          console.warn("Korean font registered but not found in font list");
        }
      } catch (fontError) {
        console.error("Failed to add Korean font:", fontError);
        // Continue without Korean font
      }
    } else {
      console.warn("Korean font base64 data is empty");
    }

    // Prepare table data
    const headers = Object.keys(rows[0]);
    const tableData = rows.map((row) =>
      headers.map((header) => {
        const value = row[header as keyof ExportRow];
        return value !== null && value !== undefined ? String(value) : "";
      })
    );

    // Add table using autoTable (v5+ requires direct function call)
    // autoTable has built-in Unicode support, but Korean fonts need to be added manually
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 20,
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        textColor: [0, 0, 0], // 검은색 텍스트
        halign: "left",
        valign: "middle",
        font: koreanFontLoaded ? "NanumGothic" : "helvetica",
        fontStyle: "normal",
      },
      headStyles: { 
        fillColor: [243, 244, 246],
        textColor: [0, 0, 0], // 검은색 텍스트
        halign: "left",
        valign: "middle",
        font: koreanFontLoaded ? "NanumGothic" : "helvetica",
        fontStyle: "normal",
      },
      alternateRowStyles: { 
        fillColor: [249, 250, 251],
        textColor: [0, 0, 0], // 검은색 텍스트
        font: koreanFontLoaded ? "NanumGothic" : "helvetica",
        fontStyle: "normal",
      },
      margin: { top: 20 },
    });

    // Get final Y position
    const finalY = (doc as any).lastAutoTable?.finalY || 20;

    // Add summary using autoTable for better Korean support
    autoTable(doc, {
      startY: finalY + 10,
      body: [
        [`작성자: ${summary.author}`],
        [`작성일자: ${summary.createdDate}`],
        [`기간: ${summary.startDate} ~ ${summary.endDate}`],
        [`총 항목 수: ${summary.totalItems}`],
        [`총액: ₩${summary.totalAmount.toLocaleString()}`],
      ],
      styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        cellPadding: 3,
        font: koreanFontLoaded ? "NanumGothic" : "helvetica",
        fontStyle: "normal",
      },
      theme: "plain",
      margin: { left: 14 },
    });

    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
}

