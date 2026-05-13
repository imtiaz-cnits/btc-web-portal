import Link from "next/link";
import { getWinners, deleteWinner } from "@/app/actions/winners";
import DeleteButton from "@/components/dashboard/DeleteButton";

export default async function AdminWinnersPage() {
  const winners = await getWinners();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Winner List Management</h1>
        <Link 
          href="/admin/winner-list/add" 
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Add New Winner
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Publish Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {winners.map((winner) => (
              <tr key={winner.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-800 font-medium">{winner.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold uppercase ${
                    winner.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {winner.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {winner.publishDate ? new Date(winner.publishDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link href={`/admin/winner-list/edit/${winner.id}`} className="text-blue-500 hover:underline text-sm font-medium">Edit</Link>
                  <DeleteButton id={winner.id} action={deleteWinner} />
                </td>
              </tr>
            ))}
            {winners.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No winners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
