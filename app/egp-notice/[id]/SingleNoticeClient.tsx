"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Home, ArrowLeft, Printer, Download, Landmark, Info, AlertCircle, Loader2, Phone, MapPin, Globe, CalendarPlus, Calendar, CalendarCheck, Paperclip, FileText } from "lucide-react";
import { sanitizeBijoyDeep, autoConvertBijoy } from "@/lib/bijoyToUnicode";
import { parseNoticeTableData, tableSpecToRowsArray } from "@/lib/tableEngine/normalizer";
import { sortRowsByTenderIdAsc } from "@/lib/tableEngine/sortRows";
import { resolveNoticeFileUrl, buildNoticeDownloadFilename } from "@/lib/fileUrl";
import PdfFullViewer from "@/components/PdfFullViewer";

const formatDisplayDate = (dateStr: any) => {
  if (dateStr === null || dateStr === undefined) return "";
  const str = String(dateStr).trim();
  if (!str) return "";

  // If it's an ISO date string like 2026-05-19T00:00:00.000Z
  if (str.includes("T")) {
    const datePart = str.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}-${m}-${y}`;
    }
  }

  // Try parsing YYYY-MM-DD format (optionally followed by time e.g., 2026-04-09 05:00 PM)
  const parts = str.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts.slice(1).join(" ");

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split("-");
    return timePart ? `${d}-${m}-${y} ${timePart}` : `${d}-${m}-${y}`;
  }

  // If it's already in d/m/Y format or dd/mm/yyyy or with dashes
  if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(datePart)) {
    return str.replace(/\//g, "-");
  }

  // Only fallback to Date.parse for short, strictly date-like strings (never prose like "Cleaning of Septic tank... FY 2026-27")
  const strictDatePattern =
    /^(?:\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]+\d{1,2}[\s,.-]+\d{2,4}|\d{1,2}[\s,.-]+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]+\d{2,4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?$/i;
  if (str.length > 40 || !strictDatePattern.test(str)) {
    return str;
  }

  // Fallback try to parse standard JS date
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

const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const toBengaliDigits = (numStr: string | number) =>
  numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);

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

  // Extract all time patterns (e.g., 11:59 PM, 05:00 PM, 17:00)
  const timeMatches = str.match(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/gi);
  const parts = str.split(/\s+/);
  const datePart = parts[0];

  if (timeMatches && timeMatches.length > 0) {
    // Pick the last matched time (e.g. "05:00 PM")
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
  let hour = parts.find((p) => p.type === "hour")?.value || "";
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

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  lastDate?: string;
  lotteryDate?: string;
  date: string;
  year?: string;
  type: "FILE" | "TEXT" | "TABLE";
  content?: string | null;
  tableData?: string | null;
  filePath?: string | null;
}

interface SingleNoticeClientProps {
  notice: NoticeItem;
}

export default function SingleNoticeClient({
  notice,
}: SingleNoticeClientProps) {
  const resolvedFileUrl = resolveNoticeFileUrl(notice.filePath);
  const attachedDownloadFilename = buildNoticeDownloadFilename({
    title: notice.title,
    year: notice.year,
    date: notice.date,
    publishDate: notice.publishDate,
    lastDate: notice.lastDate,
    filePath: notice.filePath,
  });
  const attachedDownloadUrl = resolveNoticeFileUrl(
    notice.filePath,
    attachedDownloadFilename,
  );
  const isPdf = Boolean(
    resolvedFileUrl &&
    resolvedFileUrl.split("?")[0].toLowerCase().endsWith(".pdf"),
  );
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [pdfDownloading, setPdfDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current || pdfDownloading) return;
    setPdfDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro" as any),
        import("jspdf"),
      ]);

      const isLandscape = parsedTables.length > 0;
      const pdfWidth = isLandscape ? 297 : 210;
      const pdfHeight = isLandscape ? 210 : 297;
      const targetContainerWidth = isLandscape ? 1122 : 794;
      const maxPageContentHeight = isLandscape ? 740 : 1060;

      const cleanDate = (notice.lastDate || notice.date || "").replace(/[/\\:*?"<>|]/g, "-").trim();
      const sanitizedTitle = (notice.title || "notice").slice(0, 50).replace(/[/\\:*?"<>|]/g, "-").trim();
      const totalDisplayedRows = parsedTables.reduce((acc, t) => {
        const winnerColIdx = (t.headers || []).findIndex((h: string) =>
          h.toUpperCase().replace(/\./g, "").includes("WINNER")
        );
        const isWinnerNotice = notice.category === "LOTTERY_RESULT" || t.type === "LOTTERY_RESULT";
        const winningRows = winnerColIdx !== -1 ? (t.rows || []).filter((r: any) => r[winnerColIdx] && r[winnerColIdx].trim() !== "") : [];
        const displayRows = isWinnerNotice && winningRows.length > 0 ? winningRows : (t.rows || []);
        return acc + displayRows.length;
      }, 0);
      const groupSuffix = totalDisplayedRows > 0 ? ` (${toBengaliDigits(totalDisplayedRows)} গ্রুপ)` : "";
      const fileName = cleanDate ? `${sanitizedTitle}-${cleanDate}${groupSuffix}.pdf` : `${sanitizedTitle}${groupSuffix}.pdf`;

      const sourceBlocks = printAreaRef.current.querySelectorAll(".pwd-table-block");

      if (sourceBlocks.length === 0) {
        // Fallback for non-table standard notices
        const canvas = await (html2canvas as any)(printAreaRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const pdf = new (jsPDF as any)(isLandscape ? "l" : "p", "mm", "a4");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        pdf.save(fileName);
        return;
      }

      // Create a temporary hidden container to build and measure exact paginated pages
      const tempWrapper = document.createElement("div");
      tempWrapper.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${targetContainerWidth}px;
        z-index: -9999;
        background: #ffffff;
      `;

      // Inject the exact print styles into the temp wrapper
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
          Array.from(targetPage.querySelectorAll(".pwd-scroll-wrapper")).forEach((existingWrapper) => {
            if (existingWrapper.querySelectorAll("tbody tr").length === 0) {
              existingWrapper.remove();
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
            const clonedThead = originalThead.cloneNode(true) as HTMLElement;
            const seenRowTypes = new Set<string>();
            Array.from(clonedThead.querySelectorAll("tr")).forEach((tr) => {
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

        // Measure table width and synchronize scroll-wrapper, footers and page width
        const tableEl = pageEl.querySelector("table");
        if (tableEl) {
          const tableWidth = Math.max(tableEl.offsetWidth, tableEl.scrollWidth);
          const scrollWrapper = pageEl.querySelector(".pwd-scroll-wrapper") as HTMLElement;
          const topBar = pageEl.querySelector(".custom-print-header") as HTMLElement;
          const footerBlocks = pageEl.querySelectorAll(".details-footer-block, .warning-footer-block");

          const neededPageWidth = tableWidth + 28; // 14px padding left + 14px padding right
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
      setPdfDownloading(false);
    }
  };

  // Parsing Multi-Tables (supports V3, V2, and legacy formats seamlessly)
  let parsedTables: any[] = [];
  if (notice.tableData) {
    try {
      const v3Data = parseNoticeTableData(notice.tableData);
      if (v3Data.tables && v3Data.tables.length > 0) {
        parsedTables = v3Data.tables.map((table) => {
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
            extra: table.extra,
          };
        });
      }
    } catch (e) {
      console.error("Error parsing notice tableData", e);
    }
  }

  if (parsedTables.length > 0) {
    parsedTables = sanitizeBijoyDeep(parsedTables);
  }

  useEffect(() => {
    if (parsedTables.length > 0) {
      document.documentElement.classList.add("hide-global-layout");
      return () => {
        document.documentElement.classList.remove("hide-global-layout");
      };
    }
  }, [parsedTables]);

  const handlePrint = () => {
    if (isPdf && resolvedFileUrl) {
      // PDF print handling using a hidden iframe with Chrome query parameters
      // Bypasses browser PDF viewer layout bugs, scrollbars, sidebars, and multi-page print cuts!
      const pdfUrl =
        resolvedFileUrl.startsWith("/") || resolvedFileUrl.startsWith("http")
          ? resolvedFileUrl
          : "/" + resolvedFileUrl;

      // Add query parameters to hide toolbars/navpanes and center-fit the document
      const cleanPdfUrl = pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0&view=Fit";

      let iframe = document.getElementById(
        "pdf-print-iframe",
      ) as HTMLIFrameElement;
      if (iframe) {
        document.body.removeChild(iframe);
      }

      iframe = document.createElement("iframe");
      iframe.id = "pdf-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = cleanPdfUrl;

      document.body.appendChild(iframe);

      iframe.onload = function () {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Remove the iframe after print dialog opens
          setTimeout(() => {
            const el = document.getElementById("pdf-print-iframe");
            if (el) document.body.removeChild(el);
          }, 5000);
        } catch (e) {
          // Fallback if cross-origin print blocks
          window.open(pdfUrl, "_blank");
        }
      };
      return;
    }

    // Restore original DOM replacement logic for standard web tables/text as requested by the user
    // This keeps the original styles, colors, margins, fonts, and print layouts exactly the same!
    const isLandscape = parsedTables.length > 0;
    const brightenColorForPrint = (colorStr: string, factor = 1.3): string => {
      if (!colorStr) return colorStr;
      const clean = colorStr.trim();
      const rgbMatch = clean.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (rgbMatch) {
        const r = Math.min(255, Math.round(parseInt(rgbMatch[1], 10) * factor));
        const g = Math.min(255, Math.round(parseInt(rgbMatch[2], 10) * factor));
        const b = Math.min(255, Math.round(parseInt(rgbMatch[3], 10) * factor));
        return `rgb(${r}, ${g}, ${b})`;
      }
      const hexMatch = clean.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const r = Math.min(255, Math.round(parseInt(hex.slice(0, 2), 16) * factor));
        const g = Math.min(255, Math.round(parseInt(hex.slice(2, 4), 16) * factor));
        const b = Math.min(255, Math.round(parseInt(hex.slice(4, 6), 16) * factor));
        return `rgb(${r}, ${g}, ${b})`;
      }
      return colorStr;
    };

    let printContents = "";
    if (printAreaRef.current) {
      const clonedPrintArea = printAreaRef.current.cloneNode(true) as HTMLElement;
      clonedPrintArea
        .querySelectorAll(
          "th:not(.print-office-name):not(.print-subtitle):not(.date-block-th), .date-block-badge, .details-footer-badge"
        )
        .forEach((el: any) => {
          if (el.style && el.style.backgroundColor) {
            el.style.backgroundColor = brightenColorForPrint(el.style.backgroundColor, 1.3);
          }
        });
      const firstHeaderTr = clonedPrintArea.querySelector(
        "thead tr:not(:has(.print-office-name)):not(:has(.print-subtitle)):not(:has(.date-block-th))"
      ) as HTMLElement | null;
      if (firstHeaderTr && firstHeaderTr.style && firstHeaderTr.style.backgroundColor) {
        firstHeaderTr.style.backgroundColor = brightenColorForPrint(firstHeaderTr.style.backgroundColor, 1.3);
      }
      clonedPrintArea.querySelectorAll(".pwd-table-block").forEach((block) => {
        const tableEl = block.querySelector("table");
        const tbodyEl = tableEl?.querySelector("tbody");
        if (!tableEl || !tbodyEl) return;
        const maxCols = Array.from(tableEl.querySelectorAll("tr")).reduce((max, tr) => {
          const cols = Array.from(tr.children).reduce(
            (sum, cell) => sum + (parseInt(cell.getAttribute("colspan") || "1", 10) || 1),
            0
          );
          return Math.max(max, cols);
        }, 1);
        const footerBlocks = Array.from(
          block.querySelectorAll(".details-footer-block, .warning-footer-block")
        );
        footerBlocks.forEach((footerEl) => {
          const tr = document.createElement("tr");
          tr.className = "print-footer-tr";
          const td = document.createElement("td");
          td.colSpan = maxCols;
          td.className = "print-footer-td";
          td.style.cssText = "padding: 0 !important; border: 1px solid #000000 !important; background-color: #ffffff !important;";
          footerEl.remove();
          td.appendChild(footerEl);
          tr.appendChild(td);
          tbodyEl.appendChild(tr);
        });
      });
      printContents = clonedPrintArea.innerHTML;
    }

    if (printContents) {
      const originalContents = document.body.innerHTML;
      const originalTitle = document.title;
      document.title = "S. Alom EGP Tender & Consultant";
      document.body.innerHTML = `
        <html>
          <head>
            <title>&nbsp;</title>
            <style>
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
              @page {
                size: ${isLandscape ? "A4 landscape" : "A4 portrait"};
                margin: 9mm 6mm 6mm 6mm;
                @top-left {
                  content: "Page " counter(page);
                  font-size: 11px;
                  font-weight: bold;
                  color: #000000;
                  font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif;
                }
                @top-center {
                  content: "S. Alom EGP Tender & Consultant";
                  font-size: 11px;
                  font-weight: bold;
                  color: #000000;
                  font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif;
                }
                @top-right {
                  content: "Print: ${getFormattedPrintDateTime()}";
                  font-size: 11px;
                  font-weight: bold;
                  color: #000000;
                  font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif;
                }
              }
              *, *:before, *:after {
                box-sizing: border-box !important;
                outline: none !important;
                box-shadow: none !important;
              }
              html, body {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
                background-color: white !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                line-height: 1.4;
              }
              .print-container {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 1px 2px !important;
                box-sizing: border-box !important;
                background-color: transparent !important;
              }
              .print-container > div {
                padding-left: 0px !important;
                padding-right: 0px !important;
                padding-top: 0px !important;
                margin-left: 0px !important;
                margin-right: 0px !important;
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              *, *[class], *[style] {
                font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
                outline: none !important;
                box-shadow: none !important;
                filter: none !important;
              }
              .print-office-name, .warning-card-content, .warning-card-content * {
                font-family: 'Tiro Bangla', serif !important;
              }
              /* Minimal Print Header Styles */
              .print-header {
                border-bottom: none !important;
                padding-bottom: 6pt !important;
                margin-bottom: 8pt !important;
                font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
              }
              .notice-title {
                font-size: 18pt !important;
                font-weight: 700 !important;
                color: #000000 !important;
                margin: 0 0 8pt 0 !important;
                line-height: 1.4 !important;
                text-align: left !important;
                font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
              }
              .notice-details-bar {
                display: flex !important;
                justify-content: space-between !important;
                font-size: 10pt !important;
                color: #333333 !important;
                font-weight: 600 !important;
              }
              .detail-item {
                font-weight: 500 !important;
              }
              .detail-item strong {
                color: #000000 !important;
              }
              .pwd-table-block {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin-bottom: 15pt !important;
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
              .pwd-scroll-wrapper {
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                overflow: visible !important;
                display: block !important;
                position: relative !important;
                box-sizing: border-box !important;
              }
              table, .print-container table {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                border-spacing: 0 !important;
                border: 1px solid #000000 !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                page-break-inside: auto !important;
                overflow: visible !important;
                table-layout: auto !important;
                background-color: transparent !important;
                box-sizing: border-box !important;
              }
              thead {
                display: table-header-group !important;
                border: none !important;
              }
              tbody, tr {
                border: none !important;
                background-color: transparent !important;
                page-break-inside: avoid !important;
              }
              th, thead th, td, tbody td,
              .print-container th, .print-container td,
              .print-office-name, .print-subtitle, .date-block-th {
                border: 1px solid #000000 !important;
                border-color: #000000 !important;
                padding: 2px 3px !important;
                word-wrap: break-word !important;
                word-break: normal !important;
                overflow-wrap: break-word !important;
                box-sizing: border-box !important;
                outline: none !important;
                box-shadow: none !important;
              }
              .print-office-name, .print-container th.print-office-name {
                font-size: 16pt !important;
                text-align: center !important;
                font-weight: 700 !important;
                font-family: 'Tiro Bangla', serif !important;
                background-color: white !important;
                color: #000000 !important;
                padding: 2px 4px !important;
              }
              .print-subtitle, .print-container th.print-subtitle {
                font-size: 12.5px !important;
                text-align: center !important;
                font-weight: 700 !important;
                font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
                background-color: white !important;
                color: #000000 !important;
                padding: 2px 4px !important;
              }
              th, th *, thead th, thead th *, .print-container th, .print-container th * {
                color: #000000 !important;
              }
              th:not(.print-office-name):not(.print-subtitle):not(.date-block-th),
              .print-container th:not(.print-office-name):not(.print-subtitle):not(.date-block-th) {
                font-size: 11px !important;
                font-weight: 700 !important;
                line-height: 1.15 !important;
                text-transform: capitalize !important;
                text-align: center !important;
                vertical-align: middle !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              td, .print-container td {
                color: #000000 !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                line-height: 1.2 !important;
              }
              .date-block-th, .print-container th.date-block-th, thead th.date-block-th {
                padding: 0 !important;
                background-color: #ffffff !important;
              }
              .date-block-badge, .date-block-badge * {
                color: #000000 !important;
              }
              .date-block-badge {
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
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .schedule-date-header {
                font-size: 11px !important;
                line-height: 1.15 !important;
                font-weight: 700 !important;
                text-transform: capitalize !important;
              }
              .selling-date-cell, .selling-date-cell * {
                font-size: 10.5px !important;
                line-height: 1.15 !important;
                white-space: nowrap !important;
              }
              .footer-card-label svg, .warning-card-label svg {
                width: 16px !important;
                height: 16px !important;
                display: inline-block !important;
                vertical-align: middle !important;
                flex-shrink: 0 !important;
              }
              .auto-column {
                white-space: nowrap !important;
                width: 1% !important;
              }
              .location-column {
                white-space: nowrap !important;
                width: 1% !important;
                min-width: 0 !important;
                max-width: none !important;
                text-align: center !important;
                line-height: 1.15 !important;
                font-size: 10.5px !important;
              }
              .location-cell {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1.15 !important;
              }
              .location-word {
                display: block !important;
                white-space: nowrap !important;
                font-size: 10.5px !important;
                line-height: 1.15 !important;
              }
              .desc-column {
                white-space: normal !important;
                width: auto !important;
                min-width: 150px !important;
                word-wrap: break-word !important;
                word-break: normal !important;
                font-size: 11px !important;
                line-height: 1.25 !important;
              }
              td.desc-column, .print-container td.desc-column {
                font-size: 12px !important;
                line-height: 1.25 !important;
              }
              .print-footer-td,
              tbody td.print-footer-td,
              .print-container td.print-footer-td,
              .print-container tbody td.print-footer-td {
                padding: 0 !important;
                border: 1px solid #000000 !important;
                background-color: #ffffff !important;
              }
              .details-footer-block {
                width: 100% !important;
                min-width: 100% !important;
                margin: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                background-color: #ffffff !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .details-footer-col {
                padding: 3px 6px !important;
                box-sizing: border-box !important;
                border: none !important;
              }
              .details-footer-col:first-child {
                border-right: 1px solid #000000 !important;
              }
              .details-footer-badge,
              .details-footer-badge *,
              .details-footer-badge svg {
                color: #000000 !important;
                stroke: #000000 !important;
              }
              .details-footer-badge {
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
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .details-footer-text, .details-footer-text * {
                font-size: 12px !important;
                font-weight: 700 !important;
                line-height: 1.3 !important;
                color: #000000 !important;
              }
              .contact-info-line {
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
              }
              .contact-info-icon,
              .details-footer-text svg.contact-info-icon {
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
              .warning-footer-block {
                width: 100% !important;
                min-width: 100% !important;
                margin: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                padding: 3px 6px !important;
                background-color: #ffffff !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .warning-footer-badge {
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
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                flex-shrink: 0 !important;
              }
              .warning-footer-text, .warning-footer-text * {
                font-size: 12px !important;
                font-weight: 700 !important;
                line-height: 1.3 !important;
                color: #dc2626 !important;
                font-family: 'Tiro Bangla', serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              img {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                margin: 0 auto !important;
                border: none !important;
                page-break-inside: avoid;
              }
              .watermark-container {
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 9999 !important;
                pointer-events: none !important;
                opacity: 0.08 !important;
              }
              img.watermark-img {
                width: 480px !important;
                max-width: 480px !important;
                height: auto !important;
                display: block !important;
                margin: 0 auto !important;
              }
              h1, h2, h3, h4, h5, p, tr {
                page-break-inside: avoid;
              }
              .no-print, button, .btn, h4, .print-hidden, [class*="print:hidden"] {
                display: none !important;
              }
              /* Print optimizations for yellow totals row */
              .total-amount-row, .total-amount-row td {
                background-color: #facc15 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .total-amount-row td {
                font-size: 12px !important;
                font-weight: 700 !important;
                color: #000000 !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${!isLandscape
          ? `
                <div class="print-header">
                  <h1 class="notice-title">${notice.title}</h1>
                  <div class="notice-details-bar">
                    <span class="detail-item"><strong>Category:</strong> ${notice.category}</span>
                    <span class="detail-item"><strong>Publish Date:</strong> ${notice.publishDate}</span>
                    ${notice.lastDate ? `<span class="detail-item"><strong>Last Date:</strong> ${notice.lastDate}</span>` : ""}
                  </div>
                </div>
              `
          : ""
        }
              ${printContents}
            </div>
          </body>
        </html>
      `;

      // A small delay (1000ms) to allow attached images to fully load in the DOM
      setTimeout(() => {
        window.print();
        document.body.innerHTML = originalContents;
        document.title = originalTitle;

        // Dynamic reload callback when clicking back to bypass standard React router removeChild crash
        window.addEventListener("popstate", () => {
          window.location.reload();
        });

        window.location.reload(); // Restore full React DOM
      }, 1000);
    }
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

  const getHeaderTextColor = (bgColor: string) => {
    if (!bgColor) return "text-white";
    const lower = bgColor.toLowerCase().trim();
    const lightColors = [
      "#ffffff",
      "#fff",
      "#22d3ee",
      "#34d399",
      "#4ade80",
      "#fef08a",
      "#a7f3d0",
      "#bae6fd",
      "#fecdd3",
      "#ccffff",
    ];
    return lightColors.includes(lower) ? "text-slate-800" : "text-white";
  };

  const getHeaderTextColorHex = (bgColor: string) => {
    const cls = getHeaderTextColor(bgColor);
    return cls === "text-white" ? "#ffffff" : "#1e293b";
  };

  // 1. FULLSCREEN TABLE VIEW (Hides layout headers and footers for pure document presentation)
  if (parsedTables.length > 0) {
    return (
      <div className="w-full min-h-screen bg-white select-none relative font-bangla pb-20">
        {/* Dynamic Global Header/Footer Suppressor */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Albert+Sans:wght@400;600;700&display=swap');
          .website-layout > *:not(.main),
          .top_notice_board,
          .topbar,
          .footer_wrap,
          footer,
          header,
          nav,
          .newsletter_section,
          .newsletter,
          .bg-\[\#ff253a\],
          .marquee,
          .text_marquee {
            display: none !important;
          }
          .website-layout, .home-page {
            padding: 0 !important;
            margin: 0 !important;
          }
          .main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          *, *[class], *[style] {
            font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
          }
          .print-office-name, .warning-card-content, .warning-card-content * {
            font-family: 'Tiro Bangla', serif !important;
          }
          .print-office-name {
            font-size: 26pt !important;
          }
          .date-block-th {
            padding: 0 !important;
          }
          .pwd-table-block table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
            border: none !important;
          }
          .pwd-table-block thead,
          .pwd-table-block tbody,
          .pwd-table-block tr {
            border: none !important;
          }
          .pwd-table-block th,
          .pwd-table-block td {
            border-top: none !important;
            border-left: none !important;
            border-right: 1px solid #000000 !important;
            border-bottom: 1px solid #000000 !important;
          }
          .pwd-table-block thead tr:first-child > th,
          .pwd-table-block thead tr:first-child > td,
          .pwd-table-block table > tbody:first-child > tr:first-child > th,
          .pwd-table-block table > tbody:first-child > tr:first-child > td {
            border-top: 1px solid #000000 !important;
          }
          .pwd-table-block tr > th:first-child,
          .pwd-table-block tr > td:first-child {
            border-left: 1px solid #000000 !important;
          }
          .pwd-table-block .details-footer-block {
            margin: 0 !important;
            margin-top: 0 !important;
            border-top: none !important;
            border-left: 1px solid #000000 !important;
            border-right: 1px solid #000000 !important;
            border-bottom: 1px solid #000000 !important;
          }
          .pwd-table-block .details-footer-col {
            border: none !important;
          }
          .pwd-table-block .details-footer-col:first-child {
            border-right: 1px solid #000000 !important;
          }
          .pwd-table-block .warning-footer-block {
            margin: 0 !important;
            margin-top: 0 !important;
            border-top: none !important;
            border-left: 1px solid #000000 !important;
            border-right: 1px solid #000000 !important;
            border-bottom: 1px solid #000000 !important;
          }
        `,
          }}
        />

        {/* Fullscreen Top Navigation Bar */}
        <div className="w-full bg-white border-b border-slate-200 py-3.5 px-3 flex justify-center gap-3 print:hidden">
          <Link
            href="/"
            className="bg-[#e74c3c] hover:bg-[#c0392b] !text-white px-3 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/egp-notice"
            className="bg-[#34495e] hover:bg-[#2c3e50] !text-white px-3 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button
            onClick={handlePrint}
            className="bg-[var(--primary-color)] hover:bg-green-700 !text-white px-3 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          {
            resolvedFileUrl && !resolvedFileUrl.includes("-result.pdf") && !notice.tableData ? (
              <a
                href={attachedDownloadUrl}
                download={attachedDownloadFilename}
                className="bg-[#2980b9] hover:bg-[#3498db] !text-white px-3 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
            ) : notice.tableData ? (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfDownloading}
                className="bg-[#2980b9] hover:bg-[#3498db] !text-white px-3 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {pdfDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download PDF
                  </>
                )}
              </button>
            ) : null
          }
        </div>

        {/* Fullscreen Table Content Wrapper */}
        <div
          ref={printAreaRef}
          className="print-wrapper-box w-full max-w-full px-2 sm:px-3 md:px-12 py-8 bg-white space-y-8"
        >
          {parsedTables.map((table, tIdx) => {
            const defaultHeaderBg =
              notice.category === "OTM" ? "#059669" : "#0891b2";
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

            // Safe normalization of rows into string arrays (supports both standard nested arrays and key-value objects)
            const normalizedRows = rawRows.map((row: any, rIdx: number) => {
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

            // PWD LTM Template Table Sum Calculations
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
              notice.category === "LOTTERY_RESULT" ||
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
                  (sum: number, r: string[]) =>
                    sum + parseMoney(r[securityColIdx]),
                  0,
                )
                : 0;
            const totalDocFees =
              docFeesColIdx !== -1
                ? displayRows.reduce(
                  (sum: number, r: string[]) =>
                    sum + parseMoney(r[docFeesColIdx]),
                  0,
                )
                : 0;

            const totalCols = headers.length + (!hasSl ? 1 : 0);

            return (
              <div
                key={table.id || tIdx}
                className="pwd-table-block space-y-0 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0"
              >
                {/* Table Specs with Watermark */}
                <div
                  className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative"
                  style={{
                    overflowY: "hidden",
                    height: "auto",
                    maxHeight: "none",
                  }}
                >
                  {/* Centred Watermark Image with Plural/Singular Fallback */}
                  <div className="watermark-container absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.09] select-none z-20">
                    <img
                      src="/assets/icon/watermark.png"
                      alt="Watermark"
                      className="watermark-img w-[400px] md:w-[480px] h-auto max-h-[85%] object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes("/assets/")) {
                          target.src = "/asset/icon/watermark.png";
                        }
                      }}
                    />
                  </div>

                  <table className="w-full border-collapse border border-black text-left font-semibold text-black relative z-10 print:w-full print:border-black">
                    <thead className="text-black">
                      {table.officeName && (
                        <tr>
                          <th
                            colSpan={totalCols}
                            className="p-2 md:p-3 font-extrabold text-3xl md:text-5xl text-center text-black bg-white print-office-name"
                            style={{
                              border: "1px solid #000000",
                              borderLeft: "1px solid #000000",
                              borderRight: "1px solid #000000",
                              borderTop: "1px solid #000000",
                              borderBottom: "1px solid #000000",
                              fontFamily: "'Tiro Bangla', serif",
                              backgroundColor: "#ffffff",
                              color: "#000000",
                              WebkitPrintColorAdjust: "exact",
                              printColorAdjust: "exact",
                            }}
                          >
                            {table.officeName}
                          </th>
                        </tr>
                      )}
                      {table.subTitle && (
                        <tr>
                          <th
                            colSpan={totalCols}
                            className="p-2 font-bold text-[18px] md:text-[22px] print:!text-[22px] text-center text-black bg-white print-subtitle"
                            style={{
                              border: "1px solid #000000",
                              borderTop: "1px solid #000000",
                              borderLeft: "1px solid #000000",
                              borderRight: "1px solid #000000",
                              borderBottom: "1px solid #000000",
                              backgroundColor: "#ffffff",
                              color: "#000000",
                              WebkitPrintColorAdjust: "exact",
                              printColorAdjust: "exact",
                            }}
                          >
                            {table.subTitle}
                          </th>
                        </tr>
                      )}
                      {table.noticeDateBlock && (
                        <tr>
                          <th
                            colSpan={totalCols}
                            className="p-0 bg-white date-block-th"
                            style={{
                              border: "1px solid #000000",
                              borderTop: "1px solid #000000",
                              borderBottom: "1px solid #000000",
                              borderLeft: "1px solid #000000",
                              borderRight: "1px solid #000000",
                              padding: "0 !important",
                              backgroundColor: "#ffffff",
                              WebkitPrintColorAdjust: "exact",
                              printColorAdjust: "exact",
                            }}
                          >
                            <div className="flex justify-end w-full m-0 p-0">
                              <div
                                className="date-block-badge font-bold text-xs md:text-sm text-right whitespace-nowrap"
                                style={{
                                  backgroundColor:
                                    table.headerBgColor || defaultHeaderBg,
                                  color: getHeaderTextColorHex(
                                    table.headerBgColor || defaultHeaderBg
                                  ),
                                  padding: "3px 10px",
                                  borderLeft: "1px solid #000000",
                                  WebkitPrintColorAdjust: "exact",
                                  printColorAdjust: "exact",
                                }}
                              >
                                Egp Published Date :{" "}
                                {formatDisplayDate(table.noticeDateBlock)}
                              </div>
                            </div>
                          </th>
                        </tr>
                      )}
                      <tr
                        className="divide-x divide-gray-400"
                        style={{
                          backgroundColor:
                            table.headerBgColor || defaultHeaderBg,
                        }}
                      >
                        {!hasSl && (
                          <th
                            className="p-2 font-bold border border-gray-400 text-sm capitalize text-center whitespace-nowrap"
                            style={{
                              backgroundColor:
                                table.headerBgColor || defaultHeaderBg,
                              color: getHeaderTextColorHex(
                                table.headerBgColor || defaultHeaderBg,
                              ),
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
                              className={`p-2 font-bold border border-gray-400 text-base capitalize text-center ${isDesc
                                ? "desc-column w-[32%] min-w-[220px] print:w-auto whitespace-normal"
                                : isLocation
                                  ? "location-column w-[1%] print:w-[1%] whitespace-nowrap text-center"
                                  : "auto-column print:w-[1%]"
                                } ${isTender || isSl ? "whitespace-nowrap" : ""}`}
                              style={{
                                backgroundColor:
                                  table.headerBgColor || defaultHeaderBg,
                                color: getHeaderTextColorHex(
                                  table.headerBgColor || defaultHeaderBg,
                                ),
                              }}
                            >
                              {formatHeaderTitle(hdr)}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                      {displayRows.map((row: string[], rIdx: number) => {
                        const isWinnerRow =
                          winnerColIdx !== -1 &&
                          row[winnerColIdx] &&
                          row[winnerColIdx].trim() !== "";
                        return (
                          <tr
                            key={rIdx}
                            className={`hover:bg-slate-50/50 transition divide-x divide-gray-400 ${isWinnerRow
                              ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500"
                              : ""
                              }`}
                          >
                            {!hasSl && (
                              <td
                                className="p-3 border border-gray-400 text-black text-base font-bold text-center whitespace-nowrap"
                                style={
                                  isWinnerRow
                                    ? { backgroundColor: "#fffbeb" }
                                    : table.columnColors?.[0]
                                      ? {
                                        backgroundColor:
                                          table.columnColors[0],
                                      }
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
                              const hasCustomBg =
                                cellBg &&
                                cellBg !== "#ffffff" &&
                                cellBg !== "#fff";

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
                                  className={`p-2.5 border border-gray-400 text-black text-[15px] font-semibold ${cellAlignClass} ${isDesc
                                    ? "desc-column w-[32%] min-w-[220px] print:w-auto whitespace-normal text-left"
                                    : isLocationCol
                                      ? "location-column w-[1%] print:w-[1%] whitespace-nowrap text-center"
                                      : "auto-column print:w-[1%]"
                                    } ${isNoWrapCell ? "whitespace-nowrap" : ""
                                    }`}
                                  style={{
                                    backgroundColor: cellBg,
                                    textAlign: isCenterAlignCol || isLocationCol
                                      ? "center"
                                      : isCurrencyAlignCol
                                        ? "right"
                                        : "left",
                                    whiteSpace: isDesc ? "normal" : isLocationCol ? "nowrap" : isNoWrapCell ? "nowrap" : undefined,
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  {isWinnerCell && isWinnerRow && (
                                    <span className="inline-block mr-1">
                                      🏆
                                    </span>
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
                                          <span className="whitespace-nowrap font-normal print:text-[12.5px] text-[12.5px]">
                                            {datePart}
                                          </span>
                                          {timePart ? (
                                            <span className="whitespace-nowrap font-normal mt-0.5 print:text-[12.5px] text-[12.5px]">
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

                      {/* Sum Totals Row if any sum matches */}
                      {(securityColIdx !== -1 || docFeesColIdx !== -1) && (
                        <tr
                          className="bg-[#facc15] font-bold text-black divide-x divide-gray-400 total-amount-row"
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
                                  className="p-3 border border-gray-400 text-right text-sm font-semibold text-black bg-[#facc15]"
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
                                  className="p-3 border border-gray-400 text-sm font-semibold text-black bg-[#facc15] text-right"
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
                                  className="p-3 border border-gray-400 text-sm font-semibold text-black bg-[#facc15] text-right"
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
                                className="p-3 border border-gray-400 bg-[#facc15]"
                                style={{ backgroundColor: "#facc15" }}
                              ></td>
                            );
                          })}
                        </tr>
                      )}

                      {normalizedRows.length === 0 && (
                        <tr>
                          <td
                            colSpan={headers.length || 1}
                            className="p-8 text-center text-slate-400 italic"
                          >
                            No tender entries available..
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Modern Compact Attached Details Footer */}
                {(table.payOrderTo || true) && (
                  <div className="details-footer-block w-full bg-white grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 text-black">
                    {/* Left Column: BD Pay Order To */}
                    <div className="details-footer-col p-2 flex flex-col justify-start">
                      <div className="mb-1">
                        <span
                          className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                          style={{
                            backgroundColor: table.headerBgColor || defaultHeaderBg,
                            color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
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

                    {/* Right Column: Contact Info */}
                    <div className="details-footer-col p-2 flex flex-col justify-start">
                      <div className="mb-1">
                        <span
                          className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                          style={{
                            backgroundColor: table.headerBgColor || defaultHeaderBg,
                            color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
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

                {/* Modern Compact Attached Warning Banner (1-line design directly attached below details box) */}
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
      </div>
    );
  }

  // 2. STANDARD NOTICE LAYOUT
  return (
    <div className="single_notice_page bg-secondary py-16 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Tiro+Bangla:ital@0;1&family=Albert+Sans:wght@400;600;700&display=swap');
        .single_notice_page *:not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class*="fa-"]), .single_notice_page *[class]:not(.print-office-name):not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class*="fa-"]), .single_notice_page *[style]:not(.print-office-name):not(.fa-solid):not(.fa-regular):not(.fa-brands):not([class*="fa-"]), .single_notice_page .font-bangla:not(.print-office-name), .single_notice_page [style*="font-family"]:not(.print-office-name) {
          font-family: 'Space Grotesk', 'Tiro Bangla', 'SutonnyOMJ', 'Albert Sans', Arial, sans-serif !important;
        }
        .single_notice_page .print-office-name {
          font-family: 'Tiro Bangla', serif !important;
        }
        .single_notice_page .pwd-table-block table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          border: none !important;
        }
        .single_notice_page .pwd-table-block thead,
        .single_notice_page .pwd-table-block tbody,
        .single_notice_page .pwd-table-block tr {
          border: none !important;
        }
        .single_notice_page .pwd-table-block th,
        .single_notice_page .pwd-table-block td {
          border-top: none !important;
          border-left: none !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
        }
        .single_notice_page .pwd-table-block thead tr:first-child > th,
        .single_notice_page .pwd-table-block thead tr:first-child > td,
        .single_notice_page .pwd-table-block table > tbody:first-child > tr:first-child > th,
        .single_notice_page .pwd-table-block table > tbody:first-child > tr:first-child > td {
          border-top: 1px solid #000000 !important;
        }
        .single_notice_page .pwd-table-block tr > th:first-child,
        .single_notice_page .pwd-table-block tr > td:first-child {
          border-left: 1px solid #000000 !important;
        }
        .single_notice_page .pwd-table-block .details-footer-block {
          margin: 0 !important;
          margin-top: 0 !important;
          border-top: none !important;
          border-left: 1px solid #000000 !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
        }
        .single_notice_page .pwd-table-block .details-footer-col {
          border: none !important;
        }
        .single_notice_page .pwd-table-block .details-footer-col:first-child {
          border-right: 1px solid #000000 !important;
        }
        .single_notice_page .pwd-table-block .warning-footer-block {
          margin: 0 !important;
          margin-top: 0 !important;
          border-top: none !important;
          border-left: 1px solid #000000 !important;
          border-right: 1px solid #000000 !important;
          border-bottom: 1px solid #000000 !important;
        }
      `,
        }}
      />
      <div className="custom-container">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex-1">
            <Link
              href="/egp-notice"
              className="inline-flex items-center bg-primary hover:!text-secondary !text-secondary px-3 py-2 mb-5 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" /> Back to All Notices
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-1 font-bangla leading-tight">
              {notice.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm font-bold">
              <span className="bg-primary text-white px-3 py-1.5 rounded-full text-xs uppercase tracking-wider">
                {notice.category}
              </span>
              <span className="text-text-2 flex items-center gap-1.5">
                <CalendarPlus className="w-4 h-4 text-primary shrink-0" />
                Publish Date: {notice.publishDate}
              </span>
              {notice.lastDate && (
                <span className="text-text-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  Last Date: {notice.lastDate}
                </span>
              )}
              {notice.lotteryDate && (
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Lottery Date: {notice.lotteryDate}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-initial bg-text-1 text-white px-3 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-primary transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 shrink-0" /> Print Notice
            </button>
            {resolvedFileUrl && !resolvedFileUrl.includes("-result.pdf") && (
              <a
                href={attachedDownloadUrl}
                download={attachedDownloadFilename}
                className="flex-1 lg:flex-initial bg-primary hover:!text-secondary !text-secondary px-3 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0" /> Download File
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Content Display Area */}
        <div className="bg-white rounded-[32px] border border-ac-2 shadow-xl overflow-hidden p-6 md:p-10">
          <div
            ref={printAreaRef}
            className="print-wrapper-box w-full space-y-10"
          >
            {/* 1. ATTACHMENT VIEW (Renders if present) */}
            {resolvedFileUrl && (
              <div className="w-full relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 text-text-1 print:hidden">
                  <Paperclip className="w-4 h-4 text-primary shrink-0" />{" "}
                  Attached Document Reference
                </h4>
                {isPdf ? (
                  <PdfFullViewer fileUrl={resolvedFileUrl} title={notice.title} />
                ) : (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={resolvedFileUrl}
                      alt={notice.title}
                      className="w-full h-auto block mx-auto rounded-xl shadow-xs"
                    />
                    {/* Watermark Overlay for Images */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none rotate-45">
                      <span className="text-[60px] md:text-[100px] font-bold text-slate-800 whitespace-nowrap">
                        BTC CONSULTANT
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. RICH TEXT DESCRIPTION (Renders if present) */}
            {notice.content && (
              <div className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5 text-text-1 border-b pb-3 print:hidden">
                  <FileText className="w-4 h-4 text-primary shrink-0" /> Notice
                  Specifications & Guidelines
                </h4>
                <div className="prose max-w-none text-text-1 font-bangla text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </div>
              </div>
            )}

            {/* 3. MULTIPLE TABLES LIST (Renders if any tables are built) */}
            {parsedTables.length > 0 && (
              <div className="space-y-12">
                {parsedTables.map((table, tIdx) => {
                  const defaultHeaderBg =
                    notice.category === "OTM" ? "#059669" : "#0891b2";
                  const headers = table.headers || [];
                  const rows = table.rows || [];

                  const hasSl = headers.some((h: string) => {
                    const norm = (h || "")
                      .toLowerCase()
                      .replace(/\./g, "")
                      .trim();
                    return norm === "slno" || norm === "sl";
                  });

                  // Safe normalization of rows into string arrays (supports both standard nested arrays and key-value objects)
                  const normalizedRows = rows.map((row: any, rIdx: number) => {
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
                      return Object.values(row).map((val) =>
                        (val ?? "").toString(),
                      );
                    }
                    return [];
                  });

                  // PWD LTM Template Table Sum Calculations
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
                    notice.category === "LOTTERY_RESULT" ||
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
                        (sum: number, r: string[]) =>
                          sum + parseMoney(r[securityColIdx]),
                        0,
                      )
                      : 0;
                  const totalDocFees =
                    docFeesColIdx !== -1
                      ? displayRows.reduce(
                        (sum: number, r: string[]) =>
                          sum + parseMoney(r[docFeesColIdx]),
                        0,
                      )
                      : 0;

                  const totalCols = headers.length + (!hasSl ? 1 : 0);

                  return (
                    <div
                      key={table.id || tIdx}
                      className="pwd-table-block space-y-0 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0 select-none"
                    >
                      {/* Table Specs with Watermark */}
                      <div
                        className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative"
                        style={{
                          overflowY: "hidden",
                          height: "auto",
                          maxHeight: "none",
                        }}
                      >
                        {/* Centred Watermark Image with Plural/Singular Fallback */}
                        <div className="watermark-container absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] select-none z-20">
                          <img
                            src="/assets/icon/watermark.png"
                            alt="Watermark"
                            className="watermark-img w-[300px] md:w-[350px] h-auto max-h-[85%] object-contain"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.src.includes("/assets/")) {
                                target.src = "/asset/icon/watermark.png";
                              }
                            }}
                          />
                        </div>

                        <table className="w-full border-collapse border border-black text-left font-semibold text-black relative z-10 print:w-full print:border-black">
                          <thead className="text-black">
                            {table.officeName && (
                              <tr>
                                <th
                                  colSpan={totalCols}
                                  className="p-2 md:p-3 font-extrabold text-3xl md:text-5xl text-center text-black bg-white print-office-name"
                                  style={{
                                    border: "1px solid #000000",
                                    borderLeft: "1px solid #000000",
                                    borderRight: "1px solid #000000",
                                    borderTop: "1px solid #000000",
                                    borderBottom: "1px solid #000000",
                                    fontFamily: "'Tiro Bangla', serif",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  {table.officeName}
                                </th>
                              </tr>
                            )}
                            {table.subTitle && (
                              <tr>
                                <th
                                  colSpan={totalCols}
                                  className="p-2 font-bold text-[18px] md:text-[22px] print:!text-[22px] text-center text-black bg-white print-subtitle"
                                  style={{
                                    border: "1px solid #000000",
                                    borderTop: "1px solid #000000",
                                    borderLeft: "1px solid #000000",
                                    borderRight: "1px solid #000000",
                                    borderBottom: "1px solid #000000",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  {table.subTitle}
                                </th>
                              </tr>
                            )}
                            {table.noticeDateBlock && (
                              <tr>
                                <th
                                  colSpan={totalCols}
                                  className="p-0 bg-white date-block-th"
                                  style={{
                                    border: "1px solid #000000",
                                    borderTop: "1px solid #000000",
                                    borderBottom: "1px solid #000000",
                                    borderLeft: "1px solid #000000",
                                    borderRight: "1px solid #000000",
                                    padding: "0 !important",
                                    backgroundColor: "#ffffff",
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  <div className="flex justify-end w-full m-0 p-0">
                                    <div
                                      className="date-block-badge font-bold text-xs md:text-sm text-right whitespace-nowrap"
                                      style={{
                                        backgroundColor:
                                          table.headerBgColor || defaultHeaderBg,
                                        color: getHeaderTextColorHex(
                                          table.headerBgColor || defaultHeaderBg
                                        ),
                                        padding: "3px 10px",
                                        borderLeft: "1px solid #000000",
                                        WebkitPrintColorAdjust: "exact",
                                        printColorAdjust: "exact",
                                      }}
                                    >
                                      Egp Published Date :{" "}
                                      {formatDisplayDate(table.noticeDateBlock)}
                                    </div>
                                  </div>
                                </th>
                              </tr>
                            )}
                            <tr
                              className="divide-x divide-gray-400"
                              style={{
                                backgroundColor:
                                  table.headerBgColor || defaultHeaderBg,
                              }}
                            >
                              {!hasSl && (
                                <th
                                  className="p-2 font-bold border border-gray-400 text-sm capitalize whitespace-nowrap text-center"
                                  style={{
                                    backgroundColor:
                                      table.headerBgColor || defaultHeaderBg,
                                    color: getHeaderTextColorHex(
                                      table.headerBgColor || defaultHeaderBg,
                                    ),
                                    textAlign: "center",
                                  }}
                                >
                                  #
                                </th>
                              )}
                              {headers.map((hdr: string, idx: number) => {
                                const isDesc = (hdr || "")
                                  .toLowerCase()
                                  .includes("description");
                                const isLocation = (hdr || "")
                                  .toLowerCase()
                                  .includes("location");
                                return (
                                  <th
                                    key={idx}
                                    className={`p-2 font-bold border border-gray-400 text-sm capitalize text-center ${isDesc
                                      ? "desc-column w-[30%] min-w-[220px] print:w-auto whitespace-normal"
                                      : isLocation
                                        ? "location-column w-[1%] print:w-[1%] whitespace-nowrap text-center"
                                        : "auto-column print:w-[1%]"
                                      }`}
                                    style={{
                                      backgroundColor:
                                        table.headerBgColor || defaultHeaderBg,
                                      color: getHeaderTextColorHex(
                                        table.headerBgColor || defaultHeaderBg,
                                      ),
                                      textAlign: "center",
                                    }}
                                  >
                                    {formatHeaderTitle(hdr)}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-400">
                            {displayRows.map(
                              (row: string[], rIdx: number) => {
                                const isWinnerRow =
                                  winnerColIdx !== -1 &&
                                  row[winnerColIdx] &&
                                  row[winnerColIdx].trim() !== "";
                                return (
                                  <tr
                                    key={rIdx}
                                    className={`hover:bg-slate-50/50 transition divide-x divide-gray-400 ${isWinnerRow
                                      ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500"
                                      : ""
                                      }`}
                                  >
                                    {!hasSl && (
                                      <td
                                        className="p-2.5 border border-gray-400 text-black text-sm font-bold text-center whitespace-nowrap"
                                        style={
                                          isWinnerRow
                                            ? { backgroundColor: "#fffbeb" }
                                            : table.columnColors?.[0]
                                              ? {
                                                backgroundColor:
                                                  table.columnColors[0],
                                              }
                                              : undefined
                                        }
                                      >
                                        {rIdx + 1}
                                      </td>
                                    )}
                                    {row.map((cell: string, cIdx: number) => {
                                      const cellBg = isWinnerRow
                                        ? "#fffbeb"
                                        : table.columnColors?.[cIdx] ||
                                        "#ffffff";
                                      const isDesc = (headers[cIdx] || "")
                                        .toLowerCase()
                                        .includes("description");
                                      const isWinnerCell =
                                        cIdx === winnerColIdx;
                                      const hasCustomBg =
                                        cellBg &&
                                        cellBg !== "#ffffff" &&
                                        cellBg !== "#fff";

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
                                      const isLocationCol = colHdr.includes("location");

                                      return (
                                        <td
                                          key={cIdx}
                                          className={`p-2.5 border border-gray-400 text-black text-sm font-semibold ${cellAlignClass} ${isDesc
                                            ? "desc-column w-[30%] min-w-[220px] print:w-auto whitespace-normal text-left"
                                            : isLocationCol
                                              ? "location-column w-[1%] print:w-[1%] whitespace-nowrap text-center"
                                              : "auto-column print:w-[1%]"
                                            }`}
                                          style={{
                                            backgroundColor: cellBg,
                                            textAlign: isCenterAlignCol || isLocationCol
                                              ? "center"
                                              : isCurrencyAlignCol
                                                ? "right"
                                                : "left",
                                            whiteSpace: !isDesc ? "nowrap" : undefined,
                                            WebkitPrintColorAdjust: "exact",
                                            printColorAdjust: "exact",
                                          }}
                                        >
                                          {isWinnerCell && isWinnerRow && (
                                            <span className="inline-block mr-1">
                                              🏆
                                            </span>
                                          )}
                                          {(() => {
                                            const formattedVal = formatCellValue(
                                              cell,
                                              headers[cIdx] || "",
                                            );
                                            const isSellingDateCol =
                                              (headers[cIdx] || "")
                                                .toLowerCase()
                                                .includes("selling") ||
                                              (headers[cIdx] || "")
                                                .toLowerCase()
                                                .includes("last date");

                                            if (
                                              isSellingDateCol &&
                                              formattedVal &&
                                              formattedVal !== "N/A"
                                            ) {
                                              const { datePart, timePart } =
                                                getSellingDateDisplay(formattedVal);
                                              return (
                                                <div className="selling-date-cell flex flex-col text-center leading-tight">
                                                  <span className="whitespace-nowrap font-normal text-[12.5px] print:text-[12.5px]">
                                                    {datePart}
                                                  </span>
                                                  {timePart ? (
                                                    <span className="whitespace-nowrap font-normal mt-0.5 text-[12.5px] print:text-[12.5px]">
                                                      {timePart}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              );
                                            }
                                            const isLocationCol = (headers[cIdx] || "")
                                              .toLowerCase()
                                              .includes("location");
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
                              },
                            )}

                            {/* Sum Totals Row if any sum matches */}
                            {(securityColIdx !== -1 ||
                              docFeesColIdx !== -1) && (
                                <tr
                                  className="bg-[#facc15] font-bold text-black divide-x divide-gray-400 total-amount-row"
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
                                          className="p-2.5 border border-gray-400 text-right text-sm font-semibold text-black bg-[#facc15]"
                                          style={{
                                            backgroundColor: "#facc15",
                                            textAlign: "right",
                                          }}
                                          colSpan={
                                            colSpanCount + (!hasSl ? 1 : 0)
                                          }
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
                                          className="p-2.5 border border-gray-400 text-sm font-semibold text-black bg-[#facc15] text-right"
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
                                          className="p-2.5 border border-gray-400 text-sm font-semibold text-black bg-[#facc15] text-right"
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
                                        className="p-2.5 border border-gray-400 bg-[#facc15]"
                                        style={{ backgroundColor: "#facc15" }}
                                      ></td>
                                    );
                                  })}
                                </tr>
                              )}

                            {normalizedRows.length === 0 && (
                              <tr>
                                <td
                                  colSpan={headers.length || 1}
                                  className="p-8 text-center text-slate-400 italic"
                                >
                                  No tender entries available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Compact Government Footer Table Blocks */}
                      {(table.payOrderTo || true) && (
                        <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 text-black details-footer-block">
                          {/* Left Column: BD Pay Order To */}
                          <div className="details-footer-col p-2 flex flex-col justify-start">
                            <div className="mb-1">
                              <span
                                className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                                style={{
                                  backgroundColor: table.headerBgColor || defaultHeaderBg,
                                  color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
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

                          {/* Right Column: Contact Info */}
                          <div className="details-footer-col p-2 flex flex-col justify-start">
                            <div className="mb-1">
                              <span
                                className="details-footer-badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider"
                                style={{
                                  backgroundColor: table.headerBgColor || defaultHeaderBg,
                                  color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
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

                      {/* Modern Compact Attached Warning Banner (1-line design directly attached below details box) */}
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
            )}

            {/* If absolutely nothing is filled */}
            {!notice.filePath &&
              !notice.content &&
              parsedTables.length === 0 && (
                <div className="text-center p-12 text-slate-400 italic font-semibold">
                  No attachment, description, or table grid available for this
                  tender notice.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
