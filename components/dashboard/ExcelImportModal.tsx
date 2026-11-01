"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ClipboardPaste,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  parseWorkbookBuffer,
  parseClipboardText,
  ParsedSheetData,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/tableEngine/excelParser";
import {
  mapColumns,
  ColumnMappingItem,
  MappingResult,
} from "@/lib/tableEngine/columnMapper";
import {
  validateAndMapRows,
  ValidationResult,
} from "@/lib/tableEngine/dataValidator";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationHeaders: string[];
  category: string;
  defaultLocation?: string;
  defaultLastDate?: string;
  initialClipboardData?: ParsedSheetData | null;
  onConfirmImport: (rows: string[][], mode: "append" | "replace") => void;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  destinationHeaders,
  category,
  defaultLocation = "",
  defaultLastDate = "",
  initialClipboardData = null,
  onConfirmImport,
}: ExcelImportModalProps) {
  // Step: 1 = upload/paste, 2 = map columns & preview
  const [step, setStep] = useState<1 | 2>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Sheet data
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheetName, setSelectedSheetName] = useState<string>("");
  const [sheetsData, setSheetsData] = useState<Record<string, ParsedSheetData>>({});
  const [currentSheet, setCurrentSheet] = useState<ParsedSheetData | null>(null);

  // Column Mappings
  const [mappings, setMappings] = useState<ColumnMappingItem[]>([]);
  const [unmappedSources, setUnmappedSources] = useState<string[]>([]);

  // Validation Result
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Import Mode
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [confirmReplace, setConfirmReplace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from clipboard data if provided
  useEffect(() => {
    if (isOpen && initialClipboardData && initialClipboardData.rawRows.length > 0) {
      setFileName("Clipboard Data");
      setFileSize(`${initialClipboardData.rawRows.length} rows`);
      setSheetNames(["Clipboard"]);
      setSelectedSheetName("Clipboard");
      setSheetsData({ Clipboard: initialClipboardData });
      setCurrentSheet(initialClipboardData);

      // Auto map
      const mappingRes = mapColumns(destinationHeaders, initialClipboardData.headers);
      setMappings(mappingRes.mappings);
      setUnmappedSources(mappingRes.unmappedSourceHeaders);
      setStep(2);
    } else if (isOpen) {
      // Reset state on open
      setStep(1);
      setFileName("");
      setFileSize("");
      setErrorMessage("");
      setSheetNames([]);
      setSelectedSheetName("");
      setSheetsData({});
      setCurrentSheet(null);
      setMappings([]);
      setUnmappedSources([]);
      setValidationResult(null);
      setImportMode("append");
      setConfirmReplace(false);
    }
  }, [isOpen, initialClipboardData, destinationHeaders]);

  // Handle Sheet selection change
  const handleSheetChange = (sheetName: string) => {
    setSelectedSheetName(sheetName);
    const sheet = sheetsData[sheetName];
    if (sheet) {
      setCurrentSheet(sheet);
      const mappingRes = mapColumns(destinationHeaders, sheet.headers);
      setMappings(mappingRes.mappings);
      setUnmappedSources(mappingRes.unmappedSourceHeaders);
    }
  };

  // Re-run validation whenever mappings or currentSheet changes
  useEffect(() => {
    if (!currentSheet || mappings.length === 0) {
      setValidationResult(null);
      return;
    }

    const res = validateAndMapRows(
      currentSheet.rawRows,
      currentSheet.headers,
      mappings,
      category,
      {
        workLocation: defaultLocation,
        lastDate: defaultLastDate,
      },
    );
    setValidationResult(res);
  }, [mappings, currentSheet, category, defaultLocation, defaultLastDate]);

  // Process File Upload
  const processFile = async (file: File) => {
    setErrorMessage("");
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMessage("Unsupported file format. Please upload .xlsx, .xls, or .csv files.");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const result = parseWorkbookBuffer(buffer, file.name);

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      if (result.sheetNames.length === 0) {
        setErrorMessage("The uploaded workbook contains no sheets or readable data.");
        return;
      }

      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      setSheetNames(result.sheetNames);
      setSheetsData(result.sheets);

      const firstSheetName = result.sheetNames[0];
      setSelectedSheetName(firstSheetName);
      const firstSheet = result.sheets[firstSheetName];
      setCurrentSheet(firstSheet);

      // Auto map columns
      const mappingRes = mapColumns(destinationHeaders, firstSheet.headers);
      setMappings(mappingRes.mappings);
      setUnmappedSources(mappingRes.unmappedSourceHeaders);

      setStep(2);
    } catch (err: any) {
      setErrorMessage(`Failed to read file: ${err.message || String(err)}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualMapChange = (destHdr: string, newSourceHdr: string) => {
    setMappings((prev) =>
      prev.map((m) => {
        if (m.destinationHeader === destHdr) {
          return {
            ...m,
            sourceHeader: newSourceHdr === "__IGNORE__" ? null : newSourceHdr,
            isAutoMatched: false,
            confidence: newSourceHdr === "__IGNORE__" ? 0 : 1,
          };
        }
        // If another destination column already had this source column, prevent duplicate assignment
        if (newSourceHdr !== "__IGNORE__" && m.sourceHeader === newSourceHdr) {
          return {
            ...m,
            sourceHeader: null,
            isAutoMatched: false,
            confidence: 0,
          };
        }
        return m;
      }),
    );
  };

  const handleFinalConfirm = () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      setErrorMessage("No valid rows available to import. Please check required column mappings.");
      return;
    }

    if (importMode === "replace" && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }

    onConfirmImport(validationResult.validRows, importMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Excel Tender Data Import
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700/80 text-white rounded-full">
                  Category: {category}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Populate destination table rows directly from Excel or clipboard paste
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600 shrink-0">
          <div className="flex items-center gap-6">
            <span className={`flex items-center gap-1.5 ${step === 1 ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"}`}>1</span>
              Source File & Worksheet
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className={`flex items-center gap-1.5 ${step === 2 ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"}`}>2</span>
              Column Mapping & Live Preview
            </span>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-medium text-slate-700 truncate max-w-[200px]">{fileName}</span>
              <span>({fileSize})</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Drag and Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                    : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50/50"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag and drop your Excel workbook
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Microsoft Excel (<span className="font-semibold text-slate-700">.xlsx</span>,{" "}
                    <span className="font-semibold text-slate-700">.xls</span>) and CSV (
                    <span className="font-semibold text-slate-700">.csv</span>) up to 10 MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Paste Notice Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <ClipboardPaste className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800">Direct Clipboard Copy & Paste</span>
                  <p>
                    You can also select rows in Microsoft Excel or Google Sheets, press{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono text-slate-800">Ctrl + C</kbd>,
                    and press{" "}
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono text-slate-800">Ctrl + V</kbd>{" "}
                    anywhere on the Notice Table page to import instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && currentSheet && (
            <div className="space-y-6">
              {/* Worksheet Selector if multiple */}
              {sheetNames.length > 1 && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <label className="text-xs font-bold text-slate-700">Select Worksheet:</label>
                  <select
                    value={selectedSheetName}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name} ({sheetsData[name]?.totalRows || 0} rows, {sheetsData[name]?.totalCols || 0} cols)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Column Mapping Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Destination Column Mapping
                    <span className="text-[11px] font-normal text-slate-500">
                      ({mappings.filter((m) => m.sourceHeader).length} of {mappings.length} mapped)
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Change Source File
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Destination Table Column</th>
                        <th className="p-2.5">Matched Excel Column</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {mappings.map((mapping) => {
                        const isMapped = mapping.sourceHeader !== null;
                        return (
                          <tr key={mapping.destinationHeader} className="hover:bg-slate-50/60 transition">
                            <td className="p-2.5 font-semibold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span>{mapping.destinationHeader}</span>
                                {mapping.isRequired && (
                                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.2 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={mapping.sourceHeader || "__IGNORE__"}
                                onChange={(e) =>
                                  handleManualMapChange(mapping.destinationHeader, e.target.value)
                                }
                                className={`text-xs px-2.5 py-1 rounded-lg border outline-hidden transition ${
                                  isMapped
                                    ? "border-slate-300 bg-white text-slate-800 focus:border-emerald-500"
                                    : "border-amber-300 bg-amber-50/50 text-amber-800"
                                }`}
                              >
                                <option value="__IGNORE__">(Ignore / Leave Blank)</option>
                                {currentSheet.headers.map((srcHdr) => (
                                  <option key={srcHdr} value={srcHdr}>
                                    {srcHdr}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5 text-center">
                              {isMapped ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" /> Mapped
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <HelpCircle className="w-3 h-3" /> Blank
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Preview Table */}
              {validationResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Live Preview (First {Math.min(validationResult.validRows.length, 10)} Rows)
                      </h3>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {validationResult.validRows.length} Valid
                        </span>
                        {validationResult.invalidCount > 0 && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                            {validationResult.invalidCount} Invalid Skipped
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs max-h-[220px]">
                    <table className="w-full text-left text-xs border-collapse font-bangla whitespace-nowrap">
                      <thead className="bg-slate-800 text-white font-bold sticky top-0">
                        <tr>
                          {destinationHeaders.map((hdr) => (
                            <th key={hdr} className="p-2 border-r border-slate-700">
                              {hdr}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {validationResult.validRows.slice(0, 10).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 transition">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-slate-100 text-slate-800">
                                {cell || <span className="text-slate-300 italic">—</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Mode Selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800">Select Import Operation:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      importMode === "append"
                        ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500"
                        : "border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => {
                        setImportMode("append");
                        setConfirmReplace(false);
                      }}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Append to Table</span>
                      <span className="text-[11px] text-slate-500">
                        Add {validationResult?.validRows.length || 0} rows after existing rows.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      importMode === "replace"
                        ? "border-red-600 bg-red-50/50 ring-1 ring-red-500"
                        : "border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Replace Table Rows</span>
                      <span className="text-[11px] text-slate-500">
                        Remove existing rows and replace with {validationResult?.validRows.length || 0} new rows.
                      </span>
                    </div>
                  </label>
                </div>

                {importMode === "replace" && confirmReplace && (
                  <div className="p-2.5 bg-red-100 border border-red-300 rounded-lg text-xs font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Warning: Existing data rows will be replaced upon confirmation. Proceed?</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition"
          >
            Cancel
          </button>

          {step === 2 && (
            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={!validationResult || validationResult.validRows.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center gap-2 cursor-pointer ${
                importMode === "replace"
                  ? confirmReplace
                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                    : "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              {importMode === "replace"
                ? confirmReplace
                  ? `Confirm Replace (${validationResult?.validRows.length || 0} Rows)`
                  : `Replace with ${validationResult?.validRows.length || 0} Rows`
                : `Import & Append ${validationResult?.validRows.length || 0} Rows`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

