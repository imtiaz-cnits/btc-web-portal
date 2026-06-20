import Hero from "@/components/Hero";
import Services from "@/components/Services";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ClientSlider from "@/components/ClientSlider";
import HomeNoticesSection from "@/components/HomeNoticesSection";
import prisma from "@/lib/prisma";

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
    console.error("Failed to fetch active notices for homepage categories:", error);
  }

  const homepageNotices = allActiveNotices.map((notice) => {
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
      title: notice.title,
      publishDate: formattedPublishDate,
      date: formattedLastDate,
      lotteryDate: formattedLotteryDate,
      fileUrl: notice.filePath || "",
      category: categoryMap[notice.category] || "LTM",
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
