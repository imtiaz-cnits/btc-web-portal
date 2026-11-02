/**
 * BTC Web Portal - Phase 6 Official Excel Templates Verification Test Suite
 *
 * Verifies that:
 * 1. All 8 official templates (blank & sample for OTM, LTM, LOTTERY_PENDING, LOTTERY_RESULT) exist.
 * 2. Header text, column counts, and column orders match NoticeForm.tsx HEADERS_MAP 100%.
 * 3. Blank templates contain valid headers and zero rows.
 * 4. Sample templates contain valid headers and realistic data rows.
 * 5. Ingestion pipeline accepts all rows without data loss.
 * 6. Bengali Unicode, currency formatting, date normalization, and winner highlighting are preserved.
 * 7. Serialization produces valid V3 format with 0 validation errors.
 */

import * as fs from "fs";
import * as path from "path";
import { parseWorkbookBuffer } from "../lib/tableEngine/excelParser";
import { mapColumns } from "../lib/tableEngine/columnMapper";
import { validateAndMapRows } from "../lib/tableEngine/dataValidator";
import {
  parseNoticeTableData,
  serializeNoticeTableData,
  tableSpecToRowsArray,
  rowsArrayToTableSpec,
  validateNoticeTableData,
  isWinnerRow,
} from "../lib/tableEngine/normalizer";

const EXPECTED_HEADERS: Record<string, string[]> = {
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
};

function fileToArrayBuffer(filePath: string): ArrayBuffer {
  const buf = fs.readFileSync(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTemplateVerificationTests() {
  console.log("========================================================");
  console.log("PHASE 6: EXCEL TEMPLATES QUALITY ASSURANCE & VERIFICATION");
  console.log("========================================================\n");

  let testCount = 0;
  const templateDirs = [
    path.join(process.cwd(), "public", "templates"),
    path.join(process.cwd(), "docs", "templates"),
  ];

  // 1. Verify existence of all 8 templates in both locations
  console.log("--- 1. Template Existence in Public and Docs Directories ---");
  for (const dir of templateDirs) {
    const dirName = path.basename(path.dirname(dir)) + "/" + path.basename(dir);
    console.log(`Checking directory: ${dirName}`);

    const files = [
      "otm_template_blank.xlsx",
      "otm_template_sample.xlsx",
      "ltm_template_blank.xlsx",
      "ltm_template_sample.xlsx",
      "lottery_pending_template_blank.xlsx",
      "lottery_pending_template_sample.xlsx",
      "lottery_result_template_blank.xlsx",
      "lottery_result_template_sample.xlsx",
    ];

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      assert(fs.existsSync(fullPath), `File exists: ${dirName}/${file}`); testCount++;
      const stats = fs.statSync(fullPath);
      assert(stats.size > 1000, `File has valid size (>1KB): ${file} (${stats.size} bytes)`); testCount++;
    });
  }

  // 2. Verify Blank Templates Structure & Headers
  console.log("\n--- 2. Blank Templates Structure & Header Precision ---");
  const categories: Array<"OTM" | "LTM" | "LOTTERY_PENDING" | "LOTTERY_RESULT"> = [
    "OTM",
    "LTM",
    "LOTTERY_PENDING",
    "LOTTERY_RESULT",
  ];

  for (const cat of categories) {
    const fileName = `${cat.toLowerCase()}_template_blank.xlsx`;
    const filePath = path.join(process.cwd(), "public", "templates", fileName);
    const arrayBuf = fileToArrayBuffer(filePath);
    const parsedWb = parseWorkbookBuffer(arrayBuf, fileName);

    const sheetName = parsedWb.sheetNames[0];
    const sheet = parsedWb.sheets[sheetName];
    const expected = EXPECTED_HEADERS[cat];

    assert(sheet.headers.length === expected.length, `[Blank ${cat}] Exactly ${expected.length} columns`); testCount++;
    assert(sheet.totalRows === 0, `[Blank ${cat}] Has exactly 0 data rows`); testCount++;

    // Strict 1:1 match of headers
    expected.forEach((expHdr, idx) => {
      assert(sheet.headers[idx] === expHdr, `[Blank ${cat}] Col ${idx} header matches: '${expHdr}'`); testCount++;
    });

    // Auto-map validation
    const mapping = mapColumns(expected, sheet.headers);
    assert(mapping.missingRequiredHeaders.length === 0, `[Blank ${cat}] Zero missing required headers`); testCount++;
  }

  // 3. Verify Sample Templates Data & Ingestion
  console.log("\n--- 3. Sample Templates Ingestion & Validation Pipeline ---");
  for (const cat of categories) {
    const fileName = `${cat.toLowerCase()}_template_sample.xlsx`;
    const filePath = path.join(process.cwd(), "public", "templates", fileName);
    const arrayBuf = fileToArrayBuffer(filePath);
    const parsedWb = parseWorkbookBuffer(arrayBuf, fileName);

    const sheetName = parsedWb.sheetNames[0];
    const sheet = parsedWb.sheets[sheetName];
    const expected = EXPECTED_HEADERS[cat];

    assert(sheet.headers.length === expected.length, `[Sample ${cat}] Exactly ${expected.length} columns`); testCount++;
    assert(sheet.totalRows === 5, `[Sample ${cat}] Contains exactly 5 realistic sample rows`); testCount++;

    const mapping = mapColumns(expected, sheet.headers);
    assert(mapping.missingRequiredHeaders.length === 0, `[Sample ${cat}] All columns mapped`); testCount++;

    const validation = validateAndMapRows(
      sheet.rawRows,
      sheet.headers,
      mapping.mappings,
      cat,
      { workLocation: "Pabna", lastDate: "25-09-2026" }
    );

    assert(validation.validRows.length === 5, `[Sample ${cat}] All 5 sample rows valid and accepted`); testCount++;
    assert(validation.errors.length === 0, `[Sample ${cat}] 0 row validation errors`); testCount++;

    // Convert to TableSpecV3
    const v3Table = rowsArrayToTableSpec({
      id: `tbl-${cat.toLowerCase()}-tmpl`,
      order: 0,
      tableTitle: `গণপূর্ত বিভাগ, পাবনা (${cat})`,
      officeName: `গণপূর্ত বিভাগ, পাবনা (${cat})`,
      headers: expected,
      rows: validation.validRows,
      category: cat,
    });

    const v3Payload = { version: "v3" as const, tables: [v3Table] };
    const schemaValidation = validateNoticeTableData(v3Payload);
    assert(schemaValidation.isValid, `[Sample ${cat}] Passes validateNoticeTableData with 0 errors`); testCount++;

    const serialized = serializeNoticeTableData(v3Payload);
    const reloaded = parseNoticeTableData(serialized);
    assert(reloaded.version === "v3", `[Sample ${cat}] Reloaded version is V3`); testCount++;

    const unpacked = tableSpecToRowsArray(reloaded.tables[0]);
    assert(unpacked.rows.length === 5, `[Sample ${cat}] tableSpecToRowsArray unpacked 5 rows`); testCount++;
    assert(unpacked.headers.length === expected.length, `[Sample ${cat}] All ${expected.length} headers unpacked`); testCount++;

    // Specific Category Invariant Assertions
    if (cat === "OTM") {
      assert(unpacked.rows[0][0] === "1326177", "[Sample OTM] Row 0 Tender ID: 1326177"); testCount++;
      assert(unpacked.rows[0][1].includes("আর.সি.সি রাস্তা নির্মাণ"), "[Sample OTM] Bengali text: আর.সি.সি রাস্তা নির্মাণ"); testCount++;
      assert(unpacked.rows[0][4] === "41,26,000", "[Sample OTM] Cost formatted: 41,26,000"); testCount++;
      assert(unpacked.rows[0][5] === "44 Lac", "[Sample OTM] Credit line: 44 Lac"); testCount++;
      assert(unpacked.rows[0][6] === "2.2 Cr", "[Sample OTM] Turnover: 2.2 Cr"); testCount++;
    }

    if (cat === "LTM") {
      assert(unpacked.rows[0][0] === "1428010", "[Sample LTM] Row 0 Tender ID: 1428010"); testCount++;
      assert(unpacked.rows[0][1].includes("আরএইচডি ভবন সংস্কার"), "[Sample LTM] Bengali text: আরএইচডি ভবন সংস্কার"); testCount++;
      assert(unpacked.rows[0][4] === "15,50,000", "[Sample LTM] Cost formatted: 15,50,000"); testCount++;
    }

    if (cat === "LOTTERY_PENDING") {
      assert(unpacked.rows[0][0] === "1529011", "[Sample Pending] Row 0 Tender ID: 1529011"); testCount++;
      assert(unpacked.rows[0][3] === "Lottery Pending", "[Sample Pending] Method auto-assigned: Lottery Pending"); testCount++;
    }

    if (cat === "LOTTERY_RESULT") {
      const winnerColIdx = expected.findIndex((h) => h.includes("WINNER"));
      assert(winnerColIdx === 9, "[Sample Result] WINNER LIST NAME is Column 9"); testCount++;
      assert(unpacked.rows[0][9] === "মেসার্স শাহ আলম এন্টারপ্রাইজ", "[Sample Result] Row 0 Winner: মেসার্স শাহ আলম এন্টারপ্রাইজ"); testCount++;
      assert(unpacked.rows[1][9] === "মেসার্স কবির কন্সট্রাকশন", "[Sample Result] Row 1 Winner: মেসার্স কবির কন্সট্রাকশন"); testCount++;
      assert(unpacked.rows[2][9] === "", "[Sample Result] Row 2 Non-winner is blank"); testCount++;
      assert(unpacked.rows[3][9] === "মেসার্স প্রগতি বিল্ডার্স", "[Sample Result] Row 3 Winner: মেসার্স প্রগতি বিল্ডার্স"); testCount++;
      assert(unpacked.rows[4][9] === "", "[Sample Result] Row 4 Non-winner is blank"); testCount++;

      // Verify isWinnerRow helper
      const row0Obj = reloaded.tables[0].rows[0];
      const row2Obj = reloaded.tables[0].rows[2];
      assert(isWinnerRow(row0Obj, reloaded.tables[0].headers) === true, "[Sample Result] Winner helper detects row 0 as winning"); testCount++;
      assert(isWinnerRow(row2Obj, reloaded.tables[0].headers) === false, "[Sample Result] Winner helper detects row 2 as non-winning"); testCount++;
    }
  }

  console.log("\n========================================================");
  console.log(`TEMPLATE VERIFICATION SUMMARY: ${testCount} PASSED, 0 FAILED`);
  console.log("========================================================\n");
}

runTemplateVerificationTests().catch((err) => {
  console.error("FATAL TEMPLATE VERIFICATION FAILURE:", err);
  process.exit(1);
});

