"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWinner } from "@/app/actions/winners";

export default function EditWinnerForm({ winner }: { winner: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("existingFilePath", winner.filePath || "");

    const result = await updateWinner(winner.id, formData);
    if (result.success) {
      router.push("/admin/winner-list");
    } else {
      alert(result.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Winner List Title</label>
          <input 
            name="title" 
            required 
            defaultValue={winner.title}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Content / Description</label>
          <textarea 
            name="content" 
            required 
            rows={5}
            defaultValue={winner.content}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select name="status" defaultValue={winner.status} className="w-full p-3 border rounded-lg outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Publish Date</label>
          <input 
            type="date" 
            name="publishDate" 
            defaultValue={winner.publishDate ? new Date(winner.publishDate).toISOString().split('T')[0] : ""}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-gray-700">Replace Result Document (Optional)</label>
          <input 
            type="file" 
            name="file" 
            accept=".pdf,image/*"
            className="w-full p-3 border rounded-lg outline-none"
          />
          {winner.filePath && (
            <p className="text-xs text-gray-400 italic">Current file: {winner.filePath}</p>
          )}
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
          {loading ? "Updating..." : "Update Winner"}
        </button>
      </div>
    </form>
  );
}
