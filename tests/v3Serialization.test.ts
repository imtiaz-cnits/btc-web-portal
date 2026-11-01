/**
 * BTC Web Portal - V3 Serialization & Multi-Version Lifecycle Test Suite (Phase 5.1)
 *
 * Verifies the 4 independent serialization scenarios:
 * Scenario A: Create completely new notice -> Import Excel data -> Save -> Serializes strictly as V3.
 * Scenario B: Edit existing V2 notice -> Load -> Import Excel -> Save -> Upgraded to V3.
 * Scenario C: Edit Legacy notice (PWD & Standard) -> Load -> Import Excel -> Save -> Normalized to V3.
 * Scenario D: Edit existing V3 notice -> Load -> Import Excel -> Save -> Preserves V3 structure & metadata.
 */

import {
  parseNoticeTableData,
  serializeNoticeTableData,
  tableSpecToRowsArray,
  rowsArrayToTableSpec,
  validateNoticeTableData,
} from "../lib/tableEngine/normalizer";
import { NoticeTableDataV3 } from "../lib/tableEngine/types";
import { validateAndMapRows } from "../lib/tableEngine/dataValidator";
import { mapColumns } from "../lib/tableEngine/columnMapper";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runV3SerializationTests() {
  console.log("========================================================");
  console.log("PHASE 5.1: V3 SERIALIZATION & LIFECYCLE VERIFICATION");
  console.log("========================================================\n");

  let passed = 0;

  // --------------------------------------------------------------------------
  // Scenario A: Create completely new notice -> Import Excel -> Save
  // --------------------------------------------------------------------------
  console.log("--- Scenario A: Completely New Notice Lifecycle ---");
  {
    // 1. Initial new notice state in OTM category
    const otmHeaders = [
      "SL No", "Tender Id", "Brief Description Of Works", "Location", "Method",
      "APP Estimate Cost Tk.", "Bank Credit Line 05 Years", "Turn Over 05 Years",
      "Similar Work 05 Years", "Tender Security (Tk)", "Document Price Tk."
    ];

    // 2. User imports Excel data into new notice
    const rawExcelRows = [
      ["1001", "Construction of R.C.C Road", "Pabna Sadar", "OTM", "41,26,000", "44 Lac", "2.2 Cr", "25 Lac", "1,00,000", "1,500"],
      ["1002", "Renovation of School Building", "Ishwardi", "OTM", "17,37,000", "20 Lac", "1.25 Cr", "10 Lac", "45,000", "1,000"]
    ];

    const excelHeaders = ["Tender ID", "Description", "Location", "Method", "APP Cost", "Bank Line", "Turnover", "Similar Work", "Security", "Doc Price"];
    const colMapping = mapColumns(otmHeaders, excelHeaders);

    const importResult = validateAndMapRows(
      rawExcelRows,
      excelHeaders,
      colMapping.mappings,
      "OTM",
      { workLocation: "Pabna Sadar" }
    );

    const formTable = {
      id: "tbl-otm-1",
      officeName: "গণপূর্ত বিভাগ, পাবনা।",
      subTitle: "e-Tender Notice (OTM Method)",
      headers: otmHeaders,
      rows: importResult.validRows,
      headerBgColor: "#059669",
      columnColors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
      payOrderTo: "নির্বাহী প্রকৌশলী, গণপূর্ত বিভাগ, পাবনা",
      moreInfo: "Mobile: 01711-805086",
      bottomWarning: "বিশেষ দ্রষ্টব্য: দরপত্র দাখিলের পূর্বে বিস্তারিত নিয়মাবলী দেখে নিন।",
      workLocation: "Pabna",
      noticeDateBlock: "21-09-2026 10:00 AM",
      lastDateBlock: "01-10-2026 05:00 PM",
    };

    // 3. Save notice using NoticeForm V3 serialization
    const v3Table = rowsArrayToTableSpec({
      id: formTable.id,
      order: 0,
      tableTitle: formTable.officeName,
      tableSubtitle: formTable.subTitle,
      officeName: formTable.officeName,
      subTitle: formTable.subTitle,
      workLocation: formTable.workLocation,
      noticeDateBlock: formTable.noticeDateBlock,
      lastDateBlock: formTable.lastDateBlock,
      headers: formTable.headers,
      rows: formTable.rows,
      columnColors: formTable.columnColors,
      headerBgColor: formTable.headerBgColor,
      payOrderTo: formTable.payOrderTo,
      moreInfo: formTable.moreInfo,
      bottomWarning: formTable.bottomWarning,
      category: "OTM",
    });

    const v3Payload: NoticeTableDataV3 = {
      version: "v3",
      tables: [v3Table],
    };

    const serializedData = serializeNoticeTableData(v3Payload);

    // 4. Verify serialized Notice.tableData
    const parsed = JSON.parse(serializedData);
    assert(parsed.version === "v3", "Scenario A: Serialized notice has version: 'v3'"); passed++;
    assert(Array.isArray(parsed.tables) && parsed.tables.length === 1, "Scenario A: Tables array has 1 table"); passed++;
    assert(typeof parsed.tables[0].headers[0] === "object" && !!parsed.tables[0].headers[0].id, "Scenario A: Headers are ColumnSpecV3 objects with id"); passed++;
    assert(typeof parsed.tables[0].rows[0] === "object" && !Array.isArray(parsed.tables[0].rows[0]), "Scenario A: Rows are Record<columnId, string> objects"); passed++;
    assert(parsed.tables[0].title === "গণপূর্ত বিভাগ, পাবনা।", "Scenario A: Bengali title preserved"); passed++;
    assert(parsed.tables[0].rows.length === 2, "Scenario A: All 2 imported rows preserved in V3"); passed++;
    const validation = validateNoticeTableData(parsed);
    assert(validation.isValid, "Scenario A: Schema passes validateNoticeTableData with 0 errors"); passed++;
  }

  // --------------------------------------------------------------------------
  // Scenario B: Edit existing V2 notice -> Load -> Import -> Save
  // --------------------------------------------------------------------------
  console.log("\n--- Scenario B: Edit Existing V2 Notice (Upgrade to V3) ---");
  {
    // 1. Existing V2 notice record from production database
    const existingV2Record = JSON.stringify({
      version: "v2",
      tables: [
        {
          id: "tbl-v2-101",
          type: "LTM",
          officeName: "সড়ক ও জনপথ বিভাগ, পাবনা।",
          subTitle: "e-GP Tender Notice (LTM)",
          headers: ["SL No", "Tender Id", "Brief Description Of Works", "Location", "Method", "APP Estimate Cost Tk.", "Document Price Tk.", "Last Date & Time", "WINNER LIST NAME"],
          rows: [
            ["1", "882101", "Patch repair work on Pabna-Paksey road", "Pabna", "LTM", "15,50,000", "1,000", "25-09-2026 05:00 PM", "M/S Construction Co."]
          ],
          headerBgColor: "#0891b2",
          columnColors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffcc"],
          payOrderTo: "নির্বাহী প্রকৌশলী, সওজ",
          moreInfo: "RHD Pabna",
          bottomWarning: "Warning: All tenders must be submitted online.",
          workLocation: "Pabna Road Division",
          noticeDateBlock: "15-09-2026 11:00 AM",
          lastDateBlock: "25-09-2026 05:00 PM",
        }
      ]
    });

    // 2. Load notice into NoticeForm state
    const loadedV3 = parseNoticeTableData(existingV2Record);
    assert(loadedV3.version === "v3", "Scenario B: parseNoticeTableData parsed V2 into V3 container"); passed++;

    const loadedFormTables = loadedV3.tables.map((table, tIdx) => {
      const { headers, rows, columnColors } = tableSpecToRowsArray(table);
      return {
        id: table.id || `table-${tIdx + 1}`,
        type: table.tableType || "LTM",
        officeName: table.title || "",
        subTitle: table.subtitle || "",
        workLocation: table.workLocation || "",
        noticeDateBlock: table.noticeDateBlock || "",
        lastDateBlock: table.lastDateBlock || "",
        lotteryDateBlock: table.lotteryDateBlock || "",
        payOrderTo: table.payOrderTo || "",
        moreInfo: table.moreInfo || "",
        bottomWarning: table.bottomWarning || "",
        headers,
        rows,
        columnColors,
        headerBgColor: table.headerBgColor,
      };
    });

    assert(loadedFormTables.length === 1, "Scenario B: Form loaded exactly 1 table"); passed++;
    assert(loadedFormTables[0].rows.length === 1, "Scenario B: Original V2 row loaded into form"); passed++;
    assert(loadedFormTables[0].officeName === "সড়ক ও জনপথ বিভাগ, পাবনা।", "Scenario B: Procuring entity title preserved"); passed++;

    // 3. User imports additional row (Append mode)
    const newRow = ["2", "882102", "Bridge rehabilitation work", "Pabna", "LTM", "22,00,000", "2,000", "28-09-2026 05:00 PM", ""];
    loadedFormTables[0].rows.push(newRow);

    // 4. Save notice in NoticeForm
    const upgradedV3Tables = loadedFormTables.map((t, idx) =>
      rowsArrayToTableSpec({
        id: t.id,
        order: idx,
        tableTitle: t.officeName,
        tableSubtitle: t.subTitle,
        officeName: t.officeName,
        subTitle: t.subTitle,
        workLocation: t.workLocation,
        noticeDateBlock: t.noticeDateBlock,
        lastDateBlock: t.lastDateBlock,
        lotteryDateBlock: t.lotteryDateBlock,
        headers: t.headers,
        rows: t.rows,
        columnColors: t.columnColors,
        headerBgColor: t.headerBgColor,
        payOrderTo: t.payOrderTo,
        moreInfo: t.moreInfo,
        bottomWarning: t.bottomWarning,
        category: "LTM",
      })
    );

    const savedPayload: NoticeTableDataV3 = {
      version: "v3",
      tables: upgradedV3Tables,
    };
    const savedSerialized = serializeNoticeTableData(savedPayload);

    // 5. Verify upgraded notice
    const savedParsed = JSON.parse(savedSerialized);
    assert(savedParsed.version === "v3", "Scenario B: Saved notice is strictly upgraded to version 'v3'"); passed++;
    assert(savedParsed.tables[0].rows.length === 2, "Scenario B: Contains original row + appended row (2 total)"); passed++;
    assert(savedParsed.tables[0].headers.length === 9, "Scenario B: All 9 columns preserved in V3 specs"); passed++;
    assert(savedParsed.tables[0].headerBgColor === "#0891b2", "Scenario B: Custom header color '#0891b2' preserved"); passed++;
    assert(savedParsed.tables[0].payOrderTo === "নির্বাহী প্রকৌশলী, সওজ", "Scenario B: Footer payOrderTo preserved"); passed++;
  }

  // --------------------------------------------------------------------------
  // Scenario C: Edit Legacy notice (PWD & Standard) -> Load -> Import -> Save
  // --------------------------------------------------------------------------
  console.log("\n--- Scenario C: Edit Legacy Notice (PWD / Standard -> Normalize to V3) ---");
  {
    // Part C1: Legacy PWD Template
    const legacyPwdData = JSON.stringify({
      isPwdTemplate: true,
      officeName: "পাবনা গণপূর্ত বিভাগ (Legacy PWD)",
      noticeDateBlock: "10-08-2025",
      lastDateBlock: "20-08-2025 05:00 PM",
      payOrderTo: "নির্বাহী প্রকৌশলী, পাবনা",
      moreInfo: "Legacy phone: 01711805086",
      bottomWarning: "Legacy warning notes.",
      rows: [
        {
          tenderId: "554433",
          description: "Legacy construction work",
          location: "Pabna",
          appCost: "12,50,000",
          solvency: "15 Lac",
          security: "35,000",
          docFees: "1,000",
          lastDateTime: "20-08-2025 05:00 PM"
        }
      ]
    });

    const parsedLegacy = parseNoticeTableData(legacyPwdData);
    assert(parsedLegacy.version === "v3", "Scenario C1: Legacy PWD parsed to V3 container"); passed++;
    assert(parsedLegacy.tables.length === 1, "Scenario C1: Produces 1 table"); passed++;
    assert(parsedLegacy.tables[0].title === "পাবনা গণপূর্ত বিভাগ (Legacy PWD)", "Scenario C1: Title mapped from legacy officeName"); passed++;

    // Unpack to form state
    const { headers: legacyHeaders, rows: legacyRows } = tableSpecToRowsArray(parsedLegacy.tables[0]);
    assert(legacyRows.length === 1, "Scenario C1: Legacy object row converted to positional array"); passed++;
    assert(legacyRows[0].includes("554433"), "Scenario C1: Tender ID '554433' preserved in row"); passed++;

    // Add imported row
    legacyRows.push(["2", "554434", "Second package", "Pabna", "LTM", "18,00,000", "20 Lac", "45,000", "1,000", "22-08-2025 05:00 PM"]);

    // Save as V3
    const normalizedV3 = rowsArrayToTableSpec({
      id: "tbl-migrated-1",
      order: 0,
      tableTitle: parsedLegacy.tables[0].title,
      officeName: parsedLegacy.tables[0].title,
      headers: legacyHeaders,
      rows: legacyRows,
      category: "LTM",
    });

    const savedLegacyV3 = serializeNoticeTableData({ version: "v3", tables: [normalizedV3] });
    const parsedSavedLegacy = JSON.parse(savedLegacyV3);
    assert(parsedSavedLegacy.version === "v3", "Scenario C1: Saved legacy notice now has version: 'v3'"); passed++;
    assert(parsedSavedLegacy.tables[0].rows.length === 2, "Scenario C1: All rows preserved in normalized V3"); passed++;

    // Part C2: Legacy Standard Table
    const legacyStandardData = JSON.stringify({
      officeName: "ঢাকা শিক্ষা প্রকৌশল অধিদপ্তর",
      subTitle: "Standard Tender Table",
      headers: ["SL", "Tender ID", "Description", "Location", "Cost"],
      rows: [
        ["1", "991001", "Boundary wall construction", "Dhaka", "8,50,000"]
      ]
    });

    const parsedStd = parseNoticeTableData(legacyStandardData);
    assert(parsedStd.version === "v3", "Scenario C2: Legacy standard parsed to V3 container"); passed++;
    assert(parsedStd.tables[0].rows.length === 1, "Scenario C2: Legacy standard rows converted to record objects"); passed++;
    const reSerializedStd = serializeNoticeTableData(parsedStd);
    assert(JSON.parse(reSerializedStd).version === "v3", "Scenario C2: Re-serialized format is strictly V3"); passed++;
  }

  // --------------------------------------------------------------------------
  // Scenario D: Edit existing V3 notice -> Load -> Import -> Save
  // --------------------------------------------------------------------------
  console.log("\n--- Scenario D: Edit Existing V3 Notice (Structure Preservation) ---");
  {
    // 1. Existing V3 notice with rich column specs and styling
    const existingV3Data: NoticeTableDataV3 = {
      version: "v3",
      tables: [
        {
          id: "tbl_adv_otm_1",
          title: "স্বাস্থ্য প্রকৌশল অধিদপ্তর (HED), রাজশাহী",
          subtitle: "e-Tender Notice No: 04/2026-27",
          order: 0,
          tableType: "OTM",
          headers: [
            { id: "col_0_sl_no", header: "SL No", fieldKey: "sl_no", width: 60, align: "center", dataType: "number", visible: true, backgroundColor: "#ffffff" },
            { id: "col_1_tender_id", header: "Tender Id", fieldKey: "tender_id", width: 100, align: "center", dataType: "string", visible: true, backgroundColor: "#ffffff" },
            { id: "col_2_brief_description_of_works", header: "Brief Description Of Works", fieldKey: "description", width: 280, align: "left", dataType: "string", visible: true, backgroundColor: "#ffffff" },
            { id: "col_3_location", header: "Location", fieldKey: "location", width: 140, align: "left", dataType: "string", visible: true, backgroundColor: "#ffffff" },
            { id: "col_4_app_estimate_cost_tk", header: "APP Estimate Cost Tk.", fieldKey: "app_estimate_cost", width: 130, align: "right", dataType: "currency", visible: true, backgroundColor: "#fef08a" }
          ],
          rows: [
            {
              col_0_sl_no: "1",
              col_1_tender_id: "770011",
              col_2_brief_description_of_works: "Supply of Medical Equipment",
              col_3_location: "Rajshahi Medical College",
              col_4_app_estimate_cost_tk: "1,25,00,000"
            }
          ],
          headerBgColor: "#059669",
          columnColors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#fef08a"],
          workLocation: "Rajshahi",
          noticeDateBlock: "01-09-2026 09:00 AM",
          lastDateBlock: "15-09-2026 05:00 PM",
          payOrderTo: "Executive Engineer, HED Rajshahi",
          moreInfo: "Web: www.hed.gov.bd",
          bottomWarning: "Strict compliance with PPR-2008 required."
        }
      ]
    };

    const serializedV3 = JSON.stringify(existingV3Data);

    // 2. Load into form
    const loadedV3 = parseNoticeTableData(serializedV3);
    assert(loadedV3.version === "v3", "Scenario D: parseNoticeTableData preserves V3 root"); passed++;
    const originalTable = loadedV3.tables[0];
    assert(originalTable.id === "tbl_adv_otm_1", "Scenario D: Stable table ID 'tbl_adv_otm_1' preserved"); passed++;
    assert(originalTable.headers[4].backgroundColor === "#fef08a", "Scenario D: Custom column yellow color preserved"); passed++;

    // 3. User appends a new row
    const { headers, rows, columnColors } = tableSpecToRowsArray(originalTable);
    rows.push(["2", "770012", "Maintenance of Hospital Ward", "Rajshahi", "35,00,000"]);

    // 4. Save notice in form
    const reSavedTable = rowsArrayToTableSpec({
      id: originalTable.id,
      order: 0,
      tableTitle: originalTable.title,
      tableSubtitle: originalTable.subtitle,
      officeName: originalTable.title,
      subTitle: originalTable.subtitle,
      workLocation: originalTable.workLocation,
      noticeDateBlock: originalTable.noticeDateBlock,
      lastDateBlock: originalTable.lastDateBlock,
      headers,
      rows,
      columnColors,
      headerBgColor: originalTable.headerBgColor,
      payOrderTo: originalTable.payOrderTo,
      moreInfo: originalTable.moreInfo,
      bottomWarning: originalTable.bottomWarning,
      category: "OTM",
    });

    const finalSavedPayload: NoticeTableDataV3 = {
      version: "v3",
      tables: [reSavedTable],
    };
    const finalSavedString = serializeNoticeTableData(finalSavedPayload);

    // 5. Inspect final serialized data
    const finalParsed = JSON.parse(finalSavedString);
    assert(finalParsed.version === "v3", "Scenario D: Re-saved notice remains version 'v3'"); passed++;
    assert(finalParsed.tables[0].id === "tbl_adv_otm_1", "Scenario D: Stable table ID unchanged"); passed++;
    assert(finalParsed.tables[0].rows.length === 2, "Scenario D: Contains exactly 2 rows (original + new)"); passed++;
    assert(finalParsed.tables[0].rows[1][finalParsed.tables[0].headers[1].id] === "770012", "Scenario D: New row correctly keyed by column ID"); passed++;
    assert(finalParsed.tables[0].headerBgColor === "#059669", "Scenario D: Header color '#059669' intact"); passed++;
    assert(finalParsed.tables[0].payOrderTo === "Executive Engineer, HED Rajshahi", "Scenario D: Footer payOrderTo intact"); passed++;
    assert(validateNoticeTableData(finalParsed).isValid, "Scenario D: Passes validateNoticeTableData"); passed++;
  }

  console.log("\n========================================================");
  console.log(`V3 SERIALIZATION VERIFICATION SUMMARY: ${passed} PASSED, 0 FAILED`);
  console.log("========================================================\n");
}

runV3SerializationTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
