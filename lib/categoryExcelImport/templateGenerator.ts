/**
 * BTC Web Portal - Category-Based Excel Template Generator
 * Generates official Category-Specific Excel Notice Workbooks with 2 sheets:
 * Sheet 1: Tender Data (Title, Subtitle, Publish Date + Table Headers + Data Rows)
 * Sheet 2: Footer Details (Pay Order To, Information / Notice Details, Warning)
 *
 * Supported Categories:
 * - OTM: 12 columns (#, Tender Id, Brief Description Of Works, Location, Method, APP Estimate Cost Tk., Bank Credit Line, Turn Over 05 Years, Similar Work 05 Years, Tender Security (BD), Document Price. Tk, Schedule & Selling Date)
 * - LTM: 10 columns (#, Tender Id, Brief Description Of Works, Location, Method, APP Estimate Cost Tk., Bank Credit Line, Tender Security (BD), Document Price. Tk, Schedule & Selling Date)
 */

import * as XLSX from "xlsx";
import { NoticeCategory } from "./types";

export interface CategoryTemplateConfig {
  category: "OTM" | "LTM" | "LOTTERY_PENDING" | "LOTTERY_RESULT";
  fileName: string;
  defaultTitle: string;
  defaultSubTitle: string;
  defaultPublishDate: string;
  headers: string[];
  columnWidths: number[];
  sampleRows: string[][];
  defaultPayOrderTo: string;
  defaultMoreInfo: string;
  defaultBottomWarning: string;
}

export const CATEGORY_TEMPLATE_CONFIGS: Record<NoticeCategory, CategoryTemplateConfig> = {
  OTM: {
    category: "OTM",
    fileName: "BTC_OTM_Notice_Template.xlsx",
    defaultTitle: "পানি উন্নয়ন বোর্ড, পাবনা। (BWDB)",
    defaultSubTitle: "Bangladesh Agricultural Development Corporation, Pabna (BADC) (OTM Method)",
    defaultPublishDate: "12-09-2026 12:16 PM",
    headers: [
      "#",
      "Tender Id",
      "Brief Description Of Works",
      "Location",
      "Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Turn Over 05 Years",
      "Similar Work 05 Years",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & Selling Date",
    ],
    columnWidths: [6, 14, 45, 22, 12, 22, 18, 20, 22, 22, 18, 26],
    sampleRows: [
      [
        "1",
        "01-01-4354",
        "srwer ewrwerw werwer werwerwer werwerwer",
        "Pabna Sadar, Pabna",
        "OTM",
        "50,000",
        "5.46 Lac",
        "5.57 Lac",
        "6.66 Lac",
        "65,656",
        "5.66 Lac",
        "14-09-2026 05:00 PM",
      ],
    ],
    defaultPayOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
    defaultMoreInfo:
      "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086, 01972-805086\nL M B Market 1st Floor, Pabna.\nsalomdhaka@gmail.com\nWeb: www.egpbtc.com",
    defaultBottomWarning: "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।",
  },

  LTM: {
    category: "LTM",
    fileName: "BTC_LTM_Notice_Template.xlsx",
    defaultTitle: "জেলা পরিষদ, পাবনা",
    defaultSubTitle: "Zila Parishad, Pabna. E-Tender Notice.(2026-2027) (LTM Method)",
    defaultPublishDate: "20-08-2026 11:56 AM",
    headers: [
      "#",
      "Tender Id",
      "Brief Description Of Works",
      "Location",
      "Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & Selling Date",
    ],
    columnWidths: [6, 14, 45, 22, 12, 22, 18, 22, 18, 26],
    sampleRows: [
      [
        "1",
        "1329553",
        "Rehabilitation of Dogachi Up to Lachipara road. from Ch 00m - Ch 845m [PABNA-S]",
        "Sadar Pabna",
        "LTM",
        "40,17,031",
        "32 Lac",
        "1,00,000",
        "1,500",
        "05-10-2026 05:00 PM",
      ],
    ],
    defaultPayOrderTo: "MD. JAKIR HOSSAIN, Assistant Engineer, Zila Parishad, Pabna",
    defaultMoreInfo:
      "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086, 01972-805086\nL M B Market 1st Floor, Pabna.\nsalomdhaka@gmail.com\nWeb: www.egpbtc.com",
    defaultBottomWarning:
      "Only Zilla Parishad,Pabna Enlisted Tenderer (F/Y-2025-2026) can eligible for This Tender, Bank statement is not acceptable. In case of credit commitment attached to tender in format e-PW2B-5 must be paid",
  },

  // Fallback stubs for backward-compatibility if referenced by legacy modules
  LOTTERY_PENDING: {
    category: "LOTTERY_PENDING",
    fileName: "BTC_LOTTERY_PENDING_Notice_Template.xlsx",
    defaultTitle: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)",
    defaultSubTitle: "Local Government Engineering Department, Pabna (Lottery Pending)",
    defaultPublishDate: "23-09-2026 11:46 AM",
    headers: [
      "#",
      "Tender Id",
      "Brief Description Of Works",
      "Location",
      "Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & Selling Date",
    ],
    columnWidths: [6, 14, 45, 22, 12, 22, 18, 22, 18, 26],
    sampleRows: [],
    defaultPayOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
    defaultMoreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086",
    defaultBottomWarning: "",
  },

  LOTTERY_RESULT: {
    category: "LOTTERY_RESULT",
    fileName: "BTC_LOTTERY_RESULT_Notice_Template.xlsx",
    defaultTitle: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)",
    defaultSubTitle: "Local Government Engineering Department, Pabna (Lottery Result)",
    defaultPublishDate: "23-09-2026 11:46 AM",
    headers: [
      "#",
      "Tender Id",
      "Brief Description Of Works",
      "Location",
      "Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & Selling Date",
    ],
    columnWidths: [6, 14, 45, 22, 12, 22, 18, 22, 18, 26],
    sampleRows: [],
    defaultPayOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
    defaultMoreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086",
    defaultBottomWarning: "",
  },
};

/**
 * Creates an in-memory XLSX Workbook with 2 sheets (Tender Data & Footer Details)
 * matching the visual table design of the BTC Portal (Images 2 & 3).
 */
export function generateCategoryWorkbook(
  category: NoticeCategory,
  includeSampleRows: boolean = true,
): XLSX.WorkBook {
  const config = CATEGORY_TEMPLATE_CONFIGS[category] || CATEGORY_TEMPLATE_CONFIGS.OTM;
  const numCols = config.headers.length;

  const wb = XLSX.utils.book_new();

  // --------------------------------------------------------------------------
  // Sheet 1: Tender Data (Title, Subtitle, Publish Date, Headers, Data Rows)
  // --------------------------------------------------------------------------
  const tenderSheetData: (string | number)[][] = [];

  // Row 1 (Index 0): Notice Title (Centered, merged across all columns)
  const row1 = Array(numCols).fill("");
  row1[0] = config.defaultTitle;
  tenderSheetData.push(row1);

  // Row 2 (Index 1): Notice Sub-title (Centered, merged across all columns)
  const row2 = Array(numCols).fill("");
  row2[0] = config.defaultSubTitle;
  tenderSheetData.push(row2);

  // Row 3 (Index 2): Egp Published Date (Right-aligned badge)
  const row3 = Array(numCols).fill("");
  const publishColIdx = Math.max(0, numCols - 4);
  row3[publishColIdx] = `Egp Published Date : ${config.defaultPublishDate}`;
  tenderSheetData.push(row3);

  // Row 4 (Index 3): Column Headers
  tenderSheetData.push([...config.headers]);

  // Row 5+ (Index 4+): Data Rows
  if (includeSampleRows && config.sampleRows.length > 0) {
    config.sampleRows.forEach((r) => tenderSheetData.push([...r]));
  } else {
    // 1 Blank data row with pre-filled SL and Method
    const methodIdx = config.headers.findIndex((h) => h.toLowerCase().includes("method"));
    const blankRow = Array(numCols).fill("");
    blankRow[0] = "1"; // # SL
    if (methodIdx !== -1) blankRow[methodIdx] = config.category;
    tenderSheetData.push(blankRow);
  }

  const wsTenderData = XLSX.utils.aoa_to_sheet(tenderSheetData);

  // Configure cell merges for Row 1 (Title), Row 2 (Subtitle), Row 3 (Publish Date)
  wsTenderData["!merges"] = [
    // Row 1: Merged across all columns
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } },
    // Row 2: Merged across all columns
    { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } },
    // Row 3: Publish Date merged across rightmost columns
    { s: { r: 2, c: publishColIdx }, e: { r: 2, c: numCols - 1 } },
  ];

  // Configure column widths
  wsTenderData["!cols"] = config.columnWidths.map((w) => ({ wch: w }));

  // Append Sheet 1
  XLSX.utils.book_append_sheet(wb, wsTenderData, "Tender Data");

  // --------------------------------------------------------------------------
  // Sheet 2: Footer Details (Field Name, Field Value, Instructions)
  // --------------------------------------------------------------------------
  const footerDetailsData: (string | number)[][] = [
    ["Field Name", "Field Value", "Instructions"],
    ["Pay Order To", config.defaultPayOrderTo, "Pay Order issuance authority name and location"],
    [
      "Information / Notice Details",
      config.defaultMoreInfo,
      "Contact designation, telephone, address or tender instructions",
    ],
    [
      "Information / Bottom Warning",
      config.defaultBottomWarning,
      "Special tender conditions, eligibility, or bank guarantee notes",
    ],
  ];

  const wsFooterDetails = XLSX.utils.aoa_to_sheet(footerDetailsData);
  wsFooterDetails["!cols"] = [{ wch: 30 }, { wch: 65 }, { wch: 50 }];

  // Append Sheet 2
  XLSX.utils.book_append_sheet(wb, wsFooterDetails, "Footer Details");

  return wb;
}

/**
 * Generates workbook as ArrayBuffer / Buffer for direct download or file write.
 */
export function generateCategoryWorkbookBuffer(
  category: NoticeCategory,
  includeSampleRows: boolean = true,
): Uint8Array {
  const wb = generateCategoryWorkbook(category, includeSampleRows);
  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });
  return new Uint8Array(buffer);
}
