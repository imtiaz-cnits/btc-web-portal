/**
 * BTC Web Portal - Excel Import System Unit Tests
 * Tests Excel parsing, clipboard TSV parsing, category column mapping,
 * Bangladeshi currency formatting, date normalization, and row validation.
 */

import * as XLSX from "xlsx";
import {
  parseWorkbookBuffer,
  parseClipboardText,
  MAX_ROW_LIMIT,
  MAX_FILE_SIZE_BYTES,
} from "../lib/tableEngine/excelParser";
import { mapColumns } from "../lib/tableEngine/columnMapper";
import {
  validateAndMapRows,
  formatCurrencyBD,
  normalizeDateToDmy,
} from "../lib/tableEngine/dataValidator";

const CATEGORY_HEADERS = {
  LTM: [
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date",
  ],
  LOTTERY_PENDING: [
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date",
  ],
  LOTTERY_RESULT: [
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date",
    "WINNER LIST NAME",
  ],
  OTM: [
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "TURN OVER 05 Years",
    "Similar Work 05 Years",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date",
  ],
};

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAILED: ${testName}`);
  }
}

console.log("\n========================================================");
console.log("RUNNING EXCEL IMPORT ENGINE TEST SUITE");
console.log("========================================================\n");

// ----------------------------------------------------
// 1. Workbook Parsing Tests
// ----------------------------------------------------
console.log("1. Workbook Parsing Tests (.xlsx / .csv)");

// Create a dummy XLSX buffer in memory using SheetJS
const sampleData = [
  ["Tender ID", "Work Description", "Location", "Estimated Cost", "Security", "Doc Price", "Last Date"],
  ["1326177", "Construction of R.C.C road-17", "Pabna Sadar", "4126000", "100000", "1500", "21-09-2026 05:00 PM"],
  ["1326180", "Construction of R.C.C road-18", "Sujanagar", "1737000", "45000", "1000", "21-09-2026 05:00 PM"],
];
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(sampleData);
XLSX.utils.book_append_sheet(wb, ws, "Tenders");
const xlsxBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

const parsedWb = parseWorkbookBuffer(xlsxBuffer, "test.xlsx");
assert(parsedWb.sheetNames.length === 1, "Detects worksheet count");
assert(parsedWb.sheetNames[0] === "Tenders", "Detects worksheet name");
assert(parsedWb.sheets["Tenders"].headers.length === 7, "Extracts 7 headers");
assert(parsedWb.sheets["Tenders"].rawRows.length === 2, "Extracts 2 data rows");
assert(parsedWb.sheets["Tenders"].rawRows[0][0] === "1326177", "Extracts tender ID in row 1");

// Test file size limit error
const largeBuffer = new ArrayBuffer(MAX_FILE_SIZE_BYTES + 1024);
const largeParsed = parseWorkbookBuffer(largeBuffer, "huge.xlsx");
assert(!!largeParsed.error && largeParsed.error.includes("limit"), "Enforces 10 MB file size limit");

// ----------------------------------------------------
// 2. Clipboard TSV Parsing Tests (Direct Ctrl + V)
// ----------------------------------------------------
console.log("\n2. Clipboard Parsing Tests (Direct Ctrl + V / TSV)");

const tsvWithHeaders = `Tender ID\tDescription\tLocation\tEstimated Cost
1326631\tConstruction of R.C.C road-19\tChatmohar\t21,71,000
1326643\tConstruction of R.C.C road-20\tIshwardi\t26,05,000`;

const parsedClipboard1 = parseClipboardText(tsvWithHeaders);
assert(parsedClipboard1.headers.length === 4, "Clipboard detects 4 headers");
assert(parsedClipboard1.rawRows.length === 2, "Clipboard extracts 2 rows");
assert(parsedClipboard1.rawRows[1][0] === "1326643", "Clipboard extracts row 2 tender ID");

// Clipboard without headers (raw data only)
const tsvWithoutHeaders = `1328010\tConstruction of R.C.C road-22\tBera\t15,30,000
1328167\tConstruction of R.C.C road-23\tAtgharia\t21,71,000`;
const parsedClipboard2 = parseClipboardText(tsvWithoutHeaders);
assert(parsedClipboard2.headers.length === 4, "Auto-generates generic headers for headerless paste");
assert(parsedClipboard2.rawRows.length === 2, "Extracts all rows without dropping first row");

// Empty clipboard
const emptyClipboard = parseClipboardText("   \n\n  ");
assert(emptyClipboard.rawRows.length === 0, "Handles empty clipboard safely");

// ----------------------------------------------------
// 3. Category Column Mapping Tests
// ----------------------------------------------------
console.log("\n3. Category Column Mapping Tests");

const excelHeaders = [
  "Tender ID",
  "Description of Work",
  "Site Location",
  "Estimated Amount",
  "Bank Solvency",
  "Tender Security",
  "Doc Fee",
  "Submission Deadline",
];

const ltmMapping = mapColumns(CATEGORY_HEADERS.LTM, excelHeaders);
assert(ltmMapping.mappings.length === CATEGORY_HEADERS.LTM.length, "Generates mapping for all LTM columns");

const tenderIdMap = ltmMapping.mappings.find((m) => m.destinationHeader === "Tender Id");
assert(tenderIdMap?.sourceHeader === "Tender ID" && tenderIdMap?.isAutoMatched, "Maps 'Tender ID' to 'Tender Id'");

const descMap = ltmMapping.mappings.find((m) => m.destinationHeader === "Brief Description of Works");
assert(descMap?.sourceHeader === "Description of Work" && descMap?.isAutoMatched, "Maps 'Description of Work' via alias");

const costMap = ltmMapping.mappings.find((m) => m.destinationHeader === "APP Estimate Cost Tk.");
assert(costMap?.sourceHeader === "Estimated Amount" && costMap?.isAutoMatched, "Maps 'Estimated Amount' to 'APP Estimate Cost Tk.'");

// OTM mapping with 5-year experience columns
const otmExcelHeaders = [
  "Tender Id",
  "Brief Description of Works",
  "Work Location",
  "Turnover 05 Years",
  "Similar Experience",
];
const otmMapping = mapColumns(CATEGORY_HEADERS.OTM, otmExcelHeaders);
const turnoverMap = otmMapping.mappings.find((m) => m.destinationHeader === "TURN OVER 05 Years");
assert(turnoverMap?.sourceHeader === "Turnover 05 Years" && turnoverMap?.isAutoMatched, "Maps 'Turnover 05 Years' in OTM");

const similarMap = otmMapping.mappings.find((m) => m.destinationHeader === "Similar Work 05 Years");
assert(similarMap?.sourceHeader === "Similar Experience" && similarMap?.isAutoMatched, "Maps 'Similar Experience' to 'Similar Work 05 Years'");

// Lottery Result Winner Column Mapping
const lotteryResultHeaders = ["Tender Id", "Work Description", "Selected Bidder"];
const lotteryMapping = mapColumns(CATEGORY_HEADERS.LOTTERY_RESULT, lotteryResultHeaders);
const winnerMap = lotteryMapping.mappings.find((m) => m.destinationHeader === "WINNER LIST NAME");
assert(winnerMap?.sourceHeader === "Selected Bidder" && winnerMap?.isAutoMatched, "Maps 'Selected Bidder' to 'WINNER LIST NAME'");

// ----------------------------------------------------
// 4. Data Validation and Bangladeshi Currency Formatting Tests
// ----------------------------------------------------
console.log("\n4. Data Validation & Currency Formatting Tests");

assert(formatCurrencyBD("4126000") === "41,26,000", "Formats '4126000' to '41,26,000'");
assert(formatCurrencyBD("1737000") === "17,37,000", "Formats '1737000' to '17,37,000'");
assert(formatCurrencyBD("22000000") === "2,20,00,000", "Formats 2.2 Crore to '2,20,00,000'");
assert(formatCurrencyBD("44 Lac") === "44 Lac", "Preserves text amounts like '44 Lac'");
assert(formatCurrencyBD("1.25 Cr") === "1.25 Cr", "Preserves text amounts like '1.25 Cr'");

// Date normalization
assert(normalizeDateToDmy("2026-09-21") === "21-09-2026", "Normalizes YYYY-MM-DD to DD-MM-YYYY");
assert(normalizeDateToDmy("2026-09-21 05:00 PM") === "21-09-2026 05:00 PM", "Preserves time in date normalization");

// ----------------------------------------------------
// 5. Full Validation & Row Ingestion Pipeline Tests
// ----------------------------------------------------
console.log("\n5. Ingestion Pipeline & Auto-Assignment Tests");

const testRawRows = [
  ["1326177", "Road repair work", "Pabna", "4126000", "44 Lac", "100000", "1500", "2026-09-21"],
  ["1326180", "Bridge repair work", "Pabna", "1737000", "20 Lac", "45000", "1000", "2026-09-21"],
  ["", "Empty tender ID row", "Pabna", "100000", "10 Lac", "10000", "500", "2026-09-21"], // Invalid row
];
const testSourceHeaders = [
  "Tender ID",
  "Description of Work",
  "Location",
  "Estimated Amount",
  "Bank Solvency",
  "Tender Security",
  "Doc Fee",
  "Submission Deadline",
];

const mappedLtm = mapColumns(CATEGORY_HEADERS.LTM, testSourceHeaders);
const validation = validateAndMapRows(
  testRawRows,
  testSourceHeaders,
  mappedLtm.mappings,
  "LTM",
  { workLocation: "Pabna Sadar", lastDate: "21-09-2026" },
);

assert(validation.validRows.length === 2, "Accepts 2 valid rows, rejects 1 invalid row");
assert(validation.errors.length === 1, "Reports missing required Tender ID on invalid row");
assert(validation.validRows[0][3] === "LTM", "Auto-populates Type of Method as 'LTM'");
assert(validation.validRows[0][4] === "41,26,000", "Applies currency comma formatting to cost");
assert(validation.validRows[0][0] === "1326177", "Preserves valid tender ID");

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n========================================================");
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("========================================================\n");

if (failedCount > 0) {
  process.exit(1);
}

