"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { NoticeCategory, CategoryNoticeImportData } from "@/lib/categoryExcelImport/types";
import { parseCategoryNoticeWorkbook } from "@/lib/categoryExcelImport/parser";
import { CATEGORY_TEMPLATE_CONFIGS, generateCategoryWorkbookBuffer } from "@/lib/categoryExcelImport/templateGenerator";

interface CategoryExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory: string;
  onApply: (importData: CategoryNoticeImportData) => void;
}

export default function CategoryExcelImportModal({
  isOpen,
  onClose,
  initialCategory,
  onApply,
}: CategoryExcelImportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory>("OTM");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CategoryNoticeImportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial category from form (strictly OTM or LTM)
  useEffect(() => {
    if (isOpen) {
      const norm = (initialCategory || "OTM").toUpperCase();
      if (norm === "LTM") setSelectedCategory("LTM");
      else setSelectedCategory("OTM");

      setFileName("");
      setFileSize("");
      setParseResult(null);
      setIsProcessing(false);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const currentConfig = CATEGORY_TEMPLATE_CONFIGS[selectedCategory] || CATEGORY_TEMPLATE_CONFIGS.OTM;

  // Direct client-side template download
  const handleDownloadTemplate = () => {
    try {
      const buffer = generateCategoryWorkbookBuffer(selectedCategory, true);
      const blob = new Blob([buffer as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentConfig.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Template download error:", e);
      // Fallback to static public link
      window.open(`/templates/category-import/${currentConfig.fileName}`, "_blank");
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseCategoryNoticeWorkbook(buffer, selectedCategory, file.name);
      setParseResult(result);
    } catch (err: any) {
      console.error("Failed to parse file:", err);
      setParseResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyClick = () => {
    if (parseResult && parseResult.validation.isValid) {
      onApply(parseResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-slate-800 font-extrabold text-base leading-tight flex items-center gap-2">
                <span>Category-Based Excel Notice Entry</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  2-Sheet System
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Download category template, fill Tender Data & Footer Details, and apply directly to the Notice Form.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 rounded-xl flex items-center justify-center transition border-0 cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1 & 2: Select Category & Download Official Template */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  1. Target Notice Category:
                </label>
                <p className="text-[11px] text-slate-400">
                  Select the procurement category for your notice template.
                </p>
              </div>

              {/* Template Download Button */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition inline-flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer border-0"
                title={`Download ${currentConfig.fileName}`}
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download {selectedCategory} Template (.xlsx)</span>
              </button>
            </div>

            {/* Category Cards (Strictly OTM & LTM) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {(["OTM", "LTM"] as NoticeCategory[]).map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setParseResult(null);
                      setFileName("");
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                    }`}
                  >
                    <span className="font-extrabold text-sm">{cat}</span>
                    <span
                      className={`text-[11px] mt-1 font-semibold ${
                        isSelected ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {cat === "OTM" ? "12 Columns" : "10 Columns"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Upload Filled Excel Workbook */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              2. Upload Completed {selectedCategory} Workbook:
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/60"
                  : fileName
                  ? "border-emerald-300 bg-emerald-50/20"
                  : "border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {isProcessing ? (
                <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Parsing and validating workbook...</span>
                </div>
              ) : fileName ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">{fileName}</p>
                    <p className="text-[11px] text-slate-400">{fileSize} • Click or drag to replace file</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    Click to browse or drag and drop your completed workbook
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports Microsoft Excel files (.xlsx, .xls) up to 10 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Validation Status & Previews */}
          {parseResult && (
            <div className="space-y-4">
              {/* Validation Banner */}
              {parseResult.validation.isValid ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Workbook Validated Successfully!
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Category matches <strong>{selectedCategory}</strong> with {parseResult.tenderData.totalRows} tender row(s).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Validation Failed ({parseResult.validation.errors.length} issue(s) found):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-red-700 font-medium">
                    {parseResult.validation.errors.map((err, idx) => (
                      <li key={idx}>
                        <span className="font-bold uppercase text-[10px]">[{err.section}]:</span> {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings if any */}
              {parseResult.validation.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <p className="font-bold">Notice Notes:</p>
                  <ul className="list-disc list-inside text-[11px] text-amber-700">
                    {parseResult.validation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complete Section Previews */}
              {parseResult.validation.isValid && (
                <div className="space-y-4">
                  {/* Notice Details Preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        Notice Details Preview
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {parseResult.noticeDetails.category}
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Title:</span>
                        <span className="font-bold text-slate-800 font-bangla">{parseResult.noticeDetails.title || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Sub-title:</span>
                        <span className="font-medium text-slate-700">{parseResult.noticeDetails.subTitle || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Year & Publish Date:</span>
                        <span className="font-bold text-slate-800">
                          {parseResult.noticeDetails.year} • Pub: {parseResult.noticeDetails.publishDate || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Last Submission Date:</span>
                        <span className="font-bold text-slate-800">
                          Last: {parseResult.noticeDetails.lastDate || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tender Data Preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        Tender Data Preview ({parseResult.tenderData.totalRows} row(s))
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {parseResult.tenderData.headers.length} Columns
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-[220px]">
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            {parseResult.tenderData.headers.map((h, i) => (
                              <th
                                key={i}
                                className={`px-2.5 py-2 font-bold whitespace-nowrap text-left border-r border-slate-200 ${
                                  h === "#" ? "bg-slate-100 text-center w-10" : ""
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parseResult.tenderData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-2.5 py-1.5 border-r border-slate-100 whitespace-nowrap text-slate-700 ${
                                    parseResult.tenderData.headers[cIdx] === "#"
                                      ? "font-extrabold text-slate-400 bg-slate-50/50 text-center"
                                      : ""
                                  }`}
                                >
                                  {cell || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer Details Preview */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-700">
                        Footer Details Preview
                      </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pay Order To:</span>
                        <span className="font-medium text-slate-800">{parseResult.footerDetails.payOrderTo || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Contact / Notice Details:</span>
                        <span className="font-medium text-slate-700 whitespace-pre-line line-clamp-3">
                          {parseResult.footerDetails.moreInfo || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <p className="text-[11px] text-slate-400">
            Applying fills the Notice Form state. You can review and save to database using the existing Save button.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer border-0 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parseResult || !parseResult.validation.isValid}
              onClick={handleApplyClick}
              className={`font-bold px-5 py-2 rounded-xl text-xs transition inline-flex items-center gap-2 shadow-sm border-0 ${
                parseResult && parseResult.validation.isValid
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply to Notice Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
