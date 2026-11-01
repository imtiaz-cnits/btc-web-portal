/**
 * BTC Web Portal - Tender Data Validation & Normalization Engine
 * Applies Bangladeshi currency formatting, date normalization, Bijoy conversion,
 * method auto-assignment, and required field validation.
 */

import { ColumnMappingItem } from "./columnMapper";
import { autoConvertBijoy } from "@/lib/bijoyToUnicode";

export interface RowValidationError {
  rowIndex: number;
  column: string;
  message: string;
}

export interface ValidationResult {
  validRows: string[][];
  errors: RowValidationError[];
  warnings: string[];
  totalProcessed: number;
  invalidCount: number;
}

/**
 * Checks if a destination column is a currency field.
 */
export function isCurrencyField(header: string): boolean {
  if (!header) return false;
  const lower = header.toLowerCase();
  return (
    lower.includes("cost") ||
    lower.includes("tk") ||
    lower.includes("taka") ||
    lower.includes("security") ||
    lower.includes("fees") ||
    lower.includes("fee") ||
    lower.includes("price") ||
    lower.includes("amount") ||
    lower.includes("turn over") ||
    lower.includes("turnover") ||
    lower.includes("similar work") ||
    lower.includes("credit") ||
    lower.includes("টাকা")
  );
}

/**
 * Formats a raw numeric or currency string into Bangladeshi (Indian numbering system) currency format with commas.
 * e.g., "4126000" -> "41,26,000", "44 Lac" -> "44 Lac", "2.2 Cr" -> "2.2 Cr"
 */
export function formatCurrencyBD(val: string): string {
  if (!val) return "";
  const str = String(val).trim();

  // If already contains Lac, Cr, Crore, or text units, preserve it
  if (/(?:lac|cr|crore|lakh|লাখ|কোটি)/i.test(str)) {
    return str;
  }

  // Remove existing commas
  let clean = str.replace(/,/g, "");

  // Preserve leading negative sign
  const isNegative = clean.startsWith("-");

  // Check if it's a valid number
  const parts = clean.split(".");
  const integerPart = parts[0].replace(/[^\d]/g, "");

  if (!integerPart && parts.length === 1) return str;

  const num = parseInt(integerPart || "0", 10);
  if (isNaN(num)) return str;

  let formatted = (isNegative ? "-" : "") + num.toLocaleString("en-IN");
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, "").slice(0, 2);
    if (decimalPart) {
      formatted += "." + decimalPart;
    }
  }

  return formatted;
}

/**
 * Formats date string into DD-MM-YYYY format, preserving time if present.
 * Uses strict UTC for serial numbers to prevent timezone shift.
 */
export function normalizeDateToDmy(cellStr: string): string {
  if (!cellStr) return "";
  const str = String(cellStr).trim();

  // If Excel serial date number
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    // Excel epoch 1900 UTC calculation
    const utcMs = Math.round((serial - 25569) * 86400 * 1000);
    const date = new Date(utcMs);
    const d = String(date.getUTCDate()).padStart(2, "0");
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const y = date.getUTCFullYear();
    return `${d}-${m}-${y} 05:00 PM`;
  }

  // ISO string
  if (str.includes("T")) {
    const datePart = str.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}-${m}-${y}`;
    }
  }

  const parts = str.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts.slice(1).join(" ");

  let formattedDate = datePart;
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-");
    formattedDate = `${d}-${m}-${y}`;
  } else if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(datePart)) {
    const clean = datePart.replace(/\//g, "-");
    const dParts = clean.split("-");
    const p1 = parseInt(dParts[0], 10);
    const p2 = parseInt(dParts[1], 10);
    let y = dParts[2];
    if (y.length === 2) y = "20" + y;

    let d = p1;
    let m = p2;
    // If p2 > 12 (e.g. 9/21/2026), p2 is day and p1 is month
    if (p2 > 12 && p1 <= 12) {
      d = p2;
      m = p1;
    }
    formattedDate = `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
  }

  return timePart ? `${formattedDate} ${timePart}` : formattedDate;
}

/**
 * Returns the proper method text according to category.
 */
export function getCategoryMethodText(category: string): string {
  switch (category) {
    case "OTM":
      return "OTM";
    case "LTM":
      return "LTM";
    case "LOTTERY_PENDING":
      return "Lottery Pending";
    case "LOTTERY_RESULT":
      return "Lottery Result";
    default:
      return category || "LTM";
  }
}

/**
 * Validates and maps raw rows into final destination string[][] arrays.
 */
export function validateAndMapRows(
  rawRows: (string | number)[][],
  sourceHeaders: string[],
  mappings: ColumnMappingItem[],
  category: string,
  defaults?: {
    workLocation?: string;
    lastDate?: string;
  },
): ValidationResult {
  const validRows: string[][] = [];
  const errors: RowValidationError[] = [];
  const warnings: string[] = [];

  // Map source header names to their column index in rawRows
  const sourceIndexMap = new Map<string, number>();
  sourceHeaders.forEach((hdr, idx) => {
    sourceIndexMap.set(hdr, idx);
  });

  const methodText = getCategoryMethodText(category);

  // Identify destination column roles
  const destRoles = mappings.map((m) => {
    const norm = m.destinationHeader.toLowerCase().replace(/[.\s_\-]/g, "");
    const isSl = norm === "slno" || norm === "sl" || norm === "serial";
    const isMethod = norm.includes("method") || norm.includes("matho");
    const isLocation = norm.includes("location") || norm.includes("স্থান") || norm.includes("লোকেশন");
    const isLastDate = norm.includes("sellingdate") || norm.includes("lastdate") || norm.includes("scheduledate");
    const isCurrency = isCurrencyField(m.destinationHeader);
    const isTenderId = norm.includes("tenderid") || norm === "id";
    const isDesc = norm.includes("description") || norm.includes("works");

    return {
      destinationHeader: m.destinationHeader,
      sourceIndex: m.sourceHeader ? sourceIndexMap.get(m.sourceHeader) ?? -1 : -1,
      isRequired: m.isRequired,
      isSl,
      isMethod,
      isLocation,
      isLastDate,
      isCurrency,
      isTenderId,
      isDesc,
    };
  });

  rawRows.forEach((row, rowIdx) => {
    // Check if row is completely empty
    const hasAnyValue = row.some((c) => c !== undefined && c !== null && String(c).trim() !== "");
    if (!hasAnyValue) {
      return; // Skip completely empty rows silently
    }

    let isRowValid = true;
    const formattedRow: string[] = [];

    destRoles.forEach((role, colIdx) => {
      let cellValue = "";

      if (role.sourceIndex !== -1 && row[role.sourceIndex] !== undefined) {
        cellValue = String(row[role.sourceIndex] ?? "").trim();
      }

      // Bijoy conversion
      if (cellValue) {
        cellValue = autoConvertBijoy(cellValue);
      }

      // Auto-populate Type of Method
      if (role.isMethod) {
        cellValue = methodText;
      }

      // Auto-populate Location fallback if empty
      if (role.isLocation && !cellValue && defaults?.workLocation) {
        cellValue = defaults.workLocation;
      }

      // Auto-populate Last Date fallback if empty
      if (role.isLastDate) {
        if (cellValue) {
          cellValue = normalizeDateToDmy(cellValue);
        } else if (defaults?.lastDate) {
          cellValue = `${defaults.lastDate} 05:00 PM`;
        }
      }

      // Format currency
      if (role.isCurrency && cellValue) {
        cellValue = formatCurrencyBD(cellValue);
      }

      // Required field validation (e.g. Tender Id)
      if (role.isRequired && !cellValue) {
        isRowValid = false;
        errors.push({
          rowIndex: rowIdx + 1,
          column: role.destinationHeader,
          message: `Required field "${role.destinationHeader}" is missing in row ${rowIdx + 1}.`,
        });
      }

      formattedRow.push(cellValue);
    });

    if (isRowValid) {
      validRows.push(formattedRow);
    }
  });

  // Automatically recalculate SL.NO if present
  const slColIdx = destRoles.findIndex((r) => r.isSl);
  if (slColIdx !== -1) {
    validRows.forEach((r, idx) => {
      r[slColIdx] = (idx + 1).toString();
    });
  }

  return {
    validRows,
    errors,
    warnings,
    totalProcessed: rawRows.length,
    invalidCount: errors.length,
  };
}

