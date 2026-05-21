import prisma from "@/lib/prisma";
import { 
  FileText, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Inbox
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Real-time data

export default async function AdminDashboardPage() {
  const totalNotices = await prisma.notice.count();
  const activeNotices = await prisma.notice.count({ where: { status: "active" } });
  const inactiveNotices = await prisma.notice.count({ where: { status: "inactive" } });
  
  // Category counts
  const ltmCount = await prisma.notice.count({ where: { category: "LTM" } });
  const otmCount = await prisma.notice.count({ where: { category: "OTM" } });
  const pendingCount = await prisma.notice.count({ where: { category: "LOTTERY_PENDING" } });
  const resultCount = await prisma.notice.count({ where: { category: "LOTTERY_RESULT" } });

  const stats = [
    { name: "Total Notices", value: totalNotices, icon: FileText, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Active Notices", value: activeNotices, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { name: "Inactive Notices", value: inactiveNotices, icon: AlertCircle, color: "bg-rose-50 text-rose-600 border-rose-100" },
  ];

  const categories = [
    { name: "OTM Notices", count: otmCount, color: "bg-blue-500", percentage: totalNotices ? Math.round((otmCount / totalNotices) * 100) : 0 },
    { name: "LTM Notices", count: ltmCount, color: "bg-emerald-500", percentage: totalNotices ? Math.round((ltmCount / totalNotices) * 100) : 0 },
    { name: "Lottery Pending", count: pendingCount, color: "bg-amber-500", percentage: totalNotices ? Math.round((pendingCount / totalNotices) * 100) : 0 },
    { name: "Lottery Results", count: resultCount, color: "bg-purple-500", percentage: totalNotices ? Math.round((resultCount / totalNotices) * 100) : 0 },
  ];

  // Fetch recent notices
  const recentNotices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your portal's notices and tender information.</p>
        </div>
        <Link 
          href="/admin/egp-notices/add"
          className="bg-[var(--primary-color)] text-white hover:bg-green-700 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-green-600/20 text-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          Add New Notice
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{stat.name}</span>
                <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl border ${stat.color} shadow-sm shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary-color)]" />
              Category Breakdown
            </h2>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-600">{cat.name}</span>
                  <span className="text-slate-800">{cat.count} ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notices list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Notices</h2>
            <Link href="/admin/egp-notices" className="text-[var(--primary-color)] text-sm font-semibold hover:underline flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {recentNotices.map((notice) => (
              <div key={notice.id} className="py-4 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div className="space-y-1 pr-4">
                  <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{notice.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {notice.category}
                    </span>
                    <span>
                      {notice.publishDate ? (() => {
                        const d = new Date(notice.publishDate);
                        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                      })() : "N/A"}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                      {notice.type}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase ${
                    notice.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {notice.status}
                  </span>
                </div>
              </div>
            ))}

            {recentNotices.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Inbox className="w-12 h-12 text-slate-300" />
                <p className="font-medium text-sm">No notices created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
