"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Loader2 } from "lucide-react";
import { uploadNoticePdf } from "@/app/actions/notices";

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  year?: string | null;
  type: string;
  content?: string | null;
  publishDate?: Date | string | null;
  lastDate?: Date | string | null;
  tableData?: string | null;
  filePath?: string | null;
}

const toBengaliDigits = (numStr: string | number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const formatBengaliDate = (dateVal: any) => {
  if (!dateVal) return "";
  if (typeof dateVal === "string" && /[০-৯]/.test(dateVal)) return dateVal;
  try {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return toBengaliDigits(dateVal.toString());
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${toBengaliDigits(day)}/${toBengaliDigits(month)}/${toBengaliDigits(year)}ইং`;
  } catch (e) {
    return toBengaliDigits(dateVal.toString());
  }
};

const isCurrencyColumn = (hdr: string) => {
  if (!hdr) return false;
  const lower = hdr.toLowerCase();
  return (
    lower.includes("cost") || lower.includes("tk") || lower.includes("taka") ||
    lower.includes("security") || lower.includes("fees") || lower.includes("fee") ||
    lower.includes("price") || lower.includes("amount") || lower.includes("turn over") ||
    lower.includes("turnover") || lower.includes("similar work") || lower.includes("similar") ||
    lower.includes("credit") || lower.includes("টাকা")
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
        if (!isNaN(parsedInt)) return `${parsedInt.toLocaleString("en-IN")}.${decimalPart}`;
      }
      return num.toLocaleString("en-IN");
    }
  }
  return str;
};

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

const parseTables = (tableData: string): any[] => {
  try {
    const parsed = JSON.parse(tableData);
    if (parsed.version === "v2" && Array.isArray(parsed.tables)) return parsed.tables;
    if (parsed.isPwdTemplate) {
      return [{
        officeName: parsed.officeName || "",
        headers: parsed.headers || ["Tender ID", "Description", "Location", "AppCost (Tk)", "Solvency (Tk)", "Security (Tk)", "Doc Fees (Tk)", "Last Date & Time"],
        rows: parsed.rows || [],
      }];
    }
    if (parsed.headers && parsed.rows) return [{ headers: parsed.headers, rows: parsed.rows }];
  } catch (e) {}
  return [];
};

const parseTableMeta = (notice: NoticeItem) => {
  let officeName = "";
  let groupCount = 1;
  let lastDate: any = notice.lastDate;
  if (notice.tableData) {
    try {
      const parsed = JSON.parse(notice.tableData);
      let tables: any[] = [];
      if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
        tables = parsed.tables;
      } else if (parsed.isPwdTemplate) {
        tables = [{ officeName: parsed.officeName || "", rows: parsed.rows || [], lastDateBlock: parsed.lastDateBlock || "" }];
      } else if (parsed.headers && parsed.rows) {
        tables = [{ rows: parsed.rows || [] }];
      }
      if (tables.length > 0) {
        officeName = tables[0].officeName || "";
        groupCount = tables.reduce((acc: number, t: any) => acc + (t.rows?.length || 0), 0) || 1;
        if (tables[0].lastDateBlock) lastDate = tables[0].lastDateBlock;
      }
    } catch (_) {}
  }
  return { officeName, groupCount, lastDate };
};

const buildWhatsAppMessage = (notice: NoticeItem, pdfPublicUrl: string | null) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { officeName, groupCount, lastDate } = parseTableMeta(notice);
  const normalizeStr = (s: string) => s ? s.replace(/\s+/g, "").trim().toLowerCase() : "";
  const lines: string[] = [];
  lines.push(`টেন্ডার নোটিশ । ${toBengaliDigits(groupCount)} গ্রুপ`);
  if (officeName) lines.push(officeName);
  if (notice.title && normalizeStr(notice.title) !== normalizeStr(officeName)) lines.push(notice.title);
  if (lastDate) lines.push(`শেষ তারিখ: ${formatBengaliDate(lastDate)}`);
  lines.push(`${origin}/egp-notice/${notice.id}`);
  if (pdfPublicUrl) {
    lines.push(`\n📄 সংযুক্ত ফাইল ডাউনলোড লিঙ্ক:\n${pdfPublicUrl}`);
  }
  return lines.join("\n");
};

export default function WhatsAppShareButton({ notice }: { notice: NoticeItem }) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    const origin = window.location.origin;

    // Open blank window SYNCHRONOUSLY to avoid popup blocker
    const waWindow = window.open("", "_blank");
    if (waWindow) {
      waWindow.document.write(`
        <html><body style="font-family:sans-serif;text-align:center;padding-top:20%;color:#555;">
          <p style="font-size:18px;">📄 PDF তৈরি হচ্ছে...</p>
          <p style="font-size:13px;color:#888;">একটু অপেক্ষা করুন, WhatsApp খুলছে।</p>
        </body></html>
      `);
    }

    let pdfPublicUrl: string | null = null;

    // --- Generate PDF from hidden DOM element ---
    try {
      const element = document.getElementById(`pdf-capture-${notice.id}`);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 800,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const pdf = new jsPDF("p", "mm", "a4");
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

        const pdfBlob = pdf.output("blob");

        // Upload to server → get a real, permanent public URL
        const reader = new FileReader();
        const base64Str = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(pdfBlob);
        });

        const uploadRes = await uploadNoticePdf(notice.id, base64Str);
        if (uploadRes.success && uploadRes.filePath) {
          pdfPublicUrl = `${origin}${uploadRes.filePath}`;

          // ✅ Open the server URL in a NEW tab — browser will show PDF download/preview
          // This is 100% reliable since it's a real file URL, not a blob URL
          window.open(pdfPublicUrl, "_blank");
        }
      }
    } catch (err) {
      console.warn("PDF generation failed, sharing text only:", err);
    }

    // --- Build WhatsApp message with PDF link ---
    const finalMessage = buildWhatsAppMessage(notice, pdfPublicUrl);
    const encodedMsg = encodeURIComponent(finalMessage);
    const waUrl = `https://wa.me/?text=${encodedMsg}`;

    // Redirect the waiting WhatsApp tab
    if (waWindow) {
      waWindow.location.href = waUrl;
    } else {
      window.open(waUrl, "_blank");
    }

    setLoading(false);
  };

  const parsedTables = notice.tableData ? parseTables(notice.tableData) : [];

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleShareClick}
        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition inline-flex items-center justify-center border-0 active:scale-95 shadow-sm cursor-pointer disabled:opacity-75"
        title="Share to WhatsApp"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.447 4.908 1.448 5.41-.001 9.812-4.417 9.815-9.83.002-2.623-1.01-5.086-2.854-6.93C16.671 1.997 14.213 1.002 11.6 1.002c-5.418 0-9.825 4.414-9.828 9.828-.001 1.706.46 3.376 1.34 4.872l-.99 3.619 3.716-.975c1.472.805 2.923 1.157 4.219 1.157zm11.233-6.993c-.3-.15-1.776-.876-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.892-.796-1.494-1.78-1.669-2.08-.175-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.007-.565-.007-.196 0-.518.074-.789.37-.272.295-1.037 1.012-1.037 2.47 0 1.456 1.06 2.868 1.208 3.067.147.2 2.087 3.186 5.055 4.47.705.305 1.256.488 1.685.625.708.226 1.35.194 1.858.118.567-.085 1.776-.726 2.025-1.428.25-.701.25-1.302.175-1.428-.075-.125-.275-.2-.575-.35z" />
          </svg>
        )}
      </button>

      {/* Hidden off-screen render target — via Portal to avoid table cell constraints */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div
          id={`pdf-capture-${notice.id}`}
          style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "750px", backgroundColor: "#fff", color: "#000", padding: "40px" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", paddingBottom: "16px", borderBottom: "2px solid #1b4332", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", margin: "0 0 4px" }}>{notice.title}</h1>
            <p style={{ fontSize: "11px", fontWeight: "bold", color: "#334155", margin: "0 0 8px" }}>Tender Procurement Notice</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
              <span>Category: {notice.category.replace("_", " ")}</span>
              {notice.year && <span>Year: {notice.year}</span>}
              <span>Date: {notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : ""}</span>
            </div>
          </div>

          {/* TEXT */}
          {notice.type === "TEXT" && notice.content && (
            <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }} dangerouslySetInnerHTML={{ __html: notice.content }} />
          )}

          {/* TABLE */}
          {notice.type === "TABLE" && parsedTables.length > 0 && (
            <div>
              {parsedTables.map((table: any, tIdx: number) => {
                const defaultHeaderBg = notice.category === "OTM" ? "#059669" : "#0891b2";
                const headerBg = table.headerBgColor || defaultHeaderBg;
                const headers = table.headers || [];
                const rows = table.rows || [];
                const winnerColIdx = headers.findIndex((h: string) => h.toUpperCase().replace(/\./g, "").includes("WINNER"));
                const hasSl = headers.some((h: string) => {
                  const norm = (h || "").toLowerCase().replace(/\./g, "").trim();
                  return norm === "slno" || norm === "sl";
                });
                return (
                  <div key={tIdx} style={{ marginBottom: "24px" }}>
                    {table.officeName && <p style={{ fontWeight: "bold", textAlign: "center", fontSize: "11px", marginBottom: "8px" }}>{table.officeName}</p>}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                      <thead>
                        <tr style={{ backgroundColor: headerBg }}>
                          {!hasSl && (
                            <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: "bold", border: "1px solid #cbd5e1", backgroundColor: headerBg, color: getHeaderTextColorHex(headerBg), fontSize: "9px" }}>
                              SL No
                            </th>
                          )}
                          {headers.map((h: string, i: number) => (
                            <th key={i} style={{ padding: "6px 8px", textAlign: "left", fontWeight: "bold", border: "1px solid #cbd5e1", backgroundColor: headerBg, color: getHeaderTextColorHex(headerBg), fontSize: "9px" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row: string[], rIdx: number) => {
                          const isWinner = winnerColIdx !== -1 && row[winnerColIdx]?.trim();
                          return (
                            <tr key={rIdx} style={{ backgroundColor: isWinner ? "#fffbeb" : rIdx % 2 === 0 ? "#fff" : "#f8fafc" }}>
                              {!hasSl && (
                                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0", color: "#1e293b", fontWeight: "bold" }}>
                                  {rIdx + 1}
                                </td>
                              )}
                              {row.map((cell: string, cIdx: number) => (
                                <td key={cIdx} style={{ padding: "5px 8px", border: "1px solid #e2e8f0", color: "#1e293b" }}>
                                  {cIdx === winnerColIdx && isWinner && "🏆 "}
                                  {formatCellValue(cell, headers[cIdx] || "")}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* FILE (image) */}
          {notice.type === "FILE" && notice.filePath && !notice.filePath.toLowerCase().endsWith(".pdf") && (
            <div style={{ textAlign: "center" }}>
              <img src={notice.filePath} alt={notice.title} style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain" }} />
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "9px", color: "#94a3b8" }}>
            Generated by BTC Web Portal · /egp-notice/{notice.id}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
