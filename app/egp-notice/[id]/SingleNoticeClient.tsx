"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";

interface NoticeItem {
  id: string;
  title: string;
  category: string;
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
    // If it's ONLY a PDF and nothing else, print the iframe for high fidelity
    const hasOtherContent = !!(notice.content || parsedTables.length > 0);
    if (notice.filePath && isPdf && !hasOtherContent) {
      const iframe = document.getElementById(
        "notice-frame",
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
        return;
      }
    }

    // Otherwise print the entire structured web content beautifully
    const printContents = printAreaRef.current?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = `
        <html>
          <head>
            <title>&nbsp;</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0 !important;
              }
              body {
                padding: 15mm 15mm 15mm 15mm !important;
                margin: 0;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: white !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                line-height: 1.5;
              }
              .print-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto;
                background-color: white;
              }
              .pwd-table-block {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin-bottom: 25pt !important;
              }
              .pwd-scroll-wrapper {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
              }
              table {
                width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                margin-top: 10pt !important;
                margin-bottom: 10pt !important;
                page-break-inside: avoid;
              }
              th, td {
                border: 1px solid #000000 !important;
                padding: 6pt 8pt !important;
                text-align: left !important;
                font-size: 8.5pt !important;
                color: #000000 !important;
              }
              th {
                background-color: #ccffff !important;
                font-weight: bold !important;
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
              h1, h2, h3, h4, h5, p, div, tr {
                page-break-inside: avoid;
              }
              iframe {
                display: none !important;
              }
              .no-print, button, .btn, h4, .print-hidden, [class*="print:hidden"] {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContents}
            </div>
          </body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Restore full React DOM
    }
  };

  // Money parser helper for summing up numbers in PWD Table
  const parseMoney = (val: string) => {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/,/g, "")) || 0;
  };

  const formatMoney = (val: number) => {
    return val.toLocaleString("en-US");
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
        `,
          }}
        />

        {/* Fullscreen Top Navigation Bar */}
        <div className="w-full bg-white border-b border-slate-200 py-3.5 px-4 flex justify-center gap-3 print:hidden">
          <Link
            href="/"
            className="bg-[#e74c3c] hover:bg-[#c0392b] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all"
          >
            <i className="fa-solid fa-home"></i> Home
          </Link>
          <Link
            href="/egp-notice"
            className="bg-[#34495e] hover:bg-[#2c3e50] !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all"
          >
            <i className="fa-solid fa-arrow-left"></i> Back
          </Link>
          <button
            onClick={handlePrint}
            className="bg-[var(--primary-color)] hover:bg-green-700 !text-white px-6 py-2.5 rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <i className="fa-solid fa-print"></i> Print
          </button>
        </div>

        {/* Fullscreen Table Content Wrapper */}
        <div
          ref={printAreaRef}
          className="w-full max-w-full px-2 sm:px-6 md:px-12 py-8 bg-white space-y-8"
        >
          {parsedTables.map((table, tIdx) => {
            const headers =
              table.headers && table.headers.length > 0
                ? table.headers
                : table.type === "pwd_ltm"
                  ? [
                      "SL No",
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
                    (rIdx + 1).toString(),
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
            const docFeesColIdx = headers.findIndex(
              (h: string) =>
                h.toLowerCase().includes("fees") ||
                h.toLowerCase().includes("fee"),
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
                className="pwd-table-block space-y-4 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0"
              >
                {/* Procuring Entity Header */}
                {table.officeName && (
                  <div className="text-center font-extrabold text-3xl md:text-4xl text-black mb-6 tracking-wide leading-tight">
                    {table.officeName}
                  </div>
                )}

                {/* Unified Three Color Blocks Bar */}
                {(table.noticeDateBlock ||
                  table.lastDateBlock ||
                  table.lotteryDateBlock) && (
                  <div className="grid grid-cols-3 border border-black text-center text-xs md:text-sm font-bold divide-x divide-black mb-4">
                    {table.noticeDateBlock ? (
                      <div className="bg-[#ffff00] text-black py-3.5 flex items-center justify-center gap-1.5 border-none">
                        Notice Date : {table.noticeDateBlock}
                      </div>
                    ) : (
                      <div className="bg-[#ffff00] py-3.5" />
                    )}
                    {table.lastDateBlock ? (
                      <div className="bg-[#ff9966] text-white py-3.5 flex items-center justify-center gap-1.5 border-none">
                        Last Date : {table.lastDateBlock}
                      </div>
                    ) : (
                      <div className="bg-[#ff9966] py-3.5" />
                    )}
                    {table.lotteryDateBlock ? (
                      <div className="bg-[#99cc99] text-black py-3.5 flex items-center justify-center gap-1.5 border-none">
                        Lottery Date : {table.lotteryDateBlock}
                      </div>
                    ) : (
                      <div className="bg-[#99cc99] py-3.5" />
                    )}
                  </div>
                )}

                {/* Table Specs with Watermark */}
                <div
                  className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative"
                  style={{
                    overflowY: "hidden",
                    height: "auto",
                    maxHeight: "none",
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none rotate-0 z-0">
                    <span className="text-[80px] md:text-[140px] font-black text-slate-800 tracking-widest uppercase">
                      LTM Notice
                    </span>
                  </div>

                  <table className="w-full border-collapse text-left text-xs font-semibold text-black relative z-10 print:w-full">
                    <thead className="bg-[#ccffff] border-b border-black text-black">
                      <tr className="divide-x divide-black">
                        {headers.map((hdr: string, idx: number) => (
                          <th
                            key={idx}
                            className="p-3 font-bold border border-black bg-[#ccffff] text-black text-xs md:text-sm uppercase text-center"
                          >
                            {hdr}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {normalizedRows.map((row: string[], rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50/50 transition divide-x divide-black"
                        >
                          {row.map((cell: string, cIdx: number) => (
                            <td
                              key={cIdx}
                              className="p-3 border border-black text-black text-base md:text-lg font-semibold font-bangla"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Sum Totals Row if any sum matches */}
                      {(securityColIdx !== -1 || docFeesColIdx !== -1) && (
                        <tr className="bg-slate-50 font-bold text-black divide-x divide-black border-t border-black">
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
                                  className="p-3 border border-black text-right text-xs md:text-sm font-extrabold"
                                  colSpan={colSpanCount}
                                >
                                  Total :
                                </td>
                              );
                            }
                            // Skip columns merged by colSpan
                            const minTotalColIdx = Math.min(
                              securityColIdx !== -1
                                ? securityColIdx
                                : docFeesColIdx,
                              headers.length,
                            );
                            if (idx < minTotalColIdx) {
                              return null;
                            }
                            if (idx === securityColIdx) {
                              return (
                                <td
                                  key={idx}
                                  className="p-3 border border-black text-xs md:text-sm font-extrabold text-black"
                                >
                                  {formatMoney(totalSecurity)}
                                </td>
                              );
                            }
                            if (idx === docFeesColIdx) {
                              return (
                                <td
                                  key={idx}
                                  className="p-3 border border-black text-xs md:text-sm font-extrabold text-black"
                                >
                                  {formatMoney(totalDocFees)}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={idx}
                                className="p-3 border border-black"
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
                {(table.payOrderTo || table.moreInfo) && (
                  <div className="grid grid-cols-2 border border-t-0 border-black font-bangla text-xs md:text-sm text-black">
                    {table.payOrderTo ? (
                      <div className="p-3 border-r border-black bg-white">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5 font-bold">
                          BD Pay Order To :
                        </span>
                        <span className="text-black font-extrabold leading-relaxed text-sm md:text-base">
                          {table.payOrderTo}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 border-r border-black bg-white" />
                    )}
                    {table.moreInfo ? (
                      <div className="p-3 bg-white">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5 font-bold">
                          More Info :
                        </span>
                        <span className="text-black font-extrabold leading-relaxed text-sm md:text-base">
                          {table.moreInfo}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-white" />
                    )}
                  </div>
                )}

                {/* Red Warning alert below table */}
                {table.bottomWarning && (
                  <div className="mt-4 text-red-600 font-extrabold text-base md:text-lg font-bangla text-left leading-relaxed">
                    {table.bottomWarning}
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
      <div className="custom-container">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex-1">
            <Link
              href="/egp-notice"
              className="text-text-1 hover:!text-primary font-bold inline-flex items-center gap-2 mb-4 transition uppercase tracking-wider text-xs"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to All Notices
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-text-1 font-bangla leading-tight">
              {notice.title}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {notice.category}
              </span>
              <span className="text-text-2 text-sm font-bold">
                <i className="fa-solid fa-calendar-days mr-2"></i> {notice.date}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={handlePrint}
              className="flex-1 lg:flex-initial bg-text-1 text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-primary transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <i className="fa-solid fa-print"></i> Print Notice
            </button>
            {notice.filePath && (
              <a
                href={notice.filePath}
                download
                className="flex-1 lg:flex-initial bg-primary hover:!text-secondary text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-text-1 transition flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <i className="fa-solid fa-download"></i> Download File
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Content Display Area */}
        <div className="bg-white rounded-[32px] border border-ac-2 shadow-xl overflow-hidden p-6 md:p-10">
          <div ref={printAreaRef} className="w-full space-y-10">
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
                  const headers = table.headers || [];
                  const rows = table.rows || [];

                  // PWD LTM Template Table Sum Calculations
                  const securityColIdx = headers.findIndex((h: string) =>
                    h.toLowerCase().includes("security"),
                  );
                  const docFeesColIdx = headers.findIndex(
                    (h: string) =>
                      h.toLowerCase().includes("fees") ||
                      h.toLowerCase().includes("fee"),
                  );

                  const totalSecurity =
                    securityColIdx !== -1
                      ? rows.reduce(
                          (sum: number, r: string[]) =>
                            sum + parseMoney(r[securityColIdx]),
                          0,
                        )
                      : 0;
                  const totalDocFees =
                    docFeesColIdx !== -1
                      ? rows.reduce(
                          (sum: number, r: string[]) =>
                            sum + parseMoney(r[docFeesColIdx]),
                          0,
                        )
                      : 0;

                  return (
                    <div
                      key={table.id || tIdx}
                      className="pwd-table-block space-y-4 p-0 bg-white relative font-bangla text-black print:p-0 print:border-0 select-none"
                    >
                      {/* Procuring Entity Header */}
                      {table.officeName && (
                        <div className="text-center font-extrabold text-3xl text-black mb-4 tracking-wide">
                          {table.officeName}
                        </div>
                      )}

                      {/* Unified Three Color Blocks Bar */}
                      {(table.noticeDateBlock ||
                        table.lastDateBlock ||
                        table.lotteryDateBlock) && (
                        <div className="grid grid-cols-3 border border-black text-center text-xs md:text-sm font-bold divide-x divide-black mb-4">
                          {table.noticeDateBlock ? (
                            <div className="bg-[#ffff00] text-black py-2.5 flex items-center justify-center gap-1.5 border-none">
                              Notice Date : {table.noticeDateBlock}
                            </div>
                          ) : (
                            <div className="bg-[#ffff00] py-2.5" />
                          )}
                          {table.lastDateBlock ? (
                            <div className="bg-[#ff9966] text-white py-2.5 flex items-center justify-center gap-1.5 border-none">
                              Last Date : {table.lastDateBlock}
                            </div>
                          ) : (
                            <div className="bg-[#ff9966] py-2.5" />
                          )}
                          {table.lotteryDateBlock ? (
                            <div className="bg-[#99cc99] text-black py-2.5 flex items-center justify-center gap-1.5 border-none">
                              Lottery Date : {table.lotteryDateBlock}
                            </div>
                          ) : (
                            <div className="bg-[#99cc99] py-2.5" />
                          )}
                        </div>
                      )}

                      {/* Table Specs with Watermark */}
                      <div
                        className="pwd-scroll-wrapper w-full overflow-x-auto overflow-y-hidden bg-white relative"
                        style={{
                          overflowY: "hidden",
                          height: "auto",
                          maxHeight: "none",
                        }}
                      >
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none rotate-0 z-0">
                          <span className="text-[80px] md:text-[120px] font-black text-slate-800 tracking-widest uppercase">
                            LTM Notice
                          </span>
                        </div>

                        <table className="w-full border-collapse text-left text-xs font-semibold text-black relative z-10 print:w-full">
                          <thead className="bg-[#ccffff] border-b border-black text-black">
                            <tr className="divide-x divide-black">
                              {headers.map((hdr: string, idx: number) => (
                                <th
                                  key={idx}
                                  className="p-2.5 font-bold border border-black bg-[#ccffff] text-black text-xs uppercase"
                                >
                                  {hdr}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black">
                            {rows.map((row: string[], rIdx: number) => (
                              <tr
                                key={rIdx}
                                className="hover:bg-slate-50/50 transition divide-x divide-black"
                              >
                                {row.map((cell: string, cIdx: number) => (
                                  <td
                                    key={cIdx}
                                    className="p-2.5 border border-black text-black text-base font-semibold font-bangla"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {/* Sum Totals Row if any sum matches */}
                            {(securityColIdx !== -1 ||
                              docFeesColIdx !== -1) && (
                              <tr className="bg-slate-50 font-bold text-black divide-x divide-black border-t border-black">
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
                                        className="p-2.5 border border-black text-right text-xs"
                                        colSpan={colSpanCount}
                                      >
                                        Total :
                                      </td>
                                    );
                                  }
                                  // Skip columns merged by colSpan
                                  const minTotalColIdx = Math.min(
                                    securityColIdx !== -1
                                      ? securityColIdx
                                      : docFeesColIdx,
                                    headers.length,
                                  );
                                  if (idx < minTotalColIdx) {
                                    return null;
                                  }
                                  if (idx === securityColIdx) {
                                    return (
                                      <td
                                        key={idx}
                                        className="p-2.5 border border-black text-xs font-extrabold text-black"
                                      >
                                        {formatMoney(totalSecurity)}
                                      </td>
                                    );
                                  }
                                  if (idx === docFeesColIdx) {
                                    return (
                                      <td
                                        key={idx}
                                        className="p-2.5 border border-black text-xs font-extrabold text-black"
                                      >
                                        {formatMoney(totalDocFees)}
                                      </td>
                                    );
                                  }
                                  return (
                                    <td
                                      key={idx}
                                      className="p-2.5 border border-black"
                                    ></td>
                                  );
                                })}
                              </tr>
                            )}

                            {rows.length === 0 && (
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
                      {(table.payOrderTo || table.moreInfo) && (
                        <div className="grid grid-cols-2 border border-t-0 border-black font-bangla text-xs text-black">
                          {table.payOrderTo ? (
                            <div className="p-3 border-r border-black bg-white">
                              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5 font-bold">
                                BD Pay Order To :
                              </span>
                              <span className="text-black font-extrabold leading-relaxed">
                                {table.payOrderTo}
                              </span>
                            </div>
                          ) : (
                            <div className="p-3 border-r border-black bg-white" />
                          )}
                          {table.moreInfo ? (
                            <div className="p-3 bg-white">
                              <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-0.5 font-bold">
                                More Info :
                              </span>
                              <span className="text-black font-extrabold leading-relaxed">
                                {table.moreInfo}
                              </span>
                            </div>
                          ) : (
                            <div className="p-3 bg-white" />
                          )}
                        </div>
                      )}

                      {/* Red Warning alert below table */}
                      {table.bottomWarning && (
                        <div className="mt-3 text-red-600 font-extrabold text-sm font-bangla text-left">
                          {table.bottomWarning}
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
