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
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
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
