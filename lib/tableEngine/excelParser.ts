/**
 * BTC Web Portal - Client-Side Excel and Tabular Data Parser
 * Supports .xlsx, .xls, .csv via SheetJS (xlsx) from ArrayBuffer,
 * and standard clipboard tab-separated text (Ctrl + V).
 */

import * as XLSX from "xlsx";

export interface ParsedSheetData {
  sheetName: string;
  headers: string[];
  rawRows: (string | number)[][];
  totalRows: number;
  totalCols: number;
}

export interface WorkbookParseResult {
  sheetNames: string[];
  sheets: Record<string, ParsedSheetData>;
  error?: string;
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_ROW_LIMIT = 1000;

/**
 * Sanitizes cell values to prevent spreadsheet formula injection
 * and normalizes undefined/null values to empty strings.
 */
export function sanitizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();

  // If cell literally begins with '=' (e.g. unquoted formula or injection attempt),
  // strip the '=' to prevent formula execution, preserving the safe plain text content
  if (str.startsWith("=")) {
    str = str.slice(1).trim();
  }

  return str;
}

/**
 * Parses an in-memory ArrayBuffer of an Excel workbook (.xlsx, .xls, .csv).
 */
export function parseWorkbookBuffer(
  buffer: ArrayBuffer,
  fileName: string = "uploaded.xlsx",
): WorkbookParseResult {
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return {
      sheetNames: [],
      sheets: {},
      error: `File size exceeds the 10 MB limit (${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  try {
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      cellText: true,
      raw: false,
      codepage: 65001, // Enforce UTF-8 for CSV and plain text sheets
    });

    const sheetNames = workbook.SheetNames || [];
    if (sheetNames.length === 0) {
      return {
        sheetNames: [],
        sheets: {},
        error: "No worksheets found in the uploaded workbook.",
      };
    }

    const sheets: Record<string, ParsedSheetData> = {};

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet || !sheet["!ref"]) {
        sheets[sheetName] = {
          sheetName,
          headers: [],
          rawRows: [],
          totalRows: 0,
          totalCols: 0,
        };
        continue;
      }

      // Convert sheet to 2D array of strings
      const rawData: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
        blankrows: false,
        raw: false,
      });

      if (!rawData || rawData.length === 0) {
        sheets[sheetName] = {
          sheetName,
          headers: [],
          rawRows: [],
          totalRows: 0,
          totalCols: 0,
        };
        continue;
      }

      // First non-empty row is treated as headers
      let headerRowIndex = -1;
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row.some((cell) => cell !== undefined && String(cell).trim() !== "")) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        sheets[sheetName] = {
          sheetName,
          headers: [],
          rawRows: [],
          totalRows: 0,
          totalCols: 0,
        };
        continue;
      }

      const rawHeaders = (rawData[headerRowIndex] || []).map((h, colIdx) => {
        const val = h !== undefined && h !== null ? String(h).trim() : "";
        return val || `Column ${colIdx + 1}`;
      });

      // Find the last non-empty header column index to avoid endless empty columns
      let lastHeaderCol = rawHeaders.length - 1;
      while (
        lastHeaderCol >= 0 &&
        (!rawHeaders[lastHeaderCol] || rawHeaders[lastHeaderCol].startsWith("Column "))
      ) {
        // Check if all data rows in this column are also empty
        const hasData = rawData.slice(headerRowIndex + 1).some((r) => {
          const val = r[lastHeaderCol];
          return val !== undefined && val !== null && String(val).trim() !== "";
        });
        if (hasData) break;
        lastHeaderCol--;
      }

      const headers = rawHeaders.slice(0, Math.max(lastHeaderCol + 1, 1));

      // Extract subsequent data rows
      const dataRows: (string | number)[][] = [];
      for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row) continue;

        // Skip completely empty rows
        const hasContent = row.some((cell) => cell !== undefined && String(cell).trim() !== "");
        if (!hasContent) continue;

        // Slice to header length and normalize cells
        const normalizedRow = headers.map((_, colIdx) => {
          const cell = row[colIdx];
          return sanitizeCellValue(cell);
        });

        dataRows.push(normalizedRow);
        if (dataRows.length >= MAX_ROW_LIMIT) {
          break;
        }
      }

      sheets[sheetName] = {
        sheetName,
        headers,
        rawRows: dataRows,
        totalRows: dataRows.length,
        totalCols: headers.length,
      };
    }

    return {
      sheetNames,
      sheets,
    };
  } catch (err: any) {
    return {
      sheetNames: [],
      sheets: {},
      error: `Failed to parse workbook: ${err.message || String(err)}`,
    };
  }
}

/**
 * Parses clipboard text (tab-separated columns and newline-separated rows)
 * generated by copying cells in Microsoft Excel or Google Sheets.
 */
export function parseClipboardText(text: string): ParsedSheetData {
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      sheetName: "Clipboard",
      headers: [],
      rawRows: [],
      totalRows: 0,
      totalCols: 0,
    };
  }

  // Handle various newline styles (CRLF, LF, CR)
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const filteredLines = lines.filter((l) => l.trim().length > 0);

  if (filteredLines.length === 0) {
    return {
      sheetName: "Clipboard",
      headers: [],
      rawRows: [],
      totalRows: 0,
      totalCols: 0,
    };
  }

  // Parse lines into cell arrays
  const parsedRows: string[][] = filteredLines.map((line) => {
    // Standard tab separation from spreadsheet clipboard with cell sanitization
    return line.split("\t").map((c) => sanitizeCellValue(c));
  });

  // Check if first row contains headers or data
  // If first row looks like tender data (e.g. numeric tender ID, app cost), we treat all as rows
  const firstRow = parsedRows[0];
  const looksLikeHeaders = firstRow.some((cell) => {
    const lower = cell.toLowerCase();
    return (
      lower.includes("tender") ||
      lower.includes("desc") ||
      lower.includes("sl") ||
      lower.includes("cost") ||
      lower.includes("date") ||
      lower.includes("method") ||
      lower.includes("location")
    );
  });

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (looksLikeHeaders && parsedRows.length > 1) {
    headers = firstRow.map((h, i) => (h ? h : `Column ${i + 1}`));
    dataRows = parsedRows.slice(1);
  } else {
    // Generate generic column headers
    const maxCols = Math.max(...parsedRows.map((r) => r.length));
    headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
    dataRows = parsedRows;
  }

  // Cap at MAX_ROW_LIMIT
  if (dataRows.length > MAX_ROW_LIMIT) {
    dataRows = dataRows.slice(0, MAX_ROW_LIMIT);
  }

  return {
    sheetName: "Clipboard",
    headers,
    rawRows: dataRows,
    totalRows: dataRows.length,
    totalCols: headers.length,
  };
}

