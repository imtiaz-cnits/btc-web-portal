"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateNotice } from "@/app/actions/notices";

export default function EditNoticeForm({ notice }: { notice: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("existingFilePath", notice.filePath || "");

    const result = await updateNotice(notice.id, formData);
    if (result.success) {
      router.push("/admin/egp-notices");
    } else {
      alert(result.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Notice Title</label>
          <input 
            name="title" 
            required 
            defaultValue={notice.title}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Content / Description</label>
          <textarea 
            name="content" 
            required 
            rows={5}
            defaultValue={notice.content}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <select name="category" defaultValue={notice.category} className="w-full p-3 border rounded-lg outline-none">
            <option value="LTM">LTM</option>
            <option value="OTM">OTM</option>
            <option value="LOTTERY">LOTTERY</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select name="status" defaultValue={notice.status} className="w-full p-3 border rounded-lg outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Publish Date</label>
          <input 
            type="date" 
            name="publishDate" 
            defaultValue={notice.publishDate ? new Date(notice.publishDate).toISOString().split('T')[0] : ""}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Last Date</label>
          <input 
            type="date" 
            name="lastDate" 
            defaultValue={notice.lastDate ? new Date(notice.lastDate).toISOString().split('T')[0] : ""}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Replace File (Optional)</label>
          <input 
            type="file" 
            name="file" 
            accept=".pdf,image/*"
            className="w-full p-3 border rounded-lg outline-none"
          />
          {notice.filePath && (
            <p className="text-xs text-gray-400 italic">Current file: {notice.filePath}</p>
          )}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition border-0 active:scale-95 shadow-sm cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-8 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Notice"}
        </button>
      </div>
    </form>
  );
}
