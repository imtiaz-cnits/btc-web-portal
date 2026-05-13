import prisma from "@/lib/prisma";
import ClientHomePage from "@/components/ClientHomePage";

export default async function HomePage() {
  const tenderNotices = await prisma.notice.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return <ClientHomePage tenderNotices={tenderNotices} />;
}
