import Link from "next/link";
import { getNotices } from "@/app/actions/notices";
import NoticeLimitDropdown from "@/components/dashboard/NoticeLimitDropdown";
import NoticesTable from "@/components/dashboard/NoticesTable";
import {
  Plus,
  FileCheck2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const revalidate = 0; // Live data

export default async function AdminNoticesPage({
  searchParams,
}: {
  searchParams: { search?: string; filter?: string; page?: string; limit?: string };
}) {
  const allNotices = await getNotices();
  const query = searchParams?.search?.toLowerCase() || "";
  const filter = searchParams?.filter || "all"; // 'all', 'published', 'draft'
  const currentPage = parseInt(searchParams?.page || "1", 10);
  const currentLimit = parseInt(searchParams?.limit || "10", 10);

  // Filter based on search query
  let filtered = allNotices;
  if (query) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        (n.year && n.year.toLowerCase().includes(query)) ||
        n.category.toLowerCase().includes(query)
    );
  }

  // Count matches based on search query before status filter
  const now = new Date();
  const totalCount = filtered.filter(n => !(n.status === "active" && n.publishDate && new Date(n.publishDate) > now)).length;
  const activeCount = filtered.filter(n => 
    n.status === "active" && 
    (!n.publishDate || new Date(n.publishDate) <= now) &&
    (n.category === "LOTTERY_RESULT" || !n.lastDate || new Date(n.lastDate) >= now)
  ).length;
  const draftCount = filtered.filter(n => n.status !== "active").length;
  const scheduledCount = filtered.filter(n => n.status === "active" && n.publishDate && new Date(n.publishDate) > now).length;
  const pendingCount = filtered.filter(n => 
    n.status === "active" && 
    n.lastDate && 
    new Date(n.lastDate) < now && 
    n.category !== "LOTTERY_RESULT"
  ).length;
  const winnersCount = filtered.filter(n => 
    n.status === "active" && 
    n.category === "LOTTERY_RESULT"
  ).length;

  // Filter based on status tabs
  let notices = filtered;
  if (filter === "all") {
    notices = filtered.filter(n => !(n.status === "active" && n.publishDate && new Date(n.publishDate) > now));
  } else if (filter === "published") {
    notices = filtered.filter(n => 
      n.status === "active" && 
      (!n.publishDate || new Date(n.publishDate) <= now) &&
      (n.category === "LOTTERY_RESULT" || !n.lastDate || new Date(n.lastDate) >= now)
    );
  } else if (filter === "draft") {
    notices = filtered.filter(n => n.status !== "active");
  } else if (filter === "scheduled") {
    notices = filtered.filter(n => n.status === "active" && n.publishDate && new Date(n.publishDate) > now);
  } else if (filter === "pending") {
    notices = filtered.filter(n => 
      n.status === "active" && 
      n.lastDate && 
      new Date(n.lastDate) < now && 
      n.category !== "LOTTERY_RESULT"
    );
  } else if (filter === "winners") {
    notices = filtered.filter(n => 
      n.status === "active" && 
      n.category === "LOTTERY_RESULT"
    );
  }

  // Sort notices by publishDate descending (fallback to createdAt descending) to ensure recent notices are always on top
  notices.sort((a, b) => {
    const dateA = a.publishDate ? new Date(a.publishDate).getTime() : new Date(a.createdAt).getTime();
    const dateB = b.publishDate ? new Date(b.publishDate).getTime() : new Date(b.createdAt).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination calculation
  const totalPages = Math.ceil(notices.length / currentLimit);
  // Cap current page if out of bounds
  const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedNotices = notices.slice(
    (activePage - 1) * currentLimit,
    activePage * currentLimit
  );

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[var(--primary-color)]" />
            Tender Notices
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and track your active, inactive, file-based, or table-grid notices.</p>
        </div>
        <Link
          href="/admin/egp-notices/add"
          className="bg-[var(--primary-color)] !text-white hover:bg-green-700 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-green-600/20 text-sm flex items-center gap-2 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 !text-white" />
          Add Notice
        </Link>
      </div>

      {/* Premium Filter Tabs & Limit Selector */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-px shrink-0 select-none">
        <div className="flex gap-2">
          <Link
            href={`/admin/egp-notices?filter=all${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "all"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            All Notices
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "all" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
              }`}>{totalCount}</span>
          </Link>
          <Link
            href={`/admin/egp-notices?filter=published${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "published"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Published
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "published" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
              }`}>{activeCount}</span>
          </Link>
          <Link
            href={`/admin/egp-notices?filter=pending${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "pending"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Pending
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "pending" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-500"
              }`}>{pendingCount}</span>
          </Link>
          <Link
            href={`/admin/egp-notices?filter=winners${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "winners"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Winners
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "winners" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>{winnersCount}</span>
          </Link>
          <Link
            href={`/admin/egp-notices?filter=draft${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "draft"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Drafts
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
              }`}>{draftCount}</span>
          </Link>
          <Link
            href={`/admin/egp-notices?filter=scheduled${query ? `&search=${query}` : ""}&limit=${currentLimit}`}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${filter === "scheduled"
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            Scheduled
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold transition-all duration-300 ${filter === "scheduled" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}>{scheduledCount}</span>
          </Link>
        </div>
        <div className="pb-2.5">
          <NoticeLimitDropdown />
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <NoticesTable
            notices={paginatedNotices as any}
            startIndex={(activePage - 1) * currentLimit}
            now={now.toISOString()}
          />
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <span className="text-xs font-bold text-slate-500">
            Showing {Math.min((activePage - 1) * currentLimit + 1, notices.length)} to {Math.min(activePage * currentLimit, notices.length)} of {notices.length} entries
          </span>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/admin/egp-notices?filter=${filter}${query ? `&search=${query}` : ""}&limit=${currentLimit}&page=${Math.max(1, activePage - 1)}`}
              className={`w-9 h-9 rounded-xl bg-slate-500 hover:bg-slate-600 text-white flex items-center justify-center font-bold transition-all border-0 ${activePage === 1 ? "pointer-events-none opacity-50" : ""
                }`}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/admin/egp-notices?filter=${filter}${query ? `&search=${query}` : ""}&limit=${currentLimit}&page=${page}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs transition-all border-0 ${activePage === page
                    ? "bg-[var(--primary-color)] text-white shadow-md shadow-green-600/10"
                    : "bg-slate-450 hover:bg-slate-500 text-white"
                  }`}
              >
                {page}
              </Link>
            ))}

            <Link
              href={`/admin/egp-notices?filter=${filter}${query ? `&search=${query}` : ""}&limit=${currentLimit}&page=${Math.min(totalPages, activePage + 1)}`}
              className={`w-9 h-9 rounded-xl bg-slate-500 hover:bg-slate-600 text-white flex items-center justify-center font-bold transition-all border-0 ${activePage === totalPages ? "pointer-events-none opacity-50" : ""
                }`}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
