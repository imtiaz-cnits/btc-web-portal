/**
 * BTC Web Portal - Category Excel Import Adapter
 * Translates validated CategoryNoticeImportData into existing NoticeForm state
 * and V3 Table Engine data structures.
 */

import { CategoryNoticeImportData, NoticeFormStateUpdate } from "./types";
import { rowsArrayToTableSpec } from "../tableEngine/normalizer";

/**
 * Strips "#" (SL) column if present as column 0 so NoticeForm receives
 * the standard category headers (11 columns for OTM, 9 columns for LTM).
 */
function normalizeHeadersAndRows(headers: string[], rows: string[][]) {
  const hasSlCol =
    headers.length > 0 &&
    (headers[0].trim() === "#" ||
      headers[0].toLowerCase().trim() === "sl" ||
      headers[0].toLowerCase().trim() === "slno" ||
      headers[0].toLowerCase().trim() === "sl.no");

  if (hasSlCol) {
    return {
      headers: headers.slice(1),
      rows: rows.map((r) => r.slice(1)),
    };
  }

  return { headers, rows };
}

/**
 * Adapts intermediate CategoryNoticeImportData into NoticeForm state properties.
 */
export function adaptCategoryImportToNoticeForm(
  importData: CategoryNoticeImportData,
  existingTablesList: any[] = [],
): NoticeFormStateUpdate {
  const { noticeDetails, tenderData, footerDetails, category } = importData;

  const { headers: adaptedHeaders, rows: adaptedRows } = normalizeHeadersAndRows(
    tenderData.headers,
    tenderData.rows,
  );

  // Detect location from first tender row if available
  const locationIdx = adaptedHeaders.findIndex(
    (h) => h.toLowerCase().includes("location") || h.toLowerCase().includes("স্থান"),
  );
  const detectedLocation =
    locationIdx !== -1 && adaptedRows.length > 0 ? adaptedRows[0][locationIdx] : "";

  // Establish default table header background color
  const headerBgColor = category === "OTM" ? "#059669" : "#0891b2";

  // Establish column colors
  const columnColors = adaptedHeaders.map((hdr) => {
    const isWinner = hdr.toUpperCase().replace(/\./g, "").includes("WINNER");
    return isWinner ? "#fde047" : "#ffffff";
  });

  const baseTableId =
    existingTablesList.length > 0 && existingTablesList[0]?.id
      ? existingTablesList[0].id
      : "tbl-1";

  const defaultBottomWarning =
    category === "LTM"
      ? "Only Zilla Parishad,Pabna Enlisted Tenderer (F/Y-2025-2026) can eligible for This Tender, Bank statement is not acceptable. In case of credit commitment attached to tender in format e-PW2B-5 must be paid"
      : "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।";

  // Build the adapted TableSpec object matching NoticeForm's table representation
  const updatedTable = {
    id: baseTableId,
    type: category === "OTM" ? "pwd_otm" : "pwd_ltm",
    officeName: noticeDetails.title,
    subTitle: noticeDetails.subTitle,
    workLocation: detectedLocation,
    noticeDateBlock: noticeDetails.publishDate,
    lastDateBlock: noticeDetails.lastDate,
    lotteryDateBlock: noticeDetails.lotteryDate,
    payOrderTo: footerDetails.payOrderTo,
    moreInfo: footerDetails.moreInfo,
    bottomWarning: defaultBottomWarning,
    headers: adaptedHeaders,
    rows: adaptedRows,
    headerBgColor,
    columnColors,
  };

  return {
    title: noticeDetails.title,
    subTitle: noticeDetails.subTitle,
    category,
    year: noticeDetails.year,
    publishDate: noticeDetails.publishDate,
    lastDate: noticeDetails.lastDate,
    lotteryDate: noticeDetails.lotteryDate,
    tablesList: [updatedTable],
  };
}

/**
 * Validates that an imported dataset can be converted to Table Engine V3 specifications.
 */
export function verifyTableSpecV3Compatibility(importData: CategoryNoticeImportData) {
  const { noticeDetails, tenderData, footerDetails, category } = importData;

  const { headers: adaptedHeaders, rows: adaptedRows } = normalizeHeadersAndRows(
    tenderData.headers,
    tenderData.rows,
  );

  const headerBgColor = category === "OTM" ? "#059669" : "#0891b2";
  const columnColors = adaptedHeaders.map((hdr) => {
    const isWinner = hdr.toUpperCase().replace(/\./g, "").includes("WINNER");
    return isWinner ? "#fde047" : "#ffffff";
  });

  const defaultBottomWarning =
    category === "LTM"
      ? "Only Zilla Parishad,Pabna Enlisted Tenderer (F/Y-2025-2026) can eligible for This Tender, Bank statement is not acceptable. In case of credit commitment attached to tender in format e-PW2B-5 must be paid"
      : "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।";

  return rowsArrayToTableSpec({
    id: "v3-verification",
    order: 0,
    tableTitle: noticeDetails.title,
    tableSubtitle: noticeDetails.subTitle,
    officeName: noticeDetails.title,
    subTitle: noticeDetails.subTitle,
    workLocation: "",
    noticeDateBlock: noticeDetails.publishDate,
    lastDateBlock: noticeDetails.lastDate,
    lotteryDateBlock: noticeDetails.lotteryDate,
    headers: adaptedHeaders,
    rows: adaptedRows,
    headerBgColor,
    columnColors,
    payOrderTo: footerDetails.payOrderTo,
    moreInfo: footerDetails.moreInfo,
    bottomWarning: defaultBottomWarning,
    category,
  });
}
