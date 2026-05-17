import Link from "next/link";
import { getNotices, deleteNotice } from "@/app/actions/notices";
import DeleteButton from "@/components/dashboard/DeleteButton";
import { 
  Plus, 
  Search, 
  Calendar, 
  FileCheck2, 
  Edit3, 
  Trash2,
  FileSpreadsheet,
  FileText,
  FileDown
} from "lucide-react";

export const revalidate = 0; // Live data

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const allNotices = await getNotices();
  const query = searchParams?.search?.toLowerCase() || "";
  
  const notices = query
    ? allNotices.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          (n.year && n.year.toLowerCase().includes(query)) ||
          n.category.toLowerCase().includes(query)
      )
    : allNotices;

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[var(--primary-color)]" />
            Tender Notices
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track your active, inactive, file-based, or table-grid notices.</p>
        </div>
        <Link 
          href="/admin/egp-notices/add" 
          className="bg-[var(--primary-color)] text-white hover:bg-green-700 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-green-600/20 text-sm flex items-center gap-2 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Notice
        </Link>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Title & Type</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Year</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Publish Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {notices.map((notice) => {
                return (
                  <tr key={notice.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-slate-800 font-bold line-clamp-1">{notice.title}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                          {notice.type === "FILE" && (
                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                              <FileDown className="w-3 h-3" />
                              File
                            </span>
                          )}
                          {notice.type === "TEXT" && (
                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                              <FileText className="w-3 h-3" />
                              Text
                            </span>
                          )}
                          {notice.type === "TABLE" && (
                            <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                              <FileSpreadsheet className="w-3 h-3" />
                              Table
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full font-bold uppercase tracking-wider">
                        {notice.category.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-semibold">
                      {notice.year || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
                        notice.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {notice.status === "active" ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link 
                          href={`/admin/egp-notices/edit/${notice.id}`} 
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition inline-flex items-center justify-center border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        
                        <div className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition inline-flex items-center justify-center border border-transparent hover:border-rose-100">
                          <DeleteButton id={notice.id} action={deleteNotice} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {notices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-semibold text-sm">
                    No procurement notices found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
