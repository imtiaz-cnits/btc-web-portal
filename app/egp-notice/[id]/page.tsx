import prisma from "@/lib/prisma";
import SingleNoticeClient from "./SingleNoticeClient";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 0; // Retrieve real-time data on every request

const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};

export default async function PublicSingleNoticePage({
  params,
}: {
  params: { id: string };
}) {
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

  // Check if there is ACTUALLY a valid parsed table in notice.tableData
  let parsedTablesCount = 0;
  if (notice.tableData) {
    try {
      const parsed = JSON.parse(notice.tableData);
      if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
        parsedTablesCount = parsed.tables.length;
      } else if (parsed.isPwdTemplate) {
        parsedTablesCount = 1;
      } else if (parsed.headers && parsed.rows) {
        parsedTablesCount = 1;
      }
    } catch (e) {
      // Not a valid JSON or empty
    }
  }

  const isTableNotice = notice.type === "TABLE" || parsedTablesCount > 0;

  if (isTableNotice) {
    // For table notices, render full screen directly with absolutely no headers, top-notice bars, or footers
    return <SingleNoticeClient notice={mappedNotice} />;
  }

  // For standard notices (file, text, images), render wrapped inside the standard website layout natively
  const tenderNotices = [
    {
      id: "1",
      title:
        "বিটিসি ওয়েব পোর্টালে আপনাকে স্বাগতম - আমাদের নতুন ই-টেন্ডার সুবিধা গ্রহণ করুন।",
      createdAt: new Date(),
    },
    {
      id: "2",
      title:
        "ইজিপি এবং টেন্ডার বিষয়ক সকল প্রকার সহযোগিতা পেতে আমাদের সাথে যোগাযোগ করুন।",
      createdAt: new Date(),
    },
    {
      id: "3",
      title:
        "নতুন কনস্ট্রাকশন প্রজেক্টের টেন্ডার নোটিশ প্রকাশিত হয়েছে - বিস্তারিত জানতে ক্লিক করুন।",
      createdAt: new Date(),
    },
  ];
  const marqueeNotices = tenderNotices.map((n) => ({
    id: n.id,
    title: n.title,
    link: `/egp-notice`,
  }));

  return (
    <div className="website-layout">
      <Navbar initialNotices={marqueeNotices} />
      <main className="main">
        <SingleNoticeClient notice={mappedNotice} />
      </main>
      <Footer />
    </div>
  );
}
