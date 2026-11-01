/**
 * BTC Web Portal - Table Engine Unit Test Suite
 * Tests V3 normalization, backward compatibility (V2, Legacy PWD, Legacy Standard),
 * column definitions, footer preservation, winner list detection, and input immutability.
 */

import {
  parseNoticeTableData,
  normalizeNoticeTableData,
  convertV2ToV3,
  convertLegacyToV3,
  serializeNoticeTableData,
  validateNoticeTableData,
  tableSpecToRowsArray,
  isWinnerRow,
} from "../lib/tableEngine/normalizer";
import { NoticeTableDataV2, LegacyPWDTable, LegacyStandardTable } from "../lib/tableEngine/types";

// Simple lightweight assertion runner
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passedCount++;
    console.log(`  ✔ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✖ FAIL: ${testName}`);
    if (details) console.error("    Details:", details);
  }
}

console.log("\n========================================================");
console.log("RUNNING TABLE ENGINE UNIT TESTS (PHASE 2)");
console.log("========================================================\n");

// ----------------------------------------------------------------------------
// Test 1: Empty / Null / Undefined tableData
// ----------------------------------------------------------------------------
console.log("Test Suite 1: Empty & Null Data Handling");
{
  const resNull = parseNoticeTableData(null);
  assert(resNull.version === "v3" && resNull.tables.length === 0, "null returns empty v3 structure");

  const resUndefined = parseNoticeTableData(undefined);
  assert(resUndefined.version === "v3" && resUndefined.tables.length === 0, "undefined returns empty v3 structure");

  const resEmptyStr = parseNoticeTableData("   ");
  assert(resEmptyStr.version === "v3" && resEmptyStr.tables.length === 0, "empty string returns empty v3 structure");
}

// ----------------------------------------------------------------------------
// Test 2: Malformed JSON handling
// ----------------------------------------------------------------------------
console.log("\nTest Suite 2: Malformed JSON Handling");
{
  const malformed = "{ this is definitely not valid json 1234 }";
  const res = parseNoticeTableData(malformed);
  assert(res.version === "v3" && res.tables.length === 0, "malformed JSON does not throw and returns empty v3");
  assert(!!res.metadata?.parseErrors && res.metadata.parseErrors.length > 0, "malformed JSON records error in metadata");
}

// ----------------------------------------------------------------------------
// Test 3: V2 Single-Table Data Normalization
// ----------------------------------------------------------------------------
console.log("\nTest Suite 3: V2 Single-Table Normalization");
{
  const v2Data: NoticeTableDataV2 = {
    version: "v2",
    tables: [
      {
        id: "tbl-init",
        type: "LTM",
        officeName: "জেলা পরিষদ, পাবনা",
        subTitle: "Zila Parishad, Pabna. e-Tender Notice (LTM Method)",
        workLocation: "Bera Pabna",
        noticeDateBlock: "20-08-2026 11:56 AM",
        lastDateBlock: "01-09-2026 05:00 PM",
        lotteryDateBlock: "05-09-2026 11:00 AM",
        payOrderTo: "MD. JAKIR HOSSAIN, Assistant Engineer",
        moreInfo: "Engr. Md. Shah Alom\n01711-805086",
        bottomWarning: "Bank statement not acceptable",
        headerBgColor: "#0891b2",
        headers: [
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
        rows: [
          [
            "1318237",
            "Mosque construction boundary wall",
            "Bera Pabna",
            "LTM",
            "12,00,000",
            "3,00,000",
            "30,000",
            "1,000",
            "01-09-2026 05:00 PM",
          ],
        ],
        columnColors: [
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
        ],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(v2Data);
  assert(v3.version === "v3", "normalized structure has version v3");
  assert(v3.tables.length === 1, "contains exactly 1 table");

  const t0 = v3.tables[0];
  assert(t0.id === "tbl-init", "table ID preserved");
  assert(t0.title === "জেলা পরিষদ, পাবনা", "officeName preserved as title");
  assert(t0.subtitle?.includes("LTM Method") || false, "subTitle preserved as subtitle");
  assert(t0.headers.length === 9, "all 9 headers converted to ColumnSpecV3");
  assert(t0.headers[0].fieldKey === "tender_id", "first column fieldKey is tender_id");
  assert(t0.headers[4].dataType === "currency", "APP Estimate Cost detected as currency");
  assert(t0.headers[8].dataType === "date", "Selling Date detected as date");

  // Check row mapping
  assert(t0.rows.length === 1, "has 1 row");
  const firstColId = t0.headers[0].id;
  assert(t0.rows[0][firstColId] === "1318237", "row value keyed by column ID");

  // Check footer preservation
  assert(t0.payOrderTo === "MD. JAKIR HOSSAIN, Assistant Engineer", "payOrderTo preserved on table");
  assert(v3.sharedFooter?.payOrderTo === "MD. JAKIR HOSSAIN, Assistant Engineer", "sharedFooter populated");
}

// ----------------------------------------------------------------------------
// Test 4: V2 Multi-Table Data Normalization
// ----------------------------------------------------------------------------
console.log("\nTest Suite 4: V2 Multi-Table Normalization");
{
  const v2Multi: NoticeTableDataV2 = {
    version: "v2",
    tables: [
      {
        id: "tbl_otm_1",
        type: "OTM",
        officeName: "RHD Pabna",
        headers: ["Tender ID", "Description", "Location"],
        rows: [["111", "Road repair", "Pabna"]],
        payOrderTo: "EE RHD",
      },
      {
        id: "tbl_ltm_2",
        type: "LTM",
        officeName: "LGED Pabna",
        headers: ["Tender ID", "Description", "Location"],
        rows: [["222", "Bridge paint", "Sujanagar"]],
        payOrderTo: "XEN LGED",
      },
    ],
  };

  const v3 = normalizeNoticeTableData(v2Multi);
  assert(v3.tables.length === 2, "normalizes all tables in multi-table notice");
  assert(v3.tables[0].title === "RHD Pabna", "first table title correct");
  assert(v3.tables[1].title === "LGED Pabna", "second table title correct");
  assert(v3.tables[0].order === 0 && v3.tables[1].order === 1, "order indices assigned sequentially");

  // Table-specific footer values must be preserved independently
  assert(v3.tables[0].payOrderTo === "EE RHD", "table 1 payOrderTo preserved independently");
  assert(v3.tables[1].payOrderTo === "XEN LGED", "table 2 payOrderTo preserved independently");
  assert(v3.sharedFooter === undefined, "different footers are not merged into sharedFooter");
}

// ----------------------------------------------------------------------------
// Test 5: Custom Columns & Column Colors Preservation
// ----------------------------------------------------------------------------
console.log("\nTest Suite 5: Custom Columns & Colors");
{
  const v2Custom = {
    version: "v2",
    tables: [
      {
        id: "tbl_custom",
        type: "CUSTOM",
        headers: ["Serial No", "Special Requirement", "Approval Date"],
        columnColors: ["#ffffff", "#fef08a", "#bae6fd"],
        rows: [["1", "ISO 9001 Required", "15-10-2026"]],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(v2Custom);
  const t = v3.tables[0];
  assert(t.headers.length === 3, "custom columns preserved");
  assert(t.headers[1].backgroundColor === "#fef08a", "custom column color preserved in ColumnSpecV3");
  assert(t.headers[2].backgroundColor === "#bae6fd", "column 2 color preserved");
}

// ----------------------------------------------------------------------------
// Test 6: Legacy PWD Template Format Normalization
// ----------------------------------------------------------------------------
console.log("\nTest Suite 6: Legacy PWD Template Format");
{
  const legacyPwd: LegacyPWDTable = {
    isPwdTemplate: true,
    officeName: "গণপূর্ত বিভাগ",
    noticeDateBlock: "10-05-2025",
    payOrderTo: "Executive Engineer",
    rows: [
      {
        tenderId: "998877",
        description: "Renovation of Circuit House",
        location: "Pabna Sadar",
        appCost: "5,00,000",
        solvency: "1,00,000",
        security: "12,500",
        docFees: "1,000",
        lastDateTime: "25-05-2025 05:00 PM",
      },
    ],
  };

  const v3 = normalizeNoticeTableData(legacyPwd);
  assert(v3.version === "v3", "legacy PWD normalizes to v3");
  assert(v3.tables.length === 1, "creates 1 table from legacy PWD");
  const t = v3.tables[0];
  assert(t.title === "গণপূর্ত বিভাগ", "title mapped from officeName");
  assert(t.headers.length >= 8, "generates standard PWD columns");

  const tenderCol = t.headers.find((c) => c.fieldKey === "tender_id");
  assert(!!tenderCol, "found tender_id column in converted legacy PWD");
  if (tenderCol) {
    assert(t.rows[0][tenderCol.id] === "998877", "mapped object field tenderId into column ID");
  }
}

// ----------------------------------------------------------------------------
// Test 7: Legacy Standard Format Normalization
// ----------------------------------------------------------------------------
console.log("\nTest Suite 7: Legacy Standard Format");
{
  const legacyStd: LegacyStandardTable = {
    headers: ["Col A", "Col B"],
    rows: [["Alpha", "Beta"]],
    officeName: "General Notice",
  };

  const v3 = normalizeNoticeTableData(legacyStd);
  assert(v3.tables.length === 1, "creates 1 table from legacy standard");
  const t = v3.tables[0];
  assert(t.title === "General Notice", "officeName preserved");
  assert(t.headers[0].header === "Col A" && t.headers[1].header === "Col B", "headers preserved");
}

// ----------------------------------------------------------------------------
// Test 8: Unicode Bengali Text & Bijoy Preservation
// ----------------------------------------------------------------------------
console.log("\nTest Suite 8: Bengali Unicode & Text Preservation");
{
  const bengaliNotice = {
    version: "v2",
    tables: [
      {
        id: "bengali_tbl",
        officeName: "বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (বিএডিসি)",
        subTitle: "কৃষি ভবন, ঢাকা (ওটিএম পদ্ধতি)",
        headers: ["দরপত্র আইডি", "কাজের বিবরণ", "কাজের এলাকা"],
        rows: [["১৩২৬১৭৭", "অভ্যন্তরীণ আরসিসি রাস্তা নির্মাণ", "প্রকল্প এলাকা"]],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(bengaliNotice);
  const t = v3.tables[0];
  assert(t.title === "বাংলাদেশ কৃষি উন্নয়ন কর্পোরেশন (বিএডিসি)", "complex Bengali Unicode title preserved");
  assert(t.headers[0].header === "দরপত্র আইডি", "Bengali header preserved");
  const col0Id = t.headers[0].id;
  assert(t.rows[0][col0Id] === "১৩২৬১৭৭", "Bengali number cell value preserved");
}

// ----------------------------------------------------------------------------
// Test 9: Missing & Extra Cells Handling (Zero Data Loss)
// ----------------------------------------------------------------------------
console.log("\nTest Suite 9: Missing & Extra Cells Handling");
{
  const unbalancedData = {
    version: "v2",
    tables: [
      {
        id: "unbalanced",
        headers: ["Col 1", "Col 2"],
        rows: [
          ["Val 1"], // Missing Col 2
          ["Val 1", "Val 2", "SURPRISE EXTRA DATA 1", "SURPRISE EXTRA DATA 2"], // 2 extra cells
        ],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(unbalancedData);
  const t = v3.tables[0];
  assert(t.headers.length === 4, "dynamically added 2 extra column specs to prevent data loss");
  const col3Id = t.headers[2].id;
  const col4Id = t.headers[3].id;
  assert(t.rows[1][col3Id] === "SURPRISE EXTRA DATA 1", "extra cell 1 preserved");
  assert(t.rows[1][col4Id] === "SURPRISE EXTRA DATA 2", "extra cell 2 preserved");

  const col2Id = t.headers[1].id;
  assert(t.rows[0][col2Id] === "", "missing cell gracefully defaulted to empty string");
}

// ----------------------------------------------------------------------------
// Test 10: Winner List Name Detection & Highlighting Compatibility
// ----------------------------------------------------------------------------
console.log("\nTest Suite 10: Winner List Compatibility");
{
  const winnerData = {
    version: "v2",
    tables: [
      {
        id: "lottery_res",
        headers: ["Tender ID", "Description", "WINNER LIST NAME"],
        rows: [
          ["1001", "Work 1", "M/S Shanto Builders"], // Winning row
          ["1002", "Work 2", ""],                    // Non-winning row
        ],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(winnerData);
  const t = v3.tables[0];
  const winnerCol = t.headers.find((h) => h.fieldKey === "winner_list_name");
  assert(!!winnerCol, "detected WINNER LIST NAME column");
  assert(winnerCol?.backgroundColor === "#fde047", "winner column has default yellow background #fde047");

  assert(isWinnerRow(t.rows[0], t.headers) === true, "row 1 correctly identified as winning row");
  assert(isWinnerRow(t.rows[1], t.headers) === false, "row 2 correctly identified as non-winning row");
}

// ----------------------------------------------------------------------------
// Test 11: Adapter Output (tableSpecToRowsArray)
// ----------------------------------------------------------------------------
console.log("\nTest Suite 11: Interoperability Adapter (tableSpecToRowsArray)");
{
  const v3Table = {
    version: "v3",
    tables: [
      {
        id: "tbl_adapter",
        order: 0,
        headers: [
          { id: "col_1", header: "ID", visible: true },
          { id: "col_2", header: "Hidden", visible: false },
          { id: "col_3", header: "Name", visible: true, backgroundColor: "#00ff00" },
        ],
        rows: [
          { col_1: "101", col_2: "Secret", col_3: "Alice" },
          { col_1: "102", col_2: "Secret", col_3: "Bob" },
        ],
      },
    ],
  };

  const v3 = normalizeNoticeTableData(v3Table);
  const adapterOut = tableSpecToRowsArray(v3.tables[0]);

  assert(adapterOut.headers.length === 2, "filters out hidden column from headers array");
  assert(adapterOut.headers[0] === "ID" && adapterOut.headers[1] === "Name", "visible headers match");
  assert(adapterOut.rows.length === 2, "rows array has 2 rows");
  assert(adapterOut.rows[0][0] === "101" && adapterOut.rows[0][1] === "Alice", "row cell values correctly ordered");
  assert(adapterOut.columnColors[1] === "#00ff00", "column colors matched correctly");
}

// ----------------------------------------------------------------------------
// Test 12: Input Object Immutability Verification
// ----------------------------------------------------------------------------
console.log("\nTest Suite 12: Input Object Immutability");
{
  const originalInput: any = {
    version: "v2",
    tables: [
      {
        id: "orig_tbl",
        headers: ["Col A", "Col B"],
        rows: [["Val A", "Val B"]],
      },
    ],
  };

  const inputSnapshot = JSON.stringify(originalInput);
  const normalized = normalizeNoticeTableData(originalInput);

  // Modify normalized output
  normalized.tables[0].title = "MUTATED TITLE";
  normalized.tables[0].headers.push({ id: "col_new", header: "New" });

  assert(JSON.stringify(originalInput) === inputSnapshot, "original input object was completely untouched");
}

// ----------------------------------------------------------------------------
// Test 13: Serialization & Validation Round-Trip
// ----------------------------------------------------------------------------
console.log("\nTest Suite 13: Serialization & Validation Round-Trip");
{
  const v3Data = normalizeNoticeTableData({
    version: "v2",
    tables: [
      {
        id: "round_trip_tbl",
        officeName: "Test Office",
        headers: ["Tender ID", "Description"],
        rows: [["12345", "Test Description"]],
      },
    ],
  });

  const validation = validateNoticeTableData(v3Data);
  assert(validation.isValid === true, "normalized v3 passes validateNoticeTableData");

  const serialized = serializeNoticeTableData(v3Data);
  assert(typeof serialized === "string" && serialized.includes('"version":"v3"'), "serialized string contains version v3");

  const reParsed = parseNoticeTableData(serialized);
  assert(reParsed.tables.length === 1 && reParsed.tables[0].title === "Test Office", "re-parsed JSON restores identical structure");
}

// ----------------------------------------------------------------------------
// Summary Report
// ----------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("========================================================\n");

if (failedCount > 0) {
  process.exit(1);
}

