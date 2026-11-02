"use client";

import React, { useState, useEffect } from "react";
import { parseNoticeTableData } from "@/lib/tableEngine/normalizer";
import { getSystemEmailRecipients } from "@/app/actions/notices";
import {
  Mail,
  Send,
  Copy,
  Check,
  X,
  Plus,
  Users,
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

interface SavedEmailItem {
  email: string;
  name?: string;
}

const STORAGE_KEY = "btc_recent_emails";

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
            0
          ) || 0;
        if (v3Data.tables[0].lastDateBlock)
          lastDate = v3Data.tables[0].lastDateBlock;
      }
    } catch (_) { }
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

export default function EmailShareButton({ notice }: { notice: NoticeItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [savedEmails, setSavedEmails] = useState<SavedEmailItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load saved emails from localStorage and seed with system users
  const loadSavedEmails = async () => {
    let localList: SavedEmailItem[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        localList = JSON.parse(stored);
      }
    } catch (_) {}

    try {
      const res = await getSystemEmailRecipients();
      if (res.success && res.users) {
        // Merge system users into local list if not already present
        res.users.forEach((u: any) => {
          const lower = u.email.toLowerCase();
          if (!localList.some((item) => item.email.toLowerCase() === lower)) {
            localList.push({ email: lower, name: u.name });
          }
        });
      }
    } catch (_) {}

    const capped = localList.slice(0, 10);
    setSavedEmails(capped);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    } catch (_) {}
  };

  const handleOpenModal = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { subject: dynSubject, body: dynBody } = buildDynamicEmail(notice);
    setSubject(dynSubject);
    setBody(dynBody);
    setInputValue("");
    setErrorMsg("");

    setIsOpen(true);
    await loadSavedEmails();
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMsg("");
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Persist newly added emails to the saved 10 list
  const persistRecentEmails = (newEmails: string[]) => {
    setSavedEmails((prev) => {
      const existing = [...prev];
      newEmails.forEach((email) => {
        const lower = email.trim().toLowerCase();
        if (isValidEmail(lower)) {
          const idx = existing.findIndex(
            (item) => item.email.toLowerCase() === lower
          );
          if (idx !== -1) {
            // Move to top
            const [item] = existing.splice(idx, 1);
            existing.unshift(item);
          } else {
            // Add to top
            existing.unshift({ email: lower });
          }
        }
      });
      const updated = existing.slice(0, 10);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Remove an email permanently from the saved 10 list
  const removeSavedEmail = (emailToRemove: string) => {
    setSavedEmails((prev) => {
      const updated = prev.filter(
        (item) => item.email.toLowerCase() !== emailToRemove.toLowerCase()
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const addEmailsFromText = (text: string) => {
    const tokens = text
      .split(/[,;\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let addedCount = 0;
    const newRecipients = [...recipients];
    const successfullyAdded: string[] = [];

    tokens.forEach((t) => {
      if (isValidEmail(t)) {
        if (!newRecipients.includes(t)) {
          newRecipients.push(t);
          successfullyAdded.push(t);
          addedCount++;
        }
      } else if (t.length > 0) {
        setErrorMsg(`Invalid email format: "${t}"`);
      }
    });

    if (addedCount > 0) {
      setRecipients(newRecipients);
      setInputValue("");
      persistRecentEmails(successfullyAdded);
      if (!errorMsg.startsWith("Invalid")) {
        setErrorMsg("");
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmailsFromText(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && recipients.length > 0) {
      setRecipients(recipients.slice(0, -1));
    }
  };

  const removeRecipient = (indexToRemove: number) => {
    setRecipients(recipients.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleRecipientEmail = (email: string) => {
    const lower = email.trim().toLowerCase();
    if (recipients.includes(lower)) {
      setRecipients(recipients.filter((e) => e !== lower));
    } else {
      setRecipients([...recipients, lower]);
      persistRecentEmails([lower]);
    }
  };

  const collectFinalRecipients = () => {
    const final = [...recipients];
    if (inputValue.trim()) {
      const tokens = inputValue
        .split(/[,;\s]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      tokens.forEach((t) => {
        if (isValidEmail(t) && !final.includes(t)) {
          final.push(t);
        }
      });
      persistRecentEmails(tokens);
    }
    return final;
  };

  const handleSendGmail = () => {
    const finalRecipients = collectFinalRecipients();
    const toParam = encodeURIComponent(finalRecipients.join(","));
    const suParam = encodeURIComponent(subject);
    const bodyParam = encodeURIComponent(body);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toParam}&su=${suParam}&body=${bodyParam}`;
    window.open(gmailUrl, "_blank");
  };

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[1050] flex items-center justify-center p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl border border-slate-100 shadow-2xl flex flex-col max-h-[92vh] relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-slate-800 font-extrabold text-base leading-tight">
                    Send Notice via Email
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    ইমেইলে নোটিশ পাঠান ও ঠিকাদার নির্বাচন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-8 h-8 rounded-xl flex items-center justify-center transition border-0 cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Recipients Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    To / প্রাপকের ইমেইল:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-normal">
                      (Press Enter or comma to add multiple)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (inputValue.trim()) {
                          addEmailsFromText(inputValue);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition active:scale-95 inline-flex items-center gap-1 cursor-pointer border-0 shadow-sm"
                      title="Add typed email address"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 items-center focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                  {recipients.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg animate-scale-in"
                    >
                      <Mail className="w-3 h-3 text-indigo-500" />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(idx)}
                        className="text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded p-0.5 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    onKeyDown={handleInputKeyDown}
                    onBlur={() => {
                      if (inputValue.trim()) {
                        addEmailsFromText(inputValue);
                      }
                    }}
                    placeholder={
                      recipients.length === 0
                        ? "Type email (e.g. user@gmail.com, multiple supported)..."
                        : "Add another email..."
                    }
                    className="flex-1 min-w-[180px] bg-transparent text-xs text-slate-800 outline-none px-1.5 py-1 font-medium placeholder:text-slate-400"
                  />
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errorMsg}
                  </p>
                )}

                {/* Quick Select Users (Latest 10 Saved Emails) */}
                {savedEmails.length > 0 && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Quick Select Users (Latest 10):</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">
                        Click to add • × to delete
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {savedEmails.slice(0, 10).map((item) => {
                        const isSelected = recipients.includes(
                          item.email.toLowerCase()
                        );
                        return (
                          <div
                            key={item.email}
                            className={`inline-flex items-center text-[11px] font-semibold rounded-lg transition border overflow-hidden shadow-xs ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleRecipientEmail(item.email)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 cursor-pointer bg-transparent border-0 text-inherit font-inherit"
                              title={
                                isSelected
                                  ? "Click to remove from To field"
                                  : "Click to add to To field"
                              }
                            >
                              {isSelected ? (
                                <Check className="w-3 h-3 text-white" />
                              ) : (
                                <Plus className="w-3 h-3 text-slate-400" />
                              )}
                              <span>{item.name || item.email}</span>
                              {item.name && item.name !== item.email && (
                                <span className="opacity-70 text-[10px]">
                                  ({item.email})
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSavedEmail(item.email);
                              }}
                              className={`px-1.5 py-1 border-l transition cursor-pointer bg-transparent border-t-0 border-b-0 border-r-0 ${
                                isSelected
                                  ? "border-indigo-400 hover:bg-indigo-700 text-indigo-100"
                                  : "border-slate-200 hover:bg-slate-200 text-slate-400 hover:text-red-600"
                              }`}
                              title="Delete from saved list"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Message / বার্তা:
                </label>
                <textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition font-mono whitespace-pre-wrap leading-relaxed"
                  placeholder="Email body text..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 shrink-0">
              {/* Copy Message Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer"
                title="Copy message to clipboard"
              >
                {copied ? (
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0"
                >
                  Cancel
                </button>

                {/* Send via Gmail Web */}
                <button
                  type="button"
                  onClick={handleSendGmail}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border-0 inline-flex items-center gap-1.5 shadow-md shadow-indigo-200"
                  title="Open compose in Gmail"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
