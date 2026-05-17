import prisma from "@/lib/prisma";
import WinnerListClient from "./WinnerListClient";

export const revalidate = 0; // Live data on every request

export default async function PublicWinnerListPage() {
  // Fetch active winner entries from database
  const winners = await prisma.winnerList.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  // Map database winner list to expected props
  const mappedWinners = winners.map((winner, idx) => {
    const pubDate = winner.publishDate || winner.createdAt;
    const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      id: winner.id,
      no: (idx + 1).toString().padStart(2, "0"),
      title: winner.title,
      date: formattedDate,
      fileUrl: winner.filePath || "",
      category: "Winner List",
    };
  });

  return <WinnerListClient initialWinners={mappedWinners} />;
}
