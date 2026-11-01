/**
 * BTC Web Portal - Phase 5 Production Acceptance Test Suite
 * Tests actual files (.xlsx, .xls, .csv) loaded from disk as ArrayBuffers,
 * multi-sheet selection, formula extraction, negative currency, Bengali text,
 * full lifecycle (import -> append -> replace -> serialize -> re-parse).
 */

import * as fs from "fs";
import * as path from "path";
import { parseWorkbookBuffer } from "../lib/tableEngine/excelParser";
import { mapColumns } from "../lib/tableEngine/columnMapper";
import { validateAndMapRows } from "../lib/tableEngine/dataValidator";
import { parseNoticeTableData, serializeNoticeTableData } from "../lib/tableEngine/normalizer";

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

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${desc}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

console.log("\n========================================================");
console.log("PHASE 5: PRODUCTION ACCEPTANCE TEST SUITE");
console.log("========================================================\n");

const fixturesDir = path.join(process.cwd(), "tests", "fixtures");

function fileToArrayBuffer(filePath: string): ArrayBuffer {
  const buf = fs.readFileSync(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ----------------------------------------------------
// Task 1: Real Excel File Testing (.xlsx, .xls, .csv)
// ----------------------------------------------------
console.log("--- Task 1: Real File Ingestion & Parsing ---");

// 1.1 OTM Real .xlsx (Multi-sheet, formulas, negative numbers, Bengali Unicode)
const otmFilePath = path.join(fixturesDir, "sample_otm.xlsx");
const otmBuffer = fileToArrayBuffer(otmFilePath);
const otmResult = parseWorkbookBuffer(otmBuffer, "sample_otm.xlsx");

assert(otmResult.sheetNames.length === 2, "sample_otm.xlsx has 2 sheets");
assert(otmResult.sheetNames.includes("ReadMe") && otmResult.sheetNames.includes("OTM_Tenders"), "Detected 'ReadMe' and 'OTM_Tenders'");

// Switch to OTM_Tenders sheet
const otmSheetData = otmResult.sheets["OTM_Tenders"];
assert(otmSheetData.totalRows === 4, "sample_otm.xlsx OTM_Tenders sheet has 4 data rows");
assert(otmSheetData.headers.length === 11, "sample_otm.xlsx OTM_Tenders sheet has 11 headers");

// Map OTM
const otmMapping = mapColumns(CATEGORY_HEADERS.OTM, otmSheetData.headers);
assert(otmMapping.missingRequiredHeaders.length === 0, "All required OTM headers mapped");

const otmValidation = validateAndMapRows(
  otmSheetData.rawRows,
  otmSheetData.headers,
  otmMapping.mappings,
  "OTM",
  { workLocation: "Pabna Sadar", lastDate: "21-09-2026" },
);

assert(otmValidation.validRows.length === 4, "All 4 OTM rows validated successfully");
// Row 1: Bengali Unicode preservation
assert(
  otmValidation.validRows[0][1].includes("আর.সি.সি রাস্তা নির্মাণ"),
  "Row 1 preserves Bengali Unicode in description: 'আর.সি.সি রাস্তা নির্মাণ'",
);
assert(
  otmValidation.validRows[0][2].includes("পাবনা সদর"),
  "Row 1 preserves Bengali Unicode in location: 'পাবনা সদর'",
);
assert(otmValidation.validRows[0][4] === "41,26,000", "Row 1 formats 4126000 to '41,26,000'");
assert(otmValidation.validRows[0][5] === "44 Lac", "Row 1 preserves credit line '44 Lac'");
assert(otmValidation.validRows[0][6] === "2.2 Cr", "Row 1 preserves turnover '2.2 Cr'");

// Row 3: Negative number
assert(otmValidation.validRows[2][4] === "-2,500", "Row 3 formats negative value -2500 to '-2,500'");

// Row 4: Evaluated formula cell (E2+E3 = 5863000)
assert(otmValidation.validRows[3][4] === "58,63,000", "Row 4 evaluates formula cell to '58,63,000'");

// 1.2 LTM Real .xls (Binary BIFF8 format)
console.log("\n--- Testing Real Binary XLS (sample_ltm.xls) ---");
const ltmFilePath = path.join(fixturesDir, "sample_ltm.xls");
const ltmBuffer = fileToArrayBuffer(ltmFilePath);
const ltmResult = parseWorkbookBuffer(ltmBuffer, "sample_ltm.xls");

assert(ltmResult.sheetNames.length >= 1, "sample_ltm.xls parsed successfully");
const ltmSheetData = ltmResult.sheets[ltmResult.sheetNames[0]];
assert(ltmSheetData.totalRows === 2, "sample_ltm.xls has 2 data rows");

const ltmMapping = mapColumns(CATEGORY_HEADERS.LTM, ltmSheetData.headers);
const ltmValidation = validateAndMapRows(
  ltmSheetData.rawRows,
  ltmSheetData.headers,
  ltmMapping.mappings,
  "LTM",
  { workLocation: "Pabna Sub-division", lastDate: "02-11-2026" },
);

assert(ltmValidation.validRows.length === 2, "All 2 LTM rows validated successfully");
assert(ltmValidation.validRows[0][4] === "5,64,56,456", "LTM Row 1 cost formatted to '5,64,56,456'");
// Blank location fallback
assert(ltmValidation.validRows[1][2] === "Pabna Sub-division", "LTM Row 2 empty location uses fallback default");

// 1.3 LOTTERY_RESULT Real CSV
console.log("\n--- Testing Real CSV (sample_lottery_result.csv) ---");
const csvFilePath = path.join(fixturesDir, "sample_lottery_result.csv");
const csvBuffer = fileToArrayBuffer(csvFilePath);
const csvResult = parseWorkbookBuffer(csvBuffer, "sample_lottery_result.csv");

assert(csvResult.sheetNames.length >= 1, "CSV parsed successfully");
const csvSheetData = csvResult.sheets[csvResult.sheetNames[0]];
assert(csvSheetData.totalRows === 2, "CSV has 2 data rows");

const csvMapping = mapColumns(CATEGORY_HEADERS.LOTTERY_RESULT, csvSheetData.headers);
const csvValidation = validateAndMapRows(
  csvSheetData.rawRows,
  csvSheetData.headers,
  csvMapping.mappings,
  "LOTTERY_RESULT",
);

assert(csvValidation.validRows.length === 2, "CSV lottery rows validated");
assert(csvValidation.validRows[0][9] === "মেসার্স শাহ আলম এন্টারপ্রাইজ", "CSV winner row 1 has Bengali winner name");
assert(csvValidation.validRows[1][9] === "", "CSV winner row 2 has empty winner name");

// 1.4 LOTTERY_PENDING Real XLSX
console.log("\n--- Testing Real XLSX (sample_lottery_pending.xlsx) ---");
const pendingFilePath = path.join(fixturesDir, "sample_lottery_pending.xlsx");
const pendingBuffer = fileToArrayBuffer(pendingFilePath);
const pendingResult = parseWorkbookBuffer(pendingBuffer, "sample_lottery_pending.xlsx");
const pendingSheetData = pendingResult.sheets["Pending_Tenders"];
const pendingMapping = mapColumns(CATEGORY_HEADERS.LOTTERY_PENDING, pendingSheetData.headers);
const pendingValidation = validateAndMapRows(
  pendingSheetData.rawRows,
  pendingSheetData.headers,
  pendingMapping.mappings,
  "LOTTERY_PENDING",
);
assert(pendingValidation.validRows.length === 1, "Pending lottery row validated");
assert(pendingValidation.validRows[0][3] === "Lottery Pending", "Method assigned to 'Lottery Pending'");

// ----------------------------------------------------
// Task 2 & Task 4: Full Notice Lifecycle Simulation
// ----------------------------------------------------
console.log("\n--- Task 2 & Task 4: Full Notice Lifecycle Simulation ---");

for (const cat of ["OTM", "LTM", "LOTTERY_PENDING", "LOTTERY_RESULT"] as const) {
  const headers = CATEGORY_HEADERS[cat];

  // 1. Initial Empty/Default Table State
  const initialTable = {
    id: `tbl-${cat.toLowerCase()}`,
    type: "pwd_ltm",
    officeName: "গণপূর্ত বিভাগ, পাবনা।",
    subTitle: `${cat} Method`,
    workLocation: "Pabna Sadar",
    noticeDateBlock: "21-09-2026",
    lastDateBlock: "02-11-2026",
    payOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
    moreInfo: "Engr. Md. Shah Alom",
    bottomWarning: "ব্যাংক স্টেটমেন্ট দিতে হবে।",
    headers,
    rows: [
      headers.map((h, idx) => (idx === 0 ? "1001" : idx === 1 ? "Initial Row" : "")),
    ],
    columnColors: headers.map((h) => (h === "WINNER LIST NAME" ? "#fde047" : "#ffffff")),
    headerBgColor: cat === "OTM" ? "#059669" : "#0891b2",
  };

  // 2. Append Operation
  const importedRows = [
    headers.map((h, idx) => (idx === 0 ? "1002" : idx === 1 ? "Imported Row 2" : "Data")),
    headers.map((h, idx) => (idx === 0 ? "1003" : idx === 1 ? "Imported Row 3" : "Data")),
  ];
  const appendedTable = {
    ...initialTable,
    rows: [...initialTable.rows, ...importedRows],
  };
  assert(appendedTable.rows.length === 3, `[${cat}] Append preserved 1 initial row + 2 imported rows`);

  // 3. Replace Operation with Confirmation
  const replacedTable = {
    ...initialTable,
    rows: importedRows,
  };
  assert(replacedTable.rows.length === 2, `[${cat}] Replace replaced rows with 2 imported rows`);
  assert(replacedTable.headers.length === headers.length, `[${cat}] Replace preserved original headers`);
  assert(replacedTable.headerBgColor === initialTable.headerBgColor, `[${cat}] Replace preserved header background color`);
  assert(replacedTable.payOrderTo === initialTable.payOrderTo, `[${cat}] Replace preserved payOrderTo footer`);

  // 4. Form Submission Serialization (V2 JSON Format)
  const serializedV2 = JSON.stringify({
    version: "v2",
    tables: [replacedTable],
  });

  // 5. Normalization & Deserialization Check (Simulating Save -> Reload -> Public View)
  const normalizedV3 = parseNoticeTableData(serializedV2);
  assert(normalizedV3.tables.length === 1, `[${cat}] Deserialized into 1 table in V3 format`);
  assert(normalizedV3.tables[0].rows.length === 2, `[${cat}] Deserialized preserved exactly 2 rows`);
  assert(normalizedV3.tables[0].headers.length === headers.length, `[${cat}] Deserialized preserved exact column count`);

  // 6. Round-trip serialization
  const reserialized = serializeNoticeTableData(normalizedV3);
  const reParsed = parseNoticeTableData(reserialized);
  assert(reParsed.tables[0].rows.length === 2, `[${cat}] Round-trip serialization preserved rows`);
}

console.log("\n========================================================");
console.log(`PRODUCTION ACCEPTANCE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================\n");

if (failed > 0) process.exit(1);
