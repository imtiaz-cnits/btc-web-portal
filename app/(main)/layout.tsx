import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // I'll create this next
import prisma from "@/lib/prisma";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const noticesData = await prisma.notice.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const notices = noticesData.map((notice) => ({
    id: notice.id,
    title: notice.title,
    link: `/egp-notice/${notice.id}`,
  }));

  return (
    <div className="website-layout">
      <Navbar initialNotices={notices} />
      <main className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
