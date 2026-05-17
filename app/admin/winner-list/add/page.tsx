"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createWinner } from "@/app/actions/winners";
import { ChevronDown, Check, Calendar } from "lucide-react";

export default function AddWinnerPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Custom states
  const [status, setStatus] = useState("active");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [publishDate, setPublishDate] = useState("");

  // Initialize Flatpickr CDN
  useEffect(() => {
    if (!document.getElementById("flatpickr-css")) {
      const link = document.createElement("link");
      link.id = "flatpickr-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
      document.head.appendChild(link);
    }

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
          onChange: (selectedDates: any, dateStr: string) => {
            setPublishDate(dateStr);
          }
        });
      }
    }
  }, []);

  // Global click listener to close dropdown
  useEffect(() => {
    const handleClose = () => setOpenStatusDropdown(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("authorId", "user_id_placeholder");
    
    // Explicitly set custom state values in FormData
    formData.set("status", status);
    formData.set("publishDate", publishDate);

    const result = await createWinner(formData);
    if (result.success) {
      router.push("/admin/winner-list");
    } else {
      alert(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Add New Winner</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Winner List Title</label>
            <input 
              name="title" 
              required 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition text-sm font-semibold shadow-xs"
              placeholder="Enter winner list title"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content / Description</label>
            <textarea 
              name="content" 
              required 
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:border-[var(--primary-color)] focus:bg-white focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition text-sm font-semibold shadow-xs"
              placeholder="Enter winner details"
            ></textarea>
          </div>

          {/* Status Dropdown replaced with Custom Dropdown */}
          <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <button
              type="button"
              onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-semibold focus:border-[var(--primary-color)] hover:border-slate-300 transition cursor-pointer flex justify-between items-center shadow-xs h-[46px]"
            >
              <span>{status === "active" ? "Active" : "Inactive"}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openStatusDropdown ? "rotate-180" : ""}`} />
            </button>

            {openStatusDropdown && (
              <div className="absolute top-[100%] left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 w-full animate-scale-in">
                {[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setStatus(opt.value);
                      setOpenStatusDropdown(false);
                    }}
                    className={`px-4 py-3.5 text-xs font-bold hover:bg-green-50 hover:text-green-700 transition cursor-pointer flex items-center justify-between ${
                      status === opt.value ? "bg-green-50 text-green-700" : "text-slate-600"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {status === opt.value && <Check className="w-3.5 h-3.5 text-green-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish Date Input replaced with Custom Calendar */}
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
                className="flatpickr-date bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 outline-none text-sm font-semibold focus:border-[var(--primary-color)] focus:bg-white transition cursor-pointer w-full shadow-xs h-[46px]"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attach Result Document (PDF or Image)</label>
            <input 
              type="file" 
              name="file" 
              accept=".pdf,image/*"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 hover:text-slate-700 outline-none transition text-sm font-semibold shadow-xs file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-green-50 file:text-[var(--primary-color)] hover:file:bg-green-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[var(--primary-color)] hover:bg-green-700 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-green-600/20 transition active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            {loading ? "Adding..." : "Save Winner"}
          </button>
        </div>
      </form>
    </div>
  );
}
