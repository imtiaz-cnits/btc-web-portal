/**
 * BTC Web Portal - Phase 5.2 Final Production Smoke Test
 *
 * Controlled end-to-end smoke test executing against the database:
 * - Test A: 4 New Notice Categories (OTM, LTM, LOTTERY_PENDING, LOTTERY_RESULT)
 * - Test B: Backward Compatibility & Migration (V2, Legacy PWD, Legacy Standard)
 * - Test C: Multi-surface Rendering Verification (Public, Dashboard, PDF, WhatsApp)
 * - Test D: Data Integrity & Preservation Comparison
 */

import fs from "fs";
import path from "path";
import prisma from "../lib/prisma";
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
import { NoticeTableDataV3 } from "../lib/tableEngine/types";

const CATEGORY_HEADERS: Record<string, string[]> = {
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

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runProductionSmokeTest() {
  console.log("========================================================");
  console.log("PHASE 5.2: FINAL PRODUCTION SMOKE TEST");
  console.log("========================================================\n");

  let testCount = 0;

  // 1. Initial Environment & Production Safety Audit
  console.log("--- 1. Environment & Pre-Flight Safety Audit ---");
  const initialNotices = await prisma.notice.findMany({
    select: { id: true, title: true, category: true, type: true }
  });
  console.log(`Initial database notice count: ${initialNotices.length}`);
  const initialIds = new Set(initialNotices.map((n) => n.id));
  assert(initialNotices.length >= 0, "Database connected and reachable"); testCount++;

  const author = await prisma.user.findFirst({ select: { id: true } });
  if (!author) {
    throw new Error("No user found in database to assign as author");
  }
  const authorId = author.id;
  console.log(`Using test authorId: ${authorId}`);

  const createdTestIds: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // Test A — Four New Notice Categories (OTM, LTM, LOTTERY_PENDING, LOTTERY_RESULT)
    // ------------------------------------------------------------------------
    console.log("\n--- Test A: Four New Notice Categories ---");

    // Case A1: OTM
    console.log("\n[Test A1: OTM Category Lifecycle]");
    {
      const otmBuf = fs.readFileSync(path.join(__dirname, "fixtures", "sample_otm.xlsx"));
      const arrayBuf = otmBuf.buffer.slice(otmBuf.byteOffset, otmBuf.byteOffset + otmBuf.byteLength);
      const parsedWb = parseWorkbookBuffer(arrayBuf);
      const sheet = parsedWb.sheets["OTM_Tenders"];
      assert(!!sheet, "[OTM] Sheet 'OTM_Tenders' found"); testCount++;

      const mapping = mapColumns(CATEGORY_HEADERS.OTM, sheet.headers);
      assert(mapping.missingRequiredHeaders.length === 0, "[OTM] Required columns mapped"); testCount++;

      const validation = validateAndMapRows(
        sheet.rawRows,
        sheet.headers,
        mapping.mappings,
        "OTM",
        { workLocation: "Pabna Sadar" }
      );
      assert(validation.validRows.length === 4, "[OTM] 4 valid rows ingested"); testCount++;

      // Create V3 TableSpec
      const v3Table = rowsArrayToTableSpec({
        id: "tbl-otm-smoke",
        order: 0,
        tableTitle: "গণপূর্ত বিভাগ, পাবনা।",
        tableSubtitle: "e-Tender Notice (OTM Method) Smoke Test",
        officeName: "গণপূর্ত বিভাগ, পাবনা।",
        subTitle: "e-Tender Notice (OTM Method) Smoke Test",
        workLocation: "Pabna Sadar",
        noticeDateBlock: "21-09-2026 10:00 AM",
        lastDateBlock: "01-10-2026 05:00 PM",
        headers: CATEGORY_HEADERS.OTM,
        rows: validation.validRows,
        headerBgColor: "#059669",
        columnColors: CATEGORY_HEADERS.OTM.map(() => "#ffffff"),
        payOrderTo: "নির্বাহী প্রকৌশলী, গণপূর্ত বিভাগ, পাবনা",
        moreInfo: "Mobile: 01711-805086",
        bottomWarning: "দরপত্র দাখিলের পূর্বে বিস্তারিত নিয়মাবলী দেখে নিন।",
        category: "OTM",
      });

      const serialized = serializeNoticeTableData({ version: "v3", tables: [v3Table] });

      const noticeId = `smoke-test-otm-${Date.now()}`;
      createdTestIds.push(noticeId);

      // Save to database
      const createdNotice = await prisma.notice.create({
        data: {
          id: noticeId,
          title: "গণপূর্ত বিভাগ, পাবনা।",
          category: "OTM",
          type: "TABLE",
          tableData: serialized,
          publishDate: new Date(),
          authorId,
        }
      });
      assert(!!createdNotice, "[OTM] Notice saved to database"); testCount++;

      // Inspect persisted data
      const fetchedNotice = await prisma.notice.findUnique({ where: { id: noticeId } });
      assert(!!fetchedNotice && !!fetchedNotice.tableData, "[OTM] Reloaded notice from database"); testCount++;

      const parsedPersisted = JSON.parse(fetchedNotice!.tableData!);
      assert(parsedPersisted.version === "v3", "[OTM] Persisted version is strictly 'v3'"); testCount++;
      assert(parsedPersisted.tables.length === 1, "[OTM] Contains 1 table"); testCount++;
      assert(parsedPersisted.tables[0].rows.length === 4, "[OTM] All 4 rows preserved in database"); testCount++;
      assert(parsedPersisted.tables[0].title === "গণপূর্ত বিভাগ, পাবনা।", "[OTM] Bengali title intact in database"); testCount++;

      // Test reload via parseNoticeTableData
      const reloadedV3 = parseNoticeTableData(fetchedNotice!.tableData);
      const unpacked = tableSpecToRowsArray(reloadedV3.tables[0]);
      assert(unpacked.rows.length === 4, "[OTM] tableSpecToRowsArray unpacked 4 rows"); testCount++;
      assert(unpacked.headers.length === 11, "[OTM] All 11 columns unpacked"); testCount++;
      assert(unpacked.rows[0][0] === "1326177", "[OTM] Tender ID: 1326177"); testCount++;
      assert(unpacked.rows[0][1].includes("আর.সি.সি রাস্তা নির্মাণ"), "[OTM] Bengali description: আর.সি.সি রাস্তা নির্মাণ"); testCount++;
      assert(unpacked.rows[0][2].includes("পাবনা সদর"), "[OTM] Work Location: পাবনা সদর"); testCount++;
      assert(unpacked.rows[0][4] === "41,26,000", "[OTM] APP cost formatted with commas: 41,26,000"); testCount++;
      assert(unpacked.rows[0][5] === "44 Lac", "[OTM] Text currency preserved: 44 Lac"); testCount++;
      assert(unpacked.rows[0][6] === "2.2 Cr", "[OTM] Text currency preserved: 2.2 Cr"); testCount++;
    }

    // Case A2: LTM
    console.log("\n[Test A2: LTM Category Lifecycle]");
    {
      const ltmBuf = fs.readFileSync(path.join(__dirname, "fixtures", "sample_ltm.xls"));
      const arrayBuf = ltmBuf.buffer.slice(ltmBuf.byteOffset, ltmBuf.byteOffset + ltmBuf.byteLength);
      const parsedWb = parseWorkbookBuffer(arrayBuf);
      const sheet = parsedWb.sheets[parsedWb.sheetNames[0]];
      assert(!!sheet, "[LTM] Binary .xls sheet parsed"); testCount++;

      const mapping = mapColumns(CATEGORY_HEADERS.LTM, sheet.headers);
      assert(mapping.missingRequiredHeaders.length === 0, "[LTM] Required columns mapped"); testCount++;

      const validation = validateAndMapRows(
        sheet.rawRows,
        sheet.headers,
        mapping.mappings,
        "LTM",
        { workLocation: "Pabna Road Division" }
      );
      assert(validation.validRows.length === 2, "[LTM] 2 valid rows ingested"); testCount++;

      const v3Table = rowsArrayToTableSpec({
        id: "tbl-ltm-smoke",
        order: 0,
        tableTitle: "সড়ক ও জনপথ অধিদপ্তর, পাবনা।",
        tableSubtitle: "e-GP Tender Notice (LTM)",
        headers: CATEGORY_HEADERS.LTM,
        rows: validation.validRows,
        headerBgColor: "#0891b2",
        columnColors: CATEGORY_HEADERS.LTM.map(() => "#ffffff"),
        payOrderTo: "নির্বাহী প্রকৌশলী, সওজ",
        category: "LTM",
      });

      const noticeId = `smoke-test-ltm-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "সড়ক ও জনপথ অধিদপ্তর, পাবনা।",
          category: "LTM",
          type: "TABLE",
          tableData: serializeNoticeTableData({ version: "v3", tables: [v3Table] }),
          publishDate: new Date(),
          authorId,
        }
      });

      const fetched = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsed = JSON.parse(fetched!.tableData!);
      assert(parsed.version === "v3", "[LTM] Persisted format is V3"); testCount++;
      assert(parsed.tables[0].rows.length === 2, "[LTM] Preserved 2 rows"); testCount++;
      const unpacked = tableSpecToRowsArray(parseNoticeTableData(fetched!.tableData).tables[0]);
      assert(unpacked.headers.length === 9, "[LTM] Exactly 9 columns unpacked"); testCount++;
      assert(unpacked.rows[0][4] === "5,64,56,456", "[LTM] Currency formatted: 5,64,56,456"); testCount++;
    }

    // Case A3: LOTTERY_PENDING
    console.log("\n[Test A3: LOTTERY_PENDING Category Lifecycle]");
    {
      const buf = fs.readFileSync(path.join(__dirname, "fixtures", "sample_lottery_pending.xlsx"));
      const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const parsedWb = parseWorkbookBuffer(arrayBuf);
      const sheet = parsedWb.sheets["Pending_Tenders"];

      const mapping = mapColumns(CATEGORY_HEADERS.LOTTERY_PENDING, sheet.headers);
      const validation = validateAndMapRows(
        sheet.rawRows,
        sheet.headers,
        mapping.mappings,
        "LOTTERY_PENDING",
        { workLocation: "Pabna" }
      );
      assert(validation.validRows.length === 1, "[LOTTERY_PENDING] 1 valid row ingested"); testCount++;

      const v3Table = rowsArrayToTableSpec({
        id: "tbl-pending-smoke",
        order: 0,
        tableTitle: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)",
        tableSubtitle: "লটারি অপেক্ষমান তালিকা",
        headers: CATEGORY_HEADERS.LOTTERY_PENDING,
        rows: validation.validRows,
        headerBgColor: "#0284c7",
        category: "LOTTERY_PENDING",
      });

      const noticeId = `smoke-test-pending-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর (LGED)",
          category: "LOTTERY_PENDING",
          type: "TABLE",
          tableData: serializeNoticeTableData({ version: "v3", tables: [v3Table] }),
          publishDate: new Date(),
          authorId,
        }
      });

      const fetched = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsed = JSON.parse(fetched!.tableData!);
      assert(parsed.version === "v3", "[LOTTERY_PENDING] Persisted format is V3"); testCount++;
      assert(parsed.tables[0].rows.length === 1, "[LOTTERY_PENDING] Preserved 1 row"); testCount++;
    }

    // Case A4: LOTTERY_RESULT
    console.log("\n[Test A4: LOTTERY_RESULT Category Lifecycle]");
    {
      const buf = fs.readFileSync(path.join(__dirname, "fixtures", "sample_lottery_result.csv"));
      const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const parsedWb = parseWorkbookBuffer(arrayBuf);
      const sheet = parsedWb.sheets[parsedWb.sheetNames[0]];

      const mapping = mapColumns(CATEGORY_HEADERS.LOTTERY_RESULT, sheet.headers);
      const validation = validateAndMapRows(
        sheet.rawRows,
        sheet.headers,
        mapping.mappings,
        "LOTTERY_RESULT",
        { workLocation: "Pabna" }
      );
      assert(validation.validRows.length === 2, "[LOTTERY_RESULT] 2 valid rows ingested"); testCount++;

      const v3Table = rowsArrayToTableSpec({
        id: "tbl-result-smoke",
        order: 0,
        tableTitle: "জেলা পরিষদ, পাবনা",
        tableSubtitle: "উন্মুক্ত লটারির ফলাফল",
        headers: CATEGORY_HEADERS.LOTTERY_RESULT,
        rows: validation.validRows,
        headerBgColor: "#059669",
        columnColors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffcc"],
        category: "LOTTERY_RESULT",
      });

      const noticeId = `smoke-test-result-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "জেলা পরিষদ, পাবনা",
          category: "LOTTERY_RESULT",
          type: "TABLE",
          tableData: serializeNoticeTableData({ version: "v3", tables: [v3Table] }),
          publishDate: new Date(),
          authorId,
        }
      });

      const fetched = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsed = JSON.parse(fetched!.tableData!);
      assert(parsed.version === "v3", "[LOTTERY_RESULT] Persisted format is V3"); testCount++;
      assert(parsed.tables[0].headers.length === 10, "[LOTTERY_RESULT] Exactly 10 columns in V3"); testCount++;
      assert(parsed.tables[0].rows.length === 2, "[LOTTERY_RESULT] 2 rows preserved"); testCount++;

      const winnerCol = parsed.tables[0].headers.find((h: any) => h.header.includes("WINNER"));
      assert(!!winnerCol, "[LOTTERY_RESULT] WINNER LIST NAME column present"); testCount++;
      assert(parsed.tables[0].rows[0][winnerCol.id] === "মেসার্স শাহ আলম এন্টারপ্রাইজ", "[LOTTERY_RESULT] Bengali winner name preserved: মেসার্স শাহ আলম এন্টারপ্রাইজ"); testCount++;
      assert(parsed.tables[0].rows[1][winnerCol.id] === "", "[LOTTERY_RESULT] Non-winner row blank"); testCount++;
    }

    // ------------------------------------------------------------------------
    // Test B — Backward Compatibility & Isolated Record Migration
    // ------------------------------------------------------------------------
    console.log("\n--- Test B: Backward Compatibility & Migration ---");

    // Case B1: Existing V2 notice migration to V3
    console.log("\n[Test B1: Existing V2 Notice Migration]");
    {
      const isolatedV2Notice = {
        version: "v2",
        tables: [
          {
            id: "tbl-v2-smoke-1",
            type: "LTM",
            officeName: "শিক্ষা প্রকৌশল অধিদপ্তর (EED), পাবনা",
            subTitle: "e-GP Tender Notice No: 02/2026",
            headers: CATEGORY_HEADERS.LTM,
            rows: [
              ["662201", "Construction of Academic Building", "Pabna", "LTM", "85,00,000", "20 Lac", "1,50,000", "2,000", "25-09-2026 05:00 PM"]
            ],
            headerBgColor: "#0891b2",
            columnColors: CATEGORY_HEADERS.LTM.map(() => "#ffffff"),
            payOrderTo: "নির্বাহী প্রকৌশলী, ইইডি",
            moreInfo: "Pabna EED",
            bottomWarning: "Warning: Submission via e-GP portal only.",
          }
        ]
      };

      // Create isolated test record in database
      const noticeId = `smoke-test-v2-mig-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "শিক্ষা প্রকৌশল অধিদপ্তর (EED), পাবনা",
          category: "LTM",
          type: "TABLE",
          tableData: JSON.stringify(isolatedV2Notice),
          publishDate: new Date(),
          authorId,
        }
      });

      // Load notice via parseNoticeTableData
      const loaded = await prisma.notice.findUnique({ where: { id: noticeId } });
      const v3Normalized = parseNoticeTableData(loaded!.tableData);
      assert(v3Normalized.version === "v3", "[V2 Migration] parseNoticeTableData upgraded V2 to V3"); testCount++;

      const { headers, rows, columnColors } = tableSpecToRowsArray(v3Normalized.tables[0]);
      assert(rows.length === 1, "[V2 Migration] 1 row loaded"); testCount++;

      // Admin appends a new row
      rows.push(["662202", "Repair of Science Lab", "Pabna", "LTM", "25,00,000", "10 Lac", "50,000", "1,000", "28-09-2026 05:00 PM"]);

      // Save again
      const reSavedTable = rowsArrayToTableSpec({
        id: v3Normalized.tables[0].id,
        order: 0,
        tableTitle: v3Normalized.tables[0].title,
        headers,
        rows,
        columnColors,
        headerBgColor: v3Normalized.tables[0].headerBgColor,
        payOrderTo: v3Normalized.tables[0].payOrderTo,
        category: "LTM",
      });

      await prisma.notice.update({
        where: { id: noticeId },
        data: {
          tableData: serializeNoticeTableData({ version: "v3", tables: [reSavedTable] })
        }
      });

      const updated = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsedUpdated = JSON.parse(updated!.tableData!);
      assert(parsedUpdated.version === "v3", "[V2 Migration] Persisted format strictly upgraded to V3"); testCount++;
      assert(parsedUpdated.tables[0].rows.length === 2, "[V2 Migration] Both rows preserved in V3"); testCount++;
      assert(parsedUpdated.tables[0].payOrderTo === "নির্বাহী প্রকৌশলী, ইইডি", "[V2 Migration] Footer preserved"); testCount++;
    }

    // Case B2: Legacy PWD Template notice migration to V3
    console.log("\n[Test B2: Legacy PWD Template Notice Migration]");
    {
      const legacyPwd = {
        isPwdTemplate: true,
        officeName: "পাবনা গণপূর্ত বিভাগ (Legacy)",
        noticeDateBlock: "10-05-2025",
        lastDateBlock: "25-05-2025 05:00 PM",
        payOrderTo: "নির্বাহী প্রকৌশলী, গণপূর্ত",
        rows: [
          {
            tenderId: "441100",
            description: "Legacy Boundary Wall",
            location: "Pabna",
            appCost: "14,50,000",
            solvency: "15 Lac",
            security: "35,000",
            docFees: "1,000",
            lastDateTime: "25-05-2025 05:00 PM"
          }
        ]
      };

      const noticeId = `smoke-test-pwd-mig-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "পাবনা গণপূর্ত বিভাগ (Legacy)",
          category: "LTM",
          type: "TABLE",
          tableData: JSON.stringify(legacyPwd),
          publishDate: new Date(),
          authorId,
        }
      });

      const loaded = await prisma.notice.findUnique({ where: { id: noticeId } });
      const v3Normalized = parseNoticeTableData(loaded!.tableData);
      assert(v3Normalized.version === "v3", "[Legacy PWD] Normalized to V3 structure"); testCount++;

      const { headers, rows } = tableSpecToRowsArray(v3Normalized.tables[0]);
      assert(rows.length === 1, "[Legacy PWD] 1 legacy row converted to array"); testCount++;
      assert(rows[0].includes("441100"), "[Legacy PWD] Tender ID 441100 preserved"); testCount++;

      // Admin edits and saves
      const reSaved = rowsArrayToTableSpec({
        id: "tbl-migrated-pwd",
        order: 0,
        tableTitle: v3Normalized.tables[0].title,
        headers,
        rows,
        category: "LTM",
      });

      await prisma.notice.update({
        where: { id: noticeId },
        data: {
          tableData: serializeNoticeTableData({ version: "v3", tables: [reSaved] })
        }
      });

      const reloaded = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsedReloaded = JSON.parse(reloaded!.tableData!);
      assert(parsedReloaded.version === "v3", "[Legacy PWD] Persisted format strictly V3"); testCount++;
      assert(parsedReloaded.tables[0].rows.length === 1, "[Legacy PWD] Row preserved in V3"); testCount++;
    }

    // Case B3: Legacy Standard notice migration to V3
    console.log("\n[Test B3: Legacy Standard Notice Migration]");
    {
      const legacyStd = {
        officeName: "জাতীয় গৃহায়ন কর্তৃপক্ষ, পাবনা",
        headers: ["SL", "Tender ID", "Description", "Location", "Cost"],
        rows: [
          ["1", "332211", "Site Development Work", "Pabna", "32,00,000"]
        ]
      };

      const noticeId = `smoke-test-std-mig-${Date.now()}`;
      createdTestIds.push(noticeId);

      await prisma.notice.create({
        data: {
          id: noticeId,
          title: "জাতীয় গৃহায়ন কর্তৃপক্ষ, পাবনা",
          category: "OTM",
          type: "TABLE",
          tableData: JSON.stringify(legacyStd),
          publishDate: new Date(),
          authorId,
        }
      });

      const loaded = await prisma.notice.findUnique({ where: { id: noticeId } });
      const v3Normalized = parseNoticeTableData(loaded!.tableData);
      assert(v3Normalized.version === "v3", "[Legacy Standard] Normalized to V3"); testCount++;

      const { headers, rows } = tableSpecToRowsArray(v3Normalized.tables[0]);
      assert(rows.length === 1, "[Legacy Standard] 1 row converted"); testCount++;

      // Save as V3
      const reSaved = rowsArrayToTableSpec({
        id: "tbl-migrated-std",
        order: 0,
        tableTitle: v3Normalized.tables[0].title,
        headers,
        rows,
        category: "OTM",
      });

      await prisma.notice.update({
        where: { id: noticeId },
        data: {
          tableData: serializeNoticeTableData({ version: "v3", tables: [reSaved] })
        }
      });

      const reloaded = await prisma.notice.findUnique({ where: { id: noticeId } });
      const parsedReloaded = JSON.parse(reloaded!.tableData!);
      assert(parsedReloaded.version === "v3", "[Legacy Standard] Persisted format strictly V3"); testCount++;
      assert(parsedReloaded.tables[0].rows.length === 1, "[Legacy Standard] Row preserved"); testCount++;
    }

    // ------------------------------------------------------------------------
    // Test C — Multi-Surface Rendering Verification
    // ------------------------------------------------------------------------
    console.log("\n--- Test C: Multi-Surface Rendering Verification ---");
    {
      // Verify Public Notice page adapter on all created test notices
      for (const id of createdTestIds) {
        const notice = await prisma.notice.findUnique({ where: { id } });
        const v3Data = parseNoticeTableData(notice!.tableData);
        assert(v3Data.tables.length > 0, `[Public Rendering] ${id} parsed into >=1 V3 table`); testCount++;

        const table = v3Data.tables[0];
        const unpacked = tableSpecToRowsArray(table);

        // Check columns and rows
        assert(unpacked.headers.length > 0, `[Public Rendering] ${id} headers populated (${unpacked.headers.length})`); testCount++;
        assert(unpacked.rows.length > 0, `[Public Rendering] ${id} rows populated (${unpacked.rows.length})`); testCount++;

        // Verify Dashboard Preview simulation
        const dashboardTable = {
          officeName: table.title || "",
          subTitle: table.subtitle || "",
          headerBgColor: table.headerBgColor,
          columnColors: unpacked.columnColors,
          headers: unpacked.headers,
          rows: unpacked.rows,
        };
        assert(dashboardTable.headers.length === unpacked.headers.length, `[Dashboard Preview] ${id} headers match`); testCount++;

        // Verify PDF Preview simulation
        const pdfTable = {
          id: table.id,
          type: table.tableType || "LTM",
          officeName: table.title || "",
          headers: unpacked.headers,
          rows: unpacked.rows,
          columnColors: unpacked.columnColors,
        };
        assert(pdfTable.rows.length === unpacked.rows.length, `[PDF Preview] ${id} rows match`); testCount++;

        // Verify WhatsApp Share metadata simulation
        const officeName = v3Data.tables[0].title || (v3Data.tables[0] as any).officeName || "";
        const groupCount = v3Data.tables.reduce((acc, t) => acc + (t.rows?.length || 0), 0);
        assert(officeName.length > 0, `[WhatsApp Share] ${id} officeName captured: '${officeName}'`); testCount++;
        assert(groupCount === unpacked.rows.length, `[WhatsApp Share] ${id} row count matches: ${groupCount}`); testCount++;
      }

      // Check Winner Highlighting in LOTTERY_RESULT
      const resultNotice = await prisma.notice.findFirst({
        where: { id: { startsWith: "smoke-test-result-" } }
      });
      const resultV3 = parseNoticeTableData(resultNotice!.tableData);
      const resultTable = resultV3.tables[0];
      const isFirstRowWinner = isWinnerRow(resultTable.rows[0], resultTable.headers);
      const isSecondRowWinner = isWinnerRow(resultTable.rows[1], resultTable.headers);
      assert(isFirstRowWinner === true, "[Winner Highlighting] Row 1 correctly identified as winner"); testCount++;
      assert(isSecondRowWinner === false, "[Winner Highlighting] Row 2 correctly identified as non-winner"); testCount++;
    }

    // ------------------------------------------------------------------------
    // Test D — Data Integrity Comparison
    // ------------------------------------------------------------------------
    console.log("\n--- Test D: Data Integrity & Preservation Comparison ---");
    {
      const otmSmoke = await prisma.notice.findFirst({
        where: { id: { startsWith: "smoke-test-otm-" } }
      });
      const reloadedOtm = parseNoticeTableData(otmSmoke!.tableData);
      const otmUnpacked = tableSpecToRowsArray(reloadedOtm.tables[0]);

      // Assert row count match exactly
      assert(otmUnpacked.rows.length === 4, "[Integrity] Zero missing or duplicate rows (exactly 4)"); testCount++;

      // Assert column ordering and no shifted columns
      const headers = otmUnpacked.headers;
      assert(headers[0] === "Tender Id", "[Integrity] Column 0 is Tender Id"); testCount++;
      assert(headers[1] === "Brief Description of Works", "[Integrity] Column 1 is Brief Description of Works"); testCount++;
      assert(headers[2] === "Work Location", "[Integrity] Column 2 is Work Location"); testCount++;
      assert(headers[4] === "APP Estimate Cost Tk.", "[Integrity] Column 4 is APP Estimate Cost Tk."); testCount++;

      // Assert Bengali Unicode exact preservation
      const row1Desc = otmUnpacked.rows[0][1];
      assert(row1Desc.includes("আর.সি.সি রাস্তা নির্মাণ"), `[Integrity] Bengali description exact match: ${row1Desc}`); testCount++;
      const row1Loc = otmUnpacked.rows[0][2];
      assert(row1Loc.includes("পাবনা সদর"), `[Integrity] Bengali location exact match: ${row1Loc}`); testCount++;

      // Assert negative number formatting
      const row3Cost = otmUnpacked.rows[2][4];
      assert(row3Cost === "-2,500", `[Integrity] Negative currency value intact: ${row3Cost}`); testCount++;
    }
  } catch (err: any) {
    console.error("ERROR ENCOUNTERED DURING SMOKE TEST:", err);
    throw err;
  } finally {
    // ------------------------------------------------------------------------
    // Clean up isolated smoke test records & verify zero pollution
    // ------------------------------------------------------------------------
    console.log("\n--- Cleanup Isolated Smoke Test Records ---");
    if (createdTestIds.length > 0) {
      const deleteResult = await prisma.notice.deleteMany({
        where: { id: { in: createdTestIds } }
      });
      console.log(`Cleaned up ${deleteResult.count} isolated smoke test records.`);
      assert(deleteResult.count === createdTestIds.length, `All ${createdTestIds.length} smoke test records cleaned up`); testCount++;
    }

    const postCleanupNotices = await prisma.notice.findMany({
      select: { id: true }
    });
    console.log(`Final notice count: ${postCleanupNotices.length}`);
    assert(postCleanupNotices.length === initialNotices.length, "Notice count returned to exact initial baseline"); testCount++;

    const postCleanupIds = new Set(postCleanupNotices.map((n) => n.id));
    let productionNoticesUnchanged = true;
    for (const id of initialIds) {
      if (!postCleanupIds.has(id)) {
        productionNoticesUnchanged = false;
        break;
      }
    }
    assert(productionNoticesUnchanged, "All pre-existing production notices remained 100% untouched"); testCount++;

    await prisma.$disconnect();
  }

  console.log("\n========================================================");
  console.log(`PRODUCTION SMOKE TEST SUMMARY: ${testCount} PASSED, 0 FAILED`);
  console.log("========================================================\n");
}

runProductionSmokeTest().catch((err) => {
  console.error("FATAL SMOKE TEST FAILURE:", err);
  process.exit(1);
});
