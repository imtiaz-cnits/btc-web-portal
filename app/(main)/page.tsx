import Hero from "@/components/Hero";
import Services from "@/components/Services";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ClientSlider from "@/components/ClientSlider";
import prisma from "@/lib/prisma";

export const revalidate = 0; // Live data on every load

export default async function HomePage() {
  // Fetch active tender notices from remote database
  const rawTenderNotices = await prisma.notice.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Fetch active winner lists from remote database
  const rawWinnerNotices = await prisma.winnerList.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

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

  const winnerNotices = rawWinnerNotices.map((w) => ({
    id: w.id,
    title: w.title,
    date: formatShortDate(w.publishDate || w.createdAt),
    filePath: w.filePath || undefined,
  }));

  return (
    <div className="home-page">
      <Hero 
        tenderNotices={tenderNotices} 
        winnerNotices={winnerNotices} 
      />
      <Services />
      <StatsSection />
      <AboutSection />
      <ProjectsSection />
      <ClientSlider />
    </div>
  );
}
