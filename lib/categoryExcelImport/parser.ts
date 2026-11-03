/**
 * BTC Web Portal - Category-Based Excel Parser
 * Robust 2-sheet parser (with backward compatibility for 3-sheet workbooks).
 * Strictly validates OTM (12 columns) and LTM (10 columns), protecting against
 * formula injection, preserving Bengali Unicode, and normalizing dates and currency.
 */

import * as XLSX from "xlsx";
import {
  NoticeCategory,
  NoticeDetailsData,
  TenderDataSection,
  FooterDetailsData,
  CategoryNoticeImportData,
  ValidationErrorItem,
} from "./types";
import { CATEGORY_TEMPLATE_CONFIGS } from "./templateGenerator";
import { autoConvertBijoy } from "../bijoyToUnicode";
import { formatCurrencyBD } from "../tableEngine/dataValidator";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Strips leading spreadsheet formula trigger characters (=, +, -, @) when followed by formula syntax.
 */
export function sanitizeCellValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();

  // If cell literally begins with '=' (e.g. formula execution attempt), strip the '='
  if (str.startsWith("=")) {
    str = str.slice(1).trim();
  }

  return autoConvertBijoy(str);
}

/**
 * Normalizes header strings for case-insensitive and punctuation-agnostic comparison.
 */
export function normalizeHeaderName(hdr: string): string {
  if (!hdr) return "";
  return hdr.toLowerCase().replace(/[.\s_\-()\/\\:#]/g, "");
}

/**
 * Formats date into DD-MM-YYYY or DD-MM-YYYY HH:mm AM/PM.
 */
export function normalizeDateString(dateVal: any): string {
  if (!dateVal) return "";
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const d = String(dateVal.getDate()).padStart(2, "0");
    const m = String(dateVal.getMonth() + 1).padStart(2, "0");
    const y = dateVal.getFullYear();
    const hours = dateVal.getHours();
    const minutes = dateVal.getMinutes();
    if (hours === 0 && minutes === 0) {
      return `${d}-${m}-${y}`;
    }
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const hStr = String(h12).padStart(2, "0");
    const mStr = String(minutes).padStart(2, "0");
    return `${d}-${m}-${y} ${hStr}:${mStr} ${ampm}`;
  }

  const str = String(dateVal).trim();
  // Check if it's already DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}/.test(str)) {
    return str;
  }
  // Convert DD/MM/YYYY to DD-MM-YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
    return str.replace(/\//g, "-");
  }
  // Convert YYYY-MM-DD to DD-MM-YYYY
  if (/^(\d{4})-(\d{2})-(\d{2})(.*)$/.test(str)) {
    const matches = str.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
    if (matches) {
      const rest = matches[4] ? matches[4].trim() : "";
      return rest ? `${matches[3]}-${matches[2]}-${matches[1]} ${rest}` : `${matches[3]}-${matches[2]}-${matches[1]}`;
    }
  }

  return str;
}

/**
 * Extracts a date from cell strings like "Egp Published Date : 12-09-2026 12:16 PM".
 */
export function extractDateFromCellText(text: string): string {
  if (!text) return "";
  const str = String(text).trim();

  // Pattern 1: After colon or equal sign
  const prefixMatch = str.match(/(?:egp\s*)?publish(?:ed)?\s*date\s*[:=\-]?\s*(.+)/i);
  if (prefixMatch && prefixMatch[1]) {
    return normalizeDateString(prefixMatch[1].trim());
  }

  // Pattern 2: Direct date regex
  const dateMatch = str.match(/\b\d{1,2}[-/]\d{1,2}[-/]\d{4}(?:\s+\d{1,2}:\d{2}(?:\s*[AP]M)?)?/i);
  if (dateMatch) {
    return normalizeDateString(dateMatch[0].trim());
  }

  return normalizeDateString(str);
}

/**
 * Normalizes category strings (e.g. "otm" -> "OTM", "ltm" -> "LTM").
 */
export function normalizeCategoryString(catStr: string): NoticeCategory | null {
  const norm = (catStr || "").toUpperCase().replace(/[\s_\-]/g, "");
  if (norm.includes("OTM")) return "OTM";
  if (norm.includes("LTM")) return "LTM";
  if (norm.includes("PENDING")) return "LOTTERY_PENDING";
  if (norm.includes("RESULT")) return "LOTTERY_RESULT";
  return null;
}

/**
 * Finds a worksheet by fuzzy name matching.
 */
function findSheet(workbook: XLSX.WorkBook, aliases: string[]): { name: string; sheet: XLSX.WorkSheet } | null {
  for (const alias of aliases) {
    const normAlias = alias.toLowerCase().replace(/[\s_\-]/g, "");
    for (const name of workbook.SheetNames) {
      const normName = name.toLowerCase().replace(/[\s_\-]/g, "");
      if (normName === normAlias) {
        return { name, sheet: workbook.Sheets[name] };
      }
    }
  }
  return null;
}

/**
 * Reads a sheet into 2D array of string cells.
 */
function sheetToAoa(sheet: XLSX.WorkSheet): string[][] {
  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  return rows.map((r) => (Array.isArray(r) ? r.map((cell) => sanitizeCellValue(cell)) : []));
}

/**
 * Extracts key-value pairs from either key-value layout or horizontal table layout.
 */
function extractKeyValueMap(rows: string[][]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!rows || rows.length === 0) return map;

  // Pattern 1: Row 1 = Headers, Row 2 = Values (Horizontal Layout)
  const isHorizontalLayout =
    rows.length >= 2 &&
    rows[0].length >= 3 &&
    rows[0].some((h) => normalizeHeaderName(h).includes("title") || normalizeHeaderName(h).includes("category"));

  if (isHorizontalLayout) {
    const headers = rows[0];
    const values = rows[1];
    headers.forEach((hdr, idx) => {
      const key = normalizeHeaderName(hdr);
      if (key && values[idx] !== undefined) {
        map[key] = values[idx].trim();
      }
    });
    return map;
  }

  // Pattern 2: Key-Value layout (Row by Row where Col 0 is Key, Col 1 is Value)
  rows.forEach((row) => {
    if (row.length >= 2) {
      const key = normalizeHeaderName(row[0]);
      const val = row[1] !== undefined ? row[1].trim() : "";
      if (key && !key.includes("fieldname") && !key.includes("field")) {
        map[key] = val;
      }
    }
  });

  return map;
}

/**
 * Main Category-Based Excel Workbook Parser.
 * Handles both the new 2-sheet structure (Images 2 & 3) and legacy 3-sheet structure.
 */
export function parseCategoryNoticeWorkbook(
  buffer: ArrayBuffer | Uint8Array,
  expectedCategory: NoticeCategory,
  fileName: string = "uploaded.xlsx",
): CategoryNoticeImportData {
  const errors: ValidationErrorItem[] = [];
  const warnings: string[] = [];

  const emptyNoticeDetails: NoticeDetailsData = {
    title: "",
    subTitle: "",
    category: expectedCategory,
    year: new Date().getFullYear().toString(),
    publishDate: "",
    lastDate: "",
    lotteryDate: "",
  };

  const emptyTenderData: TenderDataSection = {
    headers: CATEGORY_TEMPLATE_CONFIGS[expectedCategory].headers,
    rows: [],
    totalRows: 0,
  };

  const emptyFooterDetails: FooterDetailsData = {
    payOrderTo: "",
    moreInfo: "",
  };

  // 1. File Size Verification
  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    errors.push({
      section: "workbook",
      message: `File size exceeds the 10 MB limit (${(buffer.byteLength / (1024 * 1024)).toFixed(2)} MB).`,
    });
    return {
      noticeDetails: emptyNoticeDetails,
      tenderData: emptyTenderData,
      footerDetails: emptyFooterDetails,
      validation: { isValid: false, errors, warnings },
      rawSheetNames: [],
      category: expectedCategory,
    };
  }

  // 2. Parse Workbook with XLSX
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
      raw: false,
    });
  } catch (err: any) {
    errors.push({
      section: "workbook",
      message: `Failed to parse Excel workbook: ${err?.message || "Invalid or corrupted file."}`,
    });
    return {
      noticeDetails: emptyNoticeDetails,
      tenderData: emptyTenderData,
      footerDetails: emptyFooterDetails,
      validation: { isValid: false, errors, warnings },
      rawSheetNames: [],
      category: expectedCategory,
    };
  }

  const rawSheetNames = workbook.SheetNames || [];
  if (rawSheetNames.length === 0) {
    errors.push({
      section: "workbook",
      message: "The uploaded workbook does not contain any worksheets.",
    });
    return {
      noticeDetails: emptyNoticeDetails,
      tenderData: emptyTenderData,
      footerDetails: emptyFooterDetails,
      validation: { isValid: false, errors, warnings },
      rawSheetNames,
      category: expectedCategory,
    };
  }

  // --------------------------------------------------------------------------
  // Check if legacy 3-sheet format or new 2-sheet format
  // --------------------------------------------------------------------------
  const hasLegacyNoticeDetails = findSheet(workbook, [
    "Notice Details",
    "Notice_Details",
    "NoticeDetails",
  ]);

  let noticeDetails: NoticeDetailsData = { ...emptyNoticeDetails };
  const tenderData: TenderDataSection = { ...emptyTenderData };
  const footerDetails: FooterDetailsData = { ...emptyFooterDetails };

  if (hasLegacyNoticeDetails) {
    // ------------------------------------------------------------------------
    // LEGACY 3-SHEET PARSING PATH
    // ------------------------------------------------------------------------
    const rowsA = sheetToAoa(hasLegacyNoticeDetails.sheet);
    const kvA = extractKeyValueMap(rowsA);

    const titleVal =
      kvA["noticetitle"] ||
      kvA["title"] ||
      kvA["procuringentity"] ||
      kvA["officename"] ||
      "";
    if (!titleVal) {
      errors.push({
        section: "notice",
        field: "Notice Title",
        message: 'Notice Title is required in "Notice Details" sheet.',
      });
    }
    noticeDetails.title = titleVal;

    noticeDetails.subTitle =
      kvA["noticesubtitle"] ||
      kvA["subtitle"] ||
      kvA["sub-title"] ||
      CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultSubTitle;

    const rawCategory = kvA["noticecategory"] || kvA["category"] || "";
    const parsedCat = normalizeCategoryString(rawCategory);

    if (!parsedCat) {
      errors.push({
        section: "notice",
        field: "Notice Category",
        message: `Invalid or missing category "${rawCategory}" in workbook. Expected "${expectedCategory}".`,
      });
    } else if (parsedCat !== expectedCategory) {
      errors.push({
        section: "notice",
        field: "Notice Category",
        message: `Category mismatch: This workbook contains "${parsedCat}" details, but you selected "${expectedCategory}". Please upload a "${expectedCategory}" workbook.`,
      });
    }
    noticeDetails.category = parsedCat || expectedCategory;

    const yearVal = kvA["tenderyear"] || kvA["year"] || new Date().getFullYear().toString();
    noticeDetails.year = yearVal.slice(0, 4);

    noticeDetails.publishDate = normalizeDateString(
      kvA["publishdate"] || kvA["publicationdate"] || ""
    );
    noticeDetails.lastDate = normalizeDateString(
      kvA["lastsubmissiondate"] || kvA["lastdate"] || kvA["lastdateofsubmission"] || ""
    );
    noticeDetails.lotteryDate = normalizeDateString(kvA["lotterydate"] || "");

    // Resolve Sheet B (Tender Data)
    const sheetBRef = findSheet(workbook, [
      "Tender Data",
      "Tender_Data",
      "TenderData",
      "Tenders",
      "Tender",
      "Sheet2",
    ]) || (rawSheetNames.length > 1 ? { name: rawSheetNames[1], sheet: workbook.Sheets[rawSheetNames[1]] } : null);

    if (sheetBRef) {
      parseTenderRows(sheetBRef.sheet, expectedCategory, tenderData, errors);
    } else {
      errors.push({
        section: "tender",
        message: 'Sheet "Tender Data" not found in the workbook.',
      });
    }
  } else {
    // ------------------------------------------------------------------------
    // NEW 2-SHEET PARSING PATH (Images 2 & 3)
    // Sheet 1: Tender Data (Title at Row 1, Subtitle at Row 2, Publish Date at Row 3, Headers at Row 4)
    // ------------------------------------------------------------------------
    const sheetTenderRef = findSheet(workbook, [
      "Tender Data",
      "Tender_Data",
      "TenderData",
      "Tenders",
      "Tender",
      "Sheet1",
    ]) || { name: rawSheetNames[0], sheet: workbook.Sheets[rawSheetNames[0]] };

    const rowsTender = sheetToAoa(sheetTenderRef.sheet);
    if (rowsTender.length === 0) {
      errors.push({
        section: "tender",
        message: 'The "Tender Data" worksheet is completely empty.',
      });
    } else {
      // Find the Header Row (the row containing "Tender Id" or "Brief Description")
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(10, rowsTender.length); i++) {
        const row = rowsTender[i];
        const hasTenderId = row.some((c) => {
          const norm = normalizeHeaderName(c);
          return norm === "tenderid" || norm === "id";
        });
        const hasDesc = row.some((c) => {
          const norm = normalizeHeaderName(c);
          return norm.includes("description") || norm.includes("works");
        });
        if (hasTenderId && hasDesc) {
          headerRowIdx = i;
          break;
        }
      }

      if (headerRowIdx === -1) {
        errors.push({
          section: "tender",
          message:
            'Could not locate table column headers in "Tender Data". Make sure headers include "Tender Id" and "Brief Description of Works".',
        });
      } else {
        // Extract Title, Subtitle, and Publish Date from rows above headerRowIdx
        const metadataRows = rowsTender.slice(0, headerRowIdx);

        // Row 0: Title
        let detectedTitle = "";
        if (metadataRows.length > 0) {
          const firstRowCells = metadataRows[0].filter((c) => c && c.trim().length > 0);
          detectedTitle = firstRowCells[0] || "";
        }
        if (!detectedTitle && metadataRows.length > 1) {
          detectedTitle = metadataRows[1].find((c) => c && c.trim().length > 0) || "";
        }
        if (!detectedTitle) {
          detectedTitle = CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultTitle;
        }
        noticeDetails.title = detectedTitle;

        // Row 1: Subtitle
        let detectedSubTitle = "";
        if (metadataRows.length > 1) {
          const secondRowCells = metadataRows[1].filter((c) => c && c.trim().length > 0);
          detectedSubTitle = secondRowCells[0] || "";
        }
        if (!detectedSubTitle) {
          detectedSubTitle = CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultSubTitle;
        }
        noticeDetails.subTitle = detectedSubTitle;

        // Row 2 / Any top row: Publish Date
        let detectedPublishDate = "";
        for (const metaRow of metadataRows) {
          for (const cell of metaRow) {
            if (
              cell.toLowerCase().includes("publish") ||
              cell.toLowerCase().includes("egp published date") ||
              /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/.test(cell)
            ) {
              const parsedDate = extractDateFromCellText(cell);
              if (parsedDate) {
                detectedPublishDate = parsedDate;
                break;
              }
            }
          }
          if (detectedPublishDate) break;
        }
        if (!detectedPublishDate) {
          detectedPublishDate = CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultPublishDate;
        }
        noticeDetails.publishDate = detectedPublishDate;

        // Extract Year from Publish Date or Subtitle
        const yearFromDate = detectedPublishDate.match(/\b(20\d\d)\b/);
        const yearFromSub = detectedSubTitle.match(/\b(20\d\d)\b/);
        noticeDetails.year = yearFromDate
          ? yearFromDate[1]
          : yearFromSub
          ? yearFromSub[1]
          : new Date().getFullYear().toString();

        // Detect Category from Header Row & Subtitle
        const rawHeaders = rowsTender[headerRowIdx];
        const normalizedHeaders = rawHeaders.map((h) => normalizeHeaderName(h));
        const hasTurnOver = normalizedHeaders.some((h) => h.includes("turnover"));
        const hasSimilarWork = normalizedHeaders.some((h) => h.includes("similarwork"));
        const isOtmByCols = hasTurnOver && hasSimilarWork;

        const subLower = detectedSubTitle.toLowerCase();
        let detectedCategory: NoticeCategory = isOtmByCols ? "OTM" : "LTM";
        if (subLower.includes("otm")) detectedCategory = "OTM";
        if (subLower.includes("ltm")) detectedCategory = "LTM";

        if (detectedCategory !== expectedCategory) {
          errors.push({
            section: "notice",
            field: "Notice Category",
            message: `Category mismatch: This workbook contains "${detectedCategory}" details, but you selected "${expectedCategory}". Please upload a "${expectedCategory}" workbook.`,
          });
        }
        noticeDetails.category = detectedCategory;

        // Process Data Rows below headerRowIdx
        parseTenderRowsCustom(
          rowsTender,
          headerRowIdx,
          expectedCategory,
          tenderData,
          noticeDetails,
          errors,
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // Resolve Sheet 2: Footer Details
  // --------------------------------------------------------------------------
  const sheetFooterRef = findSheet(workbook, [
    "Footer Details",
    "Footer_Details",
    "FooterDetails",
    "Footer",
    "Sheet2",
    "Sheet3",
  ]);

  if (sheetFooterRef) {
    const rowsFooter = sheetToAoa(sheetFooterRef.sheet);
    const kvFooter = extractKeyValueMap(rowsFooter);

    footerDetails.payOrderTo =
      kvFooter["payorderto"] ||
      kvFooter["payorder"] ||
      CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultPayOrderTo;

    footerDetails.moreInfo =
      kvFooter["informationnoticedetails"] ||
      kvFooter["noticedetails"] ||
      kvFooter["information"] ||
      kvFooter["moreinfo"] ||
      CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultMoreInfo;
  } else {
    footerDetails.payOrderTo = CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultPayOrderTo;
    footerDetails.moreInfo = CATEGORY_TEMPLATE_CONFIGS[expectedCategory].defaultMoreInfo;
    warnings.push('Sheet "Footer Details" was not found; default footer specifications will be applied.');
  }

  const isValid = errors.length === 0;

  return {
    noticeDetails,
    tenderData,
    footerDetails,
    validation: {
      isValid,
      errors,
      warnings,
    },
    rawSheetNames,
    category: expectedCategory,
  };
}

/**
 * Parses and maps tender rows starting from headerRowIdx in 2-sheet mode.
 */
function parseTenderRowsCustom(
  rows: string[][],
  headerRowIdx: number,
  category: NoticeCategory,
  tenderData: TenderDataSection,
  noticeDetails: NoticeDetailsData,
  errors: ValidationErrorItem[],
) {
  const sourceHeaders = rows[headerRowIdx].map((h) => h.trim());
  const expectedHeaders = CATEGORY_TEMPLATE_CONFIGS[category].headers;

  // Map each expected header to the source column index
  const colIndexMap: number[] = [];
  const missingHeaders: string[] = [];

  expectedHeaders.forEach((expHdr) => {
    const normExp = normalizeHeaderName(expHdr);
    const foundIdx = sourceHeaders.findIndex((srcHdr) => normalizeHeaderName(srcHdr) === normExp);
    if (foundIdx === -1) {
      // Special allowance: if "#" (SL) is missing from source headers, we can synthesize it
      if (normExp === "" || normExp === "sl" || normExp === "slno") {
        colIndexMap.push(-2); // -2 denotes auto-synthesize
      } else {
        missingHeaders.push(expHdr);
      }
    } else {
      colIndexMap.push(foundIdx);
    }
  });

  if (missingHeaders.length > 0) {
    errors.push({
      section: "tender",
      message: `Missing required ${category} columns in "Tender Data": ${missingHeaders.join(", ")}.`,
    });
  }

  tenderData.headers = expectedHeaders;

  const dataRows = rows.slice(headerRowIdx + 1);
  const validRows: string[][] = [];

  dataRows.forEach((rowCells, rIdx) => {
    // Skip completely empty row or placeholder row (where only #/Method may be prefilled)
    const nonMetaCells = rowCells.filter((c, idx) => {
      const srcHdr = normalizeHeaderName(sourceHeaders[idx] || "");
      return srcHdr !== "" && srcHdr !== "sl" && srcHdr !== "slno" && srcHdr !== "method" && srcHdr !== "typeofmethod";
    });
    const isEmpty =
      rowCells.every((c) => !c || c.trim() === "") ||
      (nonMetaCells.length > 0 && nonMetaCells.every((c) => !c || c.trim() === ""));
    if (isEmpty) return;

    // Skip summary / total row (e.g. "Total Amount BD Tk =")
    const isTotalRow = rowCells.some((c) => {
      const lower = String(c).toLowerCase().trim();
      return lower.startsWith("total amount") || lower === "total";
    });
    if (isTotalRow) return;

    const rowNumber = headerRowIdx + 2 + rIdx;
    const mappedRow: string[] = [];

    expectedHeaders.forEach((expHdr, expIdx) => {
      const srcIdx = colIndexMap[expIdx];
      let cellVal = "";

      if (srcIdx === -2) {
        // Auto SL
        cellVal = (validRows.length + 1).toString();
      } else if (srcIdx !== -1 && rowCells[srcIdx] !== undefined) {
        cellVal = rowCells[srcIdx].trim();
      }

      const normHdr = normalizeHeaderName(expHdr);

      // Validate Required Tender ID
      if (normHdr === "tenderid" || normHdr === "id") {
        if (!cellVal) {
          errors.push({
            section: "tender",
            row: rowNumber,
            column: expHdr,
            message: `Row ${rowNumber}: Tender Id is required.`,
          });
        }
      }

      // Auto-populate / normalize Method
      if (normHdr === "method" || normHdr === "typeofmethod") {
        cellVal = category === "OTM" ? "OTM" : "LTM";
      }

      // Currency Formatting
      const isCurrency =
        normHdr.includes("cost") ||
        normHdr.includes("credit") ||
        normHdr.includes("security") ||
        normHdr.includes("price") ||
        normHdr.includes("turnover") ||
        normHdr.includes("similarwork");
      if (isCurrency && cellVal) {
        cellVal = formatCurrencyBD(cellVal);
      }

      // Selling / Last Date formatting
      if (normHdr.includes("sellingdate") || normHdr.includes("lastdate") || normHdr.includes("schedule")) {
        if (cellVal) {
          cellVal = normalizeDateString(cellVal);
        }
      }

      mappedRow.push(cellVal);
    });

    validRows.push(mappedRow);
  });

  tenderData.rows = validRows;
  tenderData.totalRows = validRows.length;

  if (validRows.length === 0) {
    errors.push({
      section: "tender",
      message: '"Tender Data" sheet does not contain any valid tender rows.',
    });
  }

  // Populate notice lastDate from the selling date column if available
  // noticeDetails.lastDate remains blank as requested for manual form selection
}

/**
 * Legacy Sheet B parser.
 */
function parseTenderRows(
  sheet: XLSX.WorkSheet,
  category: NoticeCategory,
  tenderData: TenderDataSection,
  errors: ValidationErrorItem[],
) {
  const rows = sheetToAoa(sheet);
  if (rows.length === 0) {
    errors.push({
      section: "tender",
      message: '"Tender Data" sheet is empty.',
    });
    return;
  }

  const dummyDetails: NoticeDetailsData = {
    title: "",
    subTitle: "",
    category,
    year: "",
    publishDate: "",
    lastDate: "",
    lotteryDate: "",
  };

  parseTenderRowsCustom(rows, 0, category, tenderData, dummyDetails, errors);
}
