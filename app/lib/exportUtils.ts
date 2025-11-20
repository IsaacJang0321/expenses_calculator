import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
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
  // A4 size in pixels at 96 DPI: 794px x 1123px (210mm x 297mm)
  const A4_WIDTH = 794; // pixels at 96 DPI
  const A4_HEIGHT = 1123; // pixels at 96 DPI
  const SCALE = 2; // For better quality
  const PADDING = 40;
  const HEADER_HEIGHT = 150; // Title + header section
  const FOOTER_HEIGHT = 50; // Total text
  const ROW_HEIGHT = 35; // Approximate height per table row
  const TABLE_HEADER_HEIGHT = 40;
  
  const headers = Object.keys(rows[0] || {});
  // Add extra margin at bottom (about 4-5 rows worth of space for sum and page number)
  const BOTTOM_MARGIN = 150; // Extra space at bottom (increased for sum and page number)
  const availableHeight = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TABLE_HEADER_HEIGHT - (PADDING * 2) - BOTTOM_MARGIN;
  // Use more conservative calculation: subtract 3 more rows for safety
  const rowsPerPage = Math.max(1, Math.floor(availableHeight / ROW_HEIGHT) - 3);
  const OVERLAP_ROWS = 2; // Number of rows to overlap between pages
  
  // Calculate number of pages needed
  // Each page after the first adds (rowsPerPage - OVERLAP_ROWS) new rows
  let totalPages = 1;
  if (rows.length > rowsPerPage) {
    const remainingRows = rows.length - rowsPerPage;
    totalPages = 1 + Math.ceil(remainingRows / (rowsPerPage - OVERLAP_ROWS));
  }
  
  // Helper function to create a page
  const createPage = (pageRows: ExportRow[], pageNumber: number, isLastPage: boolean) => {
    const pageContainer = document.createElement("div");
    pageContainer.style.width = `${A4_WIDTH}px`;
    pageContainer.style.height = `${A4_HEIGHT}px`;
    pageContainer.style.padding = `${PADDING}px`;
    pageContainer.style.backgroundColor = "white";
    pageContainer.style.fontFamily = "Arial, sans-serif";
    pageContainer.style.boxSizing = "border-box";
    pageContainer.style.position = "relative";

    // Title
    const title = document.createElement("h1");
    title.textContent = "경비 지출내역서";
    title.style.textAlign = "center";
    title.style.fontSize = "24px";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "20px";
    title.style.color = "#000000";
    pageContainer.appendChild(title);

    // Header section
    const headerDiv = document.createElement("div");
    headerDiv.style.display = "flex";
    headerDiv.style.justifyContent = "space-between";
    headerDiv.style.marginBottom = "20px";
    headerDiv.style.fontSize = "14px";
    
    const periodDiv = document.createElement("div");
    periodDiv.innerHTML = `<strong>기간:</strong> ${summary.startDate} ~ ${summary.endDate}`;
    periodDiv.style.color = "#000000";
    
    const authorDiv = document.createElement("div");
    authorDiv.innerHTML = `<strong>작성자:</strong> ${summary.author}<br><strong>작성일자:</strong> ${summary.createdDate}`;
    authorDiv.style.textAlign = "right";
    authorDiv.style.color = "#000000";
    
    headerDiv.appendChild(periodDiv);
    headerDiv.appendChild(authorDiv);
    pageContainer.appendChild(headerDiv);

    // Create table
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.fontSize = "11px";
    table.style.border = "1px solid #000000";
    table.style.marginBottom = "0px";

    // Create header row
    const headerRow = document.createElement("tr");
    headerRow.style.backgroundColor = "#f3f4f6";
    headerRow.style.fontWeight = "bold";
    
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.border = "1px solid #000000";
      th.style.padding = "8px";
      th.style.textAlign = "center";
      th.style.color = "#000000";
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create data rows
    pageRows.forEach((row) => {
      const tr = document.createElement("tr");
      headers.forEach((header) => {
        const td = document.createElement("td");
        td.textContent = row[header as keyof ExportRow] || "";
        td.style.border = "1px solid #d1d5db";
        td.style.padding = "6px";
        td.style.color = "#000000";
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    pageContainer.appendChild(table);

    // Add total text at bottom right (only on last page)
    if (isLastPage) {
      const totalDiv = document.createElement("div");
      totalDiv.style.textAlign = "right";
      totalDiv.style.position = "absolute";
      totalDiv.style.bottom = `${PADDING}px`;
      totalDiv.style.right = `${PADDING}px`;
      totalDiv.style.fontSize = "14px";
      totalDiv.style.fontWeight = "bold";
      totalDiv.style.color = "#000000";
      totalDiv.textContent = `합계: ₩${summary.totalAmount.toLocaleString()}`;
      pageContainer.appendChild(totalDiv);
    }

    // Page number
    if (totalPages > 1) {
      const pageNumberDiv = document.createElement("div");
      pageNumberDiv.style.position = "absolute";
      pageNumberDiv.style.bottom = `${PADDING}px`;
      pageNumberDiv.style.left = `${PADDING}px`;
      pageNumberDiv.style.fontSize = "12px";
      pageNumberDiv.style.color = "#000000";
      pageNumberDiv.textContent = `${pageNumber} / ${totalPages}`;
      pageContainer.appendChild(pageNumberDiv);
    }

    return pageContainer;
  };

  // Create all pages
  // No overlap between pages - each page has independent rows
  const allPages: HTMLDivElement[] = [];
  
  for (let i = 0; i < totalPages; i++) {
    let startIdx: number;
    let endIdx: number;
    
    if (i === 0) {
      // First page: start from 0
      startIdx = 0;
      // Exclude last 2 rows if not last page, or reserve space for footer if last page
      if (totalPages === 1) {
        // Only one page: reserve space for footer
        endIdx = Math.min(rowsPerPage - 5, rows.length);
      } else {
        // Multiple pages: exclude last 2 rows
        endIdx = Math.min(rowsPerPage - OVERLAP_ROWS, rows.length);
      }
    } else {
      // Subsequent pages: start where previous page ended (no overlap)
      const prevPageStart = i === 1 ? 0 : (i - 1) * (rowsPerPage - OVERLAP_ROWS);
      const prevPageEnd = prevPageStart + (rowsPerPage - OVERLAP_ROWS);
      startIdx = prevPageEnd; // Start right after previous page ends
      
      if (i < totalPages - 1) {
        // Not last page: exclude last 2 rows
        endIdx = Math.min(startIdx + rowsPerPage - OVERLAP_ROWS, rows.length);
      } else {
        // Last page: reserve space for footer
        const maxRowsForLastPage = rowsPerPage - 5; // Reserve 5 rows for footer
        endIdx = Math.min(startIdx + maxRowsForLastPage, rows.length);
        // But ensure we show at least the remaining rows if there aren't many left
        const remainingRows = rows.length - startIdx;
        if (remainingRows <= maxRowsForLastPage) {
          endIdx = rows.length; // Show all remaining rows if they fit
        }
      }
    }
    
    const pageRows = rows.slice(startIdx, endIdx);
    const isLastPage = i === totalPages - 1;
    allPages.push(createPage(pageRows, i + 1, isLastPage));
  }

  // If only one page, download directly
  if (totalPages === 1) {
    const pageContainer = allPages[0];
    document.body.appendChild(pageContainer);
    pageContainer.style.position = "absolute";
    pageContainer.style.left = "-9999px";

    try {
      const canvas = await html2canvas(pageContainer, {
        backgroundColor: "#ffffff",
        scale: SCALE,
        width: A4_WIDTH,
        height: A4_HEIGHT,
      });

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
      document.body.removeChild(pageContainer);
    }
    return;
  }

  // Multiple pages: create individual PNGs and zip them
  const zip = new JSZip();
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  document.body.appendChild(tempContainer);

  try {
    // Process each page individually
    for (let i = 0; i < allPages.length; i++) {
      const pageContainer = allPages[i];
      tempContainer.appendChild(pageContainer);

      // Wait a bit for rendering
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(pageContainer, {
        backgroundColor: "#ffffff",
        scale: SCALE,
        width: A4_WIDTH,
        height: A4_HEIGHT,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
        }, "image/png");
      });

      // Add to zip
      zip.file(`${filename}_${i + 1}.png`, blob);

      // Remove page from container
      tempContainer.removeChild(pageContainer);
    }

    // Generate zip file and download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.zip`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } finally {
    // Remove temporary container
    if (tempContainer.parentNode) {
      document.body.removeChild(tempContainer);
    }
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
    // Use same page calculation as PNG
    const A4_WIDTH_MM = 210; // A4 width in mm
    const A4_HEIGHT_MM = 297; // A4 height in mm
    const PADDING_MM = 14; // ~40px in mm
    const HEADER_HEIGHT_MM = 40; // Title + header section in mm
    const FOOTER_HEIGHT_MM = 15; // Total text in mm
    const ROW_HEIGHT_MM = 8; // Approximate height per table row in mm
    const TABLE_HEADER_HEIGHT_MM = 10;
    const BOTTOM_MARGIN_MM = 30; // Extra space at bottom
    
    const headers = Object.keys(rows[0] || {});
    const availableHeight = A4_HEIGHT_MM - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM - TABLE_HEADER_HEIGHT_MM - (PADDING_MM * 2) - BOTTOM_MARGIN_MM;
    const rowsPerPage = Math.max(1, Math.floor(availableHeight / ROW_HEIGHT_MM) - 3);
    const OVERLAP_ROWS = 2;
    
    // Calculate number of pages needed (same logic as PNG)
    let totalPages = 1;
    if (rows.length > rowsPerPage) {
      const remainingRows = rows.length - rowsPerPage;
      totalPages = 1 + Math.ceil(remainingRows / (rowsPerPage - OVERLAP_ROWS));
    }

    // Add Korean font if available
    let koreanFontLoaded = false;
    const doc = new jsPDF("portrait", "mm", "a4");
    
    if (koreanFontBase64 && koreanFontBase64.length > 0) {
      try {
        doc.addFileToVFS("NanumGothic.ttf", koreanFontBase64);
        doc.addFont("NanumGothic.ttf", "NanumGothic", "normal");
        const fonts = (doc as any).getFontList();
        if (fonts && fonts["NanumGothic"]) {
          koreanFontLoaded = true;
          doc.setFont("NanumGothic", "normal");
        }
      } catch (fontError) {
        console.error("Failed to add Korean font:", fontError);
      }
    }

    // Create pages (same logic as PNG)
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        doc.addPage();
      }

      let startIdx: number;
      let endIdx: number;
      
      if (i === 0) {
        startIdx = 0;
        if (totalPages === 1) {
          endIdx = Math.min(rowsPerPage - 5, rows.length);
        } else {
          endIdx = Math.min(rowsPerPage - OVERLAP_ROWS, rows.length);
        }
      } else {
        const prevPageStart = i === 1 ? 0 : (i - 1) * (rowsPerPage - OVERLAP_ROWS);
        const prevPageEnd = prevPageStart + (rowsPerPage - OVERLAP_ROWS);
        startIdx = prevPageEnd;
        
        if (i < totalPages - 1) {
          endIdx = Math.min(startIdx + rowsPerPage - OVERLAP_ROWS, rows.length);
        } else {
          const maxRowsForLastPage = rowsPerPage - 5;
          endIdx = Math.min(startIdx + maxRowsForLastPage, rows.length);
          const remainingRows = rows.length - startIdx;
          if (remainingRows <= maxRowsForLastPage) {
            endIdx = rows.length;
          }
        }
      }
      
      const pageRows = rows.slice(startIdx, endIdx);
      const isLastPage = i === totalPages - 1;

      // Title
      doc.setFontSize(18);
      doc.text("경비 지출내역서", A4_WIDTH_MM / 2, 20, { align: "center" });

      // Header section
      doc.setFontSize(10);
      doc.text(`기간: ${summary.startDate} ~ ${summary.endDate}`, PADDING_MM, 30);
      doc.text(`작성자: ${summary.author}`, A4_WIDTH_MM - PADDING_MM, 30, { align: "right" });
      doc.text(`작성일자: ${summary.createdDate}`, A4_WIDTH_MM - PADDING_MM, 35, { align: "right" });

      // Prepare table data
      const tableData = pageRows.map((row) =>
        headers.map((header) => {
          const value = row[header as keyof ExportRow];
          return value !== null && value !== undefined ? String(value) : "";
        })
      );

      // Add table
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 45,
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
          font: koreanFontLoaded ? "NanumGothic" : "helvetica",
          fontStyle: "normal",
        },
        headStyles: { 
          fillColor: [243, 244, 246],
          textColor: [0, 0, 0],
          halign: "center",
          valign: "middle",
          font: koreanFontLoaded ? "NanumGothic" : "helvetica",
          fontStyle: "normal",
        },
        margin: { left: PADDING_MM, right: PADDING_MM },
      });

      // Add total text at bottom right (only on last page)
      if (isLastPage) {
        // Set font and size
        if (koreanFontLoaded) {
          doc.setFont("NanumGothic", "normal");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const totalText = `합계: ₩${summary.totalAmount.toLocaleString()}`;
        // Use right edge of page minus padding for right alignment
        doc.text(
          totalText,
          A4_WIDTH_MM - PADDING_MM,
          A4_HEIGHT_MM - PADDING_MM,
          { align: "right" }
        );
      }

      // Page number
      if (totalPages > 1) {
        doc.setFontSize(10);
        doc.setFont(koreanFontLoaded ? "NanumGothic" : "helvetica", "normal");
        doc.text(
          `${i + 1} / ${totalPages}`,
          PADDING_MM,
          A4_HEIGHT_MM - PADDING_MM
        );
      }
    }

    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
}

