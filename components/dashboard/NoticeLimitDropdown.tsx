"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function NoticeLimitDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLimit = searchParams.get("limit") || "10";
  const limits = ["10", "30", "50", "100"];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (limit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", limit);
    params.set("page", "1"); // Reset to page 1 on limit change
    router.push(`/admin/egp-notices?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer min-w-[100px] shadow-xs"
      >
        <span>Show {currentLimit}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {limits.map((limit) => (
            <button
              key={limit}
              type="button"
              onClick={() => handleSelect(limit)}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                currentLimit === limit
                  ? "bg-green-50 text-[var(--primary-color)]"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {limit} items
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
