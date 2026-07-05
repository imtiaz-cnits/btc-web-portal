import Hero from "@/components/Hero";
import Services from "@/components/Services";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ClientSlider from "@/components/ClientSlider";
import HomeNoticesSection from "@/components/HomeNoticesSection";
import prisma from "@/lib/prisma";
import { formatDateDhaka, isNoticeExpired } from "@/lib/date";

export const revalidate = 0; // Live data on every load

const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};

export default async function HomePage() {
  // Fetch active notices for the Browse Notices By Category Section
  let allActiveNotices: any[] = [];
  try {
    allActiveNotices = await prisma.notice.findMany({
      where: { 
        status: "active",
        OR: [
          { publishDate: null },
          { publishDate: { lte: new Date() } }
        ]
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch active notices for homepage categories:", error);
  }

  const homepageNotices = allActiveNotices.map((notice) => {
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

    return {
      id: notice.id,
      title: notice.title,
      publishDate: formattedPublishDate,
      date: formattedLastDate,
      lotteryDate: formattedLotteryDate,
      fileUrl: notice.filePath || "",
      category: categoryMap[finalCategory] || "LTM",
    };
  });

  return (
    <div className="home-page">
      <Hero />
      
      {/* Tender Browse Section right below Hero */}
      <HomeNoticesSection notices={homepageNotices} />
      
      <Services />
      <StatsSection />
      <AboutSection />
      <ProjectsSection />
      <ClientSlider />
    </div>
  );
}
