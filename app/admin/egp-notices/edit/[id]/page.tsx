import { getNoticeById } from "@/app/actions/notices";
import NoticeForm from "@/components/dashboard/NoticeForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditNoticePage({
  params,
}: {
  params: { id: string };
}) {
  const notice = await getNoticeById(params.id);

  if (!notice) {
    notFound();
  }

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
            Edit Tender Notice
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Modify the procurement notice parameters, table rows/columns, or
            uploaded files.
          </p>
        </div>
      </div>

      <NoticeForm notice={notice} />
    </div>
  );
}
