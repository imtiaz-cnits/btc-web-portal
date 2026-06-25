"use client";

import React, { useRef } from "react";
import Link from "next/link";

interface Notice {
  id: string;
  no?: string;
  title: string;
  publishDate?: string;
  date: string;
  lotteryDate?: string;
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
    const cleanVal = str.replace(/,/g, "").trim();
    const num = parseFloat(cleanVal);
    if (!isNaN(num) && /^\d+(\.\d+)?$/.test(cleanVal)) {
      if (cleanVal.includes(".")) {
        const [integerPart, decimalPart] = cleanVal.split(".");
        const parsedInt = parseFloat(integerPart);
        if (!isNaN(parsedInt)) {
          return `${parsedInt.toLocaleString("en-IN")}.${decimalPart}`;
        }
      }
      return num.toLocaleString("en-IN");
    }
  }
  return str;
};

// Renders the table data into a printable-friendly HTML table
function TablePdfPreview({ tableData, title, category }: { tableData: string; title: string; category?: string }) {
  try {
    const parsed = JSON.parse(tableData);
    let tables: any[] = [];

    if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
      tables = parsed.tables;
    } else if (parsed.headers && parsed.rows) {
      tables = [{ headers: parsed.headers, rows: parsed.rows, columnColors: parsed.columnColors || [] }];
    } else if (parsed.isPwdTemplate) {
      tables = [{ ...parsed, headers: parsed.headers || [], rows: parsed.rows || [] }];
    }

    const getHeaderTextColor = (bgColor: string) => {
      if (!bgColor) return "text-white";
      const lower = bgColor.toLowerCase().trim();
      const lightColors = ["#ffffff", "#fff", "#22d3ee", "#34d399", "#4ade80", "#fef08a", "#a7f3d0", "#bae6fd", "#fecdd3", "#ccffff"];
      return lightColors.includes(lower) ? "text-slate-800" : "text-white";
    };

    const getHeaderTextColorHex = (bgColor: string) => {
      const cls = getHeaderTextColor(bgColor);
      return cls === "text-white" ? "#ffffff" : "#1e293b";
    };

    const defaultHeaderBg = category === "OTM" ? "#059669" : "#0891b2";

    return (
      <div className="space-y-6">
        <div className="text-center pb-4 border-b-2 border-[#1b4332] space-y-1">
          <h1 className="text-xl font-black text-slate-900 leading-tight">{title}</h1>
          <p className="text-sm font-bold text-slate-700">Lottery Winner Result Publication</p>
        </div>
        {tables.map((table: any, tIdx: number) => {
          const headerBg = table.headerBgColor || defaultHeaderBg;
          const headers = table.headers || [];
          const rows = table.rows || [];
          const winnerColIdx = headers.findIndex((h: string) =>
            h.toUpperCase().replace(/\./g, "").includes("WINNER")
          );
          const hasSl = headers.some((h: string) => {
            const norm = (h || "").toLowerCase().replace(/\./g, "").trim();
            return norm === "slno" || norm === "sl";
          });
          return (
            <div key={tIdx} className="space-y-2">
              {table.officeName && (
                <p className="text-xs font-bold text-slate-700 text-center">{table.officeName}</p>
              )}
              <div className="overflow-x-auto rounded border border-slate-200">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: headerBg }} className={getHeaderTextColor(headerBg)}>
                      {!hasSl && (
                        <th
                          style={{ backgroundColor: headerBg, color: getHeaderTextColorHex(headerBg) }}
                          className="px-3 py-2 text-left font-bold border border-slate-200 text-[10px] uppercase tracking-wide whitespace-nowrap"
                        >
                          SL No
                        </th>
                      )}
                      {headers.map((h: string, i: number) => (
                        <th
                          key={i}
                          style={{ backgroundColor: headerBg, color: getHeaderTextColorHex(headerBg) }}
                          className="px-3 py-2 text-left font-bold border border-slate-200 text-[10px] uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row: string[], rIdx: number) => {
                      const isWinnerRow =
                        winnerColIdx !== -1 && row[winnerColIdx] && row[winnerColIdx].trim() !== "";
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
                          {!hasSl && (
                            <td
                              style={isWinnerRow ? { backgroundColor: "#fffbeb" } : table.columnColors?.[0] ? { backgroundColor: table.columnColors[0] } : undefined}
                              className="px-3 py-2 border border-slate-200 text-slate-800 text-left whitespace-nowrap font-bold"
                            >
                              {rIdx + 1}
                            </td>
                          )}
                          {row.map((cell: string, cIdx: number) => {
                            const isCurrency = isCurrencyColumn(headers[cIdx] || "");
                            const isWinnerCell = cIdx === winnerColIdx;
                            const cellBg = isWinnerRow ? "#fffbeb" : table.columnColors?.[cIdx];
                            return (
                              <td
                                key={cIdx}
                                style={cellBg ? { backgroundColor: cellBg } : undefined}
                                className={`px-3 py-2 border border-slate-200 text-slate-800 ${
                                  isCurrency ? "text-right" : "text-left"
                                } whitespace-nowrap`}
                              >
                                {isWinnerCell && isWinnerRow && (
                                  <span className="inline-block mr-1">🏆</span>
                                )}
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
      </div>
    );
  } catch {
    return null;
  }
}

// -----------------------------------------------
// Download button for table-based lottery result notices
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

      const canvas = await (html2canvas as any)(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new (jsPDF as any)("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
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
          width: "1100px",
          color: "#000000",
          backgroundColor: "#ffffff",
          zIndex: -1,
        }}
      >
        <div ref={captureRef} className="bg-white text-black p-10 space-y-6">
          <style dangerouslySetInnerHTML={{ __html: `
            .pdf-cap, .pdf-cap * { color: #000000 !important; border-color: #cbd5e1 !important; }
            .pdf-cap table { background-color: #ffffff !important; width: 100% !important; }
            .pdf-cap th { color: #ffffff !important; }
            .pdf-cap td { background-color: #ffffff !important; color: #000000 !important; }
          ` }} />
          <div className="pdf-cap">
            <TablePdfPreview tableData={notice.tableData!} title={notice.title} category={notice.category} />
          </div>
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
          <i className="fa-solid fa-spinner fa-spin"></i>
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
    if (notice.category === "Lottery Result" && notice.tableData) return true;
    return false;
  };

  const desktopDownloadBtn = (notice: Notice) => {
    const cls = "bg-text-1 !text-secondary px-3.5 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-primary transition shadow-sm flex items-center gap-2 cursor-pointer";
    if (notice.fileUrl) {
      return (
        <a href={notice.fileUrl} download className={cls}>
          <i className="fa-solid fa-download"></i>
        </a>
      );
    }
    if (notice.category === "Lottery Result" && notice.tableData) {
      return <TableDownloadButton notice={notice} className={cls} />;
    }
    return null;
  };

  const mobileDownloadBtn = (notice: Notice) => {
    const cls = "bg-text-1 !text-secondary hover:!text-black hover:bg-primary p-3 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center aspect-square shadow-sm active:scale-95 transition-all cursor-pointer";
    if (notice.fileUrl) {
      return (
        <a href={notice.fileUrl} download className={cls}>
          <i className="fa-solid fa-download"></i>
        </a>
      );
    }
    if (notice.category === "Lottery Result" && notice.tableData) {
      return <TableDownloadButton notice={notice} className={cls} />;
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-ac-2 shadow-sm bg-white overflow-hidden">
      {/* Desktop View: Standard Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-shade-1 border-b border-ac-2">
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-16">
                #
              </th>
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm">
                Procuring Entity / Title
              </th>
              {showPublishDate && (
                <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                  Publish Date
                </th>
              )}
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                Last Date
              </th>
              {isLotteryResult && (
                <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-40 text-center">
                  Lottery Date
                </th>
              )}
              <th className="py-3 px-4 font-bold text-text-1 uppercase text-sm w-48 text-center">
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
                  <td className="py-2.5 px-4 text-text-2 font-medium">{index + 1}</td>
                  <td className="py-2.5 px-4">
                    <h4 className="text-text-1 font-semibold leading-tight font-bangla text-base lg:text-lg">
                      {notice.title}
                    </h4>
                  </td>
                  {showPublishDate && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-sm font-bold">
                        {notice.publishDate || "N/A"}
                      </div>
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-text-2 text-sm font-bold">
                      {notice.date}
                    </div>
                  </td>
                  {isLotteryResult && (
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-block bg-shade-1 px-3 py-1 rounded-full border border-primary/20 text-emerald-600 text-sm font-bold bg-green-50/50">
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

              <h4 className="text-text-1 font-bold leading-snug font-bangla text-base mb-5">
                {notice.title}
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
