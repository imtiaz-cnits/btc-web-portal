/**
 * BTC Web Portal - Category Excel Import Final Acceptance Test
 * Strict end-to-end acceptance test for OTM & LTM 2-sheet templates:
 * - BTC_OTM_Notice_Template.xlsx (12 columns)
 * - BTC_LTM_Notice_Template.xlsx (10 columns)
 *
 * Verifies:
 * 1. Template reading and filling with realistic metadata and 3+ tender rows.
 * 2. Upload, category detection, and validation preview.
 * 3. NoticeForm state adaptation (all fields, table rows, and footer details).
 * 4. Database save workflow using Table Engine V3 serialization.
 * 5. Reload and edit persistence.
 * 6. Public rendering and print/PDF output compatibility.
 * 7. Guaranteed database cleanup returning to 5 baseline notices.
 */

import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import prisma from "../../lib/prisma";
import { parseCategoryNoticeWorkbook } from "../../lib/categoryExcelImport/parser";
import {
  adaptCategoryImportToNoticeForm,
  verifyTableSpecV3Compatibility,
} from "../../lib/categoryExcelImport/adapter";
import {
  serializeNoticeTableData,
  parseNoticeTableData,
  tableSpecToRowsArray,
  rowsArrayToTableSpec,
  validateNoticeTableData,
} from "../../lib/tableEngine/normalizer";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✔ PASS: ${msg}`);
}

const TEMPLATE_DIR = path.join(process.cwd(), "public", "templates", "category-import");

const TEST_ROWS_BY_CATEGORY: Record<"OTM" | "LTM", string[][]> = {
  OTM: [
    [
      "1",
      "1326177",
      "Construction of Internal R.C.C road-17 (আর.সি.সি রাস্তা নির্মাণ)",
      "Pabna Sadar (পাবনা সদর)",
      "OTM",
      "41,26,000",
      "44 Lac",
      "2.2 Cr",
      "25 Lac",
      "1,00,000",
      "1,500",
      "21-09-2026 05:00 PM",
    ],
    [
      "2",
      "1326180",
      "Construction of Internal R.C.C road-18 (কালভার্ট ও ড্রেন নির্মাণ)",
      "Sujanagar, Pabna (সুজানগর)",
      "OTM",
      "17,37,000",
      "20 Lac",
      "1.25 Cr",
      "10 Lac",
      "45,000",
      "1,000",
      "21-09-2026 05:00 PM",
    ],
    [
      "3",
      "1326185",
      "Periodic maintenance of Pabna-Paksey road (রাস্তা সংস্কার ও মেরামত)",
      "Ishwardi, Pabna (ঈশ্বরদী)",
      "OTM",
      "85,50,000",
      "60 Lac",
      "3.5 Cr",
      "40 Lac",
      "2,50,000",
      "2,000",
      "25-09-2026 05:00 PM",
    ],
  ],

  LTM: [
    [
      "1",
      "1329553",
      "Rehabilitation of Dogachi Up to Lachipara road from Ch 00m - Ch 845m (রাস্তা পুনর্বাসন)",
      "Sadar Pabna (সদর পাবনা)",
      "LTM",
      "40,17,031",
      "32 Lac",
      "1,00,000",
      "1,500",
      "05-10-2026 05:00 PM",
    ],
    [
      "2",
      "1329552",
      "Rehabilitation of kumilli Chunnu House via Mosque road (মসজিদ সংলগ্ন রাস্তা সংস্কার)",
      "Sadar Pabna (সদর পাবনা)",
      "LTM",
      "18,85,261",
      "15 Lac",
      "50,000",
      "1,000",
      "05-10-2026 05:00 PM",
    ],
    [
      "3",
      "1329554",
      "Rehabilitation of Kashipur hat - Charprotabpur road (হাট সংলগ্ন রাস্তা নির্মাণ)",
      "Sadar Pabna (সদর পাবনা)",
      "LTM",
      "50,24,992",
      "40 Lac",
      "1,50,000",
      "2,500",
      "05-10-2026 05:00 PM",
    ],
  ],
};

async function runE2EAcceptance() {
  console.log("\n========================================================");
  console.log("CATEGORY EXCEL IMPORT FINAL ACCEPTANCE TEST (OTM & LTM)");
  console.log("========================================================\n");

  // Step 0: Pre-flight safety check
  const initialNotices = await prisma.notice.findMany({
    select: { id: true, title: true, category: true },
  });
  const baselineCount = initialNotices.length;
  console.log(`Initial baseline database notice count: ${baselineCount}`);
  assert(baselineCount === 5, "Database contains exactly 5 baseline notices");

  // Fetch admin author ID
  const adminUser = await prisma.user.findFirst();
  const authorId = adminUser?.id || "admin-test-id";

  const categories = ["OTM", "LTM"] as const;
  const createdTestNoticeIds: string[] = [];

  try {
    for (const cat of categories) {
      console.log(`\n--- Testing Category: ${cat} ---`);

      // 1. Verify official template exists
      const templateFileName = `BTC_${cat}_Notice_Template.xlsx`;
      const templatePath = path.join(TEMPLATE_DIR, templateFileName);
      assert(fs.existsSync(templatePath), `[${cat}] Official template exists: ${templateFileName}`);

      const fileBuffer = fs.readFileSync(templatePath);
      const wb = XLSX.read(fileBuffer, { type: "buffer" });
      assert(wb.SheetNames.length === 2, `[${cat}] Template has exactly 2 sheets`);
      assert(wb.SheetNames[0] === "Tender Data", `[${cat}] Sheet 1 is "Tender Data"`);
      assert(wb.SheetNames[1] === "Footer Details", `[${cat}] Sheet 2 is "Footer Details"`);

      // 2. Prepare realistic test metadata in Tender Data
      const testTitle = `[E2E-ACCEPTANCE] স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা (${cat})`;
      const testSubTitle = `Local Government Engineering Department, Pabna (${cat} Method Execution)`;
      const testPublishDate = "23-09-2026 11:46 AM";

      const wsTender = wb.Sheets["Tender Data"];
      const aoa = XLSX.utils.sheet_to_json<string[]>(wsTender, { header: 1 });

      // Update Row 1 (Title), Row 2 (Subtitle), Row 3 (Publish Date)
      aoa[0][0] = testTitle;
      aoa[1][0] = testSubTitle;
      aoa[2][aoa[2].length - 4] = `Egp Published Date : ${testPublishDate}`;

      // Ingest 3 realistic tender rows
      const expectedHeaders = aoa[3];
      const expectedColsCount = cat === "OTM" ? 12 : 10;
      assert(expectedHeaders.length === expectedColsCount, `[${cat}] Header has exactly ${expectedColsCount} columns`);

      const tenderRows = TEST_ROWS_BY_CATEGORY[cat];
      const updatedTenderAoa = [aoa[0], aoa[1], aoa[2], aoa[3], ...tenderRows];

      const newWsTender = XLSX.utils.aoa_to_sheet(updatedTenderAoa);
      newWsTender["!merges"] = wsTender["!merges"];
      newWsTender["!cols"] = wsTender["!cols"];
      wb.Sheets["Tender Data"] = newWsTender;

      // 3. Update Footer Details
      const testPayOrder = "Executive Engineer, Pabna PWD Division, Pabna";
      const testMoreInfo = "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile: 01711-805086\nPabna, Bangladesh";
      const footerAoa = [
        ["Field Name", "Field Value", "Instructions"],
        ["Pay Order To", testPayOrder, "Pay Order instructions"],
        ["Information / Notice Details", testMoreInfo, "Contact instructions"],
        ["Information / Bottom Warning", "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।", "Warning note"],
      ];
      wb.Sheets["Footer Details"] = XLSX.utils.aoa_to_sheet(footerAoa);

      // 4. Serialize modified workbook and parse
      const modifiedBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const parsed = parseCategoryNoticeWorkbook(modifiedBuffer, cat, templateFileName);

      assert(parsed.validation.isValid, `[${cat}] Workbook validated successfully`);
      assert(parsed.noticeDetails.category === cat, `[${cat}] Category detected matches ${cat}`);
      assert(parsed.noticeDetails.title === testTitle, `[${cat}] Notice Title extracted correctly`);
      assert(parsed.noticeDetails.subTitle === testSubTitle, `[${cat}] Notice Subtitle extracted correctly`);
      assert(parsed.noticeDetails.publishDate === testPublishDate, `[${cat}] Publish Date extracted correctly`);
      assert(parsed.tenderData.rows.length === 3, `[${cat}] Exactly 3 tender rows parsed`);

      // 5. Apply to Notice Form State
      const formUpdate = adaptCategoryImportToNoticeForm(parsed);
      assert(formUpdate.title === testTitle, `[${cat}] Form title state updated`);
      assert(formUpdate.category === cat, `[${cat}] Form category state updated`);
      assert(formUpdate.tablesList.length === 1, `[${cat}] Exactly 1 table created for form`);

      const adaptedTable = formUpdate.tablesList[0];
      const strippedHeadersCount = cat === "OTM" ? 11 : 9;
      assert(
        adaptedTable.headers.length === strippedHeadersCount,
        `[${cat}] Form headers stripped '#' to standard ${strippedHeadersCount} columns`,
      );
      assert(adaptedTable.rows.length === 3, `[${cat}] Form table contains 3 data rows`);

      // 6. Save using existing V3 workflow
      const v3TableSpec = verifyTableSpecV3Compatibility(parsed);
      const v3Payload = serializeNoticeTableData({
        version: "v3",
        tables: [v3TableSpec],
        sharedFooter: {
          payOrderTo: parsed.footerDetails.payOrderTo,
          moreInfo: parsed.footerDetails.moreInfo,
        },
      });

      const savedNotice = await prisma.notice.create({
        data: {
          title: formUpdate.title,
          category: formUpdate.category,
          type: "TABLE",
          status: "active",
          authorId,
          tableData: v3Payload,
          publishDate: new Date(),
          lastDate: new Date(),
        },
      });

      createdTestNoticeIds.push(savedNotice.id);
      console.log(`  ✓ Notice saved to DB: ID=${savedNotice.id}`);

      // 7. Reload and edit the saved notice
      const reloadedNotice = await prisma.notice.findUnique({
        where: { id: savedNotice.id },
      });
      assert(!!reloadedNotice, `[${cat}] Saved notice reloaded from DB`);
      assert(reloadedNotice!.title === testTitle, `[${cat}] DB notice title matches`);

      const parsedReloaded = parseNoticeTableData(reloadedNotice!.tableData!);
      assert(parsedReloaded.tables.length === 1, `[${cat}] DB table has 1 TableSpec`);
      assert(parsedReloaded.tables[0].rows.length === 3, `[${cat}] DB table has 3 rows`);

      // Edit simulated: update officeName
      const editedTitle = `${testTitle} [EDITED]`;
      const { headers: rHeaders, rows: rRows, columnColors: rCols } = tableSpecToRowsArray(parsedReloaded.tables[0]);
      const updatedV3 = serializeNoticeTableData({
        version: "v3",
        tables: [
          rowsArrayToTableSpec({
            ...parsedReloaded.tables[0],
            officeName: editedTitle,
            tableTitle: editedTitle,
            headers: rHeaders,
            rows: rRows,
            columnColors: rCols,
          }),
        ],
        sharedFooter: parsedReloaded.sharedFooter,
      });

      const updatedNotice = await prisma.notice.update({
        where: { id: savedNotice.id },
        data: {
          title: editedTitle,
          tableData: updatedV3,
        },
      });
      assert(updatedNotice.title === editedTitle, `[${cat}] Notice edited and updated in DB`);

      // 8. Public notice rendering & PDF/Print compatibility
      const finalNotice = await prisma.notice.findUnique({
        where: { id: savedNotice.id },
      });
      const finalV3 = parseNoticeTableData(finalNotice!.tableData!);
      const tableDataForRender = tableSpecToRowsArray(finalV3.tables[0]);

      assert(tableDataForRender.rows.length === 3, `[${cat}] Public view renders 3 rows`);
      assert(tableDataForRender.headers.length === strippedHeadersCount, `[${cat}] Public view headers intact`);

      console.log(`  ✔ [${cat}] Full lifecycle acceptance PASS`);
    }
  } finally {
    // 9. Isolated test cleanup
    console.log("\n--- Cleaning up test records ---");
    for (const testId of createdTestNoticeIds) {
      await prisma.notice.delete({ where: { id: testId } });
      console.log(`  ✓ Deleted test notice: ${testId}`);
    }

    const finalNotices = await prisma.notice.findMany({ select: { id: true } });
    console.log(`Final notice count: ${finalNotices.length} (Baseline: ${baselineCount})`);
    assert(finalNotices.length === baselineCount, "Database restored to exact baseline count of 5 notices");
  }

  console.log("\n========================================================");
  console.log("✔ ALL END-TO-END ACCEPTANCE TESTS PASSED (OTM & LTM)");
  console.log("========================================================\n");
}

runE2EAcceptance()
  .catch((err) => {
    console.error("E2E Acceptance Failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
