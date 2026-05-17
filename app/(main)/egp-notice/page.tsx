import prisma from "@/lib/prisma";
import EgpNoticeClient from "./EgpNoticeClient";

export const revalidate = 0; // Disable caching to fetch real-time notices

const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};

export default async function PublicEgpNoticePage() {
  // Fetch active notices from database ordered by publication or creation date
  const notices = await prisma.notice.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  // Map database notice properties to the fields expected by NoticeTable
  const mappedNotices = notices.map((notice, idx) => {
    const pubDate = notice.publishDate || notice.createdAt;
    const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      id: notice.id,
      no: (idx + 1).toString().padStart(2, "0"),
      title: notice.title,
      date: formattedDate,
      fileUrl: notice.filePath || "",
      category: categoryMap[notice.category] || "LTM",
    };
  });

  return <EgpNoticeClient initialNotices={mappedNotices} />;
}
