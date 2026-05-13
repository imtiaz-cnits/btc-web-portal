import { getWinnerById } from "@/app/actions/winners";
import EditWinnerForm from "@/components/dashboard/EditWinnerForm";
import { notFound } from "next/navigation";

export default async function EditWinnerPage({ params }: { params: { id: string } }) {
  const winner = await getWinnerById(params.id);

  if (!winner) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Edit Winner Entry</h1>
      <EditWinnerForm winner={winner} />
    </div>
  );
}
