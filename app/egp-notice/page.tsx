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
      where: { 
        status: "active",
        OR: [
          { publishDate: null },
          { publishDate: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { category: "LOTTERY_RESULT" },
              { lastDate: null },
              { lastDate: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch notices in PublicEgpNoticePage:", error);
  }

  // Map database notice properties to the fields expected by NoticeTable
  const mappedNotices = notices.map((notice, idx) => {
    let formattedPublishDate = "N/A";
    if (notice.publishDate) {
      const pd = new Date(notice.publishDate);
      formattedPublishDate = `${String(pd.getDate()).padStart(2, '0')}-${String(pd.getMonth() + 1).padStart(2, '0')}-${pd.getFullYear()}`;
    } else if (notice.createdAt) {
      const pd = new Date(notice.createdAt);
      formattedPublishDate = `${String(pd.getDate()).padStart(2, '0')}-${String(pd.getMonth() + 1).padStart(2, '0')}-${pd.getFullYear()}`;
    }

    let formattedLastDate = "N/A";
    if (notice.lastDate) {
      const ld = new Date(notice.lastDate);
      formattedLastDate = `${String(ld.getDate()).padStart(2, '0')}-${String(ld.getMonth() + 1).padStart(2, '0')}-${ld.getFullYear()}`;
    }

    let formattedLotteryDate = "";
    if (notice.lotteryDate) {
      const ld = new Date(notice.lotteryDate);
      formattedLotteryDate = `${String(ld.getDate()).padStart(2, '0')}-${String(ld.getMonth() + 1).padStart(2, '0')}-${ld.getFullYear()}`;
    }

    return {
      id: notice.id,
      no: (idx + 1).toString().padStart(2, "0"),
      title: notice.title,
      publishDate: formattedPublishDate,
      date: formattedLastDate,
      lotteryDate: formattedLotteryDate,
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
