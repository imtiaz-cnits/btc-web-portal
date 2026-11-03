/**
 * BTC Web Portal - Category-Based Excel Notice Entry System Test Suite
 * Rigorous test coverage for:
 * 1. Template generation for OTM (12 columns) & LTM (10 columns) with 2 sheets.
 * 2. 2-Sheet parsing (Tender Data & Footer Details) with title, subtitle, and publish date extraction.
 * 3. Strict category mismatch rejection.
 * 4. Required field validation (Tender Id).
 * 5. Bengali Unicode text preservation.
 * 6. Currency formatting and text amounts (e.g. "44 Lac", "2.2 Cr", "5.46 Lac").
 * 7. Formula injection safety.
 * 8. NoticeForm adapter mapping (strips "#" to produce 11 cols for OTM, 9 cols for LTM).
 * 9. V3 Table Engine compatibility.
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import {
  generateCategoryWorkbook,
  generateCategoryWorkbookBuffer,
  CATEGORY_TEMPLATE_CONFIGS,
} from "../../lib/categoryExcelImport/templateGenerator";
import { parseCategoryNoticeWorkbook } from "../../lib/categoryExcelImport/parser";
import {
  adaptCategoryImportToNoticeForm,
  verifyTableSpecV3Compatibility,
} from "../../lib/categoryExcelImport/adapter";
import { serializeNoticeTableData, validateNoticeTableData, parseNoticeTableData } from "../../lib/tableEngine/normalizer";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✔ PASS: ${msg}`);
}

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("CATEGORY-BASED EXCEL NOTICE ENTRY SYSTEM TEST SUITE (OTM & LTM)");
  console.log("========================================================\n");

  const categories = ["OTM", "LTM"] as const;

  // --------------------------------------------------------------------------
  // Test 1: Official Template Generation & 2-Sheet Structure
  // --------------------------------------------------------------------------
  console.log("1. Template Generation & 2-Sheet Structure");
  for (const cat of categories) {
    const wb = generateCategoryWorkbook(cat, true);
    assert(wb.SheetNames.length === 2, `[${cat}] Workbook has exactly 2 sheets`);
    assert(wb.SheetNames[0] === "Tender Data", `[${cat}] Sheet 1 is "Tender Data"`);
    assert(wb.SheetNames[1] === "Footer Details", `[${cat}] Sheet 2 is "Footer Details"`);

    const expectedCols = cat === "OTM" ? 12 : 10;
    const wsTender = wb.Sheets["Tender Data"];
    const rows = XLSX.utils.sheet_to_json<string[]>(wsTender, { header: 1 });
    // Row 3 (Index 3) contains headers
    assert(rows[3].length === expectedCols, `[${cat}] Tender Data has ${expectedCols} columns (# + tender fields)`);
    assert(rows[3][0] === "#", `[${cat}] First column is "#" (SL)`);
    assert(rows[3][1] === "Tender Id", `[${cat}] Second column is "Tender Id"`);
  }

  // --------------------------------------------------------------------------
  // Test 2: Full Parse Roundtrip for OTM & LTM
  // --------------------------------------------------------------------------
  console.log("\n2. Parse Roundtrip for OTM & LTM");
  for (const cat of categories) {
    const buffer = generateCategoryWorkbookBuffer(cat, true);
    const parsed = parseCategoryNoticeWorkbook(buffer, cat, `BTC_${cat}_Notice_Template.xlsx`);

    assert(parsed.validation.isValid, `[${cat}] Parsing succeeds with isValid = true`);
    assert(parsed.validation.errors.length === 0, `[${cat}] Has 0 validation errors`);
    assert(parsed.noticeDetails.category === cat, `[${cat}] Notice category matches ${cat}`);
    assert(parsed.noticeDetails.title.length > 0, `[${cat}] Notice title extracted`);
    assert(parsed.noticeDetails.subTitle.length > 0, `[${cat}] Notice subtitle extracted`);
    assert(parsed.noticeDetails.publishDate.length > 0, `[${cat}] Publish Date extracted`);
    assert(parsed.tenderData.rows.length >= 1, `[${cat}] Tender rows extracted (${parsed.tenderData.rows.length} rows)`);
    assert(parsed.footerDetails.payOrderTo.length > 0, `[${cat}] Pay Order To extracted`);
    assert(parsed.footerDetails.moreInfo.length > 0, `[${cat}] Footer Information extracted`);
  }

  // --------------------------------------------------------------------------
  // Test 3: Strict Category Mismatch Rejection
  // --------------------------------------------------------------------------
  console.log("\n3. Strict Category Mismatch Rejection");
  {
    // Upload an OTM template when LTM was selected
    const otmBuffer = generateCategoryWorkbookBuffer("OTM", true);
    const mismatchResult = parseCategoryNoticeWorkbook(otmBuffer, "LTM", "BTC_OTM_Notice_Template.xlsx");

    assert(!mismatchResult.validation.isValid, "Mismatch result is marked invalid");
    assert(
      mismatchResult.validation.errors.some((e) => e.message.includes("Category mismatch")),
      "Category mismatch error reported when uploading OTM for LTM",
    );
  }

  // --------------------------------------------------------------------------
  // Test 4: Missing Required Fields Validation
  // --------------------------------------------------------------------------
  console.log("\n4. Missing Required Fields Validation");
  {
    const wb = generateCategoryWorkbook("LTM", false);
    // Add row without Tender ID
    const emptyRow = ["1", "", "Some work description", "Pabna", "LTM", "10,00,000", "5 Lac", "50,000", "1,000", "01-01-2027"];
    XLSX.utils.sheet_add_aoa(wb.Sheets["Tender Data"], [emptyRow], { origin: -1 });

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const parsed = parseCategoryNoticeWorkbook(buffer, "LTM", "invalid.xlsx");

    assert(!parsed.validation.isValid, "Reported invalid when Tender ID is missing");
    assert(
      parsed.validation.errors.some((e) => e.column === "Tender Id" || e.message.includes("Tender Id is required")),
      "Missing Tender ID error properly identified",
    );
  }

  // --------------------------------------------------------------------------
  // Test 5: Bengali Unicode Text Preservation
  // --------------------------------------------------------------------------
  console.log("\n5. Bengali Unicode Preservation");
  {
    const buffer = generateCategoryWorkbookBuffer("OTM", true);
    const parsed = parseCategoryNoticeWorkbook(buffer, "OTM");

    assert(
      parsed.noticeDetails.title.includes("পানি উন্নয়ন বোর্ড") || parsed.noticeDetails.title.includes("পাবনা"),
      "Bengali office name preserved in title",
    );
    assert(
      parsed.tenderData.rows.some((r) => r.some((c) => c.includes("Pabna") || c.includes("পাবনা"))),
      "Location text preserved in tender description",
    );
  }

  // --------------------------------------------------------------------------
  // Test 6: Currency Formatting & Text Representation
  // --------------------------------------------------------------------------
  console.log("\n6. Currency Formatting & Number Precision");
  {
    const wb = generateCategoryWorkbook("OTM", false);
    const testRow = [
      "1",
      "999888",
      "Bridge Construction",
      "Pabna",
      "OTM",
      "12345678", // unformatted number -> 1,23,45,678
      "44 Lac", // text currency -> preserved
      "2.2 Cr", // crore text -> preserved
      "25 Lac",
      "100000",
      "1500",
      "21-09-2026 05:00 PM",
    ];
    XLSX.utils.sheet_add_aoa(wb.Sheets["Tender Data"], [testRow], { origin: -1 });

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const parsed = parseCategoryNoticeWorkbook(buffer, "OTM");
    assert(parsed.validation.isValid, "Row with raw numeric values parsed successfully");

    const row = parsed.tenderData.rows[parsed.tenderData.rows.length - 1];
    assert(row[5] === "1,23,45,678", `App Cost formatted with Indian commas: ${row[5]}`);
    assert(row[6] === "44 Lac", `Bank credit line text preserved: ${row[6]}`);
    assert(row[7] === "2.2 Cr", `Crore text preserved: ${row[7]}`);
  }

  // --------------------------------------------------------------------------
  // Test 7: Formula Injection Protection
  // --------------------------------------------------------------------------
  console.log("\n7. Formula Injection Protection");
  {
    const wb = generateCategoryWorkbook("LTM", false);
    const maliciousRow = [
      "1",
      "112233",
      "=cmd|'/C calc'!A0",
      "Pabna",
      "LTM",
      "=SUM(A1:B10)",
      "10 Lac",
      "50,000",
      "1,000",
      "05-10-2026",
    ];
    XLSX.utils.sheet_add_aoa(wb.Sheets["Tender Data"], [maliciousRow], { origin: -1 });

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const parsed = parseCategoryNoticeWorkbook(buffer, "LTM");

    const row = parsed.tenderData.rows[parsed.tenderData.rows.length - 1];
    assert(!row[2].startsWith("="), "Formula trigger stripped from description");
    assert(!row[5].startsWith("="), "Formula trigger stripped from cost");
  }

  // --------------------------------------------------------------------------
  // Test 8: NoticeForm Adapter & V3 Serialization Compatibility
  // --------------------------------------------------------------------------
  console.log("\n8. NoticeForm Adapter & V3 Compatibility");
  for (const cat of categories) {
    const buffer = generateCategoryWorkbookBuffer(cat, true);
    const parsed = parseCategoryNoticeWorkbook(buffer, cat);
    const formUpdate = adaptCategoryImportToNoticeForm(parsed);

    assert(formUpdate.title === parsed.noticeDetails.title, `[${cat}] Form title matches notice details`);
    assert(formUpdate.category === cat, `[${cat}] Form category matches ${cat}`);
    assert(formUpdate.tablesList.length === 1, `[${cat}] Adapted to exactly 1 table spec`);

    const table = formUpdate.tablesList[0];
    const expectedHeadersCount = cat === "OTM" ? 11 : 9; // Stripped "#" for NoticeForm
    assert(
      table.headers.length === expectedHeadersCount,
      `[${cat}] Form table headers stripped "#" to match standard ${expectedHeadersCount} columns`,
    );
    assert(table.rows.length === parsed.tenderData.rows.length, `[${cat}] All tender rows mapped`);
    assert(table.rows[0].length === expectedHeadersCount, `[${cat}] Data row width matches stripped headers`);

    // Verify V3 serialization
    const v3TableSpec = verifyTableSpecV3Compatibility(parsed);
    const serializedJson = serializeNoticeTableData({
      version: "v3",
      tables: [v3TableSpec],
      sharedFooter: {
        payOrderTo: parsed.footerDetails.payOrderTo,
        moreInfo: parsed.footerDetails.moreInfo,
      },
    });

    assert(typeof serializedJson === "string" && serializedJson.length > 50, `[${cat}] Serialized to V3 JSON string`);
    const parsedBack = parseNoticeTableData(serializedJson);
    const validation = validateNoticeTableData(parsedBack);
    if (!validation.isValid) {
      console.log(`[${cat}] Validation errors:`, validation.errors);
    }
    assert(validation.isValid, `[${cat}] V3 Serialized output passes table engine validator`);
  }

  console.log("\n========================================================");
  console.log("✔ ALL CATEGORY EXCEL IMPORT TESTS PASSED SUCCESSFULLY");
  console.log("========================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
