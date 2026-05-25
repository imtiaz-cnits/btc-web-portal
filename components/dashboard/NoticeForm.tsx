"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
  Sliders,
  Clock
} from "lucide-react";

interface NoticeFormProps {
  notice?: any; // If provided, we are in EDIT mode
}

// ----------------------------------------------------
// Work Location Suggestions
// ----------------------------------------------------
const LOCATION_SUGGESTIONS = [
  "Pabna Sadar, Pabna",
  "Sujanagar, Pabna",
  "Ishwardi, Pabna",
  "Bera, Pabna",
  "Bhangura, Pabna",
  "Chatmohar, Pabna",
  "Faridpur, Pabna",
  "Atgharia, Pabna",
  "Santhia, Pabna",
];

function LocationAutocompleteInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = value.trim()
    ? LOCATION_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      )
    : LOCATION_SUGGESTIONS;

  const updatePosition = () => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 2,
      left: rect.left,
      width: Math.max(rect.width, 200),
      zIndex: 99999,
    });
  };

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updatePosition();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) { if (e.key === "ArrowDown") { updatePosition(); setOpen(true); } return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      onChange(filtered[highlighted]);
      setOpen(false);
      setHighlighted(-1);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const dropdown = open && filtered.length > 0 ? (
    <ul
      style={dropdownStyle}
      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
      onMouseLeave={handleMouseLeave}
      className="bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto text-xs"
    >
      {filtered.map((s, i) => (
        <li
          key={s}
          onMouseDown={(e) => { e.preventDefault(); onChange(s); setOpen(false); setHighlighted(-1); }}
          className={`px-3 py-2 cursor-pointer font-semibold transition-colors ${
            i === highlighted
              ? "bg-green-100 text-green-800"
              : "hover:bg-slate-100 text-slate-700"
          }`}
        >
          📍 {s}
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div className="relative w-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); updatePosition(); setOpen(true); setHighlighted(-1); }}
        onKeyDown={handleKeyDown}
        className={className}
        placeholder={placeholder || "Type location..."}
        autoComplete="off"
      />
      {typeof document !== "undefined" && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}

// ----------------------------------------------------
// 1. Sleek Reusable Custom Dropdown Component
// ----------------------------------------------------
function CustomSelect({
  label,
  value,
  onChange,
  options,
  isOpen,
  onToggle,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      const handleClose = () => onToggle();
      window.addEventListener("click", handleClose);
      return () => window.removeEventListener("click", handleClose);
    }
  }, [isOpen, onToggle]);

  const activeOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
      {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>}
      <div 
        onClick={onToggle}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm font-semibold focus:border-[var(--primary-color)] hover:border-slate-300 transition cursor-pointer flex justify-between items-center shadow-xs"
      >
        <span>{activeOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 max-h-[250px] overflow-y-auto animate-scale-in">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                onToggle();
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
// 1.5. Dynamic Category Header Map and Migration Helpers
// ----------------------------------------------------
const HEADERS_MAP: Record<string, string[]> = {
  LTM: [
    "SL.NO",
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date"
  ],
  LOTTERY_PENDING: [
    "SL.NO",
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date"
  ],
  LOTTERY_RESULT: [
    "SL.NO",
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date",
    "WINNER LIST NAME"
  ],
  OTM: [
    "SL.NO",
    "Tender Id",
    "Brief Description of Works",
    "Work Location",
    "Type of Method",
    "APP Estimate Cost Tk.",
    "Bank Credit Line",
    "TURN OVER 05 Years",
    "Similar Work 05 Years",
    "Tender Security (BD)",
    "Document Price. Tk",
    "Schedule & BD Last Selling Date"
  ]
};

function migrateTableRows(
  oldHeaders: string[], 
  oldRows: string[][], 
  newHeaders: string[], 
  newCategory: string
): string[][] {
  if (!Array.isArray(oldRows)) return [];
  return oldRows.map((row, rowIndex) => {
    if (!Array.isArray(row)) return [];
    return newHeaders.map((newHdr, newColIdx) => {
      // 1. SL.NO auto-calculated
      if (newHdr.toUpperCase().replace(/\./g, "") === "SLNO") {
        return (rowIndex + 1).toString();
      }

      // 2. Type of Method updated automatically based on category
      if (newHdr.toLowerCase().includes("method") || newHdr.toLowerCase().includes("matho")) {
        return newCategory === "OTM" ? "OTM" : "LTM SOCIAL";
      }

      // 3. Match from existing headers using normalized strings
      const normalizedNewHdr = newHdr.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
      const matchedIdx = oldHeaders.findIndex(oldHdr => {
        if (!oldHdr) return false;
        const normalizedOld = oldHdr.toLowerCase().replace(/\s+/g, "").replace(/\./g, "");
        return normalizedOld === normalizedNewHdr || normalizedOld.includes(normalizedNewHdr) || normalizedNewHdr.includes(normalizedOld);
      });

      if (matchedIdx !== -1 && row[matchedIdx] !== undefined) {
        return row[matchedIdx];
      }

      // 4. Default: empty string
      return "";
    });
  });
}

// ----------------------------------------------------
// 1.8. Currency input parsing and formatting helper
// ----------------------------------------------------
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

const formatInputCurrency = (value: string) => {
  if (!value) return "";
  let clean = value.replace(/,/g, "");
  const parts = clean.split(".");
  if (parts.length > 2) {
    clean = parts[0] + "." + parts.slice(1).join("");
  }
  const integerPart = parts[0].replace(/\D/g, "");
  let formatted = integerPart ? parseInt(integerPart, 10).toLocaleString("en-US") : "";
  if (parts.length > 1) {
    const decimalPart = parts[1].replace(/\D/g, "");
    formatted += "." + decimalPart;
  }
  return formatted;
};

const getLastDateColIdx = (headers: string[]) => {
  if (!Array.isArray(headers)) return -1;
  return headers.findIndex(h => {
    const lower = (h || "").toLowerCase();
    return lower.includes("selling") || lower.includes("last date & time") || lower.includes("schedule");
  });
};

// ----------------------------------------------------
// 2. Main Multi-Table Tender Notice Studio Form Component
// ----------------------------------------------------
export default function NoticeForm({ notice }: NoticeFormProps) {
  const router = useRouter();
  const isEdit = !!notice;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown Open State Sync
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  // Base Form Fields
  const [title, setTitle] = useState(notice?.title || "");
  const [category, setCategory] = useState(notice?.category || "OTM");
  const [status, setStatus] = useState(notice?.status || "active");
  const [year, setYear] = useState(notice?.year || new Date().getFullYear().toString());
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [modalScheduledDate, setModalScheduledDate] = useState("");
  const [modalScheduledDateOnly, setModalScheduledDateOnly] = useState("");
  const [modalScheduledTimeOnly, setModalScheduledTimeOnly] = useState("");

  const formatIsoToDmy = (isoStr: string) => {
    if (!isoStr) return "";
    const datePart = isoStr.includes("T") ? isoStr.split("T")[0] : isoStr;
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      return `${d}-${m}-${y}`;
    }
    return isoStr;
  };

  const formatIsoToDmyHms = (dateObj: Date) => {
    if (!dateObj || isNaN(dateObj.getTime())) return "";
    const d = String(dateObj.getDate()).padStart(2, "0");
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const y = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const h = String(hours).padStart(2, "0");
    return `${d}-${m}-${y} ${h}:${minutes} ${ampm}`;
  };

  const formatPublishDateForState = (dateValue: any) => {
    if (!dateValue) return "";
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return "";
    
    // If it has a time component (not exactly midnight local time) OR if it is in the future
    const isFuture = dateObj > new Date();
    const hasTime = dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0;
    
    if (isFuture || hasTime) {
      return formatIsoToDmyHms(dateObj);
    }
    
    // Otherwise, standard DD-MM-YYYY
    const d = String(dateObj.getDate()).padStart(2, "0");
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const parseDateTimeDmyToDate = (str: string): Date | null => {
    if (!str) return null;
    const trimmed = str.trim();
    // Case 1: Simple date "DD-MM-YYYY"
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split("-");
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    // Case 2: Date and time "DD-MM-YYYY hh:mm AM/PM" or similar, like from Flatpickr
    // Format: "d-m-Y h:i K" -> e.g. "22-05-2026 05:30 PM"
    const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      const [_, d, m, y, hStr, minStr, ampm] = match;
      let hours = parseInt(hStr);
      const minutes = parseInt(minStr);
      if (ampm) {
        if (ampm.toUpperCase() === "PM" && hours < 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === "AM" && hours === 12) {
          hours = 0;
        }
      }
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), hours, minutes);
    }

    // Fallback: try raw JS Date parsing
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    return null;
  };

  const formatCellDateToDmy = (cellStr: string) => {
    if (!cellStr) return "";
    const str = String(cellStr).trim();
    
    // If it's an ISO date string like 2026-05-19T00:00:00.000Z
    if (str.includes("T")) {
      const datePart = str.split("T")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split("-");
        return `${d}-${m}-${y}`;
      }
    }
    
    // If it has time part, e.g. "2026-05-20 05:00 PM"
    const parts = str.split(/\s+/);
    const datePart = parts[0];
    const timePart = parts.slice(1).join(" ");
    
    let formattedDate = datePart;
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split("-");
      formattedDate = `${d}-${m}-${y}`;
    } else if (/^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(datePart)) {
      formattedDate = datePart.replace(/\//g, "-");
      // ensure leading zero for day and month
      const dParts = formattedDate.split("-");
      const d = dParts[0].padStart(2, '0');
      const m = dParts[1].padStart(2, '0');
      const y = dParts[2];
      formattedDate = `${d}-${m}-${y}`;
    }
    
    return timePart ? `${formattedDate} ${timePart}` : formattedDate;
  };

  const [publishDate, setPublishDate] = useState(
    notice?.publishDate 
      ? formatPublishDateForState(notice.publishDate) 
      : (isEdit ? "" : formatPublishDateForState(new Date()))
  );
  const [lastDate, setLastDate] = useState(
    notice?.lastDate ? formatPublishDateForState(notice.lastDate) : ""
  );
  const [lotteryDate, setLotteryDate] = useState(
    notice?.lotteryDate ? formatPublishDateForState(notice.lotteryDate) : ""
  );

  // Combinable Section Switches
  const [enableFile, setEnableFile] = useState(notice ? !!notice.filePath : false);
  const [enableText, setEnableText] = useState(notice ? !!notice.content : false);
  const [enableTables, setEnableTables] = useState(notice ? !!notice.tableData : true);

  // Text notice description content
  const [content, setContent] = useState(notice?.content || "");

  // Multiple Tables Array
  const [tablesList, setTablesList] = useState<any[]>(
    notice?.tableData ? [] : [{
      id: "tbl-init",
      type: "pwd_ltm",
      officeName: "গণপূর্ত বিভাগ, পাবনা।",
      noticeDateBlock: "",
      lastDateBlock: "",
      lotteryDateBlock: "",
      payOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
      moreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086\nL M B Market 1st Floor, Pabna.",
      bottomWarning: "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।",
      headers: ["SL No", "Tender ID", "Description", "Location", "AppCost (Tk)", "Solvency (Tk)", "Security (Tk)", "Doc Fees (Tk)", "Last Date & Time"],
      rows: [["1", "1251464", "Necessary repair works...", "Pabna sadar", "2,72,184", "2,00,000", "7,000", "500", ""]]
    }]
  );

  // Real-time file upload preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  
  // Modal Previewer State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modalPreviewUrl, setModalPreviewUrl] = useState<string | null>(null);
  const [modalPreviewType, setModalPreviewType] = useState<"image" | "pdf" | null>(null);

  // Clean up ObjectURL when component unmounts or changes
  useEffect(() => {
    return () => {
      if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFileUrl);
      }
    };
  }, [selectedFileUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFileUrl);
      }
      const url = URL.createObjectURL(file);
      setSelectedFileUrl(url);
    } else {
      setSelectedFile(null);
      if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
        URL.revokeObjectURL(selectedFileUrl);
      }
      setSelectedFileUrl(null);
    }
  };


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
        const els = document.querySelectorAll(".flatpickr-date");
        els.forEach((el: any) => {
          if (el._flatpickr) {
            el._flatpickr.destroy();
          }
          (window as any).flatpickr(el, {
            dateFormat: "d-m-Y",
            allowInput: true,
            onChange: (selectedDates: any, dateStr: string, instance: any) => {
              const fieldName = instance.element.getAttribute("name");
              if (fieldName === "publishDate") {
                setPublishDate(dateStr);
              } else if (fieldName === "lastDate") {
                setLastDate(dateStr);
              } else if (fieldName === "lotteryDate") {
                setLotteryDate(dateStr);
              }
            }
          });
        });

        // Initialize Date picker for modal
        const modalDateEls = document.querySelectorAll(".flatpickr-date-modal");
        modalDateEls.forEach((el: any) => {
          if (el._flatpickr) {
            el._flatpickr.destroy();
          }
          (window as any).flatpickr(el, {
            dateFormat: "d-m-Y",
            allowInput: true,
            minDate: "today",
            defaultDate: modalScheduledDateOnly || "today",
            onChange: (selectedDates: any, dateStr: string) => {
              setModalScheduledDateOnly(dateStr);
            }
          });
        });

        // Initialize Time picker for modal
        const modalTimeEls = document.querySelectorAll(".flatpickr-time-modal");
        modalTimeEls.forEach((el: any) => {
          if (el._flatpickr) {
            el._flatpickr.destroy();
          }
          (window as any).flatpickr(el, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
            allowInput: true,
            defaultDate: modalScheduledTimeOnly || "12:00 PM",
            onChange: (selectedDates: any, dateStr: string) => {
              setModalScheduledTimeOnly(dateStr);
            }
          });
        });
      }
    }

    return () => {
      document.querySelectorAll(".flatpickr-date").forEach((el: any) => {
        if (el._flatpickr) el._flatpickr.destroy();
      });
      document.querySelectorAll(".flatpickr-date-modal").forEach((el: any) => {
        if (el._flatpickr) el._flatpickr.destroy();
      });
      document.querySelectorAll(".flatpickr-time-modal").forEach((el: any) => {
        if (el._flatpickr) el._flatpickr.destroy();
      });
    };
  }, [showScheduleModal]);

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
            const formattedTables = parsed.tables.map((table: any) => {
              const noticeDateBlock = formatCellDateToDmy(table.noticeDateBlock);
              const lastDateBlock = formatCellDateToDmy(table.lastDateBlock);
              const lotteryDateBlock = formatCellDateToDmy(table.lotteryDateBlock);
              
              const rows = (table.rows || []).map((row: any) => {
                if (Array.isArray(row)) {
                  return row.map((cell: string, cIdx: number) => {
                    const headerName = (table.headers[cIdx] || "").toLowerCase();
                    const isDateField = headerName.includes("date") || headerName.includes("time") || headerName.includes("তারিখ") || headerName.includes("সময়");
                    if (isDateField && cell) {
                      return formatCellDateToDmy(cell);
                    }
                    return cell;
                  });
                }
                return row;
              });
              
              return {
                ...table,
                noticeDateBlock,
                lastDateBlock,
                lotteryDateBlock,
                rows
              };
            });
            setTablesList(formattedTables);
          } else {
            // Backward compatibility for old single-table formats
            if (parsed.isPwdTemplate) {
              const legacyRows = parsed.rows || [];
              const normalizedLegacyRows = legacyRows.map((row: any, rIdx: number) => {
                let cellVal = "";
                if (Array.isArray(row)) {
                  cellVal = row[8] || "";
                } else if (row && typeof row === "object") {
                  cellVal = row.lastDateTime || row.lastDate || "";
                }
                const formattedCellVal = formatCellDateToDmy(cellVal);
                
                if (Array.isArray(row)) {
                  const newRow = [...row];
                  newRow[8] = formattedCellVal;
                  return newRow;
                }
                if (row && typeof row === "object") {
                  return [
                    (rIdx + 1).toString(),
                    row.tenderId || "",
                    row.description || "",
                    row.location || "",
                    row.appCost || "",
                    row.solvency || "",
                    row.security || "",
                    row.docFees || "",
                    formattedCellVal
                  ];
                }
                return [];
              });

              setTablesList([{
                id: "old-pwd-" + Math.random().toString(),
                type: "pwd_ltm",
                officeName: parsed.officeName || "",
                noticeDateBlock: formatCellDateToDmy(parsed.noticeDateBlock),
                lastDateBlock: formatCellDateToDmy(parsed.lastDateBlock),
                lotteryDateBlock: formatCellDateToDmy(parsed.lotteryDateBlock),
                payOrderTo: parsed.payOrderTo || "",
                moreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086\nL M B Market 1st Floor, Pabna.",
                bottomWarning: parsed.bottomWarning || "",
                headers: ["SL No", "Tender ID", "Description", "Location", "AppCost (Tk)", "Solvency (Tk)", "Security (Tk)", "Doc Fees (Tk)", "Last Date & Time"],
                rows: normalizedLegacyRows
              }]);
            } else if (parsed.headers && parsed.rows) {
              const formattedRows = parsed.rows.map((row: string[]) => {
                return row.map((cell: string, cIdx: number) => {
                  const headerName = (parsed.headers[cIdx] || "").toLowerCase();
                  const isDateField = headerName.includes("date") || headerName.includes("time") || headerName.includes("তারিখ") || headerName.includes("সময়");
                  if (isDateField && cell) {
                    return formatCellDateToDmy(cell);
                  }
                  return cell;
                });
              });
              
              setTablesList([{
                id: "old-std-" + Math.random().toString(),
                type: "standard",
                headers: parsed.headers,
                rows: formattedRows
              }]);
            }
          }
        } catch (err) {
          console.error("Failed to parse tableData", err);
        }
      }
    } else {
      // Set a default empty state or pre-populate with default table on add page if tables are enabled
      if (enableTables) {
        const targetHeaders = HEADERS_MAP[category] || HEADERS_MAP.LTM;
        const initialRow = targetHeaders.map((hdr) => {
          const normHdr = hdr.toUpperCase().replace(/\./g, "");
          if (normHdr === "SLNO") return "1";
          if (hdr.toLowerCase().includes("method") || hdr.toLowerCase().includes("matho")) return category === "OTM" ? "OTM" : "LTM SOCIAL";
          return "";
        });

        const initialColors = targetHeaders.map(hdr => hdr === "WINNER LIST NAME" ? "#ffffcc" : "#ffffff");
        const defaultHeaderBg = category === "OTM" ? "#c2ffd8" : "#ccffff";

        setTablesList([
          {
            id: "tbl-init",
            type: "pwd_ltm",
            officeName: "গণপূর্ত বিভাগ, পাবনা।",
            noticeDateBlock: publishDate || "",
            lastDateBlock: lastDate || "",
            lotteryDateBlock: "",
            payOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
            moreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086\nL M B Market 1st Floor, Pabna.",
            bottomWarning: "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।",
            headers: targetHeaders,
            rows: [initialRow],
            columnColors: initialColors,
            headerBgColor: defaultHeaderBg
          }
        ]);
      } else {
        setTablesList([]);
      }
    }
  }, [isEdit, notice]);

  // Dynamically sync publishDate, lastDate and lotteryDate into all tables
  useEffect(() => {
    setTablesList(prev => {
      let changed = false;
      const next = prev.map(table => {
        let tableChanged = false;
        
        const newNoticeDate = publishDate || "";
        const oldNoticeDate = table.noticeDateBlock || "";
        
        const newLastDate = lastDate || "";
        const oldLastDate = table.lastDateBlock || "";

        const newLotteryDate = lotteryDate || "";
        const oldLotteryDate = table.lotteryDateBlock || "";

        let newRows = table.rows;
        if (table.type === "pwd_ltm" && Array.isArray(table.rows)) {
          const lastDateColIdx = getLastDateColIdx(table.headers || []);
          if (lastDateColIdx !== -1) {
            newRows = table.rows.map((row: any) => {
              if (Array.isArray(row) && row.length > lastDateColIdx) {
                const existingVal = row[lastDateColIdx] || "";
                const timePart = existingVal.includes(" ") ? existingVal.split(" ").slice(1).join(" ") : "05:00 PM";
                const targetVal = lastDate ? `${lastDate} ${timePart}` : "";
                if (existingVal !== targetVal) {
                  tableChanged = true;
                  const newRow = [...row];
                  newRow[lastDateColIdx] = targetVal;
                  return newRow;
                }
              }
              return row;
            });
          }
        }

        if (oldNoticeDate !== newNoticeDate || oldLastDate !== newLastDate || oldLotteryDate !== newLotteryDate) {
          tableChanged = true;
        }

        if (tableChanged) {
          changed = true;
          return {
            ...table,
            noticeDateBlock: newNoticeDate,
            lastDateBlock: newLastDate,
            lotteryDateBlock: newLotteryDate,
            rows: newRows
          };
        }
        return table;
      });

      return changed ? next : prev;
    });
  }, [publishDate, lastDate, lotteryDate]);

  // Dynamically migrate table columns and structures based on the Notice Category selected
  useEffect(() => {
    setTablesList(prev => {
      if (prev.length === 0) return prev;
      return prev.map(table => {
        if (table.type !== "pwd_ltm") return table;
        
        const targetHeaders = HEADERS_MAP[category] || HEADERS_MAP.LTM;
        const currentHeaders = table.headers || [];
        const currentRows = table.rows || [];
        
        // Migrate row cell contents based on fuzzy text matching
        const migratedRows = migrateTableRows(currentHeaders, currentRows, targetHeaders, category);
        
        // Setup/Migrate column background colors
        const currentColors = table.columnColors || [];
        const migratedColors = targetHeaders.map((newHdr, newColIdx) => {
          // Defaults: light yellow for WINNER LIST NAME
          if (newHdr === "WINNER LIST NAME") return "#ffffcc";
          
          // Match existing color if possible
          const oldColIdx = currentHeaders.findIndex((oldHdr: string) => {
            if (!oldHdr) return false;
            return oldHdr.toLowerCase().replace(/\s+/g, "") === newHdr.toLowerCase().replace(/\s+/g, "");
          });
          if (oldColIdx !== -1 && currentColors[oldColIdx]) {
            return currentColors[oldColIdx];
          }
          return "#ffffff"; // default cell bg
        });

        // Set dynamic default header colors based on LTM vs OTM style
        let defaultHeaderBg = table.headerBgColor;
        if (!defaultHeaderBg || defaultHeaderBg === "#ccffff" || defaultHeaderBg === "#c2ffd8") {
          defaultHeaderBg = category === "OTM" ? "#c2ffd8" : "#ccffff";
        }

        return {
          ...table,
          headers: targetHeaders,
          rows: migratedRows,
          columnColors: migratedColors,
          headerBgColor: defaultHeaderBg
        };
      });
    });
  }, [category]);

  // ----------------------------------------------------
  // Interactive Multi-Table State Modifiers
  // ----------------------------------------------------
  
  // Add new blank table blocks
  const addPwdTableBlock = () => {
    setTablesList(prev => {
      if (prev.length >= 1) return prev;

      const targetHeaders = HEADERS_MAP[category] || HEADERS_MAP.LTM;
      const initialRow = targetHeaders.map((hdr) => {
        const normHdr = hdr.toUpperCase().replace(/\./g, "");
        if (normHdr === "SLNO") return "1";
        if (hdr.toLowerCase().includes("method") || hdr.toLowerCase().includes("matho")) return category === "OTM" ? "OTM" : "LTM SOCIAL";
        return "";
      });

      const initialColors = targetHeaders.map(hdr => hdr === "WINNER LIST NAME" ? "#ffffcc" : "#ffffff");
      const defaultHeaderBg = category === "OTM" ? "#c2ffd8" : "#ccffff";

      return [
        ...prev,
        {
          id: "tbl-init",
          type: "pwd_ltm",
          officeName: "গণপূর্ত বিভাগ, পাবনা।",
          noticeDateBlock: publishDate || "",
          lastDateBlock: lastDate || "",
          lotteryDateBlock: "",
          payOrderTo: "Executive Engineer, Pabna PWD Division, Pabna",
          moreInfo: "Engr. Md. Shah Alom B.Sc. Engr.(Civil)\nMobile No: 01711-805086\nL M B Market 1st Floor, Pabna.",
          bottomWarning: "ব্যাংক স্টেটমেন্ট অথবা ক্রেডিট কমিটমেন্ট দিতে হবে।",
          headers: targetHeaders,
          rows: [initialRow],
          columnColors: initialColors,
          headerBgColor: defaultHeaderBg
        }
      ];
    });
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
      const lastDateColIdx = getLastDateColIdx(t.headers || []);
      if (t.type === "pwd_ltm" && lastDateColIdx !== -1 && newRow.length > lastDateColIdx) {
        newRow[lastDateColIdx] = lastDate ? `${lastDate} 05:00 PM` : "";
      }
      
      // Auto-populate Type of Method based on category
      const methodColIdx = (t.headers || []).findIndex((h: string) => {
        const lower = (h || "").toLowerCase();
        return lower.includes("method") || lower.includes("matho");
      });
      if (methodColIdx !== -1 && newRow.length > methodColIdx) {
        newRow[methodColIdx] = category === "OTM" ? "OTM" : "LTM SOCIAL";
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
      
      let formattedVal = val;
      const hdr = t.headers[colIndex] || "";
      if (isCurrencyColumn(hdr)) {
        formattedVal = formatInputCurrency(val);
      }
      
      const updated = [...t.rows];
      updated[rowIndex] = [...updated[rowIndex]];
      updated[rowIndex][colIndex] = formattedVal;
      return { ...t, rows: updated };
    }));
  };

  const handleColumnColorChange = (tIdx: number, colIdx: number, color: string) => {
    setTablesList(prev => prev.map((t, idx) => {
      if (idx !== tIdx) return t;
      const updatedColors = [...(t.columnColors || [])];
      while (updatedColors.length < t.headers.length) {
        updatedColors.push("#ffffff");
      }
      updatedColors[colIdx] = color;
      return { ...t, columnColors: updatedColors };
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
      const dateFields = document.querySelectorAll(".flatpickr-date-field");
      dateFields.forEach((el: any) => {
        if (el._flatpickr) {
          el._flatpickr.destroy();
        }
        (window as any).flatpickr(el, {
          dateFormat: "d-m-Y",
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
      });

      // 2. PWD rows custom date-time calendar picker binding
      const datetimeFields = document.querySelectorAll(".flatpickr-datetime-field");
      datetimeFields.forEach((el: any) => {
        if (el._flatpickr) {
          el._flatpickr.destroy();
        }
        (window as any).flatpickr(el, {
          enableTime: true,
          dateFormat: "d-m-Y h:i K",
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
      });
    }
  }, [tablesList]);

  // ----------------------------------------------------
  // Form Submission
  // ----------------------------------------------------
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>, 
    forceStatus?: string,
    overridePublishDate?: string
  ) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Validation checks
      if (!enableFile && !enableText && (!enableTables || tablesList.length === 0)) {
        setErrorMessage("Please enable and configure at least one notice module (Attachment, Text Description, or Tables).");
        setLoading(false);
        return;
      }

      const formEl = document.querySelector("form") as HTMLFormElement;
      if (!formEl) {
        setErrorMessage("Notice form element not found.");
        setLoading(false);
        return;
      }

      const formData = new FormData(formEl);
      
      // Parse publish date: use overridePublishDate if scheduling, otherwise force to current time for instant publication
      if (overridePublishDate !== undefined) {
        const publishDateObj = parseDateTimeDmyToDate(overridePublishDate);
        if (publishDateObj) {
          formData.set("publishDate", publishDateObj.toISOString());
        } else {
          formData.set("publishDate", "");
        }
      } else {
        formData.set("publishDate", new Date().toISOString());
      }

      const lastDateObj = parseDateTimeDmyToDate(formData.get("lastDate") as string);
      if (lastDateObj) {
        formData.set("lastDate", lastDateObj.toISOString());
      } else {
        formData.set("lastDate", "");
      }

      const lotteryDateObj = parseDateTimeDmyToDate(formData.get("lotteryDate") as string);
      if (lotteryDateObj) {
        formData.set("lotteryDate", lotteryDateObj.toISOString());
      } else {
        formData.set("lotteryDate", "");
      }
      
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
    } catch (err: any) {
      console.error("Form submit error:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalScheduleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!modalScheduledDateOnly || !modalScheduledTimeOnly) {
      alert("অনুগ্রহ করে একটি তারিখ এবং একটি সময় সিলেক্ট করুন।");
      return;
    }
    
    const combinedDateTime = `${modalScheduledDateOnly} ${modalScheduledTimeOnly}`;
    setPublishDate(combinedDateTime);
    setShowScheduleModal(false);
    
    const fakeEvent = { preventDefault: () => {} } as any;
    handleSubmit(fakeEvent, "active", combinedDateTime);
  };

  // Generate Year Array (Extend up to 2050)
  const years = Array.from({ length: 27 }, (_, i) => ({
    value: (2024 + i).toString(),
    label: (2024 + i).toString(),
  }));

  const categoryOptions = [
    { value: "OTM", label: "OTM" },
    { value: "LTM", label: "LTM" },
    { value: "LOTTERY_PENDING", label: "Lottery Pending" },
    { value: "LOTTERY_RESULT", label: "Lottery Result" },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8 min-w-0 w-full overflow-hidden">
      
      {/* Notice Basic Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notice Title</label>
          <input 
            name="title" 
            required 
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);
              setTablesList(prev => prev.map((t, idx) => idx === 0 ? { ...t, officeName: newTitle } : t));
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition text-sm font-semibold shadow-xs"
            placeholder="e.g., Supply & Installation of Medical Equipment..."
          />
        </div>

        <CustomSelect 
          label="Notice Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          isOpen={openSelect === "category"}
          onToggle={() => setOpenSelect(openSelect === "category" ? null : "category")}
        />

        <CustomSelect 
          label="Tender Year"
          value={year}
          onChange={setYear}
          options={years}
          isOpen={openSelect === "year"}
          onToggle={() => setOpenSelect(openSelect === "year" ? null : "year")}
        />

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

        {(category === "LOTTERY_RESULT" || category === "LOTTERY_PENDING") && (
          <div className="space-y-2 relative animate-scale-in">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Lottery Date
            </label>
            <div className="relative">
              <input 
                type="text" 
                name="lotteryDate" 
                value={lotteryDate}
                onChange={(e) => setLotteryDate(e.target.value)}
                placeholder="Select date..."
                className="flatpickr-date bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 outline-none text-sm font-semibold focus:border-[var(--primary-color)] focus:bg-white transition cursor-pointer w-full shadow-xs"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Combinable Sections Configuration Bar */}
      <div className="border-t border-slate-100 pt-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3.5">Included Content Modules</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
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
                  const val = e.target.checked;
                  setEnableTables(val);
                  if (val) {
                    setEnableFile(false);
                    setEnableText(false);
                    if (tablesList.length === 0) {
                      addPwdTableBlock();
                    }
                  }
                }}
                className="w-4.5 h-4.5 rounded text-green-600 focus:ring-green-500 border-slate-300 cursor-pointer accent-green-600"
              />
              <span className="text-xs uppercase tracking-wider">📊 Data Tables Studio</span>
            </div>
          </label>

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
                onChange={(e) => {
                  const val = e.target.checked;
                  setEnableFile(val);
                  if (val) {
                    setEnableText(false);
                    setEnableTables(false);
                  }
                }}
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
                onChange={(e) => {
                  const val = e.target.checked;
                  setEnableText(val);
                  if (val) {
                    setEnableFile(false);
                    setEnableTables(false);
                  }
                }}
                className="w-4.5 h-4.5 rounded text-green-600 focus:ring-green-500 border-slate-300 cursor-pointer accent-green-600"
              />
              <span className="text-xs uppercase tracking-wider">📝 Rich Description</span>
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
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto text-[var(--primary-color)] shadow-xs group-hover:scale-105 transition-transform">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  {selectedFile ? "File Selected Successfully!" : "Click or Drag to Upload Notice File"}
                </p>
                <p className="text-slate-400 text-xs mt-1">Accepts PDF documents and Images (PNG, JPG, JPEG) up to 10MB.</p>
              </div>
            </div>
          </div>

          {/* New Selected File Review Row */}
          {selectedFile && (
            <div className="bg-green-50/50 p-4 rounded-xl text-xs text-green-800 font-semibold border border-green-200 mt-4 flex items-center justify-between animate-scale-in">
              <div className="flex items-center gap-1.5 min-w-0">
                <span>📎 Selected File:</span>
                <span className="font-extrabold truncate text-green-700 max-w-[200px] sm:max-w-md">{selectedFile.name}</span>
                <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-extrabold">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
                    setModalPreviewUrl(selectedFileUrl);
                    setModalPreviewType(isPdf ? "pdf" : "image");
                    setShowPreviewModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-750 !text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-95 text-[10px] uppercase cursor-pointer border-0"
                >
                  <Eye className="w-3.5 h-3.5 !text-white" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(selectedFileUrl);
                    }
                    setSelectedFileUrl(null);
                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  className="bg-red-600 hover:bg-red-750 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-95 text-[10px] uppercase cursor-pointer border-0"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Existing Document Review Row */}
          {isEdit && notice.filePath && !selectedFile && (
            <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-500 font-semibold border border-slate-200 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span>📎 Existing Attached Document:</span>
                <span className="text-[var(--primary-color)] font-bold truncate max-w-[200px] sm:max-w-md">{notice.filePath.split('/').pop()}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const isPdf = notice.filePath.toLowerCase().endsWith(".pdf");
                  setModalPreviewUrl(notice.filePath);
                  setModalPreviewType(isPdf ? "pdf" : "image");
                  setShowPreviewModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 !text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 text-[10px] uppercase cursor-pointer border-0"
              >
                <Eye className="w-3.5 h-3.5 !text-white" /> Preview Document
              </button>
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
            {tablesList.length === 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addPwdTableBlock}
                  className="bg-green-600 hover:bg-green-750 !text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 active:scale-95 shadow-md hover:shadow-lg border-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 !text-white" /> Add PWD LTM Spreadsheet Table
                </button>
              </div>
            )}
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
                      className="text-white hover:bg-red-700 bg-red-600 border-0 p-2 px-3 rounded-xl transition inline-flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                      title="Delete Entire Table Block"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Table
                    </button>
                  </div>

                  {/* Procuring Entity & Dates Headers Config */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs shrink-0">
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-green-600" /> Notice Sub-Title (Optional)
                      </label>
                      <input 
                        type="text"
                        value={table.subTitle || ""}
                        onChange={(e) => handlePwdFieldChange(tIdx, "subTitle", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[var(--primary-color)] transition"
                        placeholder="যেমন: BADC POLY SEED (OTM Mathod)"
                      />
                    </div>

                    {/* Header Background Color selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Header BG Color</label>
                      <div className="flex items-center gap-1.5 h-8">
                        {[
                          { hex: "#ccffff", name: "Cyan" },
                          { hex: "#ccffcc", name: "Green" },
                          { hex: "#c2ffd8", name: "Sage" },
                          { hex: "#fed7aa", name: "Orange" },
                          { hex: "#e2e8f0", name: "Slate" }
                        ].map((clr) => (
                          <button
                            key={clr.hex}
                            type="button"
                            onClick={() => handlePwdFieldChange(tIdx, "headerBgColor", clr.hex)}
                            className={`w-6 h-6 rounded-lg border transition transform hover:scale-110 active:scale-95 cursor-pointer ${
                              (table.headerBgColor || "#ccffff") === clr.hex ? "border-slate-800 ring-2 ring-slate-400" : "border-slate-200"
                            }`}
                            style={{ backgroundColor: clr.hex }}
                            title={`Set header bg to ${clr.name}`}
                          />
                        ))}
                      </div>
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
                          className="bg-slate-600 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 border-0 shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Column
                        </button>
                        <button 
                          type="button" 
                          onClick={() => addRow(tIdx)}
                          className="bg-[var(--primary-color)] hover:bg-green-700 !text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer border-0"
                        >
                          <Plus className="w-3.5 h-3.5 !text-white" /> Add Row
                        </button>
                      </div>
                    </div>

                    {/* Table grid */}
                    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-inner max-h-[350px] bg-white">
                      <table className="w-full border-collapse text-left text-xs bg-white">
                        <thead className="bg-[#ccffff] border-b border-slate-200 text-black sticky top-0 font-bold">
                          <tr className="divide-x divide-slate-200">
                            {(table.headers || []).map((hdr: string, cIdx: number) => {
                              const headerBg = table.headerBgColor || "#ccffff";
                              const isDescCol = (hdr || "").toLowerCase().includes("description");
                              const minWidthValue = isDescCol ? "400px" : "175px";
                              return (
                                <th 
                                  key={cIdx} 
                                  className="p-3 text-black" 
                                  style={{ backgroundColor: headerBg, minWidth: minWidthValue }}
                                >
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="text" 
                                        required
                                        value={hdr} 
                                        onChange={(e) => handleHeaderChange(tIdx, cIdx, e.target.value)}
                                        className="bg-white/85 border border-slate-250 font-extrabold text-black outline-none w-full focus:bg-white focus:ring-1 focus:ring-green-500 rounded-lg p-1.5 text-[11px]"
                                      />
                                      {((table.type === "pwd_ltm" 
                                        ? (table.headers.length > 9 && cIdx === table.headers.length - 1)
                                        : (table.headers.length > 1 && cIdx === table.headers.length - 1))) && (
                                        <button 
                                          type="button" 
                                          onClick={() => removeColumn(tIdx, cIdx)}
                                          className="text-white hover:bg-red-700 bg-red-600 p-1.5 rounded-lg transition shrink-0 border-0 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                                          title="Delete Column"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Column Cell Color Customizer */}
                                    <div className="flex items-center justify-between px-1">
                                      <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wider">Cell Color:</span>
                                      <div className="flex gap-1">
                                        {[
                                          { hex: "#ffffff", name: "White" },
                                          { hex: "#ffffcc", name: "Yellow" },
                                          { hex: "#d1fae5", name: "Green" },
                                          { hex: "#e0f2fe", name: "Blue" },
                                          { hex: "#ffe4e6", name: "Pink" }
                                        ].map((clr) => (
                                          <button
                                            key={clr.hex}
                                            type="button"
                                            onClick={() => handleColumnColorChange(tIdx, cIdx, clr.hex)}
                                            className={`w-3.5 h-3.5 rounded-full border border-slate-400 transition transform hover:scale-120 active:scale-95 cursor-pointer ${
                                              (table.columnColors?.[cIdx] || "#ffffff") === clr.hex ? "ring-2 ring-slate-650" : ""
                                            }`}
                                            style={{ backgroundColor: clr.hex }}
                                            title={`Set cell background to ${clr.name}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </th>
                              );
                            })}
                            <th className="p-3 w-12 text-center text-slate-700" style={{ backgroundColor: table.headerBgColor || "#ccffff" }}>Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(table.rows || []).map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                              {row.map((cell: string, cIdx: number) => {
                                const headerName = (table.headers[cIdx] || "").toLowerCase();
                                const isDateField = headerName.includes("date") || headerName.includes("time") || headerName.includes("তারিখ") || headerName.includes("সময়");
                                const lastDateColIdx = getLastDateColIdx(table.headers || []);
                                const isLastDateCol = table.type === "pwd_ltm" && cIdx === lastDateColIdx;
                                const cellBg = table.columnColors?.[cIdx] || "#ffffff";
                                return (
                                  <td key={cIdx} className="p-2 border-r border-slate-200 transition-colors duration-250" style={{ backgroundColor: cellBg }}>
                                    {(() => {
                                      const isLocationCol = headerName.includes("location") || headerName.includes("লোকেশন") || headerName.includes("স্থান");
                                      if (isLocationCol) {
                                        return (
                                          <LocationAutocompleteInput
                                            value={cell}
                                            onChange={(val) => handleCellChange(tIdx, rIdx, cIdx, val)}
                                            className={`bg-transparent border-0 outline-none w-full focus:bg-white focus:ring-1 focus:ring-green-500 rounded p-1.5 font-semibold text-slate-800 text-xs`}
                                            placeholder="Type location..."
                                          />
                                        );
                                      }
                                      return (
                                        <input 
                                          type="text" 
                                          required
                                          data-tidx={tIdx}
                                          data-ridx={rIdx}
                                          data-cidx={cIdx}
                                          value={cell} 
                                          onChange={(e) => handleCellChange(tIdx, rIdx, cIdx, e.target.value)}
                                          readOnly={isLastDateCol}
                                          className={`bg-transparent border-0 outline-none w-full focus:bg-white focus:ring-1 focus:ring-green-500 rounded p-1.5 font-semibold text-slate-800 text-xs ${
                                            isLastDateCol
                                              ? "font-bold text-green-700 bg-green-50/10 cursor-not-allowed"
                                              : isDateField
                                                ? "flatpickr-datetime-field cursor-pointer font-bold text-green-700 bg-green-50/10"
                                                : ""
                                          }`}
                                          placeholder={isLastDateCol ? "Synced from Top" : isDateField ? "Select Date & Time..." : ""}
                                        />
                                      );
                                    })()}
                                  </td>
                                );
                              })}
                              <td className="p-2 text-center bg-slate-50/30">
                                {table.rows.length > 1 && (
                                  <button 
                                    type="button" 
                                    onClick={() => removeRow(tIdx, rIdx)}
                                    className="text-white hover:bg-red-750 bg-red-600 p-1.5 rounded-lg transition inline-flex items-center justify-center border-0 shadow-sm active:scale-95 cursor-pointer"
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
                          <Info className="w-3.5 h-3.5 text-slate-400" /> Contact Info / e-Tender Solutions (Fixed)
                        </label>
                        <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-500 text-xs font-semibold cursor-not-allowed select-none leading-relaxed whitespace-pre-line">
                          Engr. Md. Shah Alom B.Sc. Engr.(Civil){"\n"}Mobile No: 01711-805086{"\n"}L M B Market 1st Floor, Pabna.
                        </div>
                        <p className="text-[9px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                          <Info className="w-3 h-3" /> This field is fixed and cannot be edited.
                        </p>
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
      <div className="border-t border-slate-100 pt-6 flex flex-wrap justify-end gap-3 sm:gap-4 shrink-0">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-5 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-bold transition active:scale-95 text-xs uppercase tracking-wider border-0 cursor-pointer"
        >
          Cancel
        </button>

        {(!isEdit || notice?.status !== "active") && (
          <button 
            type="button"
            disabled={loading}
            onClick={(e) => {
              handleSubmit(e as any, "inactive");
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white font-extrabold px-5 py-3 rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-0"
          >
            Save as Draft
          </button>
        )}

        <button 
          type="button"
          disabled={loading}
          onClick={() => {
            let defaultDateOnly = "";
            let defaultTimeOnly = "";
            const currentPublishDate = publishDate || "";
            if (currentPublishDate) {
              const parts = currentPublishDate.trim().split(/\s+/);
              if (parts.length >= 2) {
                defaultDateOnly = parts[0];
                defaultTimeOnly = parts.slice(1).join(" ");
              } else {
                defaultDateOnly = parts[0];
                defaultTimeOnly = "12:00 PM";
              }
            } else {
              const now = new Date();
              const d = String(now.getDate()).padStart(2, "0");
              const m = String(now.getMonth() + 1).padStart(2, "0");
              const y = now.getFullYear();
              defaultDateOnly = `${d}-${m}-${y}`;
              
              let hrs = now.getHours();
              const mins = String(now.getMinutes()).padStart(2, "0");
              const ampm = hrs >= 12 ? 'PM' : 'AM';
              hrs = hrs % 12;
              hrs = hrs ? hrs : 12;
              defaultTimeOnly = `${String(hrs).padStart(2, "0")}:${mins} ${ampm}`;
            }
            setModalScheduledDateOnly(defaultDateOnly);
            setModalScheduledTimeOnly(defaultTimeOnly);
            setModalScheduledDate(currentPublishDate);
            setShowScheduleModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-0"
        >
          <Calendar className="w-4 h-4" /> Schedule
        </button>

        <button 
          type="button"
          disabled={loading}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(e as any, "active");
          }}
          className="bg-[var(--primary-color)] hover:bg-green-700 !text-white font-extrabold px-7 py-3 rounded-xl shadow-lg shadow-green-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2 text-xs uppercase tracking-wider border-0 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? "Updating..." : "Publishing..."}
            </>
          ) : (
            "Publish Notice"
          )}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DYNAMIC DOCUMENT & IMAGE PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {showPreviewModal && modalPreviewUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 select-none animate-scale-in">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full border border-slate-150 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-4 mb-4 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--primary-color)]" /> Document Previewer
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setModalPreviewUrl(null);
                  setModalPreviewType(null);
                }}
                className="text-white bg-slate-600 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition font-bold border-0"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl border border-slate-200 p-2 min-h-0 flex items-center justify-center">
              {modalPreviewType === "image" ? (
                <img
                  src={modalPreviewUrl}
                  alt="Notice Preview"
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-xs mx-auto"
                />
              ) : (
                <iframe
                  src={`${modalPreviewUrl}#toolbar=0`}
                  className="w-full h-[65vh] border-0 rounded-xl"
                  title="PDF Notice Document Preview"
                ></iframe>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setModalPreviewUrl(null);
                  setModalPreviewType(null);
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PREMIUM GLASSMORPHISM SCHEDULE POPUP MODAL */}
      {/* ---------------------------------------------------- */}
      {showScheduleModal && (
        <div 
          onClick={() => setShowScheduleModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 select-none animate-scale-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col relative overflow-hidden"
          >
            {/* Design accents */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex justify-between items-center border-b pb-4 mb-4 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 animate-pulse" /> নোটিশ শিডিউল করুন (Schedule Notice)
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 transition text-lg bg-transparent border-0 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                নোটিশটি স্বয়ংক্রিয়ভাবে পাবলিশ করার জন্য ভবিষ্যতের একটি তারিখ এবং সময় নির্বাচন করুন। নির্ধারিত সময়ের পূর্বে পাবলিক পেজে নোটিশটি লুকানো থাকবে।
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    পাবলিশের তারিখ (Publish Date)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={modalScheduledDateOnly}
                      onChange={(e) => setModalScheduledDateOnly(e.target.value)}
                      placeholder="তারিখ সিলেক্ট করুন..."
                      className="flatpickr-date-modal bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-slate-800 outline-none text-xs font-bold focus:border-indigo-500 focus:bg-white transition cursor-pointer w-full shadow-xs"
                    />
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    পাবলিশের সময় (Publish Time)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={modalScheduledTimeOnly}
                      onChange={(e) => setModalScheduledTimeOnly(e.target.value)}
                      placeholder="সময় সিলেক্ট করুন..."
                      className="flatpickr-time-modal bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-slate-800 outline-none text-xs font-bold focus:border-indigo-500 focus:bg-white transition cursor-pointer w-full shadow-xs"
                    />
                    <Clock className="w-3.5 h-3.5 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalScheduleConfirm}
                className="bg-[var(--primary-color)] hover:bg-green-700 !text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0 shadow-lg shadow-green-600/20 flex items-center gap-1.5"
              >
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
