"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";

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

const formatCellValue = (val: string, hdr: string) => {
  if (!val) return "";
  const str = String(val).trim();
  if (isCurrencyColumn(hdr)) {
    // Extract any digits and dots
    const cleanVal = str.replace(/,/g, "").trim();
    const num = parseFloat(cleanVal);
    // Ensure it's a valid number and only numeric chars
    if (!isNaN(num) && /^\d+(\.\d+)?$/.test(cleanVal)) {
      if (num >= 10000000) {
        // 1 Crore
        const crVal = num / 10000000;
        return `${parseFloat(crVal.toFixed(2))} Cr`;
      } else if (num >= 100000) {
        // 1 Lakh
        const lacVal = num / 100000;
        return `${parseFloat(lacVal.toFixed(2))} Lac`;
      }

      if (num % 1 === 0) {
        return num.toLocaleString("en-IN");
      } else {
        return num
          .toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(/\.00$/, "");
      }
    }
  }
  return formatDisplayDate(str);
};

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  lastDate?: string;
  lotteryDate?: string;
  date: string;
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
  const isPdf = notice.filePath?.toLowerCase().endsWith(".pdf") || false;
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
      const canvas = await (html2canvas as any)(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new (jsPDF as any)("l", "mm", "a4"); // landscape for wide tables
      const imgWidth = 297; // A4 landscape width
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${notice.title.slice(0, 50)}-result.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setPdfDownloading(false);
    }
  };

  // Parsing Multi-Tables (supports old single-table formats and new multi-table v2 formats)
  let parsedTables: any[] = [];
  if (notice.tableData) {
    try {
      const parsed = JSON.parse(notice.tableData);
      if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
        parsedTables = parsed.tables;
      } else {
        // Fallback for old single table entries (standard or PWD LTM)
        if (parsed.isPwdTemplate) {
          parsedTables = [
            {
              type: "pwd_ltm",
              officeName: parsed.officeName || "",
              noticeDateBlock: parsed.noticeDateBlock || "",
              lastDateBlock: parsed.lastDateBlock || "",
              lotteryDateBlock: parsed.lotteryDateBlock || "",
              payOrderTo: parsed.payOrderTo || "",
              moreInfo: parsed.moreInfo || "",
              bottomWarning: parsed.bottomWarning || "",
              rows: parsed.rows || [],
            },
          ];
        } else if (parsed.headers && parsed.rows) {
          parsedTables = [
            {
              type: "standard",
              headers: parsed.headers,
              rows: parsed.rows,
            },
          ];
        }
      }
    } catch (e) {
      console.error("Error parsing notice tableData", e);
    }
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
    if (isPdf && notice.filePath) {
      // PDF print handling using a hidden iframe with Chrome query parameters
      // Bypasses browser PDF viewer layout bugs, scrollbars, sidebars, and multi-page print cuts!
      const pdfUrl =
        notice.filePath.startsWith("/") || notice.filePath.startsWith("http")
          ? notice.filePath
          : "/" + notice.filePath;

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

    // Restore original DOM replacement logic for standard web tables/text as requested by the user
    // This keeps the original styles, colors, margins, fonts, and print layouts exactly the same!
    const isLandscape = parsedTables.length > 0;
    const printContents = printAreaRef.current?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      const originalTitle = document.title;
      document.title = "Salom Egp consultant";
      document.body.innerHTML = `
        <html>
          <head>
            <title>&nbsp;</title>
            <style>
              @page {
                size: A4 ${isLandscape ? "landscape" : "portrait"};
                margin: 4mm 4mm 4mm 4mm !important;
              }
              * {
                font-family: 'Calibri', Candara, Segoe, Segoe UI, Optima, Arial, sans-serif !important;
              }
              body {
                padding: 0 !important;
                margin: 0;
                font-family: 'Calibri', Candara, Segoe, Segoe UI, Optima, Arial, sans-serif !important;
                background-color: white !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                line-height: 1.5;
              }
              .print-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto;
                padding: 0 !important;
                background-color: transparent !important;
              }
              .print-wrapper-box {
                padding-left: 0px !important;
                padding-right: 0px !important;
                padding-top: 0px !important;
                margin-left: 0px !important;
                margin-right: 0px !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              /* Column widths for print */
              .auto-column {
                width: auto !important;
                min-width: unset !important;
                max-width: unset !important;
                white-space: normal !important;
                word-wrap: break-word !important;
              }
              .desc-column {
                width: 28% !important;
                white-space: normal !important;
              }
              .print-office-name {
                font-size: 24pt !important;
                text-align: center !important;
                font-weight: bold !important;
                background-color: white !important;
                color: black !important;
              }
              .print-subtitle {
                font-size: 14pt !important;
                text-align: center !important;
                font-weight: bold !important;
                background-color: white !important;
                color: black !important;
              }
              /* Minimal Print Header Styles */
              .print-header {
                border-bottom: 2px solid #1b4332 !important;
                padding-bottom: 10pt !important;
                margin-bottom: 15pt !important;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              }
              .notice-title {
                font-size: 18pt !important;
                font-weight: 700 !important;
                color: #000000 !important;
                margin: 0 0 8pt 0 !important;
                line-height: 1.4 !important;
                text-align: left !important;
                font-family: 'Space Grotesk', 'Tiro Bangla', sans-serif !important;
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
                margin-bottom: 25pt !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              .pwd-scroll-wrapper {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                overflow: visible !important;
                display: block !important;
                position: relative !important;
              }
              table {
                width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                page-break-inside: auto !important;
                overflow: visible !important;
                table-layout: auto !important;
                background-color: transparent !important;
              }
              tr {
                background-color: transparent !important;
                page-break-inside: avoid !important;
              }
              td:not([style*="background-color"]) {
                background-color: transparent !important;
              }
              th, td {
                border: 1px solid #9ca3af !important;
                padding: 4px 4px !important;
                word-wrap: break-word !important;
                word-break: normal !important;
                overflow-wrap: break-word !important;
              }
              td {
                color: #000000 !important;
                font-size: 13px !important;
              }
              th {
                font-weight: bold !important;
                font-size: 13px !important;
                text-align: center !important;
                vertical-align: middle !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .pwd-scroll-wrapper {
                border: 1px solid #9ca3af !important;
                border-radius: 0 !important;
                overflow: hidden !important;
              }
              .footer-card {
                border-radius: 8px !important;
                padding: 0 !important;
                margin-bottom: 4px !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .footer-card-label {
                display: inline-block !important;
                border-right: 1px solid #9ca3af !important;
                border-bottom: 1px solid #9ca3af !important;
                border-top: none !important;
                border-left: none !important;
                border-bottom-right-radius: 8px !important;
                padding: 4px 10px !important;
                font-weight: 800 !important;
                font-size: 8pt !important;
                text-transform: uppercase !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .footer-card-content {
                padding: 10px 12px !important;
              }
              .warning-card {
                border-radius: 8px !important;
                padding: 0 !important;
                margin-top: 10pt !important;
                margin-bottom: 4px !important;
                overflow: hidden !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .warning-card-label {
                display: inline-block !important;
                border-right: 1px solid #9ca3af !important;
                border-bottom: 1px solid #9ca3af !important;
                border-top: none !important;
                border-left: none !important;
                border-bottom-right-radius: 8px !important;
                padding: 4px 10px !important;
                font-weight: 800 !important;
                font-size: 8pt !important;
                text-transform: uppercase !important;
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
                font-size: 13px !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="custom-print-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-bottom: 4px; margin-bottom: 12px; font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                <div style="width: 30%;"></div>
                <div style="width: 40%; text-align: center; font-size: 12px; font-weight: bold; color: #000000;">Salom Egp consultant</div>
                <div style="width: 30%; text-align: right; font-size: 12px; color: #000000; font-weight: bold;">Print: ${getFormattedPrintDateTime()}</div>
              </div>
              ${
                !isLandscape
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
    return parseFloat(val.toString().replace(/,/g, "")) || 0;
  };

  const formatMoney = (val: number) => {
    if (val >= 10000000) {
      // 1 Crore
      const crVal = val / 10000000;
      return `${parseFloat(crVal.toFixed(2))} Cr`;
    } else if (val >= 100000) {
      // 1 Lakh
      const lacVal = val / 100000;
      return `${parseFloat(lacVal.toFixed(2))} Lac`;
    }
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
          .website-layout > *:not(.main),
          .top_notice_board,
          .topbar,
          .footer_wrap,
          footer,
          header,
          nav,
          .newsletter_section,
          .newsletter,
          .bg-[#ff253a],
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
          * {
            font-family: 'Calibri', Candara, Segoe, Segoe UI, Optima, Arial, sans-serif !important;
          }
        `,
          }}
        />

        {/* Fullscreen Top Navigation Bar */}
        <div className="w-full bg-white border-b border-slate-200 py-3.5 px-4 flex justify-center gap-3 print:hidden">
          <Link
            href="/"
            className="bg-[#e74c3c] hover:bg-[#c0392b] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <i className="fa-solid fa-home"></i> Home
          </Link>
          <Link
            href="/egp-notice"
            className="bg-[#34495e] hover:bg-[#2c3e50] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </Link>
          <button
            onClick={handlePrint}
            className="bg-[var(--primary-color)] hover:bg-green-700 !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <i className="fa-solid fa-print"></i> Print
          </button>
          {notice.filePath ? (
            <a
              href={notice.filePath}
              download
              className="bg-[#2980b9] hover:bg-[#3498db] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <i className="fa-solid fa-download"></i> Download PDF
            </a>
          ) : notice.tableData ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfDownloading}
              className="bg-[#2980b9] hover:bg-[#3498db] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {pdfDownloading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Generating...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-download"></i> Download PDF
                </>
              )}
            </button>
          ) : null}
        </div>

        {/* Fullscreen Table Content Wrapper */}
        <div
          ref={printAreaRef}
          className="print-wrapper-box w-full max-w-full px-2 sm:px-6 md:px-12 py-8 bg-white space-y-8"
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

            const totalSecurity =
              securityColIdx !== -1
                ? normalizedRows.reduce(
                    (sum: number, r: string[]) =>
                      sum + parseMoney(r[securityColIdx]),
                    0,
                  )
                : 0;
            const totalDocFees =
              docFeesColIdx !== -1
                ? normalizedRows.reduce(
                    (sum: number, r: string[]) =>
                      sum + parseMoney(r[docFeesColIdx]),
                    0,
                  )
                : 0;

            return (
              <div
                key={table.id || tIdx}
                className="pwd-table-block space-y-0 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0"
              >
                {/* Unified Standalone Header Box (Renders only on 1st Page, doesn't repeat on page split) */}
                <div className="border border-gray-400 rounded-t-xl bg-white w-full text-center print:rounded-t-none">
                  {table.officeName && (
                    <div className="p-3 font-extrabold text-2xl md:text-3xl border-b border-gray-400 text-center text-black bg-white print-office-name">
                      {table.officeName}
                    </div>
                  )}
                  {table.subTitle && (
                    <div className="p-2 font-bold text-sm md:text-base border-b border-gray-400 text-center text-black bg-white print-subtitle">
                      {table.subTitle}
                    </div>
                  )}
                  {table.noticeDateBlock && (
                    <div className="p-0 text-right bg-white pr-4" style={{ padding: "0px !important" }}>
                      <span 
                        className="inline-block font-bold text-xs md:text-sm"
                        style={{
                          backgroundColor: table.headerBgColor || defaultHeaderBg,
                          color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                          padding: "4px 8px !important",
                        }}
                      >
                        Egp Published Date : {formatDisplayDate(table.noticeDateBlock)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Table Specs with Watermark */}
                <div
                  className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative rounded-b-xl rounded-t-none border border-gray-400 border-t-0"
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

                  <table className="w-full text-left font-semibold text-black relative z-10 print:w-full">
                    <thead
                      className="border-b border-gray-400 text-black"
                      style={{
                        backgroundColor: table.headerBgColor || defaultHeaderBg,
                      }}
                    >
                      <tr className="divide-x divide-gray-400">
                        {!hasSl && (
                          <th
                            className="p-3 font-bold border border-gray-400 text-sm uppercase text-center whitespace-nowrap"
                            style={{
                              backgroundColor:
                                table.headerBgColor || defaultHeaderBg,
                              color: getHeaderTextColorHex(
                                table.headerBgColor || defaultHeaderBg,
                              ),
                              textAlign: "center",
                            }}
                          >
                            SL No
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
                          return (
                            <th
                              key={idx}
                              className={`p-3 font-bold border border-gray-400 text-base uppercase text-center ${
                                isDesc
                                  ? "desc-column w-[32%] min-w-[220px] whitespace-normal"
                                  : "auto-column"
                              } ${
                                isTender || isSl
                                  ? "whitespace-nowrap"
                                  : ""
                              }`}
                              style={{
                                backgroundColor:
                                  table.headerBgColor || defaultHeaderBg,
                                color: getHeaderTextColorHex(
                                  table.headerBgColor || defaultHeaderBg,
                                ),
                              }}
                            >
                              {hdr}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400">
                      {normalizedRows.map((row: string[], rIdx: number) => {
                        const isWinnerRow =
                          winnerColIdx !== -1 &&
                          row[winnerColIdx] &&
                          row[winnerColIdx].trim() !== "";
                        return (
                          <tr
                            key={rIdx}
                            className={`hover:bg-slate-50/50 transition divide-x divide-gray-400 ${
                              isWinnerRow
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

                              const colHdr = (headers[cIdx] || "").toLowerCase().trim();
                              const isCenterAlignCol = 
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

                              return (
                                <td
                                  key={cIdx}
                                  className={`p-3 border border-gray-400 text-black text-base font-semibold font-bangla ${cellAlignClass} ${
                                    isDesc
                                      ? "desc-column w-[32%] min-w-[220px] whitespace-normal text-left"
                                      : "auto-column"
                                  } ${
                                    isTender || isSl
                                      ? "whitespace-nowrap"
                                      : ""
                                  }`}
                                  style={{
                                    backgroundColor: cellBg,
                                    textAlign: isCenterAlignCol ? "center" : isCurrencyAlignCol ? "right" : "left",
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
                                      const parts = formattedVal.split(/\s+/);
                                      const datePart = parts[0];
                                      const timePart = parts.slice(1).join(" ");
                                      if (timePart) {
                                        return (
                                          <div className="flex flex-col text-center">
                                            <span className="whitespace-nowrap">
                                              {datePart}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold mt-0.5 whitespace-nowrap">
                                              {timePart}
                                            </span>
                                          </div>
                                        );
                                      }
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
                        <tr className="bg-[#facc15] font-bold text-black divide-x divide-gray-400 border-t-2 border-gray-500 total-amount-row" style={{ backgroundColor: "#facc15" }}>
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
                                  className="p-3 border border-gray-400 text-right text-base font-extrabold bg-[#facc15]"
                                  style={{ backgroundColor: "#facc15", textAlign: "right" }}
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
                                  className="p-3 border border-gray-400 text-base font-extrabold text-black bg-[#facc15] text-right"
                                  style={{ backgroundColor: "#facc15", textAlign: "right" }}
                                >
                                  {formatMoney(totalSecurity)}
                                </td>
                              );
                            }
                            if (idx === docFeesColIdx) {
                              return (
                                <td
                                  key={idx}
                                  className="p-3 border border-gray-400 text-sm font-extrabold text-black bg-[#facc15] text-right"
                                  style={{ backgroundColor: "#facc15", textAlign: "right" }}
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
                            No tender entries available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Compact Government Footer Table Blocks */}
                {(table.payOrderTo || true) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 print:mt-3 print:grid-cols-2 font-bangla text-black">
                    {table.payOrderTo && (
                      <div 
                        className="footer-card bg-gradient-to-br from-slate-50 to-white rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        style={{
                          borderLeft: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                          borderRight: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                          borderTop: "1px solid #9ca3af",
                          borderBottom: "1px solid #9ca3af",
                        }}
                      >
                        <div 
                          className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-slate-300 rounded-br-xl px-4 py-2"
                          style={{
                            backgroundColor: table.headerBgColor || defaultHeaderBg,
                            color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                          }}
                        >
                          <i className="fa-solid fa-building-columns print:hidden"></i>
                          BD Pay Order To :
                        </div>
                        <div className="footer-card-content p-4 text-black font-semibold text-sm leading-relaxed whitespace-pre-line">
                          {table.payOrderTo}
                        </div>
                      </div>
                    )}
                    <div 
                      className="footer-card bg-gradient-to-br from-slate-50 to-white rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      style={{
                        borderLeft: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                        borderRight: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                        borderTop: "1px solid #9ca3af",
                        borderBottom: "1px solid #9ca3af",
                      }}
                    >
                      <div 
                        className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-slate-300 rounded-br-xl px-4 py-2"
                        style={{
                          backgroundColor: table.headerBgColor || defaultHeaderBg,
                          color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                        }}
                      >
                        <i className="fa-solid fa-circle-info print:hidden"></i>
                        Contact Info / e-Tender Solutions :
                      </div>
                      <div className="footer-card-content p-4 text-black font-semibold text-sm leading-relaxed">
                        Engr. Md. Shah Alom B.Sc. Engr.(Civil)
                        <br />
                        Mobile No: 01711-805086, 01972-805086
                        <br />
                        L M B Market 1st Floor, Pabna.
                        <br />
                        salomdhaka@gmail.com
                        <br />
                        Web:{" "}
                        <a
                          href="https://www.egpbtc.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          www.egpbtc.com
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Red Warning alert below table */}
                {table.bottomWarning && notice.category !== "OTM" && (
                  <div 
                    className="footer-card bg-gradient-to-br from-slate-50 to-white rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    style={{
                      borderLeft: "4px solid #dc2626",
                      borderRight: "4px solid #dc2626",
                      borderTop: "1px solid #fee2e2",
                      borderBottom: "1px solid #fee2e2",
                    }}
                  >
                    <div 
                      className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-red-200 rounded-br-xl px-4 py-2"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "#ffffff",
                      }}
                    >
                      <i className="fa-solid fa-circle-exclamation text-white print:hidden"></i>
                      Information :
                    </div>
                    <div 
                      className="footer-card-content p-4 text-red-650 font-extrabold text-sm leading-relaxed font-bangla"
                      style={{ color: "#dc2626" }}
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
      <style dangerouslySetInnerHTML={{ __html: `
        .single_notice_page * {
          font-family: 'Calibri', Candara, Segoe, Segoe UI, Optima, Arial, sans-serif !important;
        }
      `}} />
      <div className="custom-container">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex-1">
            <Link
              href="/egp-notice"
              className="inline-flex items-center bg-primary hover:!text-secondary !text-secondary px-4 py-2 mb-5 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to All Notices
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-1 font-bangla leading-tight">
              {notice.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm font-bold">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
                {notice.category}
              </span>
              <span className="text-text-2 flex items-center gap-1.5">
                <i className="fa-solid fa-calendar-plus text-primary"></i>
                Publish Date: {notice.publishDate}
              </span>
              {notice.lastDate && (
                <span className="text-text-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-day text-primary"></i>
                  Last Date: {notice.lastDate}
                </span>
              )}
              {notice.lotteryDate && (
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-check text-emerald-600"></i>
                  Lottery Date: {notice.lotteryDate}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-initial bg-text-1 text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-primary transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-print"></i> Print Notice
            </button>
            {notice.filePath && (
              <a
                href={notice.filePath}
                download
                className="flex-1 lg:flex-initial bg-primary hover:!text-secondary !text-secondary px-6 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-download"></i> Download File
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Content Display Area */}
        <div className="bg-white rounded-[32px] border border-ac-2 shadow-xl overflow-hidden p-6 md:p-10">
          <div ref={printAreaRef} className="print-wrapper-box w-full space-y-10">
            {/* 1. ATTACHMENT VIEW (Renders if present) */}
            {notice.filePath && (
              <div className="w-full relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5 text-text-1 print:hidden">
                  <i className="fa-solid fa-paperclip text-primary"></i>{" "}
                  Attached Document Reference
                </h4>
                {isPdf ? (
                  <iframe
                    id="notice-frame"
                    src={`${notice.filePath}#toolbar=0&navpanes=0&view=FitH`}
                    className="w-full h-[80vh] border border-slate-200 rounded-xl block"
                    title="Notice PDF Document"
                  ></iframe>
                ) : (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={notice.filePath}
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
                  <i className="fa-solid fa-file-lines text-primary"></i> Notice
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

                  const totalSecurity =
                    securityColIdx !== -1
                      ? normalizedRows.reduce(
                          (sum: number, r: string[]) =>
                            sum + parseMoney(r[securityColIdx]),
                          0,
                        )
                      : 0;
                  const totalDocFees =
                    docFeesColIdx !== -1
                      ? normalizedRows.reduce(
                          (sum: number, r: string[]) =>
                            sum + parseMoney(r[docFeesColIdx]),
                          0,
                        )
                      : 0;
                  const winnerColIdx = headers.findIndex((h: string) =>
                    h.toUpperCase().replace(/\./g, "").includes("WINNER"),
                  );

                  return (
                    <div
                      key={table.id || tIdx}
                      className="pwd-table-block space-y-0 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0 select-none"
                    >
                      {/* Unified Standalone Header Box (Renders only on 1st Page, doesn't repeat on page split) */}
                      <div className="border border-gray-400 rounded-t-xl bg-white w-full text-center print:rounded-t-none">
                        {table.officeName && (
                          <div className="p-3 font-extrabold text-2xl md:text-3xl border-b border-gray-400 text-center text-black bg-white print-office-name">
                            {table.officeName}
                          </div>
                        )}
                        {table.subTitle && (
                          <div className="p-2 font-bold text-sm md:text-base border-b border-gray-400 text-center text-black bg-white print-subtitle">
                            {table.subTitle}
                          </div>
                        )}
                        {table.noticeDateBlock && (
                          <div className="p-0 text-right bg-white pr-4" style={{ padding: "0px !important" }}>
                            <span 
                              className="inline-block font-bold text-xs md:text-sm"
                              style={{
                                backgroundColor: table.headerBgColor || defaultHeaderBg,
                                color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                                padding: "4px 8px !important",
                              }}
                            >
                              Egp Published Date : {formatDisplayDate(table.noticeDateBlock)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Table Specs with Watermark */}
                      <div
                        className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative rounded-b-xl rounded-t-none border border-gray-400 border-t-0"
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

                        <table className="w-full border-collapse text-left font-semibold text-black relative z-10 print:w-full">
                          <thead
                            className="border-b border-gray-400 text-black"
                            style={{
                              backgroundColor:
                                table.headerBgColor || defaultHeaderBg,
                            }}
                          >
                            <tr className="divide-x divide-gray-400">
                              {!hasSl && (
                                <th
                                  className="p-2.5 font-bold border border-gray-400 text-sm uppercase whitespace-nowrap text-center"
                                  style={{
                                    backgroundColor:
                                      table.headerBgColor || defaultHeaderBg,
                                    color: getHeaderTextColorHex(
                                      table.headerBgColor || defaultHeaderBg,
                                    ),
                                    textAlign: "center",
                                  }}
                                >
                                  SL No
                                </th>
                              )}
                              {headers.map((hdr: string, idx: number) => {
                                const isDesc = (hdr || "")
                                  .toLowerCase()
                                  .includes("description");
                                return (
                                  <th
                                    key={idx}
                                    className={`p-2.5 font-bold border border-gray-400 text-sm uppercase text-center ${
                                      isDesc
                                        ? "desc-column w-[30%] min-w-[220px]"
                                        : "auto-column whitespace-nowrap"
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
                                    {hdr}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-400">
                            {normalizedRows.map(
                              (row: string[], rIdx: number) => {
                                const isWinnerRow =
                                  winnerColIdx !== -1 &&
                                  row[winnerColIdx] &&
                                  row[winnerColIdx].trim() !== "";
                                return (
                                  <tr
                                    key={rIdx}
                                    className={`hover:bg-slate-50/50 transition divide-x divide-gray-400 ${
                                      isWinnerRow
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

                                      const colHdr = (headers[cIdx] || "").toLowerCase().trim();
                                      const isCenterAlignCol = 
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

                                      return (
                                        <td
                                          key={cIdx}
                                          className={`p-2.5 border border-gray-400 text-black text-sm font-semibold font-bangla ${cellAlignClass} ${
                                            isDesc
                                              ? "desc-column w-[30%] min-w-[220px] text-left"
                                              : "auto-column whitespace-nowrap"
                                          }`}
                                          style={{
                                            backgroundColor: cellBg,
                                            textAlign: isCenterAlignCol ? "center" : isCurrencyAlignCol ? "right" : "left",
                                            WebkitPrintColorAdjust: "exact",
                                            printColorAdjust: "exact",
                                          }}
                                        >
                                          {isWinnerCell && isWinnerRow && (
                                            <span className="inline-block mr-1">
                                              🏆
                                            </span>
                                          )}
                                          {formatCellValue(
                                            cell,
                                            headers[cIdx] || "",
                                          )}
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
                                className="bg-[#facc15] font-bold text-black divide-x divide-gray-400 border-t-2 border-gray-500 total-amount-row"
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
                                        className="p-2.5 border border-gray-400 text-right text-sm font-extrabold bg-[#facc15]"
                                        style={{ backgroundColor: "#facc15", textAlign: "right" }}
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
                                        className="p-2.5 border border-gray-400 text-sm font-extrabold text-black bg-[#facc15] text-right"
                                        style={{ backgroundColor: "#facc15", textAlign: "right" }}
                                      >
                                        {formatMoney(totalSecurity)}
                                      </td>
                                    );
                                  }
                                  if (idx === docFeesColIdx) {
                                    return (
                                      <td
                                        key={idx}
                                        className="p-2.5 border border-gray-400 text-sm font-extrabold text-black bg-[#facc15] text-right"
                                        style={{ backgroundColor: "#facc15", textAlign: "right" }}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 print:mt-3 print:grid-cols-2 font-bangla text-black">
                          {table.payOrderTo && (
                            <div 
                              className="footer-card bg-gradient-to-br from-slate-50 to-white rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                              style={{
                                borderLeft: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                                borderRight: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                                borderTop: "1px solid #9ca3af",
                                borderBottom: "1px solid #9ca3af",
                              }}
                            >
                              <div 
                                className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-slate-300 rounded-br-xl px-4 py-2"
                                style={{
                                  backgroundColor: table.headerBgColor || defaultHeaderBg,
                                  color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                                }}
                              >
                                <i className="fa-solid fa-building-columns print:hidden"></i>
                                BD Pay Order To :
                              </div>
                              <div className="footer-card-content p-4 text-black font-semibold text-sm leading-relaxed whitespace-pre-line">
                                {table.payOrderTo}
                              </div>
                            </div>
                          )}
                          <div 
                            className="footer-card bg-gradient-to-br from-slate-50 to-white rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            style={{
                              borderLeft: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                              borderRight: `4px solid ${table.headerBgColor || defaultHeaderBg}`,
                              borderTop: "1px solid #9ca3af",
                              borderBottom: "1px solid #9ca3af",
                            }}
                          >
                            <div 
                              className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-slate-300 rounded-br-xl px-4 py-2"
                              style={{
                                backgroundColor: table.headerBgColor || defaultHeaderBg,
                                color: getHeaderTextColorHex(table.headerBgColor || defaultHeaderBg),
                              }}
                            >
                              <i className="fa-solid fa-circle-info print:hidden"></i>
                              Contact Info / e-Tender Solutions :
                            </div>
                            <div className="footer-card-content p-4 text-black font-semibold text-sm leading-relaxed">
                              Engr. Md. Shah Alom B.Sc. Engr.(Civil)
                              <br />
                              Mobile No: 01711-805086
                              <br />
                              L M B Market 1st Floor, Pabna.
                              <br />
                              Web:{" "}
                              <a
                                href="https://www.egpbtc.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                www.egpbtc.com
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Red Warning alert below table */}
                      {table.bottomWarning && notice.category !== "OTM" && (
                        <div 
                          className="footer-card rounded-xl p-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mt-4"
                          style={{
                            borderLeft: "4px solid #dc2626",
                            borderRight: "4px solid #dc2626",
                            borderTop: "1px solid #fee2e2",
                            borderBottom: "1px solid #fee2e2",
                          }}
                        >
                          <div 
                            className="footer-card-label inline-flex items-center gap-2 text-xs md:text-sm font-extrabold uppercase tracking-wider border-r border-b border-red-200 rounded-br-xl px-4 py-2"
                            style={{
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                            }}
                          >
                            <i className="fa-solid fa-circle-exclamation text-white print:hidden"></i>
                            Information :
                          </div>
                          <div 
                            className="footer-card-content p-4 text-red-650 font-extrabold text-sm leading-relaxed font-bangla"
                            style={{ color: "#dc2626" }}
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
