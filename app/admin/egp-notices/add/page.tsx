"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNotice } from "@/app/actions/notices";

export default function AddNoticePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // For now, setting a dummy authorId. 
    // In a real app, this would come from the session.
    formData.append("authorId", "user_id_placeholder");

    const result = await createNotice(formData);
    if (result.success) {
      router.push("/admin/egp-notices");
    } else {
      alert(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Add New Tender Notice</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Notice Title</label>
            <input 
              name="title" 
              required 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              placeholder="Enter notice title"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Content / Description</label>
            <textarea 
              name="content" 
              required 
              rows={5}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              placeholder="Enter notice details"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select name="category" className="w-full p-3 border rounded-lg outline-none">
              <option value="LTM">LTM</option>
              <option value="OTM">OTM</option>
              <option value="LOTTERY">LOTTERY</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select name="status" className="w-full p-3 border rounded-lg outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Publish Date</label>
            <input 
              type="date" 
              name="publishDate" 
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Last Date</label>
            <input 
              type="date" 
              name="lastDate" 
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Attach File (PDF or Image)</label>
            <input 
              type="file" 
              name="file" 
              accept=".pdf,image/*"
              className="w-full p-3 border rounded-lg outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--shade-1)] file:text-[var(--primary-color)] hover:file:bg-green-100"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Notice"}
          </button>
        </div>
      </form>
    </div>
  );
}
