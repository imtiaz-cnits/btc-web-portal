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
  // Fetch active tender notices for the Hero slider
  let rawTenderNotices: any[] = [];
  try {
    rawTenderNotices = await prisma.notice.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (error) {
    console.error("Failed to fetch raw tender notices for homepage:", error);
  }

  // Convert dates to "15 May" short format that the GSAP slider expects
  const formatShortDate = (date: Date | null) => {
    if (!date) return "01 Jan";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const tenderNotices = rawTenderNotices.map((n) => ({
    id: n.id,
    title: n.title,
    date: formatShortDate(n.publishDate || n.createdAt),
    filePath: n.filePath || undefined,
  }));

  // Fetch active notices for the Browse Notices By Category Section
  let allActiveNotices: any[] = [];
  try {
    allActiveNotices = await prisma.notice.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch active notices for homepage categories:", error);
  }

  const homepageNotices = allActiveNotices.map((notice) => {
    const pubDate = notice.publishDate || notice.createdAt;
    const formattedDate = new Date(pubDate).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      id: notice.id,
      title: notice.title,
      date: formattedDate,
      fileUrl: notice.filePath || "",
      category: categoryMap[notice.category] || "LTM",
    };
  });

  return (
    <div className="home-page">
      <Hero tenderNotices={tenderNotices} />
      
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
