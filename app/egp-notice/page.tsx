import prisma from "@/lib/prisma";
import EgpNoticeClient from "./EgpNoticeClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 0; // Disable caching to fetch real-time notices

const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};

export default async function PublicEgpNoticePage() {
  // Fetch active notices from database ordered by publication or creation date
  let notices: any[] = [];
  try {
    notices = await prisma.notice.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch notices in PublicEgpNoticePage:", error);
  }

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
        <EgpNoticeClient initialNotices={mappedNotices} />
      </main>
      <Footer />
    </div>
  );
}
