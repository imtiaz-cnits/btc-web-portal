import Link from "next/link";
import { getNotices, deleteNotice } from "@/app/actions/notices";
import DeleteButton from "@/components/dashboard/DeleteButton"; // I'll create this helper client component

export default async function AdminNoticesPage() {
  const notices = await getNotices();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">EGP Tender Notices</h1>
        <Link 
          href="/admin/egp-notices/add" 
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Add New Notice
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Category</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {notices.map((notice) => (
              <tr key={notice.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-800 font-medium">{notice.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold uppercase">
                    {notice.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold uppercase ${
                    notice.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {notice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {notice.publishDate ? new Date(notice.publishDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link href={`/admin/egp-notices/edit/${notice.id}`} className="text-blue-500 hover:underline text-sm font-medium">Edit</Link>
                  <DeleteButton id={notice.id} action={deleteNotice} />
                </td>
              </tr>
            ))}
            {notices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No notices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
