import prisma from "@/lib/prisma";
import SingleNoticeClient from "./SingleNoticeClient";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatDateDhaka, isNoticeExpired } from "@/lib/date";

export const revalidate = 0; // Retrieve real-time data on every request

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: params.id },
    });
    if (!notice) return { title: "Notice Details | BTC Web Portal" };

    let officeName = "";
    let groupCount = 0;
    if (notice.tableData) {
      try {
        const parsed = JSON.parse(notice.tableData);
        let tables: any[] = [];
        if (parsed.version === "v2" && Array.isArray(parsed.tables)) {
          tables = parsed.tables;
        } else if (parsed.isPwdTemplate) {
          tables = [parsed];
        } else if (parsed.headers && parsed.rows) {
          tables = [parsed];
        }
        if (tables.length > 0) {
          officeName = tables[0].officeName || "";
          groupCount = tables.reduce((acc: number, t: any) => acc + (t.rows?.length || 0), 0);
        }
      } catch (_) {}
    }

    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    const toBengaliDigits = (numStr: string | number) => numStr.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
    const groupStr = groupCount > 0 ? `${toBengaliDigits(groupCount)} গ্রুপ | ` : "";
    const metaTitle = `টেন্ডার নোটিশ | ${groupStr}${officeName || notice.title}${notice.lastDate ? ` শেষ তারিখ: ${formatDateDhaka(notice.lastDate)}` : ""}`;
    const metaDesc = `${officeName || notice.title}${notice.lastDate ? ` - শেষ তারিখ: ${formatDateDhaka(notice.lastDate)}` : ""}`;

    return {
      title: metaTitle,
      description: metaDesc,
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        type: "article",
        images: ["/images/logo.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDesc,
        images: ["/images/logo.png"],
      },
    };
  } catch {
    return { title: "Notice Details | BTC Web Portal" };
  }
}

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
  let notice: any = null;
  try {
    notice = await prisma.notice.findUnique({
      where: { id: params.id },
    });
  } catch (error) {
    console.error("Failed to fetch notice in PublicSingleNoticePage:", error);
  }

  if (!notice || notice.status !== "active" || (notice.publishDate && new Date(notice.publishDate) > new Date())) {
    notFound();
  }

  let formattedPublishDate = "N/A";
  if (notice.publishDate) {
    formattedPublishDate = formatDateDhaka(notice.publishDate);
  } else if (notice.createdAt) {
    formattedPublishDate = formatDateDhaka(notice.createdAt);
  }

  const formattedLastDate = formatDateDhaka(notice.lastDate);

  let formattedLotteryDate = "";
  if (notice.lotteryDate) {
    formattedLotteryDate = formatDateDhaka(notice.lotteryDate);
  }

  const isExpired = isNoticeExpired(notice.lastDate);
  const finalCategory = (isExpired && notice.category !== "LOTTERY_RESULT") 
    ? "LOTTERY_PENDING" 
    : notice.category;

  const mappedNotice = {
    id: notice.id,
    title: notice.title,
    category: categoryMap[finalCategory] || "LTM",
    publishDate: formattedPublishDate,
    lastDate: formattedLastDate,
    lotteryDate: formattedLotteryDate,
    date: formattedLastDate || formattedPublishDate, // backward compatibility fallback for date field
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
