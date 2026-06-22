"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { deleteNotice, saveNoticeWinners } from "@/app/actions/notices";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import DeleteButton from "@/components/dashboard/DeleteButton";
import WhatsAppShareButton from "@/components/dashboard/WhatsAppShareButton";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  FileDown,
  Edit3,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  category: string;
  year?: string | null;
  status: string;
  publishDate?: Date | null;
  lastDate?: Date | string | null;
  lotteryDate?: Date | string | null;
  type: string;
  content?: string | null;
  filePath?: string | null;
  tableData?: string | null;
}

interface NoticesTableProps {
  notices: Notice[];
  startIndex: number;
  now: string;
}

// -----------------------------------------------
// Inline Table Data Renderer
// -----------------------------------------------
const isCurrencyColumn = (hdr: string) => {
  if (!hdr) return false;
  const lower = hdr.toLowerCase();
  return lower.includes("cost") || 
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
         lower.includes("টাকা");
};

const formatCellValue = (val: string, hdr: string) => {
  if (!val) return "";
  const str = String(val).trim();
  if (isCurrencyColumn(hdr)) {
    const cleanVal = str.replace(/,/g, "").trim();
    const num = parseFloat(cleanVal);
    if (!isNaN(num) && /^\d+(\.\d+)?$/.test(cleanVal)) {
      if (cleanVal.includes(".")) {
        const [integerPart, decimalPart] = cleanVal.split(".");
        const parsedInt = parseFloat(integerPart);
        if (!isNaN(parsedInt)) {
          return `${parsedInt.toLocaleString("en-US")}.${decimalPart}`;
        }
      }
      return num.toLocaleString("en-US");
    }
  }
  return str;
};

function TableDataPreview({ tableData }: { tableData: string }) {
  try {
    const parsed = JSON.parse(tableData);

    // v2 format: multiple tables
    if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
      return (
        <div className="space-y-6 custom-table-preview">
          {parsed.tables.map((table: any, tIdx: number) => {
            const headerBg = table.headerBgColor;
            const isCustomHeader = !!headerBg;
            const headers = table.headers || [];
            const rows = table.rows || [];

            const securityColIdx = headers.findIndex((h: string) =>
              h.toLowerCase().includes("security"),
            );
            const docFeesColIdx = headers.findIndex((h: string) => {
              const lower = h.toLowerCase();
              return lower.includes("fee") || lower.includes("price");
            });
            const winnerColIdx = headers.findIndex((h: string) =>
              h.toUpperCase().replace(/\./g, "").includes("WINNER")
            );

            const parseMoney = (val: string) => {
              if (!val) return 0;
              return parseFloat(val.toString().replace(/,/g, "")) || 0;
            };

            const formatMoney = (val: number) => {
              return val.toLocaleString("en-US");
            };

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
              <div key={tIdx} className="space-y-2">
                {table.officeName && (
                  <p className="text-xs font-bold text-slate-700 text-center">{table.officeName}</p>
                )}
                {table.subTitle && (
                  <p className="text-[10px] font-semibold text-slate-500 text-center -mt-1.5">{table.subTitle}</p>
                )}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr 
                        style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                        className={isCustomHeader ? "text-slate-800" : "bg-[#1b4332] text-white"}
                      >
                        {headers.map((h: string, i: number) => (
                          <th 
                            key={i} 
                            style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                            className={`px-3 py-2 text-left font-bold whitespace-nowrap border text-[10px] uppercase tracking-wide ${
                              isCustomHeader ? "border-slate-200 !text-slate-800" : "border-[#2d6a4f] !text-white"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: string[], rIdx: number) => {
                        const isWinnerRow = winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
                        return (
                          <tr 
                            key={rIdx} 
                            className={
                              isWinnerRow 
                                ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500" 
                                : rIdx % 2 === 0 
                                  ? "bg-white" 
                                  : "bg-slate-50"
                            }
                          >
                            {row.map((cell: string, cIdx: number) => {
                              const cellBg = isWinnerRow ? "#fffbeb" : table.columnColors?.[cIdx];
                              const isDesc = (headers[cIdx] || "").toLowerCase().includes("description");
                              const isCurrency = isCurrencyColumn(headers[cIdx] || "");
                              const isWinnerCell = cIdx === winnerColIdx;
                              return (
                                <td 
                                  key={cIdx} 
                                  style={cellBg ? { backgroundColor: cellBg } : undefined}
                                  className={`px-3 py-2 border border-slate-200 !text-slate-800 ${
                                    isDesc ? "whitespace-normal min-w-[220px]" : "whitespace-nowrap"
                                  } ${isCurrency ? "text-right" : "text-left"}`}
                                >
                                  {isWinnerCell && isWinnerRow && <span className="inline-block mr-1">🏆</span>}
                                  {formatCellValue(cell, headers[cIdx] || "")}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Sum Totals Row if any sum matches */}
                      {(securityColIdx !== -1 || docFeesColIdx !== -1) && (
                        <tr className="bg-[#ffffcc] font-bold text-slate-800 border-t border-slate-200">
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
                                  className="px-3 py-2 text-right font-extrabold bg-[#ffffcc] border border-slate-200 !text-slate-800"
                                  colSpan={colSpanCount}
                                >
                                  Total Amount BD Tk =
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
                                  className="px-3 py-2 font-extrabold !text-slate-800 bg-[#ffffcc] border border-slate-200 text-right whitespace-nowrap"
                                >
                                  {formatMoney(totalSecurity)}
                                </td>
                              );
                            }
                            if (idx === docFeesColIdx) {
                              return (
                                <td
                                  key={idx}
                                  className="px-3 py-2 font-extrabold !text-slate-800 bg-[#ffffcc] border border-slate-200 text-right whitespace-nowrap"
                                >
                                  {formatMoney(totalDocFees)}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={idx}
                                className="px-3 py-2 border border-slate-200 bg-[#ffffcc] !text-slate-800"
                              ></td>
                            );
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // PWD template
    if (parsed.isPwdTemplate) {
      const headerBg = parsed.headerBgColor;
      const isCustomHeader = !!headerBg;
      const headers = parsed.headers || [];
      const winnerColIdx = headers.findIndex((h: string) =>
        h.toUpperCase().replace(/\./g, "").includes("WINNER")
      );
      return (
        <div className="space-y-2 custom-table-preview">
          {parsed.officeName && (
            <p className="text-xs font-bold text-slate-600 text-center">{parsed.officeName}</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr 
                  style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                  className={isCustomHeader ? "text-slate-800" : "bg-[#1b4332] text-white"}
                >
                  {headers.map((h: string, i: number) => (
                    <th 
                      key={i} 
                      style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                      className={`px-3 py-2 text-left font-bold whitespace-nowrap border text-[10px] uppercase tracking-wide ${
                        isCustomHeader ? "border-slate-200 !text-slate-800" : "border-[#2d6a4f] !text-white"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(parsed.rows || []).map((row: string[], rIdx: number) => {
                  const isWinnerRow = winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
                  return (
                    <tr 
                      key={rIdx} 
                      className={
                        isWinnerRow 
                          ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500" 
                          : rIdx % 2 === 0 
                            ? "bg-white" 
                            : "bg-slate-50"
                      }
                    >
                      {row.map((cell: string, cIdx: number) => {
                        const cellBg = isWinnerRow ? "#fffbeb" : parsed.columnColors?.[cIdx];
                        const isDesc = (headers?.[cIdx] || "").toLowerCase().includes("description");
                        const isWinnerCell = cIdx === winnerColIdx;
                        return (
                          <td 
                            key={cIdx} 
                            style={cellBg ? { backgroundColor: cellBg } : undefined}
                            className={`px-3 py-2 border border-slate-200 !text-slate-800 ${
                              isDesc ? "whitespace-normal min-w-[220px]" : "whitespace-nowrap"
                            }`}
                          >
                            {isWinnerCell && isWinnerRow && <span className="inline-block mr-1">🏆</span>}
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Legacy simple format
    if (parsed.headers && parsed.rows) {
      const headerBg = parsed.headerBgColor;
      const isCustomHeader = !!headerBg;
      const headers = parsed.headers || [];
      const winnerColIdx = headers.findIndex((h: string) =>
        h.toUpperCase().replace(/\./g, "").includes("WINNER")
      );
      return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 custom-table-preview">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr 
                style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                className={isCustomHeader ? "text-slate-800" : "bg-[#1b4332] text-white"}
              >
                {headers.map((h: string, i: number) => (
                  <th 
                    key={i} 
                    style={isCustomHeader ? { backgroundColor: headerBg } : undefined}
                    className={`px-3 py-2 text-left font-bold whitespace-nowrap border text-[10px] uppercase tracking-wide ${
                      isCustomHeader ? "border-slate-200 !text-slate-800" : "border-[#2d6a4f] !text-white"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(parsed.rows || []).map((row: string[], rIdx: number) => {
                const isWinnerRow = winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
                return (
                  <tr 
                    key={rIdx} 
                    className={
                      isWinnerRow 
                        ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500" 
                        : rIdx % 2 === 0 
                          ? "bg-white" 
                          : "bg-slate-50"
                    }
                  >
                    {row.map((cell: string, cIdx: number) => {
                      const cellBg = isWinnerRow ? "#fffbeb" : parsed.columnColors?.[cIdx];
                      const isDesc = (headers?.[cIdx] || "").toLowerCase().includes("description");
                      const isWinnerCell = cIdx === winnerColIdx;
                      return (
                        <td 
                          key={cIdx} 
                          style={cellBg ? { backgroundColor: cellBg } : undefined}
                          className={`px-3 py-2 border border-slate-200 !text-slate-800 ${
                            isDesc ? "whitespace-normal min-w-[220px]" : "whitespace-nowrap"
                          }`}
                        >
                          {isWinnerCell && isWinnerRow && <span className="inline-block mr-1">🏆</span>}
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  } catch (e) {
    // fall through
  }

  return (
    <div className="text-center py-6 text-slate-400 text-xs font-semibold">
      Table data could not be parsed.
    </div>
  );
}

// -----------------------------------------------
// Main Component
// -----------------------------------------------
export default function NoticesTable({ notices, startIndex, now }: NoticesTableProps) {
  const searchParams = useSearchParams();
  const filter = searchParams?.get("filter") || "all";
  const nowDate = new Date(now);
  const [quickViewNotice, setQuickViewNotice] = useState<Notice | null>(null);

  const [isSelectingWinners, setIsSelectingWinners] = useState(false);
  const [tempTableData, setTempTableData] = useState<any>(null);
  const [submitWinnersLoading, setSubmitWinnersLoading] = useState(false);

  const formatLastDate = (notice: Notice) => {
    if (!notice.lastDate) return "N/A";
    const d = new Date(notice.lastDate);
    if (isNaN(d.getTime())) return "N/A";
    const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) {
      let hrs = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, "0");
      const ampm = hrs >= 12 ? "PM" : "AM";
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      return `${dateStr} ${String(hrs).padStart(2, "0")}:${mins} ${ampm}`;
    }
    return dateStr;
  };

  const initWinnersMode = (notice: Notice) => {
    try {
      const parsed = JSON.parse(notice.tableData || "{}");
      let tables = [];
      if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
        tables = parsed.tables;
      } else if (parsed.isPwdTemplate) {
        tables = [
          {
            type: "pwd_ltm",
            officeName: parsed.officeName || "",
            noticeDateBlock: parsed.noticeDateBlock || "",
            lastDateBlock: parsed.lastDateBlock || "",
            lotteryDateBlock: parsed.lotteryDateBlock || "",
            payOrderTo: parsed.payOrderTo || "",
            moreInfo: parsed.moreInfo || "",
            bottomWarning: parsed.bottomWarning || "",
            headers: parsed.headers || ["SL No", "Tender ID", "Description", "Location", "AppCost (Tk)", "Solvency (Tk)", "Security (Tk)", "Doc Fees (Tk)", "Last Date & Time"],
            rows: parsed.rows || [],
            columnColors: parsed.columnColors || []
          }
        ];
      } else if (parsed.headers && parsed.rows) {
        tables = [
          {
            type: "standard",
            headers: parsed.headers,
            rows: parsed.rows,
            columnColors: parsed.columnColors || []
          }
        ];
      }

      // Ensure "WINNER LIST NAME" column exists in each table
      const updatedTables = tables.map((table: any) => {
        const headers = [...(table.headers || [])];
        const rows = (table.rows || []).map((r: any) => Array.isArray(r) ? [...r] : []);
        const columnColors = [...(table.columnColors || [])];

        const winnerColIdx = headers.findIndex((h: string) => h.toUpperCase().replace(/\./g, "").includes("WINNER"));
        if (winnerColIdx === -1) {
          headers.push("WINNER LIST NAME");
          columnColors.push("#ffffcc");
          rows.forEach((r: any) => r.push(""));
        }
        return {
          ...table,
          headers,
          rows,
          columnColors
        };
      });

      setTempTableData({
        version: "v2",
        tables: updatedTables
      });
      setIsSelectingWinners(true);
    } catch (err) {
      console.error("Failed to initialize winner selection mode", err);
    }
  };

  const handleSaveWinners = async () => {
    if (!quickViewNotice) return;
    setSubmitWinnersLoading(true);
    try {
      let pdfBase64 = "";

      // Ensure the hidden render div exists
      const element = document.getElementById("pdf-render-capture");
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2, // higher resolution
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210; // A4 size width in mm
        const pageHeight = 295; // A4 size height in mm
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

        const pdfDataUri = pdf.output("datauristring");
        pdfBase64 = pdfDataUri.split(",")[1];
      }

      const res = await saveNoticeWinners(quickViewNotice.id, JSON.stringify(tempTableData), pdfBase64);
      if (res.success) {
        alert(res.message);
        setQuickViewNotice(null);
        setIsSelectingWinners(false);
        setTempTableData(null);
        window.location.reload();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      console.error("Failed to save winners and generate PDF:", err);
      alert(`Failed to save winners: ${err?.message || err}`);
    } finally {
      setSubmitWinnersLoading(false);
    }
  };

  const formatPublishDate = (notice: Notice) => {
    if (!notice.publishDate) return "N/A";
    const d = new Date(notice.publishDate);
    const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    const isScheduled = notice.status === "active" && new Date(notice.publishDate) > nowDate;
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (isScheduled || hasTime) {
      let hrs = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, "0");
      const ampm = hrs >= 12 ? "PM" : "AM";
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      return `${dateStr} ${String(hrs).padStart(2, "0")}:${mins} ${ampm}`;
    }
    return dateStr;
  };

  const getStatusBadge = (notice: Notice) => {
    if (notice.status !== "active") {
      return { label: "Draft", cls: "bg-amber-50 text-amber-600 border border-amber-100" };
    }

    const isScheduled = notice.publishDate && new Date(notice.publishDate) > nowDate;
    if (isScheduled) {
      return { label: "Scheduled", cls: "bg-blue-50 text-blue-600 border border-blue-100" };
    }

    const isWinner = notice.category === "LOTTERY_RESULT";
    if (isWinner) {
      return { label: "Winner Publish", cls: "bg-[#fffbeb] text-[#b45309] border border-[#fde68a]" };
    }

    const isPending = notice.lastDate && new Date(notice.lastDate) < nowDate;
    if (isPending) {
      return { label: "Pending", cls: "bg-purple-50 text-purple-600 border border-purple-100" };
    }

    return { label: "Active", cls: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
  };

  // Render preview content inside the Quick View modal
  const renderPreviewContent = (notice: Notice) => {
    // Table — render inline first (avoids PDF iframe cut-off/dark-theme issues)
    if (notice.tableData) {
      return <TableDataPreview tableData={notice.tableData} />;
    }

    // File (image or PDF)
    if (notice.filePath) {
      const ext = notice.filePath.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
        return (
          <img
            src={notice.filePath}
            alt={notice.title}
            className="max-w-full max-h-[55vh] object-contain mx-auto rounded-xl shadow-sm"
          />
        );
      }
      return (
        <iframe
          src={`${notice.filePath}#toolbar=0`}
          className="w-full h-[55vh] border-0 rounded-xl bg-slate-50"
          title="Notice Preview"
        />
      );
    }

    // Text (HTML)
    if (notice.content) {
      return (
        <div
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-sm px-2"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      );
    }

    return (
      <div className="text-center py-10 text-slate-400 text-sm font-semibold">
        No preview content available.
      </div>
    );
  };

  return (
    <>
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-12 text-center">SL</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Title &amp; Type</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Category</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Year</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Publish Date</th>
            {(filter === "all" || filter === "published") && (
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Last Date</th>
            )}
            <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {notices.map((notice, idx) => {
            const statusBadge = getStatusBadge(notice);
            return (
              <tr key={notice.id} className="hover:bg-slate-50/50 transition">
                {/* SL No */}
                <td className="px-4 py-4 text-center">
                  <span className="text-xs font-extrabold text-slate-400 bg-slate-100 w-7 h-7 rounded-lg flex items-center justify-center mx-auto">
                    {startIndex + idx + 1}
                  </span>
                </td>

                {/* Title & Type */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <span className="text-slate-800 font-bold line-clamp-1">{notice.title}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      {notice.type === "FILE" && (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                          <FileDown className="w-3 h-3" /> File
                        </span>
                      )}
                      {notice.type === "TEXT" && (
                        <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                          <FileText className="w-3 h-3" /> Text
                        </span>
                      )}
                      {notice.type === "TABLE" && (
                        <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                          <FileSpreadsheet className="w-3 h-3" /> Table
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-bold uppercase tracking-wider">
                    {notice.category.replace("_", " ")}
                  </span>
                </td>

                {/* Year */}
                <td className="px-6 py-4 text-slate-600 text-sm font-semibold">{notice.year || "N/A"}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${statusBadge.cls}`}>
                    {statusBadge.label}
                  </span>
                </td>

                {/* Publish Date */}
                <td className="px-6 py-4 text-slate-400 text-xs font-semibold font-sans">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{formatPublishDate(notice)}</span>
                    </div>
                    {notice.lotteryDate && (
                      <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                        <span>Lottery: {(() => {
                          const d = new Date(notice.lotteryDate);
                          return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
                        })()}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Last Date */}
                {(filter === "all" || filter === "published") && (
                  <td className="px-6 py-4 text-slate-400 text-xs font-semibold font-sans">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{formatLastDate(notice)}</span>
                    </div>
                  </td>
                )}

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <WhatsAppShareButton notice={notice} />

                    {/* Quick View */}
                    <button
                      type="button"
                      onClick={() => setQuickViewNotice(notice)}
                      className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg transition inline-flex items-center justify-center border-0 active:scale-95 shadow-sm cursor-pointer"
                      title="Quick View"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>

                    <Link
                      href={`/admin/egp-notices/edit/${notice.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition inline-flex items-center justify-center border-0 active:scale-95 shadow-sm"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4 text-white" />
                    </Link>

                    <DeleteButton id={notice.id} action={deleteNotice} />
                  </div>
                </td>
              </tr>
            );
          })}

          {notices.length === 0 && (
            <tr>
              <td colSpan={(filter === "all" || filter === "published") ? 8 : 7} className="px-6 py-16 text-center text-slate-400 font-semibold text-sm">
                No procurement notices found. Create one to get started!
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------------------------------------------------- */}
      {/* QUICK VIEW POPUP MODAL                               */}
      {/* ---------------------------------------------------- */}
      {quickViewNotice && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => {
            setQuickViewNotice(null);
            setIsSelectingWinners(false);
            setTempTableData(null);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary-color)] via-blue-500 to-purple-500" />

            {/* Header */}
            <div className="flex justify-between items-start gap-4 px-6 pt-7 pb-4 border-b border-slate-100 shrink-0">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {quickViewNotice.type === "FILE" && (
                    <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold">
                      <FileDown className="w-3 h-3" /> File
                    </span>
                  )}
                  {quickViewNotice.type === "TEXT" && (
                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold">
                      <FileText className="w-3 h-3" /> Text
                    </span>
                  )}
                  {quickViewNotice.type === "TABLE" && (
                    <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-[10px] uppercase font-extrabold">
                      <FileSpreadsheet className="w-3 h-3" /> Table
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-[10px] rounded-md font-extrabold uppercase ${getStatusBadge(quickViewNotice).cls}`}>
                    {getStatusBadge(quickViewNotice).label}
                  </span>
                </div>
                <h3 className="text-slate-800 font-extrabold text-base leading-snug">
                  {quickViewNotice.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold flex-wrap">
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                    {quickViewNotice.category.replace("_", " ")}
                  </span>
                  {quickViewNotice.year && <span>Year: {quickViewNotice.year}</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Pub: {formatPublishDate(quickViewNotice)}
                  </span>
                  {quickViewNotice.lotteryDate && (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold uppercase text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Lottery: {(() => {
                        const d = new Date(quickViewNotice.lotteryDate);
                        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
                      })()}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickViewNotice(null);
                  setIsSelectingWinners(false);
                  setTempTableData(null);
                }}
                className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 rounded-xl flex items-center justify-center transition border-0 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 min-h-0">
              {isSelectingWinners && tempTableData ? (
                <div className="space-y-6">
                  <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-100 p-3.5 rounded-xl leading-relaxed">
                    🏆 বিজয়ী নির্বাচন করুন: নিচে টেবিলের <strong>WINNER LIST NAME</strong> কলামের ইনপুট বক্সে বিজয়ী ঠিকাদারের নাম টাইপ করুন। একাধিক বিজয়ী সিলেক্ট করতে পারেন। সেভ করলে ক্যাটাগরি স্বয়ংক্রিয়ভাবে Lottery Result এ আপডেট হবে।
                  </p>
                  
                  {tempTableData.tables.map((table: any, tIdx: number) => {
                    const headerBg = table.headerBgColor || "#ccffff";
                    const headers = table.headers || [];
                    const rows = table.rows || [];
                    const winnerColIdx = headers.findIndex((h: string) =>
                      h.toUpperCase().replace(/\./g, "").includes("WINNER")
                    );

                    return (
                      <div key={tIdx} className="space-y-2">
                        {table.officeName && (
                          <p className="text-xs font-bold text-slate-700 text-center">{table.officeName}</p>
                        )}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr style={{ backgroundColor: headerBg }} className="text-slate-800">
                                {headers.map((h: string, i: number) => (
                                  <th 
                                    key={i} 
                                    style={{ backgroundColor: headerBg }}
                                    className="px-3 py-2 text-left font-bold border border-slate-200 text-[10px] uppercase tracking-wide !text-slate-800 whitespace-nowrap"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row: string[], rIdx: number) => {
                                const isWinnerRow = winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
                                return (
                                  <tr 
                                    key={rIdx} 
                                    className={isWinnerRow ? "bg-[#fffbeb] font-bold border-l-4 border-l-amber-500" : rIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                  >
                                    {row.map((cell: string, cIdx: number) => {
                                      const isWinnerCell = cIdx === winnerColIdx;
                                      return (
                                        <td 
                                          key={cIdx} 
                                          className="px-3 py-2 border border-slate-200 text-slate-800"
                                        >
                                          {isWinnerCell ? (
                                            <div className="flex items-center gap-1.5 min-w-[180px]">
                                              <span className="text-base select-none">🏆</span>
                                              <input
                                                type="text"
                                                value={cell}
                                                placeholder="Type Winner..."
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  const nextTables = tempTableData.tables.map((t: any, tI: number) => {
                                                    if (tI !== tIdx) return t;
                                                    const nextRows = t.rows.map((r: any, rI: number) => {
                                                      if (rI !== rIdx) return r;
                                                      const nextRow = [...r];
                                                      nextRow[cIdx] = val;
                                                      return nextRow;
                                                    });
                                                    return { ...t, rows: nextRows };
                                                  });
                                                  setTempTableData({ ...tempTableData, tables: nextTables });
                                                }}
                                                className="border border-slate-300 focus:border-amber-500 outline-none rounded-lg px-2.5 py-1 text-xs font-bold text-amber-800 bg-[#fffbeb] w-full"
                                              />
                                            </div>
                                          ) : (
                                            formatCellValue(cell, headers[cIdx] || "")
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                renderPreviewContent(quickViewNotice)
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-3 shrink-0 bg-slate-50/60">
              {isSelectingWinners ? (
                <>
                  <span className="text-xs font-semibold text-amber-600 animate-pulse flex items-center gap-1.5">
                    ⚙ Winner Select Draw Mode Active...
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSelectingWinners(false);
                        setTempTableData(null);
                      }}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitWinnersLoading}
                      onClick={handleSaveWinners}
                      className="bg-emerald-600 hover:bg-emerald-700 !text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0 flex items-center gap-1.5"
                    >
                      {submitWinnersLoading ? "Saving..." : "Save Winners & Publish"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href={`/egp-notice/${quickViewNotice.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold !text-secondary bg-slate-500 hover:bg-slate-600 px-3 py-2 rounded-lg transition active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Public Page
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewNotice(null);
                        setIsSelectingWinners(false);
                        setTempTableData(null);
                      }}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0"
                    >
                      Close
                    </button>
                    
                    {quickViewNotice.type === "TABLE" && (
                      <button
                        type="button"
                        onClick={() => initWinnersMode(quickViewNotice)}
                        className="bg-amber-500 hover:bg-amber-600 !text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 flex items-center gap-1.5 border-0 cursor-pointer"
                      >
                        🏆 Manage Winners
                      </button>
                    )}

                    <Link
                      href={`/admin/egp-notices/edit/${quickViewNotice.id}`}
                      className="bg-blue-600 hover:bg-blue-700 !text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 inline-flex items-center gap-1.5 border-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Off-screen PDF Capture Area */}
      {quickViewNotice && tempTableData && (
        <div
          id="pdf-render-capture"
          className="bg-white text-black p-10 space-y-6"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "1250px",
            color: "#000000",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Force strict light mode rendering inside PDF capture element */}
          <style dangerouslySetInnerHTML={{ __html: `
            #pdf-render-capture,
            #pdf-render-capture * {
              color: #000000 !important;
              border-color: #cbd5e1 !important;
            }
            #pdf-render-capture table {
              background-color: #ffffff !important;
              width: 100% !important;
            }
            #pdf-render-capture th {
              color: #000000 !important;
            }
            #pdf-render-capture td {
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            #pdf-render-capture tr.bg-\\[\\#fffbeb\\] {
              background-color: #fffbeb !important;
            }
            #pdf-render-capture tr.bg-slate-50 {
              background-color: #f8fafc !important;
            }
          `}} />
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-[#1b4332] space-y-1">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {quickViewNotice.title}
            </h1>
            <p className="text-sm font-bold text-slate-700">
              Lottery Winner Result Publication
            </p>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-2 px-2">
              <span>Category: {quickViewNotice.category.replace("_", " ")}</span>
              {quickViewNotice.year && <span>Year: {quickViewNotice.year}</span>}
              <span>Publish Date: {formatPublishDate(quickViewNotice)}</span>
            </div>
          </div>

          {/* Tables */}
          {tempTableData.tables.map((table: any, tIdx: number) => {
            const headerBg = table.headerBgColor || "#ccffff";
            const headers = table.headers || [];
            const rows = table.rows || [];
            const winnerColIdx = headers.findIndex((h: string) =>
              h.toUpperCase().replace(/\./g, "").includes("WINNER")
            );

            return (
              <div key={tIdx} className="space-y-2.5">
                {table.officeName && (
                  <p className="text-sm font-bold text-slate-800 text-center">{table.officeName}</p>
                )}
                {table.subTitle && (
                  <p className="text-xs font-semibold text-slate-600 text-center -mt-1">{table.subTitle}</p>
                )}
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr style={{ backgroundColor: headerBg }} className="text-slate-800 border-b border-slate-300">
                        {headers.map((h: string, i: number) => (
                          <th 
                            key={i} 
                            style={{ backgroundColor: headerBg }}
                            className="px-3 py-2 text-left font-bold border-r border-slate-300 text-[10px] uppercase tracking-wide !text-slate-800"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: string[], rIdx: number) => {
                        const isWinnerRow = winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
                        return (
                          <tr 
                            key={rIdx} 
                            className={isWinnerRow ? "bg-[#fffbeb] font-bold" : rIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                          >
                            {row.map((cell: string, cIdx: number) => {
                              const isWinnerCell = cIdx === winnerColIdx;
                              return (
                                <td 
                                  key={cIdx} 
                                  className="px-3 py-2 border-r border-b border-slate-300 text-slate-800 text-[11px]"
                                >
                                  {isWinnerCell && isWinnerRow && <span className="inline-block mr-1">🏆</span>}
                                  {formatCellValue(cell, headers[cIdx] || "")}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
            Generated by BTC Web Portal. Verify results at /egp-notice/{quickViewNotice.id}
          </div>
        </div>
      )}

    </>
  );
}
