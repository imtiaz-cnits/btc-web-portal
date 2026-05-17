import prisma from "@/lib/prisma";
import SingleNoticeClient from "./SingleNoticeClient";
import { notFound } from "next/navigation";

export const revalidate = 0; // Retrieve real-time data on every request

const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};

export default async function PublicSingleNoticePage({ params }: { params: { id: string } }) {
  const notice = await prisma.notice.findUnique({
    where: { id: params.id },
  });

  if (!notice) {
    notFound();
  }

  const pubDate = notice.publishDate || notice.createdAt;
  const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const mappedNotice = {
    id: notice.id,
    title: notice.title,
    category: categoryMap[notice.category] || "LTM",
    date: formattedDate,
    type: notice.type,
    content: notice.content,
    tableData: notice.tableData,
    filePath: notice.filePath,
  };

  return <SingleNoticeClient notice={mappedNotice} />;
}
