"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { parseNoticeTableData } from "@/lib/tableEngine/normalizer";
import {
  EmailCategory,
  EmailRecipientDirectory,
  MAIN_SENDER_EMAIL,
  getDefaultEmailDirectory,
  sanitizeEmailList,
} from "@/lib/defaultEmailRecipients";
import {
  Mail,
  Send,
  Copy,
  Check,
  X,
  Plus,
  Building2,
  Users,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Upload,
  FileText,
} from "lucide-react";

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

const DIRECTORY_STORAGE_KEY = "btc_email_directory_v2";

const toBengaliDigits = (numStr: string | number) => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d, 10)]);
};

const toAsciiDigits = (str: string) =>
  str.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

/**
 * Always formats date as dd-mm-yyyy (day-month-year) in Bengali digits
 * using Asia/Dhaka timezone and explicit DD-MM-YYYY / YYYY-MM-DD parsing
 * so local and live servers NEVER swap day and month (e.g. 01-12-2026 -> ০১-১২-২০২৬).
 */
const formatBengaliDate = (dateVal: any): string => {
  if (!dateVal) return "";

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return "";
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(dateVal)
      .replace(/\//g, "-");
    return toBengaliDigits(formatted);
  }

  const rawStr = String(dateVal).trim();
  if (!rawStr) return "";

  const asciiStr = toAsciiDigits(rawStr).replace(/ইং$/u, "").trim();

  // 1. ISO date string like 2026-12-01T17:59:59.999Z -> convert using Asia/Dhaka timezone
  if (/^\d{4}-\d{2}-\d{2}T/.test(asciiStr)) {
    const parsedIso = new Date(asciiStr);
    if (!isNaN(parsedIso.getTime())) {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(parsedIso)
        .replace(/\//g, "-");
      return toBengaliDigits(formatted);
    }
  }

  const datePart = asciiStr.split(/\s+/)[0];

  // 2. Explicit DD-MM-YYYY or DD/MM/YYYY (Bangladesh standard) — NEVER pass to new Date()!
  const dmyMatch = datePart.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${toBengaliDigits(day)}-${toBengaliDigits(month)}-${toBengaliDigits(year)}`;
  }

  // 3. Explicit YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = datePart.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${toBengaliDigits(day)}-${toBengaliDigits(month)}-${toBengaliDigits(year)}`;
  }

  // 4. Fallback standard JS Date in Asia/Dhaka timezone
  try {
    const parsed = new Date(asciiStr);
    if (!isNaN(parsed.getTime())) {
      const formatted = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(parsed)
        .replace(/\//g, "-");
      return toBengaliDigits(formatted);
    }
  } catch {
    // ignore
  }

  return toBengaliDigits(rawStr);
};

const parseTableMeta = (notice: NoticeItem) => {
  let officeName = "";
  let groupCount = 0;
  let lastDate: any = notice.lastDate;

  if (notice.tableData) {
    try {
      const v3Data = parseNoticeTableData(notice.tableData);
      if (v3Data.tables && v3Data.tables.length > 0) {
        officeName =
          v3Data.tables[0].title ||
          (v3Data.tables[0] as any).officeName ||
          "";
        groupCount =
          v3Data.tables.reduce(
            (acc: number, t: any) => acc + (t.rows?.length || 0),
            0,
          ) || 0;
        if (v3Data.tables[0].lastDateBlock)
          lastDate = v3Data.tables[0].lastDateBlock;
      }
    } catch (_) {}
  }
  return { officeName, groupCount, lastDate };
};

const buildDynamicEmail = (notice: NoticeItem) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { officeName, groupCount, lastDate } = parseTableMeta(notice);
  const normalizeStr = (s: string) =>
    s ? s.replace(/\s+/g, "").trim().toLowerCase() : "";

  // Dynamic Subject
  let subject = "টেন্ডার নোটিশ";
  if (groupCount > 0) {
    subject += ` । ${toBengaliDigits(groupCount)} গ্রুপ`;
  }
  if (officeName) {
    subject += ` - ${officeName}`;
  } else if (notice.title) {
    subject += ` - ${notice.title}`;
  }

  // Dynamic Body
  const lines: string[] = [];
  if (groupCount > 0) {
    lines.push(`টেন্ডার নোটিশ । ${toBengaliDigits(groupCount)} গ্রুপ`);
  } else {
    lines.push("টেন্ডার নোটিশ");
  }

  if (officeName) {
    lines.push(`অফিস: ${officeName}`);
  }
  if (notice.title && normalizeStr(notice.title) !== normalizeStr(officeName)) {
    lines.push(`বিবরণ: ${notice.title}`);
  }
  if (lastDate) {
    lines.push(`দরপত্র জমার শেষ তারিখ: ${formatBengaliDate(lastDate)}`);
  }

  lines.push("");
  lines.push(`নোটিশের বিস্তারিত দেখতে লিঙ্কে ক্লিক করুন:`);
  lines.push(`${origin}/egp-notice/${notice.id}`);

  return {
    subject,
    body: lines.join("\n"),
  };
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const MAX_TOTAL_PDF_BYTES = 18 * 1024 * 1024; // 18MB (safe for Gmail 25MB MIME limit)

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function EmailShareButton({ notice }: { notice: NoticeItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [directory, setDirectory] = useState<EmailRecipientDirectory>(() =>
    getDefaultEmailDirectory(),
  );
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [addCategory, setAddCategory] = useState<EmailCategory>("BANK");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [activeListTab, setActiveListTab] = useState<"ALL" | "BANK" | "TENDERER">("ALL");
  const [isEditingMainEmail, setIsEditingMainEmail] = useState(false);
  const [mainEmailDraft, setMainEmailDraft] = useState(MAIN_SENDER_EMAIL);
  const [appPasswordDraft, setAppPasswordDraft] = useState("");
  const [savingMainEmail, setSavingMainEmail] = useState(false);
  const [attachedPdfs, setAttachedPdfs] = useState<File[]>([]);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const activeMainEmail = directory.mainEmail || MAIN_SENDER_EMAIL;

  const allEmails = useMemo(() => {
    const seen = new Set<string>();
    const combined: string[] = [];
    for (const e of [...directory.bank, ...directory.tenderer]) {
      if (!seen.has(e)) {
        seen.add(e);
        combined.push(e);
      }
    }
    return combined;
  }, [directory]);

  const selectedSet = useMemo(() => new Set(selectedEmails), [selectedEmails]);

  const bankSelectedCount = useMemo(
    () => directory.bank.filter((e) => selectedSet.has(e)).length,
    [directory.bank, selectedSet],
  );

  const tendererSelectedCount = useMemo(
    () => directory.tenderer.filter((e) => selectedSet.has(e)).length,
    [directory.tenderer, selectedSet],
  );

  const isAllSelected =
    allEmails.length > 0 && allEmails.every((e) => selectedSet.has(e));
  const isBankAllSelected =
    directory.bank.length > 0 &&
    directory.bank.every((e) => selectedSet.has(e));
  const isTendererAllSelected =
    directory.tenderer.length > 0 &&
    directory.tenderer.every((e) => selectedSet.has(e));

  const filteredBankEmails = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return directory.bank;
    return directory.bank.filter((e) => e.toLowerCase().includes(q));
  }, [directory.bank, searchQuery]);

  const filteredTendererEmails = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return directory.tenderer;
    return directory.tenderer.filter((e) => e.toLowerCase().includes(q));
  }, [directory.tenderer, searchQuery]);

  const saveDirectoryToLocal = (dir: EmailRecipientDirectory) => {
    try {
      localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(dir));
    } catch {
      // ignore storage errors
    }
  };

  const loadDirectory = async () => {
    let loadedDir = getDefaultEmailDirectory();
    try {
      const localRaw = localStorage.getItem(DIRECTORY_STORAGE_KEY);
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed?.bank) && Array.isArray(parsed?.tenderer)) {
          loadedDir = {
            mainEmail:
              typeof parsed?.mainEmail === "string" && isValidEmail(parsed.mainEmail)
                ? parsed.mainEmail.trim().toLowerCase()
                : MAIN_SENDER_EMAIL,
            bank: sanitizeEmailList(parsed.bank),
            tenderer: sanitizeEmailList(parsed.tenderer),
          };
        }
      }
    } catch {
      // fallback to default
    }

    try {
      const res = await fetch("/api/email-recipients", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.directory) {
          loadedDir = {
            mainEmail:
              typeof data.directory.mainEmail === "string" &&
              isValidEmail(data.directory.mainEmail)
                ? data.directory.mainEmail.trim().toLowerCase()
                : MAIN_SENDER_EMAIL,
            bank: sanitizeEmailList(data.directory.bank),
            tenderer: sanitizeEmailList(data.directory.tenderer),
          };
          setSmtpConfigured(Boolean(data.smtpConfigured));
          saveDirectoryToLocal(loadedDir);
        }
      }
    } catch {
      // keep local/default directory if network temporarily unavailable
    }

    setDirectory(loadedDir);
    setMainEmailDraft(loadedDir.mainEmail || MAIN_SENDER_EMAIL);
    setAppPasswordDraft("");
    setIsEditingMainEmail(false);
    const mergedAll = sanitizeEmailList([
      ...loadedDir.bank,
      ...loadedDir.tenderer,
    ]);
    setSelectedEmails(mergedAll);
  };

  const handleOpenModal = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { subject: dynSubject, body: dynBody } = buildDynamicEmail(notice);
    setSubject(dynSubject);
    setBody(dynBody);
    setInputValue("");
    setSearchQuery("");
    setErrorMsg("");
    setStatusMsg("");
    setActiveListTab("ALL");
    setAttachedPdfs([]);
    setIsDraggingPdf(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }

    setIsOpen(true);
    await loadDirectory();
  };

  const handleClose = () => {
    if (sending) return;
    setIsOpen(false);
    setErrorMsg("");
    setStatusMsg("");
    setAttachedPdfs([]);
    setIsDraggingPdf(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleAddPdfFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const validNew: File[] = [];
    let invalidFound = false;

    for (const file of incoming) {
      const lowerName = file.name.toLowerCase();
      const mime = (file.type || "").toLowerCase();
      const isPdf =
        lowerName.endsWith(".pdf") ||
        mime === "application/pdf" ||
        mime === "application/x-pdf";

      if (!isPdf) {
        invalidFound = true;
        continue;
      }

      const alreadyAdded = attachedPdfs.some(
        (existing) => existing.name === file.name && existing.size === file.size,
      );
      if (!alreadyAdded) {
        validNew.push(file);
      }
    }

    if (invalidFound) {
      setErrorMsg("শুধুমাত্র PDF (.pdf) ফাইল যোগ করা যাবে।");
    }

    if (validNew.length === 0) return;

    const currentSize = attachedPdfs.reduce((sum, f) => sum + f.size, 0);
    const addedSize = validNew.reduce((sum, f) => sum + f.size, 0);
    if (currentSize + addedSize > MAX_TOTAL_PDF_BYTES) {
      setErrorMsg("মোট PDF ফাইলের সাইজ ১৮ MB-এর বেশি হতে পারবে না।");
      return;
    }

    if (!invalidFound) {
      setErrorMsg("");
    }
    setAttachedPdfs((prev) => [...prev, ...validNew]);
  };

  const handleRemoveAttachedPdf = (index: number) => {
    setAttachedPdfs((prev) => prev.filter((_, i) => i !== index));
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !sending) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, sending]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails([...allEmails]);
    }
  };

  const toggleCategoryAll = (category: EmailCategory) => {
    const list = category === "BANK" ? directory.bank : directory.tenderer;
    const allInCatSelected = list.length > 0 && list.every((e) => selectedSet.has(e));
    if (allInCatSelected) {
      const catSet = new Set(list);
      setSelectedEmails((prev) => prev.filter((e) => !catSet.has(e)));
    } else {
      setSelectedEmails((prev) => sanitizeEmailList([...prev, ...list]));
    }
  };

  const toggleSingleEmail = (email: string) => {
    const lower = email.trim().toLowerCase();
    setSelectedEmails((prev) =>
      prev.includes(lower) ? prev.filter((e) => e !== lower) : [...prev, lower],
    );
  };

  const handleAddCustomEmails = async () => {
    const raw = inputValue.trim();
    if (!raw) return;

    const tokens = raw
      .split(/[,;\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const valid: string[] = [];
    const invalid: string[] = [];
    tokens.forEach((t) => {
      if (isValidEmail(t)) {
        if (!valid.includes(t)) valid.push(t);
      } else {
        invalid.push(t);
      }
    });

    if (invalid.length > 0) {
      setErrorMsg(`Invalid email format: "${invalid[0]}"`);
      return;
    }
    if (valid.length === 0) return;

    setErrorMsg("");
    const targetKey = addCategory === "BANK" ? "bank" : "tenderer";
    const existingSet = new Set(directory[targetKey]);
    const newlyAdded = valid.filter((e) => !existingSet.has(e));

    const updatedDir: EmailRecipientDirectory = {
      ...directory,
      [targetKey]: [...newlyAdded, ...directory[targetKey]],
    };

    setDirectory(updatedDir);
    saveDirectoryToLocal(updatedDir);
    setSelectedEmails((prev) => sanitizeEmailList([...prev, ...valid]));
    setInputValue("");
    setStatusMsg(
      newlyAdded.length > 0
        ? `${newlyAdded.length}টি নতুন ইমেইল ${addCategory === "BANK" ? "BANK SEND EMAIL" : "TENDERER SEND EMAIL"} ক্যাটাগরিতে যোগ হয়েছে।`
        : "ইমেইলটি ইতিমধ্যে লিস্টে আছে এবং সিলেক্ট করা হয়েছে।",
    );

    try {
      const res = await fetch("/api/email-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          category: addCategory,
          emails: valid,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.directory) {
          setDirectory(data.directory);
          saveDirectoryToLocal(data.directory);
        }
      }
    } catch {
      // already saved locally
    }
  };

  const handleRemoveEmail = async (category: EmailCategory, email: string) => {
    const lower = email.trim().toLowerCase();
    const targetKey = category === "BANK" ? "bank" : "tenderer";
    const updatedDir: EmailRecipientDirectory = {
      ...directory,
      [targetKey]: directory[targetKey].filter((e) => e !== lower),
    };

    setDirectory(updatedDir);
    saveDirectoryToLocal(updatedDir);

    // Only unselect if not present in the other category
    const otherKey = category === "BANK" ? "tenderer" : "bank";
    if (!updatedDir[otherKey].includes(lower)) {
      setSelectedEmails((prev) => prev.filter((e) => e !== lower));
    }

    try {
      const res = await fetch("/api/email-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          category,
          email: lower,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.directory) {
          setDirectory(data.directory);
          saveDirectoryToLocal(data.directory);
        }
      }
    } catch {
      // already updated locally
    }
  };

  const handleSaveMainEmail = async () => {
    const cleaned = mainEmailDraft.trim().toLowerCase();
    if (!isValidEmail(cleaned)) {
      setErrorMsg("সঠিক Main Email অ্যাড্রেস লিখুন।");
      return;
    }

    setSavingMainEmail(true);
    setErrorMsg("");
    setStatusMsg("");

    const updatedDir: EmailRecipientDirectory = {
      ...directory,
      mainEmail: cleaned,
    };
    setDirectory(updatedDir);
    saveDirectoryToLocal(updatedDir);

    try {
      const payload: Record<string, string> = {
        action: "updateMainEmail",
        mainEmail: cleaned,
      };
      if (appPasswordDraft.trim()) {
        payload.appPassword = appPasswordDraft.trim();
      }
      const res = await fetch("/api/email-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.directory) {
          setDirectory(data.directory);
          saveDirectoryToLocal(data.directory);
          setSmtpConfigured(Boolean(data.smtpConfigured));
        }
      }
      setIsEditingMainEmail(false);
      setAppPasswordDraft("");
      setStatusMsg(`Main Email আপডেট হয়ে "${cleaned}" সেট করা হয়েছে।`);
    } catch {
      setIsEditingMainEmail(false);
      setStatusMsg(`Main Email "${cleaned}" সেট করা হয়েছে।`);
    } finally {
      setSavingMainEmail(false);
    }
  };

  const openGmailFallback = (finalRecipients: string[]) => {
    const suParam = encodeURIComponent(subject);
    const bodyParam = encodeURIComponent(body);
    const recipientsCsv = finalRecipients.join(",");
    const encodedRecipients = encodeURIComponent(recipientsCsv);

    // Gmail Web URL breaks above ~1800 chars; keep it safe so live/local NEVER gets 414 error
    if (encodedRecipients.length <= 1400) {
      const gmailUrl = `https://mail.google.com/mail/?authuser=${encodeURIComponent(activeMainEmail)}&view=cm&fs=1&to=${encodedRecipients}&su=${suParam}&body=${bodyParam}`;
      window.open(gmailUrl, "_blank");
      setStatusMsg(
        `Gmail ওপেন হয়েছে (${finalRecipients.length}টি ইমেইল)। প্রতিটি ইমেইলে আলাদাভাবে সরাসরি ${activeMainEmail} থেকে পাঠাতে App Password সেট করুন।`,
      );
    } else {
      navigator.clipboard?.writeText(recipientsCsv).catch(() => {});
      const gmailUrl = `https://mail.google.com/mail/?authuser=${encodeURIComponent(activeMainEmail)}&view=cm&fs=1&su=${suParam}&body=${bodyParam}`;
      window.open(gmailUrl, "_blank");
      setStatusMsg(
        `সব ${finalRecipients.length}টি সিলেক্টেড ইমেইল কপি করা হয়েছে। Gmail-এ পেস্ট করে Send করুন (অথবা প্রতিটি ইমেইলে আলাদাভাবে ১ ক্লিকে সরাসরি ${activeMainEmail} থেকে পাঠাতে App Password সেট করুন)।`,
      );
    }
  };

  const handleSendEmail = async () => {
    setErrorMsg("");
    setStatusMsg("");

    // Include any typed email in the input box if valid
    let finalRecipients = [...selectedEmails];
    if (inputValue.trim()) {
      const typedTokens = inputValue
        .split(/[,;\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter((t) => isValidEmail(t));
      finalRecipients = sanitizeEmailList([...finalRecipients, ...typedTokens]);
    }

    if (finalRecipients.length === 0) {
      setErrorMsg("অন্তত একটি প্রাপকের ইমেইল সিলেক্ট করুন।");
      return;
    }

    setSending(true);
    try {
      let res: Response;
      if (attachedPdfs.length > 0) {
        const formData = new FormData();
        formData.append("fromEmail", activeMainEmail);
        formData.append("recipients", JSON.stringify(finalRecipients));
        formData.append("subject", subject);
        formData.append("body", body);
        attachedPdfs.forEach((file) => {
          formData.append("attachments", file);
        });
        res = await fetch("/api/notices/send-email", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/notices/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: activeMainEmail,
            recipients: finalRecipients,
            subject,
            body,
          }),
        });
      }
      const data = await res.json();

      if (data?.success && data?.mode === "smtp") {
        setStatusMsg(
          data.message ||
            `${finalRecipients.length}টি ইমেইলে আলাদাভাবে মেসেজ সফলভাবে পাঠানো হয়েছে`,
        );
      } else if (data?.mode === "gmail_fallback") {
        openGmailFallback(finalRecipients);
      } else {
        setErrorMsg(data?.message || "ইমেইল পাঠাতে সমস্যা হয়েছে।");
      }
    } catch {
      openGmailFallback(finalRecipients);
    } finally {
      setSending(false);
    }
  };

  const handleCopyText = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  const handleCopySelectedEmails = () => {
    if (selectedEmails.length === 0) {
      setErrorMsg("কপি করার জন্য অন্তত একটি ইমেইল সিলেক্ট করুন।");
      return;
    }
    navigator.clipboard.writeText(selectedEmails.join(", ")).then(() => {
      setCopiedEmails(true);
      setTimeout(() => setCopiedEmails(false), 2000);
    });
  };

  return (
    <>
      {/* Action Button in Notices Table */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition inline-flex items-center justify-center border-0 active:scale-95 shadow-sm cursor-pointer"
        title="Share via Email"
      >
        <Mail className="w-4 h-4 text-white" />
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[1050] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl border border-slate-100 shadow-2xl flex flex-col max-h-[94vh] relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />

            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 pt-5 pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-slate-800 font-extrabold text-base leading-tight">
                    Send Notice via Email
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    ইমেইলে নোটিশ পাঠান ও ব্যাংক / ঠিকাদার নির্বাচন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 rounded-xl flex items-center justify-center transition border-0 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Editable Main Sender Email */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl px-3.5 py-2.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-600 shrink-0">
                      Main Email (From):
                    </span>
                    {!isEditingMainEmail && (
                      <>
                        <span className="text-xs font-extrabold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-lg truncate">
                          {activeMainEmail}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMainEmailDraft(activeMainEmail);
                            setAppPasswordDraft("");
                            setIsEditingMainEmail(true);
                            setErrorMsg("");
                          }}
                          className="inline-flex items-center gap-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="Edit Main Sender Email"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Selected: {selectedEmails.length} / {allEmails.length}
                    </span>
                    {smtpConfigured ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Direct Send Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        Set GMAIL_APP_PASSWORD in .env
                      </span>
                    )}
                  </div>
                </div>

                {isEditingMainEmail && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      name="btc-main-sender-email"
                      autoComplete="off"
                      value={mainEmailDraft}
                      onChange={(e) => {
                        setMainEmailDraft(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveMainEmail();
                        }
                      }}
                      placeholder="Enter main sender email..."
                      className="flex-1 bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <input
                      type="text"
                      name="btc-gmail-app-code"
                      autoComplete="off"
                      spellCheck={false}
                      value={appPasswordDraft}
                      onChange={(e) => setAppPasswordDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveMainEmail();
                        }
                      }}
                      placeholder="App Password (16-digit code)"
                      className="sm:w-52 bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleSaveMainEmail}
                        disabled={savingMainEmail}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer border-0 disabled:opacity-50"
                      >
                        {savingMainEmail ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingMainEmail(false);
                          setMainEmailDraft(activeMainEmail);
                          setAppPasswordDraft("");
                        }}
                        disabled={savingMainEmail}
                        className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Custom Email by Category */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Add Custom Email (ক্যাটাগরি অনুযায়ী ইমেইল যোগ করুন):
                  </label>
                  <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setAddCategory("BANK")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border-0 ${
                        addCategory === "BANK"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-transparent text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      BANK SEND EMAIL
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddCategory("TENDERER")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border-0 ${
                        addCategory === "TENDERER"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-transparent text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      TENDERER SEND EMAIL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomEmails();
                      }
                    }}
                    placeholder={`Add to ${addCategory === "BANK" ? "BANK SEND EMAIL" : "TENDERER SEND EMAIL"} (comma/space separated)...`}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEmails}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 inline-flex items-center justify-center gap-1 cursor-pointer border-0 shadow-sm shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Email</span>
                  </button>
                </div>
              </div>

              {/* Master Select All + Search + Category Filter Tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="p-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  {/* Master Select All Checkbox */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-slate-800">
                      Select All ({allEmails.length})
                    </span>
                  </label>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveListTab("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        activeListTab === "ALL"
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      All ({allEmails.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveListTab("BANK")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        activeListTab === "BANK"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      Bank ({bankSelectedCount}/{directory.bank.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveListTab("TENDERER")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                        activeListTab === "TENDERER"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      Tenderer ({tendererSelectedCount}/{directory.tenderer.length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search email..."
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Categorized Recipient Lists */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-200">
                  {/* Category 1: BANK SEND EMAIL */}
                  {(activeListTab === "ALL" || activeListTab === "BANK") && (
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isBankAllSelected}
                            onChange={() => toggleCategoryAll("BANK")}
                            className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                          />
                          <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                            BANK SEND EMAIL
                          </span>
                        </label>
                        <span className="text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                          {bankSelectedCount} / {directory.bank.length} টি ইমেইল
                        </span>
                      </div>

                      {filteredBankEmails.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {filteredBankEmails.map((email) => {
                            const checked = selectedSet.has(email);
                            return (
                              <div
                                key={`bank-${email}`}
                                className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition ${
                                  checked
                                    ? "bg-emerald-50/70 border-emerald-300 text-slate-800 font-semibold"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSingleEmail(email)}
                                    className="w-3.5 h-3.5 rounded accent-emerald-600 shrink-0 cursor-pointer"
                                  />
                                  <span className="truncate" title={email}>
                                    {email}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmail("BANK", email)}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-0.5 transition border-0 bg-transparent cursor-pointer shrink-0"
                                  title="Remove email from BANK SEND EMAIL"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic px-1">
                          No bank emails found.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Category 2: TENDERER SEND EMAIL */}
                  {(activeListTab === "ALL" || activeListTab === "TENDERER") && (
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isTendererAllSelected}
                            onChange={() => toggleCategoryAll("TENDERER")}
                            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                          />
                          <Users className="w-3.5 h-3.5 text-indigo-700" />
                          <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wide">
                            TENDERER SEND EMAIL
                          </span>
                        </label>
                        <span className="text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full">
                          {tendererSelectedCount} / {directory.tenderer.length} টি ইমেইল
                        </span>
                      </div>

                      {filteredTendererEmails.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {filteredTendererEmails.map((email) => {
                            const checked = selectedSet.has(email);
                            return (
                              <div
                                key={`tenderer-${email}`}
                                className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition ${
                                  checked
                                    ? "bg-indigo-50/70 border-indigo-300 text-slate-800 font-semibold"
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleSingleEmail(email)}
                                    className="w-3.5 h-3.5 rounded accent-indigo-600 shrink-0 cursor-pointer"
                                  />
                                  <span className="truncate" title={email}>
                                    {email}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveEmail("TENDERER", email)
                                  }
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-0.5 transition border-0 bg-transparent cursor-pointer shrink-0"
                                  title="Remove email from TENDERER SEND EMAIL"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic px-1">
                          No tenderer emails found.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Subject / বিষয়:
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  placeholder="Email subject..."
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Message / বার্তা:
                </label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition font-mono whitespace-pre-wrap leading-relaxed"
                  placeholder="Email body text..."
                />
              </div>

              {/* Optional PDF Attachment (Import / Drag & Drop) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Attach PDF File / পিডিএফ ফাইল যোগ করুন (ঐচ্ছিক):</span>
                  {attachedPdfs.length > 0 && (
                    <span className="text-[11px] font-bold text-indigo-600">
                      {attachedPdfs.length} টি PDF যুক্ত
                    </span>
                  )}
                </label>

                <div
                  onClick={() => pdfInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isDraggingPdf) setIsDraggingPdf(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingPdf(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDraggingPdf(false);
                    handleAddPdfFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-xl px-4 py-3 text-center transition cursor-pointer select-none ${
                    isDraggingPdf
                      ? "border-indigo-500 bg-indigo-50/80"
                      : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/40"
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={(e) => {
                      handleAddPdfFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-700">
                        PDF ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা{" "}
                        <span className="text-indigo-600 underline">
                          Import / Browse
                        </span>{" "}
                        করুন
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        শুধুমাত্র PDF ফাইল (সর্বোচ্চ ১৮ MB) — মেসেজের সাথে সরাসরি ইমেইলে যাবে
                      </p>
                    </div>
                  </div>
                </div>

                {attachedPdfs.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    {attachedPdfs.map((file, idx) => (
                      <div
                        key={`${file.name}-${file.size}-${idx}`}
                        className="flex items-center justify-between gap-2 bg-indigo-50/60 border border-indigo-200 rounded-xl px-3 py-1.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                          <span
                            className="text-xs font-semibold text-slate-800 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 shrink-0">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttachedPdf(idx);
                          }}
                          disabled={sending}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1 transition border-0 bg-transparent cursor-pointer shrink-0 disabled:opacity-50"
                          title="Remove PDF"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Always-Visible Status / Error Alerts right above Footer */}
            {(errorMsg || statusMsg) && (
              <div className="px-5 pt-2.5 pb-1 bg-white border-t border-slate-100 shrink-0 space-y-1.5">
                {errorMsg && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {statusMsg && (
                  <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{statusMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 shrink-0">
              {/* Utility Copy Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer"
                  title="Copy message to clipboard"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopySelectedEmails}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer"
                  title="Copy all selected email addresses"
                >
                  {copiedEmails ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Emails Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Emails ({selectedEmails.length})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={sending}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sending || selectedEmails.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0 inline-flex items-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50"
                  title={`Send from ${activeMainEmail}`}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {smtpConfigured
                          ? `Send Email (${selectedEmails.length})`
                          : `Send via Gmail (${selectedEmails.length})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
