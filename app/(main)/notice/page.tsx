import Link from "next/link";
import { getNotices } from "@/app/actions/notices";

export const revalidate = 0; // Live data on every load, prevents build-time database fetch failures

export default async function PublicNoticesPage() {
  const notices = await getNotices();
  const activeNotices = notices.filter(n => n.status === 'active');

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="custom-container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide">EGP Tender Notices</h1>
          <div className="w-24 h-1 bg-[var(--primary-color)] mx-auto mt-4"></div>
          <p className="text-gray-600 mt-6 max-w-2xl mx-auto italic">
            Stay updated with the latest electronic government procurement opportunities and tender details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
          {activeNotices.map((notice) => (
            <div key={notice.id} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition group">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-50 text-[var(--primary-color)] text-xs font-bold rounded-full uppercase">
                      {notice.category}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Published: {notice.publishDate ? (() => {
                        const d = new Date(notice.publishDate);
                        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                      })() : 'N/A'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-[var(--primary-color)] transition">
                    {notice.title}
                  </h2>
                </div>
                <Link 
                  href={`/egp-notice/${notice.id}`}
                  className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg font-semibold hover:bg-[var(--text-1)] transition"
                >
                  VIEW DETAILS
                </Link>
              </div>
            </div>
          ))}

          {activeNotices.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border">
              <p className="text-gray-500 text-lg italic">No active tender notices found at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
