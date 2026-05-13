import { getNoticeById } from "@/app/actions/notices";
import EditNoticeForm from "@/components/dashboard/EditNoticeForm";
import { notFound } from "next/navigation";

export default async function EditNoticePage({ params }: { params: { id: string } }) {
  const notice = await getNoticeById(params.id);

  if (!notice) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Edit Tender Notice</h1>
      <EditNoticeForm notice={notice} />
    </div>
  );
}
