"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNotice, updateNotice } from "@/app/actions/notices";
import { 
  Plus, 
  Trash2, 
  FileUp, 
  Table as TableIcon, 
  FileText as FileTextIcon, 
  ArrowLeft,
  Loader2,
  Calendar,
  Building2,
  AlertCircle,
  Info,
  CreditCard,
  ChevronDown,
  Check,
  ToggleLeft,
  Eye,
  Sliders
} from "lucide-react";

interface NoticeFormProps {
  notice?: any; // If provided, we are in EDIT mode
}

// ----------------------------------------------------
// 1. Sleek Reusable Custom Dropdown Component
// ----------------------------------------------------
function CustomSelect({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  const activeOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <div 
        onClick={() => setOpen(!open)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:border-[var(--primary-color)] hover:border-slate-300 transition cursor-pointer flex justify-between items-center shadow-xs"
      >
        <span>{activeOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 max-h-[250px] overflow-y-auto animate-scale-in">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-3 text-xs font-semibold hover:bg-green-50 hover:text-green-700 transition cursor-pointer flex items-center justify-between ${
                value === opt.value ? "bg-green-50/50 text-green-700 font-bold" : "text-slate-600"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="w-3.5 h-3.5 text-green-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. Main Multi-Table Tender Notice Studio Form Component
// ----------------------------------------------------
export default function NoticeForm({ notice }: NoticeFormProps) {
  const router = useRouter();
  const isEdit = !!notice;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Base Form Fields
  const [title, setTitle] = useState(notice?.title || "");
  const [category, setCategory] = useState(notice?.category || "LTM");
  const [status, setStatus] = useState(notice?.status || "active");
  const [year, setYear] = useState(notice?.year || new Date().getFullYear().toString());
  
  const [publishDate, setPublishDate] = useState(
    notice?.publishDate ? new Date(notice.publishDate).toISOString().split("T")[0] : ""
  );
  const [lastDate, setLastDate] = useState(
    notice?.lastDate ? new Date(notice.lastDate).toISOString().split("T")[0] : ""
  );

  // Combinable Section Switches
  const [enableFile, setEnableFile] = useState(true);
  const [enableText, setEnableText] = useState(false);
  const [enableTables, setEnableTables] = useState(false);

  // Text notice description content
  const [content, setContent] = useState(notice?.content || "");

  // Multiple Tables Array
  const [tablesList, setTablesList] = useState<any[]>([]);

  // ----------------------------------------------------
  // Load CDN Flatpickr for beautiful datepickers
  // ----------------------------------------------------
  useEffect(() => {
    // Dynamic styles
    if (!document.getElementById("flatpickr-css")) {
      const link = document.createElement("link");
      link.id = "flatpickr-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
      document.head.appendChild(link);
    }

    // Dynamic library script
    if (!document.getElementById("flatpickr-js")) {
      const script = document.createElement("script");
      script.id = "flatpickr-js";
      script.src = "https://cdn.jsdelivr.net/npm/flatpickr";
      script.onload = () => initFlatpickr();
      document.head.appendChild(script);
    } else {
      initFlatpickr();
    }

    function initFlatpickr() {
      if ((window as any).flatpickr) {
        (window as any).flatpickr(".flatpickr-date", {
          dateFormat: "Y-m-d",
          allowInput: true,
          onChange: (selectedDates: any, dateStr: string, instance: any) => {
            const fieldName = instance.element.getAttribute("name");
            if (fieldName === "publishDate") {
              setPublishDate(dateStr);
            } else if (fieldName === "lastDate") {
              setLastDate(dateStr);
            }
          }
        });
      }
    }
  }, [enableTables, tablesList]);

  // Table date Flatpickr binding is handled lower in the file after handlers are initialized.

  // Load existing notice specifications if available in edit mode
  useEffect(() => {
    if (isEdit) {
      setEnableFile(!!notice.filePath);
      setEnableText(!!notice.content);
      setEnableTables(!!notice.tableData);

      if (notice.tableData) {
        try {
          const parsed = JSON.parse(notice.tableData);
          if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
            setTablesList(parsed.tables);
          } else {
            // Backward compatibility for old single-table formats
            if (parsed.isPwdTemplate) {
              setTablesList([{
                id: "old-pwd-" + Math.random().toString(),
                type: "pwd_ltm",
                officeName: parsed.officeName || "",
                noticeDateBlock: parsed.noticeDateBlock || "",
                lastDateBlock: parsed.lastDateBlock || "",
                lotteryDateBlock: parsed.lotteryDateBlock || "",
                payOrderTo: parsed.payOrderTo || "",
                moreInfo: parsed.moreInfo || "",
                bottomWarning: parsed.bottomWarning || "",
                rows: parsed.rows || []
              }]);
            } else if (parsed.headers && parsed.rows) {
              setTablesList([{
                id: "old-std-" + Math.random().toString(),
                type: "standard",
                headers: parsed.headers,
                rows: parsed.rows
              }]);
            }
          }
        } catch (err) {
          console.error("Failed to parse tableData", err);
        }
      }
    } else {
      // Set a default empty state for standard tables on add page
      setTablesList([]);
    }
  }, [isEdit, notice]);

  // ----------------------------------------------------
  // Interactive Multi-Table State Modifiers
  // ----------------------------------------------------
  
  // Add new blank table blocks
  const addPwdTableBlock = () => {
    setTablesList([
      ...tablesList,
      {
        id: "tbl-" + Math.random().toString(),
        type: "pwd_ltm",
        officeName: "গণপূর্ত বিভাগ, পাবনা।",
        noticeDateBlock: "",
        lastDateBlock: "",
        lotteryDateBlock: "",
        payOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
        moreInfo: "Md. Babul Islam, e-Tender Solution, Sujanagar, Pabna. Mobile: 01711 222110, https://www.egpbd.com/",
        bottomWarning: "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।",
        headers: ["SL No", "Tender ID", "Description", "Location", "AppCost (Tk)", "Solvency (Tk)", "Security (Tk)", "Doc Fees (Tk)", "Last Date & Time"],
        rows: [["1", "1251464", "Necessary repair works...", "Pabna sadar", "2,72,184", "2,00,000", "7,000", "500", "2026-04-09 05:00 PM"]]
      }
    ]);
    setEnableTables(true);
  };

  const removeTableBlock = (tIdx: number) => {
    setTablesList(tablesList.filter((_, idx) => idx !== tIdx));
  };

  // Standard Table Operations
  const addColumn = (tIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      return {
        ...t,
        headers: [...t.headers, `Column ${t.headers.length + 1}`],
        rows: t.rows.map((row: string[]) => [...row, ""])
      };
    }));
  };

  const removeColumn = (tIdx: number, cIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      if (t.headers.length <= 1) return t;
      return {
        ...t,
        headers: t.headers.filter((_: string, i: number) => i !== cIdx),
        rows: t.rows.map((row: string[]) => row.filter((_, i) => i !== cIdx))
      };
    }));
  };

  const addRow = (tIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const newRow = Array(t.headers.length).fill("");
      if (t.headers.length > 0) {
        newRow[0] = (t.rows.length + 1).toString();
      }
      return {
        ...t,
        rows: [...t.rows, newRow]
      };
    }));
  };

  const removeRow = (tIdx: number, rIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      if (t.rows.length <= 1) return t;
      return {
        ...t,
        rows: t.rows.filter((_: string[], i: number) => i !== rIdx)
      };
    }));
  };

  const handleHeaderChange = (tIdx: number, colIndex: number, val: string) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const updated = [...t.headers];
      updated[colIndex] = val;
      return { ...t, headers: updated };
    }));
  };

  const handleCellChange = (tIdx: number, rowIndex: number, colIndex: number, val: string) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const updated = [...t.rows];
      updated[rowIndex] = [...updated[rowIndex]];
      updated[rowIndex][colIndex] = val;
      return { ...t, rows: updated };
    }));
  };

  // PWD LTM Template Operations
  const addPwdRow = (tIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      return {
        ...t,
        rows: [
          ...t.rows,
          {
            tenderId: "",
            description: "",
            location: "",
            appCost: "",
            solvency: "",
            security: "",
            docFees: "",
            lastDateTime: "",
          }
        ]
      };
    }));
  };

  const removePwdRow = (tIdx: number, rIdx: number) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      if (t.rows.length <= 1) return t;
      return {
        ...t,
        rows: t.rows.filter((_: any, i: number) => i !== rIdx)
      };
    }));
  };

  const handlePwdRowChange = (tIdx: number, rIdx: number, field: string, val: string) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const updatedRows = t.rows.map((row: any, i: number) => 
        i === rIdx ? { ...row, [field]: val } : row
      );
      return { ...t, rows: updatedRows };
    }));
  };

  const handlePwdFieldChange = (tIdx: number, field: string, val: string) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      return { ...t, [field]: val };
    }));
  };

  // Re-initialize and bind Flatpickr to table inputs dynamically
  useEffect(() => {
    if ((window as any).flatpickr) {
      // 1. Standard custom columns datepicker binding
      (window as any).flatpickr(".flatpickr-date-field", {
        dateFormat: "Y-m-d",
        allowInput: true,
        onChange: (selectedDates: any, dateStr: string, instance: any) => {
          const el = instance.element;
          const tIdxAttr = el.getAttribute("data-tidx");
          const rIdxAttr = el.getAttribute("data-ridx");
          const cIdxAttr = el.getAttribute("data-cidx");
          const fieldAttr = el.getAttribute("data-field");

          if (tIdxAttr !== null) {
            const tIdx = parseInt(tIdxAttr);
            if (rIdxAttr !== null && cIdxAttr !== null) {
              handleCellChange(tIdx, parseInt(rIdxAttr), parseInt(cIdxAttr), dateStr);
            } else if (fieldAttr !== null) {
              handlePwdFieldChange(tIdx, fieldAttr, dateStr);
            }
          }
        }
      });

      // 2. PWD rows custom date-time calendar picker binding
      (window as any).flatpickr(".flatpickr-datetime-field", {
        enableTime: true,
        dateFormat: "Y-m-d h:i K",
        allowInput: true,
        onChange: (selectedDates: any, dateStr: string, instance: any) => {
          const el = instance.element;
          const tIdxAttr = el.getAttribute("data-tidx");
          const rIdxAttr = el.getAttribute("data-ridx");
          const fieldAttr = el.getAttribute("data-field");

          if (tIdxAttr !== null && rIdxAttr !== null && fieldAttr !== null) {
            handlePwdRowChange(parseInt(tIdxAttr), parseInt(rIdxAttr), fieldAttr, dateStr);
          }
        }
      });
    }
  }, [tablesList]);

  // ----------------------------------------------------
  // Form Submission
  // ----------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, forceStatus?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validation checks
    if (!enableFile && !enableText && (!enableTables || tablesList.length === 0)) {
      setErrorMessage("Please enable and configure at least one notice module (Attachment, Text Description, or Tables).");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Add additional attributes manually
    formData.append("year", year);
    formData.append("category", category);
    formData.append("status", forceStatus || status);

    // Save combinable attachments or fallbacks
    if (!enableFile) {
      formData.set("file", ""); // Clear file
      formData.append("clearFile", "true");
    }

    if (enableText) {
      formData.append("content", content);
    } else {
      formData.append("content", "");
    }

    if (enableTables && tablesList.length > 0) {
      const serializedData = JSON.stringify({
        version: "v2",
        tables: tablesList
      });
      formData.append("tableData", serializedData);
    } else {
      formData.append("tableData", "");
    }

    // Assign Primary Type descriptor based on active content for DB compatibility
    let primaryType = "TEXT";
    if (enableFile) primaryType = "FILE";
    else if (enableTables && tablesList.length > 0) primaryType = "TABLE";
    formData.append("type", primaryType);

    if (isEdit) {
      formData.append("existingFilePath", notice.filePath || "");
      const res = await updateNotice(notice.id, formData);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/admin/egp-notices");
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    } else {
      const res = await createNotice(formData);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/admin/egp-notices");
        }, 1500);
      } else {
        setErrorMessage(res.message);
      }
    }
    setLoading(false);
  };

  // Generate Year Array
  const years = Array.from({ length: 7 }, (_, i) => ({
    value: (2024 + i).toString(),
    label: (2024 + i).toString(),
  }));

  const categoryOptions = [
    { value: "OTM", label: "OTM (Open Tendering Method)" },
    { value: "LTM", label: "LTM (Limited Tendering Method)" },
    { value: "LOTTERY_PENDING", label: "Lottery Pending" },
    { value: "LOTTERY_RESULT", label: "Lottery Result" },
  ];

  const statusOptions = [
    { value: "active", label: "Active (Published on live site)" },
    { value: "inactive", label: "Inactive (Draft / Hidden)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 min-w-0 w-full overflow-hidden">
      
      {/* Page Back Action */}
      <div className="flex items-center justify-between border-b pb-5 border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{isEdit ? "Edit Tender Notice Studio" : "Create Tender Notice Studio"}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Configure flexible, combinable attachment files, custom spreadsheet grids, and details.</p>
          </div>
        </div>
      </div>

      {/* Notice Basic Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Title</label>
          <input 
            name="title" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition text-sm font-semibold shadow-xs"
            placeholder="e.g., Supply & Installation of Medical Equipment..."
          />
        </div>

        <CustomSelect 
          label="Notice Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
        />

        <CustomSelect 
          label="Tender Year"
          value={year}
          onChange={setYear}
          options={years}
        />

        <CustomSelect 
          label="Publication Status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Publish Date
          </label>
          <div className="relative">
            <input 
              type="text" 
              name="publishDate" 
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              placeholder="Select date..."
              className="flatpickr-date bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 outline-none text-sm font-semibold focus:border-[var(--primary-color)] focus:bg-white transition cursor-pointer w-full shadow-xs"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Submission Date
          </label>
          <div className="relative">
            <input 
              type="text" 
              name="lastDate" 
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              placeholder="Select date..."
              className="flatpickr-date bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 outline-none text-sm font-semibold focus:border-[var(--primary-color)] focus:bg-white transition cursor-pointer w-full shadow-xs"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Combinable Sections Configuration Bar */}
      <div className="border-t border-slate-100 pt-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3.5">Included Content Modules</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* File Checkbox Switch */}
          <label className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer shadow-xs select-none ${
            enableFile 
              ? "bg-green-50/50 border-green-200 text-green-700 font-bold" 
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
          }`}>
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox"
                checked={enableFile}
                onChange={(e) => setEnableFile(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-green-600 focus:ring-green-500 border-slate-300 cursor-pointer accent-green-600"
              />
              <span className="text-xs uppercase tracking-wider">📎 Attach File</span>
            </div>
          </label>

          {/* Text Checkbox Switch */}
          <label className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer shadow-xs select-none ${
            enableText 
              ? "bg-green-50/50 border-green-200 text-green-700 font-bold" 
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
          }`}>
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox"
                checked={enableText}
                onChange={(e) => setEnableText(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-green-600 focus:ring-green-500 border-slate-300 cursor-pointer accent-green-600"
              />
              <span className="text-xs uppercase tracking-wider">📝 Rich Description</span>
            </div>
          </label>

          {/* Tables Checkbox Switch */}
          <label className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer shadow-xs select-none ${
            enableTables 
              ? "bg-green-50/50 border-green-200 text-green-700 font-bold" 
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100/50"
          }`}>
            <div className="flex items-center gap-2.5">
              <input 
                type="checkbox"
                checked={enableTables}
                onChange={(e) => {
                  setEnableTables(e.target.checked);
                  if (e.target.checked && tablesList.length === 0) {
                    addPwdTableBlock();
                  }
                }}
                className="w-4.5 h-4.5 rounded text-green-600 focus:ring-green-500 border-slate-300 cursor-pointer accent-green-600"
              />
              <span className="text-xs uppercase tracking-wider">📊 Data Tables Studio</span>
            </div>
          </label>

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODULE 1: FILE ATTACHMENT */}
      {/* ---------------------------------------------------- */}
      {enableFile && (
        <div className="border-t border-slate-100 pt-6 animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <FileUp className="w-5 h-5 text-[var(--primary-color)]" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Attachment Specifications</h3>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors relative group">
            <input 
              type="file" 
              name="file" 
              accept=".pdf,image/*"
              required={!isEdit || !notice.filePath}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto text-[var(--primary-color)] shadow-xs group-hover:scale-105 transition-transform">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">Click or Drag to Upload Notice File</p>
                <p className="text-slate-400 text-xs mt-1">Accepts PDF documents and Images (PNG, JPG, JPEG) up to 10MB.</p>
              </div>
            </div>
          </div>

          {isEdit && notice.filePath && (
            <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-500 font-semibold border border-slate-200 mt-4 flex items-center gap-1.5">
              <span>📎 Existing Attached Document:</span>
              <a href={notice.filePath} target="_blank" rel="noreferrer" className="text-[var(--primary-color)] underline hover:text-green-700 font-bold">{notice.filePath.split('/').pop()}</a>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 2: RICH TEXT DESCRIPTION */}
      {/* ---------------------------------------------------- */}
      {enableText && (
        <div className="border-t border-slate-100 pt-6 space-y-4 animate-scale-in">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-[var(--primary-color)]" />
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Rich Text Specification</h3>
          </div>

          <div className="space-y-2">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required={enableText}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition text-sm font-semibold shadow-xs"
              placeholder="Enter complete notice details, guidelines, and terms here..."
            ></textarea>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODULE 3: MULTIPLE TABLES STUDIO */}
      {/* ---------------------------------------------------- */}
      {enableTables && (
        <div className="border-t border-slate-100 pt-6 space-y-6 animate-scale-in min-w-0 w-full overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-[var(--primary-color)]" />
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Data Tables Specification Studio</h3>
                <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Build multiple customized tables or official PWD LTM templates for this tender.</p>
              </div>
            </div>

            {/* Top Table Generators */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addPwdTableBlock}
                className="bg-green-600 hover:bg-green-750 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add PWD LTM Spreadsheet Table
              </button>
            </div>
          </div>

          {/* Renders tables list */}
          <div className="space-y-10 min-w-0 w-full overflow-hidden">
            {tablesList.map((table, tIdx) => {
              return (
                <div 
                  key={table.id || tIdx}
                  className="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-5 md:p-6 space-y-6 relative min-w-0 w-full overflow-hidden shadow-xs hover:border-slate-300 transition duration-300"
                >
                  {/* Table Block Header Actions */}
                  <div className="flex justify-between items-center border-b pb-3 border-slate-200 shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border shadow-sm bg-green-50 border-green-200 text-green-700">
                      <Sliders className="w-3.5 h-3.5" /> PWD LTM Custom Specification Studio Table #{tIdx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeTableBlock(tIdx)}
                      className="text-red-500 hover:text-red-700 bg-red-50 border border-red-100 p-2 rounded-xl hover:bg-red-100 transition inline-flex items-center gap-1.5 text-xs font-bold"
                      title="Delete Entire Table Block"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Table
                    </button>
                  </div>

                  {/* Procuring Entity & Dates Headers Config */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-green-600" /> Procuring Office Name (Bangla)
                      </label>
                      <input 
                        type="text"
                        value={table.officeName || ""}
                        onChange={(e) => handlePwdFieldChange(tIdx, "officeName", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[var(--primary-color)] transition"
                        placeholder="যেমন: গণপূর্ত বিভাগ, পাবনা।"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notice Date</label>
                      <input 
                        type="text"
                        name={`pwdNoticeDate_${tIdx}`}
                        data-tidx={tIdx}
                        data-field="noticeDateBlock"
                        value={table.noticeDateBlock || ""}
                        onChange={(e) => handlePwdFieldChange(tIdx, "noticeDateBlock", e.target.value)}
                        placeholder="Select date..."
                        className="flatpickr-date-field w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[var(--primary-color)] transition cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Submission Date</label>
                      <input 
                        type="text"
                        name={`pwdLastDate_${tIdx}`}
                        data-tidx={tIdx}
                        data-field="lastDateBlock"
                        value={table.lastDateBlock || ""}
                        onChange={(e) => handlePwdFieldChange(tIdx, "lastDateBlock", e.target.value)}
                        placeholder="Select date..."
                        className="flatpickr-date-field w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[var(--primary-color)] transition cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lottery Opening Date</label>
                      <input 
                        type="text"
                        name={`pwdLotteryDate_${tIdx}`}
                        data-tidx={tIdx}
                        data-field="lotteryDateBlock"
                        value={table.lotteryDateBlock || ""}
                        onChange={(e) => handlePwdFieldChange(tIdx, "lotteryDateBlock", e.target.value)}
                        placeholder="Select date..."
                        className="flatpickr-date-field w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[var(--primary-color)] transition cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Columns & Rows Controls */}
                  <div className="space-y-4 min-w-0 w-full overflow-hidden">
                    <div className="flex justify-between items-center border-b pb-2 border-slate-200 shrink-0">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <TableIcon className="w-3.5 h-3.5 text-green-600" /> Spreadsheet Columns & Rows
                      </span>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => addColumn(tIdx)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Column
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addRow(tIdx)}
                          className="bg-[var(--primary-color)] hover:bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Row
                        </button>
                      </div>
                    </div>

                    {/* Table grid */}
                    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-inner max-h-[350px] bg-white">
                      <table className="w-full border-collapse text-left text-xs bg-white">
                        <thead className="bg-[#ccffff] border-b border-slate-200 text-black sticky top-0 font-bold">
                          <tr className="divide-x divide-slate-200">
                            {(table.headers || []).map((hdr: string, cIdx: number) => (
                              <th key={cIdx} className="p-3 min-w-[160px] bg-[#ccffff] text-black">
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    required
                                    value={hdr} 
                                    onChange={(e) => handleHeaderChange(tIdx, cIdx, e.target.value)}
                                    className="bg-white/80 border border-slate-200 font-extrabold text-black outline-none w-full focus:bg-white focus:ring-1 focus:ring-green-500 rounded-lg p-1.5 text-xs"
                                  />
                                  {table.headers.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeColumn(tIdx, cIdx)}
                                      className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-white transition shrink-0"
                                      title="Delete Column"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th className="p-3 w-12 text-center bg-[#ccffff] text-slate-500">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(table.rows || []).map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                              {row.map((cell: string, cIdx: number) => {
                                const headerName = (table.headers[cIdx] || "").toLowerCase();
                                const isDateField = headerName.includes("date") || headerName.includes("time") || headerName.includes("তারিখ") || headerName.includes("সময়");
                                return (
                                  <td key={cIdx} className="p-2 border-r border-slate-200">
                                    <input 
                                      type="text" 
                                      required
                                      data-tidx={tIdx}
                                      data-ridx={rIdx}
                                      data-cidx={cIdx}
                                      value={cell} 
                                      onChange={(e) => handleCellChange(tIdx, rIdx, cIdx, e.target.value)}
                                      className={`bg-transparent border-0 outline-none w-full focus:bg-white focus:ring-1 focus:ring-green-500 rounded p-1.5 font-semibold text-slate-800 text-xs ${
                                        isDateField ? "flatpickr-datetime-field cursor-pointer font-bold text-green-700 bg-green-50/20" : ""
                                      }`}
                                      placeholder={isDateField ? "Select Date & Time..." : ""}
                                    />
                                  </td>
                                );
                              })}
                              <td className="p-2 text-center bg-slate-50/30">
                                {table.rows.length > 1 && (
                                  <button 
                                    type="button" 
                                    onClick={() => removeRow(tIdx, rIdx)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-100 transition inline-flex items-center justify-center"
                                    title="Delete Row"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer Specifications Info */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shrink-0 shadow-xs">
                    <div className="flex items-center gap-2 border-b pb-2 border-slate-150">
                      <Info className="w-4 h-4 text-green-600" />
                      <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Tender Table Footer Specification Details</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" /> BD Pay Order To Info (Bangla / English)
                        </label>
                        <input 
                          type="text"
                          value={table.payOrderTo || ""}
                          onChange={(e) => handlePwdFieldChange(tIdx, "payOrderTo", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 outline-none text-xs font-semibold focus:border-[var(--primary-color)] transition"
                          placeholder="Executive Engineer, Pabna PWD Division, Pabna"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-slate-400" /> Contact Info / e-Tender Solutions (Bangla / English)
                        </label>
                        <input 
                          type="text"
                          value={table.moreInfo || ""}
                          onChange={(e) => handlePwdFieldChange(tIdx, "moreInfo", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 outline-none text-xs font-semibold focus:border-[var(--primary-color)] transition"
                          placeholder="Md. Babul Islam, e-Tender Solution..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 text-red-500 font-extrabold">
                          <AlertCircle className="w-3.5 h-3.5" /> Bottom Red Warning Alert Info (Bangla / English)
                        </label>
                        <input 
                          type="text"
                          value={table.bottomWarning || ""}
                          onChange={(e) => handlePwdFieldChange(tIdx, "bottomWarning", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-red-600 outline-none text-xs font-bold focus:border-red-500 transition"
                          placeholder="ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

            {tablesList.length === 0 && (
              <div className="text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-semibold italic">
                No active tables built. Add one using the buttons above!
              </div>
            )}
          </div>

        </div>
      )}

      {/* Action Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-semibold animate-scale-in">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-semibold animate-scale-in">
          ✔ {successMessage}
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-slate-100 pt-6 flex justify-end gap-4 shrink-0">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 text-xs uppercase tracking-wider"
        >
          Cancel
        </button>
        {!isEdit && (
          <button 
            type="button"
            disabled={loading}
            onClick={(e) => {
              handleSubmit(e as any, "inactive");
            }}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold px-6 py-3 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            Save as Draft
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[var(--primary-color)] hover:bg-green-700 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-green-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Studio...
            </>
          ) : (
            isEdit ? "Update Tender Notice" : "Save Tender Notice"
          )}
        </button>
      </div>
    </form>
  );
}
