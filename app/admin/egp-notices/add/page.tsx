import NoticeForm from "@/components/dashboard/NoticeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddNoticePage() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/egp-notices"
          className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition flex items-center justify-center border-0"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Add New Tender Notice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Publish a new procurement notification, file, or table grid.
          </p>
        </div>
      </div>

      <NoticeForm />
    </div>
  );
}
