"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Landmark, Info, AlertCircle, Loader2, Phone, MapPin, Globe } from "lucide-react";
import { sanitizeBijoyDeep, autoConvertBijoy } from "@/lib/bijoyToUnicode";
import { parseNoticeTableData, tableSpecToRowsArray } from "@/lib/tableEngine/normalizer";
import { sortRowsByTenderIdAsc } from "@/lib/tableEngine/sortRows";
import { resolveNoticeFileUrl, buildNoticeDownloadFilename } from "@/lib/fileUrl";

interface Notice {
  id: string;
  no?: string;
  title: string;
  publishDate?: string;
  date: string;
  lotteryDate?: string;
  year?: string;
  fileUrl: string;
  category: string;
  tableData?: string | null;
}

interface NoticeTableProps {
  notices: Notice[];
  category?: string;
}

// -----------------------------------------------
// Helpers for table preview used in PDF capture
// -----------------------------------------------
const formatDisplayDate = (dateStr: any) => {
  if (dateStr === null || dateStr === undefined) return "";
  const str = String(dateStr).trim();
  if (!str) return "";

  if (str.includes("T")) {
    const datePart = str.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}-${m}-${y}`;
    }
  }

  const parts = str.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts.slice(1).join(" ");

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-");
    return timePart ? `${d}-${m}-${y} ${timePart}` : `${d}-${m}-${y}`;
  }

  if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(datePart)) {
    return str.replace(/\//g, "-");
  }

  const strictDatePattern =
    /^(?:\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]+\d{1,2}[\s,.-]+\d{2,4}|\d{1,2}[\s,.-]+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]+\d{2,4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?$/i;
  if (str.length > 40 || !strictDatePattern.test(str)) {
    return str;
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    const dateObj = new Date(parsed);
    const d = String(dateObj.getDate()).padStart(2, "0");
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
  }

  return str;
};

const isCurrencyColumn = (hdr: string) => {
  if (!hdr) return false;
  const lower = hdr.toLowerCase();
  return (
    lower.includes("cost") ||
    lower.includes("tk") ||
    lower.includes("taka") ||
    lower.includes("security") ||
    lower.includes("fees") ||
    lower.includes("fee") ||
    lower.includes("price") ||
    lower.includes("amount") ||
    lower.includes("turn over") ||
    lower.includes("turnover") ||
    lower.includes("similar work") ||
    lower.includes("similar") ||
    lower.includes("credit") ||
    lower.includes("টাকা")
  );
};

const parseFullNumericAmount = (val: string): number | null => {
  if (!val) return null;
  const str = String(val).trim();
  const lower = str.toLowerCase();

  if (lower.includes("cr")) {
    const numPart = parseFloat(lower.replace(/[^0-9.]/g, ""));
    if (!isNaN(numPart)) return numPart * 10000000;
  }
  if (lower.includes("lac") || lower.includes("lakh")) {
    const numPart = parseFloat(lower.replace(/[^0-9.]/g, ""));
    if (!isNaN(numPart)) return numPart * 100000;
  }

  const cleanVal = str.replace(/,/g, "").trim();
  const num = parseFloat(cleanVal);
  if (!isNaN(num) && /^\d+(\.\d+)?$/.test(cleanVal)) {
    return num;
  }

  return null;
};

const formatCellValue = (val: string, hdr: string) => {
  if (!val) return "";
  const str = String(val).trim();
  const lowerHdr = (hdr || "").toLowerCase();
  const compactHdr = lowerHdr.replace(/[^a-z0-9]/g, "");

  if (compactHdr === "tenderid" || compactHdr.includes("tenderid") || compactHdr === "slno" || compactHdr === "sl") {
    return str;
  }

  const isFullNumberAmountCol =
    lowerHdr.includes("estimate") ||
    lowerHdr.includes("app cost") ||
    lowerHdr.includes("appcost") ||
    lowerHdr.includes("app estimate") ||
    lowerHdr.includes("tender security") ||
    lowerHdr.includes("security");

  if (isFullNumberAmountCol) {
    const fullNum = parseFullNumericAmount(str);
    if (fullNum !== null) {
      if (fullNum % 1 === 0) {
        return fullNum.toLocaleString("en-IN");
      } else {
        return fullNum
          .toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/\.00$/, "");
      }
    }
  }

  if (isCurrencyColumn(hdr)) {
    const fullNum = parseFullNumericAmount(str);
    if (fullNum !== null) {
      if (fullNum >= 10000000) {
        const crVal = fullNum / 10000000;
        return `${parseFloat(crVal.toFixed(2))} Cr`;
      } else if (fullNum >= 100000) {
        const lacVal = fullNum / 100000;
        return `${parseFloat(lacVal.toFixed(2))} Lac`;
      }

      if (fullNum % 1 === 0) {
        return fullNum.toLocaleString("en-IN");
      } else {
        return fullNum
          .toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/\.00$/, "");
      }
    }
  }
  const isDateColumn =
    lowerHdr.includes("date") ||
    lowerHdr.includes("selling") ||
    lowerHdr.includes("schedule") ||
    lowerHdr.includes("deadline") ||
    lowerHdr.includes("time") ||
    lowerHdr.includes("তারিখ");

  if (isDateColumn) {
    return formatDisplayDate(str);
  }
  return str;
};

const getSellingDateDisplay = (formattedVal: string) => {
  if (!formattedVal || formattedVal === "N/A") return { datePart: formattedVal, timePart: "" };
  const str = String(formattedVal).trim();

  const timeMatches = str.match(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/gi);
  const parts = str.split(/\s+/);
  const datePart = parts[0];

  if (timeMatches && timeMatches.length > 0) {
    const lastTime = timeMatches[timeMatches.length - 1];
    return { datePart, timePart: lastTime };
  }

  const timePart = parts.slice(1).join(" ");
  return { datePart, timePart };
};

const getLocationWords = (val: string): string[] => {
  if (!val || val === "N/A") return val ? [val] : [];
  return String(val)
    .replace(/,\s*/g, ", ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

const getFormattedPrintDateTime = () => {
  const now = new Date();
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", formatOptions);
  const parts = formatter.formatToParts(now);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value || "";
  const minute = parts.find((p) => p.type === "minute")?.value;
  let dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value || "";
  dayPeriod = dayPeriod.toUpperCase();

  return `${day}/${month}/${year}, ${hour}:${minute} ${dayPeriod}`;
};

const formatHeaderTitle = (hdr: string) => {
  if (!hdr) return "";
  const str = String(hdr).trim();
  const lower = str.toLowerCase();

  if (lower.includes("work location") || lower.includes("worklocation")) return "Location";
  if (lower.includes("type of method") || lower.includes("type of mathod") || lower.includes("typeofmethod")) return "Method";

  if (lower.includes("selling") || lower.includes("last date")) {
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Schedule &</span>
        <span>Selling Date</span>
      </div>
    );
  }

  if (lower.includes("app estimate") || lower.includes("estimate cost")) {
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>APP Estimate</span>
        <span>Cost Tk.</span>
      </div>
    );
  }

  if (lower.includes("bank credit") || lower.includes("credit line")) {
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Bank</span>
        <span>Credit Line</span>
      </div>
    );
  }

  if (lower.includes("turn over") || lower.includes("turnover")) {
    const yearMatch = str.match(/\b\d+\s*(?:Years?|year|yrs?)\b/i);
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Turn Over</span>
        <span>{yearMatch ? yearMatch[0] : "05 Years"}</span>
      </div>
    );
  }

  if (lower.includes("similar work") || lower.includes("similar")) {
    const yearMatch = str.match(/\b\d+\s*(?:Years?|year|yrs?)\b/i);
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Similar Work</span>
        <span>{yearMatch ? yearMatch[0] : "05 Years"}</span>
      </div>
    );
  }

  if (lower.includes("document price") || (lower.includes("document") && lower.includes("price"))) {
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Document</span>
        <span>Price. Tk</span>
      </div>
    );
  }

  if (lower.includes("tender security") || lower.includes("security")) {
    return (
      <div className="flex flex-col items-center justify-center leading-tight">
        <span>Tender</span>
        <span>Security (BD)</span>
      </div>
    );
  }

  return str;
};

const parseMoney = (val: string) => {
  if (!val) return 0;
  const str = val.toString().trim();
  const lower = str.toLowerCase();
  if (lower.includes("cr")) {
    const numPart = parseFloat(lower.replace(/[^0-9.]/g, ""));
    if (!isNaN(numPart)) return numPart * 10000000;
  }
  if (lower.includes("lac") || lower.includes("lakh")) {
    const numPart = parseFloat(lower.replace(/[^0-9.]/g, ""));
    if (!isNaN(numPart)) return numPart * 100000;
  }
  return parseFloat(str.replace(/,/g, "")) || 0;
};

const formatMoney = (val: number) => {
  if (!val) return "0";
  if (val % 1 === 0) {
    return val.toLocaleString("en-IN");
  } else {
    return val
      .toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/\.00$/, "");
  }
};

// Renders the table data into the exact same printable HTML table structure as SingleNoticeClient
function TablePdfPreview({ tableData, category }: { tableData: string; title: string; category?: string }) {
  try {
    const v3Data = parseNoticeTableData(tableData);
    let tables: any[] = [];

    if (v3Data.tables && v3Data.tables.length > 0) {
      tables = v3Data.tables.map((table) => {
        const { headers, rows, columnColors } = tableSpecToRowsArray(table);
        return {
          id: table.id,
          type: table.tableType || "LTM",
          officeName: table.title || "",
          subTitle: table.subtitle || "",
          workLocation: table.workLocation || "",
          noticeDateBlock: table.noticeDateBlock || "",
          lastDateBlock: table.lastDateBlock || "",
          lotteryDateBlock: table.lotteryDateBlock || "",
          payOrderTo: table.payOrderTo || v3Data.sharedFooter?.payOrderTo || "",
          moreInfo: table.moreInfo || v3Data.sharedFooter?.moreInfo || "",
          bottomWarning: table.bottomWarning || v3Data.sharedFooter?.bottomWarning || "",
          headers,
          rows,
          headerBgColor: table.headerBgColor,
          columnColors,
        };
      });
    }

    if (tables.length > 0) {
      tables = sanitizeBijoyDeep(tables);
    }

    const defaultHeaderBg = (category || "").toUpperCase().includes("OTM") ? "#059669" : "#0891b2";

    return (
      <div className="space-y-8">
        {tables.map((table: any, tIdx: number) => {
          const headers =
            table.headers && table.headers.length > 0
              ? table.headers
              : table.type === "pwd_ltm"
                ? [
                    "Tender ID",
                    "Description",
                    "Location",
                    "AppCost (Tk)",
                    "Solvency (Tk)",
                    "Security (Tk)",
                    "Doc Fees (Tk)",
                    "Last Date & Time",
                  ]
                : [];
          const rawRows = table.rows || [];

          const hasSl = headers.some((h: string) => {
            const norm = (h || "").toLowerCase().replace(/\./g, "").trim();
            return norm === "slno" || norm === "sl";
          });

          const normalizedRows = rawRows.map((row: any) => {
            if (Array.isArray(row)) return row;
            if (row && typeof row === "object") {
              if (
                table.type === "pwd_ltm" ||
                "tenderId" in row ||
                "description" in row
              ) {
                return [
                  row.tenderId || "",
                  row.description || "",
                  row.location || "",
                  row.appCost || "",
                  row.solvency || "",
                  row.security || "",
                  row.docFees || "",
                  row.lastDateTime || row.lastDate || "",
                ];
              }
              return Object.values(row).map((val) => (val ?? "").toString());
            }
            return [];
          });

          const securityColIdx = headers.findIndex((h: string) =>
            h.toLowerCase().includes("security"),
          );
          const docFeesColIdx = headers.findIndex((h: string) => {
            const lower = h.toLowerCase();
            return lower.includes("fee") || lower.includes("price");
          });
          const winnerColIdx = headers.findIndex((h: string) =>
            h.toUpperCase().replace(/\./g, "").includes("WINNER"),
          );
          const isLotteryResult =
            (category || "").toUpperCase().includes("RESULT") ||
            table.type === "LOTTERY_RESULT";
          const winningRows =
            winnerColIdx !== -1
              ? normalizedRows.filter(
                  (r: string[]) => r[winnerColIdx] && r[winnerColIdx].trim() !== "",
                )
              : [];
          const displayRows = sortRowsByTenderIdAsc(
            isLotteryResult && winningRows.length > 0
              ? winningRows
              : normalizedRows,
            headers,
          );

          const totalSecurity =
            securityColIdx !== -1
              ? displayRows.reduce(
                  (sum: number, r: string[]) => sum + parseMoney(r[securityColIdx]),
                  0,
                )
              : 0;
          const totalDocFees =
            docFeesColIdx !== -1
              ? displayRows.reduce(
                  (sum: number, r: string[]) => sum + parseMoney(r[docFeesColIdx]),
                  0,
                )
              : 0;

          const totalCols = headers.length + (!hasSl ? 1 : 0);

          return (
            <div
              key={table.id || tIdx}
              className="pwd-table-block space-y-0 p-0 bg-white relative font-bangla text-black"
            >
              <div className="pwd-scroll-wrapper w-full bg-white relative">
                <div className="watermark-container absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.09] select-none z-20">
                  <img
                    src="/assets/icon/watermark.png"
                    alt="Watermark"
                    className="watermark-img w-[400px] md:w-[480px] h-auto max-h-[85%] object-contain"
                  />
                </div>

                <table className="w-full text-left font-semibold text-black relative z-10">
                  <thead className="text-black">
                    {table.officeName && (
                      <tr key="office-row">
                        <th
                          colSpan={totalCols}
                          className="p-2 md:p-3 font-extrabold text-3xl md:text-5xl text-center text-black bg-white print-office-name"
                          style={{
                            fontFamily: "'Tiro Bangla', serif",
                            backgroundColor: "#ffffff",
                            color: "#000000",
                          }}
                        >
                          {table.officeName}
                        </th>
                      </tr>
                    )}
                    {table.subTitle && (
                      <tr key="subtitle-row">
                        <th
                          colSpan={totalCols}
                          className="p-2 font-bold text-[18px] md:text-[22px] text-center text-black bg-white print-subtitle"
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#000000",
                          }}
                        >
                          {table.subTitle}
                        </th>
                      </tr>
                    )}
                    {table.noticeDateBlock && (
                      <tr key="date-row">
                        <th
                          colSpan={totalCols}
                          className="p-0 bg-white date-block-th"
                          style={{
                            padding: "0 !important",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          <div className="flex justify-end w-full m-0 p-0">
                            <div
                              className="date-block-badge font-bold text-xs md:text-sm text-right whitespace-nowrap"
                              style={{
                                backgroundColor: table.headerBgColor || defaultHeaderBg,
                                color: "#000000",
                                padding: "3px 10px",
                                borderLeft: "1px solid #000000",
                              }}
                            >
                              Egp Published Date : {formatDisplayDate(table.noticeDateBlock)}
                            </div>
                          </div>
                        </th>
                      </tr>
                    )}
                    <tr
                      key="headers-row"
                      style={{
                        backgroundColor: table.headerBgColor || defaultHeaderBg,
                      }}
                    >
                      {!hasSl && (
                        <th
                          className="p-2 font-bold text-sm capitalize text-center whitespace-nowrap"
                          style={{
                            backgroundColor: table.headerBgColor || defaultHeaderBg,
                            color: "#000000",
                            textAlign: "center",
                          }}
                        >
                          #
                        </th>
                      )}
                      {headers.map((hdr: string, idx: number) => {
                        const isDesc =
                          (hdr || "").toLowerCase().includes("description") ||
                          (hdr || "").toLowerCase().includes("works");
                        const isTender = (hdr || "")
                          .toLowerCase()
                          .replace(/\s/g, "")
                          .includes("tenderid");
                        const isSl =
                          (hdr || "")
                            .toLowerCase()
                            .replace(/\s/g, "")
                            .includes("slno") ||
                          (hdr || "")
                            .toLowerCase()
                            .replace(/\s/g, "")
                            .includes("sl");
                        const isLocation =
                          (hdr || "").toLowerCase().includes("location");
                        return (
                          <th
                            key={idx}
                            className={`p-2 font-bold text-base capitalize text-center ${
                              isDesc
                                ? "desc-column w-[32%] min-w-[220px] whitespace-normal"
                                : isLocation
                                  ? "location-column w-[1%] whitespace-nowrap text-center"
                                  : "auto-column"
                            } ${isTender || isSl ? "whitespace-nowrap" : ""}`}
                            style={{
                              backgroundColor: table.headerBgColor || defaultHeaderBg,
                              color: "#000000",
                            }}
                          >
                            {formatHeaderTitle(hdr)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row: string[], rIdx: number) => {
                      const isWinnerRow =
                        winnerColIdx !== -1 &&
                        row[winnerColIdx] &&
                        row[winnerColIdx].trim() !== "";
                      return (
                        <tr
                          key={rIdx}
                          className={isWinnerRow ? "bg-[#fffbeb] font-bold" : ""}
                        >
                          {!hasSl && (
                            <td
                              className="p-3 text-black text-base font-bold text-center whitespace-nowrap"
                              style={
                                isWinnerRow
                                  ? { backgroundColor: "#fffbeb" }
                                  : table.columnColors?.[0]
                                    ? { backgroundColor: table.columnColors[0] }
                                    : undefined
                              }
                            >
                              {rIdx + 1}
                            </td>
                          )}
                          {row.map((cell: string, cIdx: number) => {
                            const cellBg = isWinnerRow
                              ? "#fffbeb"
                              : table.columnColors?.[cIdx] || "#ffffff";
                            const isDesc =
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .includes("description") ||
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .includes("works");
                            const isTender = (headers[cIdx] || "")
                              .toLowerCase()
                              .replace(/\s/g, "")
                              .includes("tenderid");
                            const isSl =
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .replace(/\s/g, "")
                                .includes("slno") ||
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .replace(/\s/g, "")
                                .includes("sl");
                            const isWinnerCell = cIdx === winnerColIdx;
                            const isSellingDateCol =
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .includes("selling") ||
                              (headers[cIdx] || "")
                                .toLowerCase()
                                .includes("last date");

                            const formattedVal = formatCellValue(
                              cell,
                              headers[cIdx] || "",
                            );

                            const colHdr = (headers[cIdx] || "")
                              .toLowerCase()
                              .trim();
                            const isTenderCol = colHdr
                              .replace(/\s/g, "")
                              .includes("tenderid");
                            const isCenterAlignCol =
                              isTenderCol ||
                              colHdr === "sl.no" ||
                              colHdr === "sl no" ||
                              colHdr === "sl. no" ||
                              colHdr === "sl" ||
                              colHdr.includes("method") ||
                              colHdr.includes("mathod");

                            const isCurrencyAlignCol =
                              colHdr.includes("cost") ||
                              colHdr.includes("price") ||
                              colHdr.includes("fee") ||
                              colHdr.includes("security") ||
                              colHdr.includes("solvency") ||
                              colHdr.includes("credit") ||
                              colHdr.includes("turnover") ||
                              colHdr.includes("turn over") ||
                              colHdr.includes("amount") ||
                              colHdr.includes("similar") ||
                              colHdr.includes("tk");

                            const cellAlignClass = isCenterAlignCol
                              ? "text-center"
                              : isCurrencyAlignCol
                                ? "text-right"
                                : "text-left";

                            const isCreditCol =
                              colHdr.includes("credit") ||
                              colHdr.includes("solvency") ||
                              colHdr.includes("line");
                            const isLocationCol = colHdr.includes("location");
                            const isNoWrapCell =
                              !isDesc &&
                              !isLocationCol &&
                              (isTender ||
                                isSl ||
                                isCreditCol ||
                                /^\s*[\d,.]+\s*(?:lac|cr|tk)?\s*$/i.test(formattedVal));

                            return (
                              <td
                                key={cIdx}
                                className={`p-2.5 text-black text-[15px] font-semibold ${cellAlignClass} ${
                                  isDesc
                                    ? "desc-column w-[32%] min-w-[220px] whitespace-normal text-left"
                                    : isLocationCol
                                      ? "location-column w-[1%] whitespace-nowrap text-center"
                                      : "auto-column"
                                } ${isNoWrapCell ? "whitespace-nowrap" : ""}`}
                                style={{
                                  backgroundColor: cellBg,
                                  textAlign:
                                    isCenterAlignCol || isLocationCol
                                      ? "center"
                                      : isCurrencyAlignCol
                                        ? "right"
                                        : "left",
                                  whiteSpace: isDesc
                                    ? "normal"
                                    : isLocationCol || isNoWrapCell
                                      ? "nowrap"
                                      : undefined,
                                }}
                              >
                                {isWinnerCell && isWinnerRow && (
                                  <span className="inline-block mr-1">🏆</span>
                                )}
                                {(() => {
                                  if (
                                    isSellingDateCol &&
                                    formattedVal &&
                                    formattedVal !== "N/A"
                                  ) {
                                    const { datePart, timePart } =
                                      getSellingDateDisplay(formattedVal);
                                    return (
                                      <div className="selling-date-cell flex flex-col text-center leading-tight">
                                        <span className="whitespace-nowrap font-normal text-[12.5px]">
                                          {datePart}
                                        </span>
                                        {timePart ? (
                                          <span className="whitespace-nowrap font-normal mt-0.5 text-[12.5px]">
                                            {timePart}
                                          </span>
                                        ) : null}
                                      </div>
                                    );
                                  }
                                  if (
                                    isLocationCol &&
                                    formattedVal &&
                                    formattedVal !== "N/A"
                                  ) {
                                    const locationWords = getLocationWords(formattedVal);
                                    return (
                                      <div className="location-cell flex flex-col items-center justify-center text-center leading-tight">
                                        {locationWords.map((word, wIdx) => (
                                          <span key={wIdx} className="location-word whitespace-nowrap">
                                            {word}
                                          </span>
                                        ))}
                                      </div>
                                    );
                                  }
                                  return formattedVal;
                                })()}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}

                    {(securityColIdx !== -1 || docFeesColIdx !== -1) && (
                      <tr
                        className="bg-[#facc15] font-bold text-black total-amount-row"
                        style={{ backgroundColor: "#facc15" }}
                      >
                        {headers.map((hdr: string, idx: number) => {
                          if (idx === 0) {
                            const colSpanCount = Math.min(
                              securityColIdx !== -1
                                ? securityColIdx
                                : docFeesColIdx,
                              headers.length,
                            );
                            return (
                              <td
                                key={idx}
                                className="p-3 text-right text-sm font-semibold text-black bg-[#facc15]"
                                style={{
                                  backgroundColor: "#facc15",
                                  textAlign: "right",
                                }}
                                colSpan={colSpanCount + (!hasSl ? 1 : 0)}
                              >
                                Total Amount BD Tk =
                              </td>
                            );
                          }
                          const minTotalColIdx = Math.min(
                            securityColIdx !== -1
                              ? securityColIdx
                              : docFeesColIdx,
                            headers.length,
                          );
                          if (idx < minTotalColIdx) return null;
                          if (idx === securityColIdx) {
                            return (
                              <td
                                key={idx}
                                className="p-3 text-sm font-semibold text-black bg-[#facc15] text-right"
                                style={{
                                  backgroundColor: "#facc15",
                                  textAlign: "right",
                                }}
                              >
                                {formatMoney(totalSecurity)}
                              </td>
                            );
                          }
                          if (idx === docFeesColIdx) {
                            return (
                              <td
                                key={idx}
                                className="p-3 text-sm font-semibold text-black bg-[#facc15] text-right"
                                style={{
                                  backgroundColor: "#facc15",
                                  textAlign: "right",
                                }}
                              >
                                {formatMoney(totalDocFees)}
                              </td>
                            );
                          }
                          return (
                            <td
                              key={idx}
                              className="p-3 bg-[#facc15]"
                              style={{ backgroundColor: "#facc15" }}
                            ></td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(table.payOrderTo || true) && (
                <div className="details-footer-block w-full bg-white grid grid-cols-2 text-black">
                  <div className="details-footer-col p-2 flex flex-col justify-start">
                    <div className="mb-1">
                      <span
                        className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                        style={{
                          backgroundColor: table.headerBgColor || defaultHeaderBg,
                          color: "#000000",
                        }}
                      >
                        <Landmark size={13} className="flex-shrink-0" />
                        BD Pay Order To :
                      </span>
                    </div>
                    <div className="details-footer-text text-[13px] font-bold text-black leading-snug whitespace-pre-line pl-0.5">
                      {table.payOrderTo || "N/A"}
                    </div>
                  </div>

                  <div className="details-footer-col p-2 flex flex-col justify-start">
                    <div className="mb-1">
                      <span
                        className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                        style={{
                          backgroundColor: table.headerBgColor || defaultHeaderBg,
                          color: "#000000",
                        }}
                      >
                        <Info size={13} className="flex-shrink-0" />
                        Contact Info / e-Tender Solutions :
                      </span>
                    </div>
                    <div className="details-footer-text text-[13px] font-bold text-black leading-snug pl-0.5">
                      <div>Engr. Md. Shah Alom B.Sc. Engr.(Civil)</div>
                      <div className="contact-info-line flex items-center gap-1">
                        <Phone size={11} strokeWidth={2.5} className="contact-info-icon flex-shrink-0 text-black" />
                        <span>Mobile No: 01711-805086, 01972-805086</span>
                      </div>
                      <div className="contact-info-line flex items-center gap-1">
                        <MapPin size={11} strokeWidth={2.5} className="contact-info-icon flex-shrink-0 text-black" />
                        <span>L M B Market 1st Floor, Pabna. | salomdhaka@gmail.com</span>
                      </div>
                      <div className="contact-info-line flex items-center gap-1">
                        <Globe size={11} strokeWidth={2.5} className="contact-info-icon flex-shrink-0 text-black" />
                        <span>Web: www.egpbtc.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {table.bottomWarning && (
                <div className="warning-footer-block w-full bg-white p-2 flex items-center gap-2.5 text-black">
                  <div className="flex-shrink-0">
                    <span
                      className="warning-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider text-white"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                      }}
                    >
                      <AlertCircle size={13} className="flex-shrink-0 text-white" />
                      INFORMATION :
                    </span>
                  </div>
                  <div
                    className="warning-footer-text text-[13px] font-bold text-red-600 leading-snug pl-0.5 font-bangla"
                    style={{ color: "#dc2626", fontFamily: "'Tiro Bangla', serif" }}
                  >
                    {table.bottomWarning}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch {
    return null;
  }
}

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBengaliDigits = (numStr: string | number) =>
  numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);

const getNoticeGroupCount = (tableData?: string | null, category?: string): number => {
  if (!tableData) return 0;
  try {
    const v3Data = parseNoticeTableData(tableData);
    if (v3Data.tables && v3Data.tables.length > 0) {
      return v3Data.tables.reduce((acc: number, t: any) => {
        const { headers, rows } = tableSpecToRowsArray(t);
        const winnerColIdx = (headers || []).findIndex((h: string) =>
          h.toUpperCase().replace(/\./g, "").includes("WINNER")
        );
        const isWinnerNotice = (category || "").toLowerCase().includes("result") || t.tableType === "LOTTERY_RESULT";
        const winningRows = winnerColIdx !== -1 ? (rows || []).filter((r: any) => r[winnerColIdx] && r[winnerColIdx].trim() !== "") : [];
        const displayRows = isWinnerNotice && winningRows.length > 0 ? winningRows : (rows || []);
        return acc + displayRows.length;
      }, 0);
    }
  } catch {
    // fallback
  }
  return 0;
};

// -----------------------------------------------
// Download button for table-based notices (matches SingleNoticeClient PDF output 100%)
// -----------------------------------------------
function TableDownloadButton({
  notice,
  className,
}: {
  notice: Notice;
  className: string;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    if (!captureRef.current || loading) return;
    setLoading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro" as any),
        import("jspdf"),
      ]);

      const isLandscape = true;
      const pdfWidth = 297;
      const pdfHeight = 210;
      const targetContainerWidth = 1122;
      const maxPageContentHeight = 740;

      const cleanDate = (notice.date || notice.publishDate || "").replace(/[/\\:*?"<>|]/g, "-").trim();
      const sanitizedTitle = (notice.title || "notice").slice(0, 50).replace(/[/\\:*?"<>|]/g, "-").trim();
      const groupCount = getNoticeGroupCount(notice.tableData, notice.category);
      const groupSuffix = groupCount > 0 ? ` (${toBengaliDigits(groupCount)} গ্রুপ)` : "";
      const fileName = cleanDate ? `${sanitizedTitle}-${cleanDate}${groupSuffix}.pdf` : `${sanitizedTitle}${groupSuffix}.pdf`;

      const sourceBlocks = captureRef.current.querySelectorAll(".pwd-table-block");
      if (sourceBlocks.length === 0) {
        setLoading(false);
        return;
      }

      const tempWrapper = document.createElement("div");
      tempWrapper.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${targetContainerWidth}px;
        z-index: -9999;
        background: #ffffff;
      `;

      const styleEl = document.createElement("style");
      styleEl.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Albert+Sans:wght@400;600;700&display=swap');
        @font-face {
          font-family: 'SutonnyOMJ';
          src: url('/fonts/SutonnyOMJ.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'SutonnyMJ';
          src: url('/fonts/SutonnyMJ.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        *, *:before, *:after {
          box-sizing: border-box !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .pdf-page-box {
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        .pdf-page-box *, .pdf-page-box *[class], .pdf-page-box *[style] {
          font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .pdf-page-box .print-office-name, .pdf-page-box .warning-card-content, .pdf-page-box .warning-card-content * {
          font-family: 'Tiro Bangla', serif !important;
        }
        .pdf-page-box .custom-print-header {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 4px !important;
          line-height: 1 !important;
          border: none !important;
          border-bottom: none !important;
        }
        .pdf-page-box .pwd-scroll-wrapper {
          width: 100% !important;
          min-width: 100% !important;
          display: block !important;
          overflow: visible !important;
          background-color: #ffffff !important;
          border: none !important;
        }
        .pdf-page-box table {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          table-layout: auto !important;
          border-collapse: separate !important;
          border-spacing: 0 !important;
          border: none !important;
          margin: 0 !important;
          background-color: #ffffff !important;
          box-sizing: border-box !important;
        }
        .pdf-page-box thead,
        .pdf-page-box tbody,
        .pdf-page-box tr {
          border: none !important;
        }
        .pdf-page-box th,
        .pdf-page-box thead th,
        .pdf-page-box td,
        .pdf-page-box tbody td,
        .pdf-page-box .print-office-name,
        .pdf-page-box .print-subtitle,
        .pdf-page-box .date-block-th {
          border-top: none !important;
          border-left: none !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
          border-color: #000000 !important;
          padding: 2px 3px !important;
          word-wrap: break-word !important;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          box-sizing: border-box !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .pdf-page-box thead tr:first-child > th,
        .pdf-page-box thead tr:first-child > td,
        .pdf-page-box table > tbody:first-child > tr:first-child > th,
        .pdf-page-box table > tbody:first-child > tr:first-child > td {
          border-top: 1px solid #000000 !important;
        }
        .pdf-page-box tr > th:first-child,
        .pdf-page-box tr > td:first-child {
          border-left: 1px solid #000000 !important;
        }
        .pdf-page-box .print-office-name {
          font-size: 16pt !important;
          text-align: center !important;
          font-weight: bold !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #000000 !important;
          padding: 2px 4px !important;
          filter: none !important;
        }
        .pdf-page-box .print-subtitle {
          font-size: 12.5px !important;
          text-align: center !important;
          font-weight: bold !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
          color: #000000 !important;
          padding: 2px 4px !important;
          filter: none !important;
        }
        .pdf-page-box th,
        .pdf-page-box th *,
        .pdf-page-box thead th,
        .pdf-page-box thead th * {
          color: #000000 !important;
        }
        .pdf-page-box th:not(.print-office-name):not(.print-subtitle):not(.date-block-th) {
          font-size: 11px !important;
          font-weight: 700 !important;
          line-height: 1.15 !important;
          color: #000000 !important;
          filter: brightness(1.3) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-page-box td {
          color: #000000 !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          line-height: 1.2 !important;
        }
        .pdf-page-box .auto-column {
          white-space: nowrap !important;
          width: 1% !important;
        }
        .pdf-page-box .location-column {
          white-space: nowrap !important;
          width: 1% !important;
          min-width: 0 !important;
          max-width: none !important;
          text-align: center !important;
          line-height: 1.15 !important;
          font-size: 10.5px !important;
        }
        .pdf-page-box .location-cell {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          line-height: 1.15 !important;
        }
        .pdf-page-box .location-word {
          display: block !important;
          white-space: nowrap !important;
          font-size: 10.5px !important;
          line-height: 1.15 !important;
        }
        .pdf-page-box .desc-column {
          white-space: normal !important;
          width: auto !important;
          min-width: 150px !important;
          word-wrap: break-word !important;
          word-break: normal !important;
          font-size: 11px !important;
          line-height: 1.25 !important;
        }
        .pdf-page-box td.desc-column {
          font-size: 12px !important;
          line-height: 1.25 !important;
        }
        .pdf-page-box .date-block-th {
          padding: 0 !important;
          background-color: #ffffff !important;
          filter: none !important;
        }
        .pdf-page-box .date-block-badge,
        .pdf-page-box .date-block-badge * {
          color: #000000 !important;
        }
        .pdf-page-box .date-block-badge {
          margin: 0 !important;
          padding: 1.5px 6px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #000000 !important;
          display: inline-block !important;
          border-left: 1px solid #000000 !important;
          border-top: none !important;
          border-right: none !important;
          border-bottom: none !important;
          filter: brightness(1.3) !important;
        }
        .pdf-page-box .selling-date-cell, .selling-date-cell {
          font-size: 10.5px !important;
          line-height: 1.15 !important;
          white-space: nowrap !important;
        }
        .pdf-page-box .footer-card-label svg, .pdf-page-box .warning-card-label svg {
          width: 16px !important;
          height: 16px !important;
          display: inline-block !important;
          vertical-align: middle !important;
          flex-shrink: 0 !important;
        }
        .pdf-page-box .total-amount-row, .pdf-page-box .total-amount-row td {
          background-color: #facc15 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          color: #000000 !important;
        }
        .pdf-page-box .details-footer-block {
          width: 100% !important;
          min-width: 100% !important;
          margin: 0 !important;
          margin-top: 0 !important;
          border-top: none !important;
          border-left: 1px solid #000000 !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
          outline: none !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        .pdf-page-box .details-footer-col {
          padding: 3px 6px !important;
          box-sizing: border-box !important;
          border: none !important;
        }
        .pdf-page-box .details-footer-col:first-child {
          border-right: 1px solid #000000 !important;
        }
        .pdf-page-box .details-footer-badge,
        .pdf-page-box .details-footer-badge *,
        .pdf-page-box .details-footer-badge svg {
          color: #000000 !important;
          stroke: #000000 !important;
        }
        .pdf-page-box .details-footer-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 10.5px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          padding: 1.5px 5px !important;
          border-radius: 4px !important;
          margin-bottom: 2px !important;
          color: #000000 !important;
          filter: brightness(1.3) !important;
        }
        .pdf-page-box .details-footer-text, .pdf-page-box .details-footer-text * {
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          color: #000000 !important;
        }
        .pdf-page-box .contact-info-line {
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .pdf-page-box .contact-info-icon,
        .pdf-page-box .details-footer-text svg.contact-info-icon {
          width: 11px !important;
          height: 11px !important;
          min-width: 11px !important;
          min-height: 11px !important;
          display: inline-block !important;
          vertical-align: middle !important;
          flex-shrink: 0 !important;
          color: #000000 !important;
          stroke: #000000 !important;
        }
        .pdf-page-box .warning-footer-block {
          width: 100% !important;
          min-width: 100% !important;
          margin: 0 !important;
          margin-top: 0 !important;
          border-top: none !important;
          border-left: 1px solid #000000 !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
          outline: none !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 3px 6px !important;
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        .pdf-page-box .warning-footer-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 4px !important;
          font-size: 10.5px !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          padding: 1.5px 5px !important;
          border-radius: 4px !important;
          background-color: #dc2626 !important;
          color: #ffffff !important;
          flex-shrink: 0 !important;
        }
        .pdf-page-box .warning-footer-text, .pdf-page-box .warning-footer-text * {
          font-size: 12px !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
          color: #dc2626 !important;
          font-family: 'Tiro Bangla', serif !important;
        }
      `;
      tempWrapper.appendChild(styleEl);
      document.body.appendChild(tempWrapper);

      const createPageElement = () => {
        const pageDiv = document.createElement("div");
        pageDiv.className = "pdf-page-box";
        pageDiv.style.cssText = `
          width: ${targetContainerWidth}px;
          min-height: auto;
          box-sizing: border-box;
          padding: 6px 14px 14px 14px;
          background: #ffffff;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          margin-bottom: 20px;
        `;

        const topBar = document.createElement("div");
        topBar.className = "custom-print-header";
        topBar.style.cssText = "display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 0; margin-top: 0; margin-bottom: 4px; line-height: 1; font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif; border: none !important; border-bottom: none !important;";
        topBar.innerHTML = `
          <div class="pdf-page-num" style="width: 30%; text-align: left; font-size: 11px; font-weight: bold; color: #000000; line-height: 1;">Page 1</div>
          <div style="width: 40%; text-align: center; font-size: 11px; font-weight: bold; color: #000000; line-height: 1;">S. Alom EGP Tender & Consultant</div>
          <div style="width: 30%; text-align: right; font-size: 11px; color: #000000; font-weight: bold; line-height: 1;">Print: ${getFormattedPrintDateTime()}</div>
        `;
        pageDiv.appendChild(topBar);
        return pageDiv;
      };

      const pages: HTMLElement[] = [];

      sourceBlocks.forEach((block) => {
        const originalTable = block.querySelector("table");
        const originalThead = originalTable?.querySelector("thead");
        const originalTbody = originalTable?.querySelector("tbody");
        const originalRows = Array.from(originalTbody?.children || []).filter(
          (el) =>
            el.tagName === "TR" &&
            !el.querySelector(".print-office-name, .print-subtitle, .date-block-th, th")
        ) as HTMLTableRowElement[];

        const totalsRow = originalRows.find((r) => r.classList.contains("total-amount-row"));
        const dataRows = originalRows.filter((r) => !r.classList.contains("total-amount-row"));

        const footerElements = Array.from(block.querySelectorAll(".details-footer-block, .warning-footer-block")) as HTMLElement[];

        const createTableOnPage = (targetPage: HTMLElement) => {
          // Ensure targetPage doesn't already have an empty table wrapper
          const existingWrappers = Array.from(targetPage.querySelectorAll(".pwd-scroll-wrapper"));
          existingWrappers.forEach((w) => {
            if (w.querySelectorAll("tbody tr").length === 0) {
              w.remove();
            }
          });

          const tableContainer = document.createElement("div");
          tableContainer.className = "pwd-scroll-wrapper relative";
          tableContainer.style.cssText = "width: 100% !important; min-width: 100% !important; overflow: visible; position: relative;";

          const watermark = document.createElement("div");
          watermark.className = "watermark-container";
          watermark.style.cssText = "position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0.09; z-index: 20;";
          watermark.innerHTML = `<img src="/assets/icon/watermark.png" style="width: 440px; height: auto; object-fit: contain;" />`;
          tableContainer.appendChild(watermark);

          const newTable = document.createElement("table");
          newTable.className = "w-full text-left font-semibold text-black relative z-10";
          newTable.style.cssText = "width: 100% !important; min-width: 100% !important; border-collapse: separate !important; border-spacing: 0 !important; border: none !important; table-layout: auto !important;";

          if (originalThead) {
            const clonedThead = originalThead.cloneNode(true) as HTMLTableSectionElement;
            const seenRowTypes = new Set<string>();
            Array.from(clonedThead.children).forEach((tr) => {
              if (tr.tagName !== "TR") return;
              let rowType = "col-headers";
              if (tr.querySelector(".print-office-name")) rowType = "office-name";
              else if (tr.querySelector(".print-subtitle")) rowType = "sub-title";
              else if (tr.querySelector(".date-block-th")) rowType = "date-block";
              if (seenRowTypes.has(rowType)) {
                tr.remove();
              } else {
                seenRowTypes.add(rowType);
              }
            });
            newTable.appendChild(clonedThead);
          }

          const newTbody = document.createElement("tbody");
          newTable.appendChild(newTbody);

          tableContainer.appendChild(newTable);
          targetPage.appendChild(tableContainer);

          return { tableContainer, newTable, newTbody };
        };

        let currentPage = createPageElement();
        tempWrapper.appendChild(currentPage);
        pages.push(currentPage);

        let { newTbody } = createTableOnPage(currentPage);

        dataRows.forEach((row) => {
          const clonedRow = row.cloneNode(true) as HTMLTableRowElement;
          newTbody.appendChild(clonedRow);

          if (newTbody.children.length > 1 && currentPage.offsetHeight > maxPageContentHeight + 45) {
            newTbody.removeChild(clonedRow);

            currentPage = createPageElement();
            tempWrapper.appendChild(currentPage);
            pages.push(currentPage);

            const nextTable = createTableOnPage(currentPage);
            newTbody = nextTable.newTbody;
            newTbody.appendChild(clonedRow);
          }
        });

        if (totalsRow) {
          const clonedTotals = totalsRow.cloneNode(true) as HTMLTableRowElement;
          newTbody.appendChild(clonedTotals);
          if (newTbody.children.length > 1 && currentPage.offsetHeight > maxPageContentHeight + 45) {
            newTbody.removeChild(clonedTotals);
            currentPage = createPageElement();
            tempWrapper.appendChild(currentPage);
            pages.push(currentPage);

            const nextTable = createTableOnPage(currentPage);
            newTbody = nextTable.newTbody;
            newTbody.appendChild(clonedTotals);
          }
        }

        footerElements.forEach((footerEl) => {
          const clonedFooter = footerEl.cloneNode(true) as HTMLElement;
          currentPage.appendChild(clonedFooter);

          if (currentPage.offsetHeight > maxPageContentHeight + 45) {
            currentPage.removeChild(clonedFooter);
            currentPage = createPageElement();
            tempWrapper.appendChild(currentPage);
            pages.push(currentPage);
            clonedFooter.style.setProperty("border-top", "1px solid #000000", "important");
            currentPage.appendChild(clonedFooter);
          }
        });
      });

      if (typeof document !== "undefined" && (document as any).fonts) {
        await (document as any).fonts.ready;
      }

      const pdf = new (jsPDF as any)(isLandscape ? "l" : "p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i];
        pageEl.style.minHeight = `${maxPageContentHeight + 40}px`;
        const pageNumEl = pageEl.querySelector(".pdf-page-num");
        if (pageNumEl) {
          pageNumEl.textContent = `Page ${i + 1}`;
        }

        const tableEl = pageEl.querySelector("table");
        if (tableEl) {
          const tableWidth = Math.max(tableEl.offsetWidth, tableEl.scrollWidth);
          const scrollWrapper = pageEl.querySelector(".pwd-scroll-wrapper") as HTMLElement;
          const topBar = pageEl.querySelector(".custom-print-header") as HTMLElement;
          const footerBlocks = pageEl.querySelectorAll(".details-footer-block, .warning-footer-block");

          const neededPageWidth = tableWidth + 28;
          if (neededPageWidth > targetContainerWidth) {
            pageEl.style.width = `${neededPageWidth}px`;
            if (scrollWrapper) {
              scrollWrapper.style.width = `${tableWidth}px`;
              scrollWrapper.style.minWidth = `${tableWidth}px`;
              scrollWrapper.style.maxWidth = `${tableWidth}px`;
            }
            if (topBar) {
              topBar.style.width = `${tableWidth}px`;
              topBar.style.minWidth = `${tableWidth}px`;
              topBar.style.maxWidth = `${tableWidth}px`;
            }
            footerBlocks.forEach((f: any) => {
              f.style.width = `${tableWidth}px`;
              f.style.minWidth = `${tableWidth}px`;
              f.style.maxWidth = `${tableWidth}px`;
            });
          } else {
            const innerWidth = targetContainerWidth - 28;
            if (scrollWrapper) {
              scrollWrapper.style.width = `${innerWidth}px`;
              scrollWrapper.style.minWidth = `${innerWidth}px`;
              scrollWrapper.style.maxWidth = `${innerWidth}px`;
            }
            tableEl.style.width = `${innerWidth}px`;
            tableEl.style.minWidth = `${innerWidth}px`;
            tableEl.style.maxWidth = `${innerWidth}px`;
            if (topBar) {
              topBar.style.width = `${innerWidth}px`;
              topBar.style.minWidth = `${innerWidth}px`;
              topBar.style.maxWidth = `${innerWidth}px`;
            }
            footerBlocks.forEach((f: any) => {
              f.style.width = `${innerWidth}px`;
              f.style.minWidth = `${innerWidth}px`;
              f.style.maxWidth = `${innerWidth}px`;
            });
          }
        }

        pageEl.querySelectorAll("*").forEach((el: any) => {
          if (el.style) {
            el.style.outline = "none";
            el.style.boxShadow = "none";
          }
        });
        pageEl
          .querySelectorAll(
            "thead th, thead th *, .date-block-badge, .date-block-badge *, .details-footer-badge, .details-footer-badge *"
          )
          .forEach((el: any) => {
            if (el.style) {
              el.style.setProperty("color", "#000000", "important");
            }
            if (el.tagName && (el.tagName.toLowerCase() === "svg" || el.closest?.("svg"))) {
              el.setAttribute("stroke", "#000000");
              if (el.style) {
                el.style.setProperty("stroke", "#000000", "important");
              }
            }
          });

        const canvas = await (html2canvas as any)(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(fileName);
      document.body.removeChild(tempWrapper);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hidden off-screen capture area */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "-9999px",
          width: "1122px",
          color: "#000000",
          backgroundColor: "#ffffff",
          zIndex: -1,
        }}
      >
        <div ref={captureRef} className="bg-white text-black">
          <TablePdfPreview tableData={notice.tableData!} title={notice.title} category={notice.category} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={className}
        title="Download PDF"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
        ) : (
          <i className="fa-solid fa-download"></i>
        )}
      </button>
    </>
  );
}

// -----------------------------------------------
// Main NoticeTable component
// -----------------------------------------------
const NoticeTable: React.FC<NoticeTableProps> = ({ notices, category }) => {
  // Determine if we show publish date (only for OTM and LTM tabs)
  const currentCategory = category || (notices.length > 0 ? notices[0].category : null);
  const showPublishDate = currentCategory
    ? (currentCategory.toLowerCase() === "otm" || currentCategory.toLowerCase() === "ltm")
    : true; // Default to true if not specified and notices array is empty

  const isLotteryResult = notices.length > 0 && notices.some(n =>
    n.category === "Lottery Result" ||
    n.category === "Lottery Pending" ||
    (n.lotteryDate && n.lotteryDate.trim() !== "")
  );

  // Check if a notice can provide a download (either via fileUrl or via client-side PDF generation from tableData)
  const canDownload = (notice: Notice) => {
    if (notice.fileUrl) return true;
    if (notice.tableData) return true;
    return Boolean(notice.id);
  };

  const desktopDownloadBtn = (notice: Notice) => {
    const cls = "bg-text-1 !text-secondary px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-primary transition shadow-sm flex items-center gap-2 cursor-pointer";
    if (notice.tableData) {
      return <TableDownloadButton notice={notice} className={cls} />;
    }
    if (notice.fileUrl) {
      const downloadName = buildNoticeDownloadFilename({
        title: notice.title,
        year: notice.year,
        date: notice.date,
        publishDate: notice.publishDate,
        filePath: notice.fileUrl,
      });
      const downloadHref = resolveNoticeFileUrl(notice.fileUrl, downloadName);
      return (
        <a href={downloadHref} download={downloadName} className={cls} title="Download File">
          <i className="fa-solid fa-download"></i>
        </a>
      );
    }
    return (
      <Link href={`/egp-notice/${notice.id}`} className={cls} title="Download PDF">
        <i className="fa-solid fa-download"></i>
      </Link>
    );
  };

  const mobileDownloadBtn = (notice: Notice) => {
    const cls = "bg-text-1 !text-secondary hover:!text-black hover:bg-primary p-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center aspect-square shadow-sm active:scale-95 transition-all cursor-pointer";
    if (notice.tableData) {
      return <TableDownloadButton notice={notice} className={cls} />;
    }
    if (notice.fileUrl) {
      const downloadName = buildNoticeDownloadFilename({
        title: notice.title,
        year: notice.year,
        date: notice.date,
        publishDate: notice.publishDate,
        filePath: notice.fileUrl,
      });
      const downloadHref = resolveNoticeFileUrl(notice.fileUrl, downloadName);
      return (
        <a href={downloadHref} download={downloadName} className={cls} title="Download File">
          <i className="fa-solid fa-download"></i>
        </a>
      );
    }
    return (
      <Link href={`/egp-notice/${notice.id}`} className={cls} title="Download PDF">
        <i className="fa-solid fa-download"></i>
      </Link>
    );
  };

  return (
    <div className="rounded-2xl border border-ac-2 shadow-sm bg-white overflow-hidden">
      {/* Desktop View: Standard Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-shade-1 border-b border-ac-2">
              <th className="py-2 px-4 font-bold text-[16px] uppercase text-base w-16">
                #
              </th>
              <th className="py-2 px-4 font-bold text-[16px] uppercase text-base">
                Procuring Entity / Title
              </th>
              {showPublishDate && (
                <th className="py-2 px-4 font-bold text-[16px] uppercase text-base w-40 text-center">
                  Publish Date
                </th>
              )}
              <th className="py-2 px-4 font-bold text-[16px] uppercase text-base w-40 text-center">
                Last Date
              </th>
              {isLotteryResult && (
                <th className="py-2 px-4 font-bold text-[16px] uppercase text-base w-40 text-center">
                  Lottery Date
                </th>
              )}
              <th className="py-2 px-4 font-bold text-[16px] uppercase text-base w-48 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {notices.length > 0 ? (
              notices.map((notice, index) => (
                <tr
                  key={notice.id}
                  className="border-b border-ac-2 hover:bg-slate-50 transition-colors single_notice"
                >
                  <td className="py-2.5 px-4 text-text-2 font-medium text-base">{index + 1}</td>
                  <td className="py-2.5 px-4">
                    <h4 className="text-text-1 font-semibold leading-tight font-bangla text-base lg:text-lg flex items-center flex-wrap gap-1.5">
                      <span>{notice.title}</span>
                      {(() => {
                        const grpCount = getNoticeGroupCount(notice.tableData, notice.category);
                        if (grpCount > 0) {
                          return (
                            <span className="text-slate-700 font-bold text-sm lg:text-base font-sans">
                              ({toBengaliDigits(grpCount)} গ্রুপ)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </h4>
                  </td>
                  {showPublishDate && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-base font-bold">
                        {notice.publishDate || "N/A"}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-base font-bold">
                      {notice.date}
                    </div>
                  </td>
                  {isLotteryResult && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-emerald-600 text-base font-bold bg-green-50/50">
                        {notice.lotteryDate || "N/A"}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/egp-notice/${notice.id}`}
                        className="bg-primary hover:!text-secondary !text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-text-1 transition shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fa-solid fa-eye"></i> View
                      </Link>
                      {canDownload(notice) && desktopDownloadBtn(notice)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isLotteryResult ? (showPublishDate ? 6 : 5) : (showPublishDate ? 5 : 4)}
                  className="p-10 text-center text-text-2 font-medium italic"
                >
                  No notices found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Card Layout */}
      <div className="md:hidden divide-y divide-ac-2">
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <div
              key={notice.id}
              className="p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="px-3 py-0.5 bg-shade-1 text-primary text-[10px] font-bold uppercase rounded-full border border-primary/10">
                    {notice.category}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {showPublishDate && (
                    <div className="text-[11px] text-text-2 font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-calendar-plus text-primary text-xs"></i>
                      Pub: {notice.publishDate || "N/A"}
                    </div>
                  )}
                  <div className="text-[11px] text-text-2 font-bold uppercase flex items-center gap-1">
                    <i className="fa-solid fa-calendar-day text-primary text-xs"></i>
                    Last: {notice.date}
                  </div>
                  {notice.lotteryDate && (
                    <div className="text-[11px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                      <i className="fa-solid fa-calendar-check text-xs"></i>
                      Lottery: {notice.lotteryDate}
                    </div>
                  )}
                </div>
              </div>

              <h4 className="text-text-1 font-bold leading-snug font-bangla text-base mb-5 flex items-center flex-wrap gap-1.5">
                <span>{notice.title}</span>
                {(() => {
                  const grpCount = getNoticeGroupCount(notice.tableData, notice.category);
                  if (grpCount > 0) {
                    return (
                      <span className="text-slate-700 font-bold text-sm font-sans">
                        ({toBengaliDigits(grpCount)} গ্রুপ)
                      </span>
                    );
                  }
                  return null;
                })()}
              </h4>

              <div className="flex items-center gap-3">
                <Link
                  href={`/egp-notice/${notice.id}`}
                  className="flex-1 bg-primary hover:bg-text-1 hover:!text-secondary  !text-text-1 py-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-eye"></i> View Detail
                </Link>
                {canDownload(notice) && mobileDownloadBtn(notice)}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-text-2 font-medium italic">
            No notices found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeTable;
