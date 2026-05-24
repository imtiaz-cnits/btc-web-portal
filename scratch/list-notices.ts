import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      publishDate: true,
      lastDate: true,
      lotteryDate: true,
      createdAt: true,
      status: true,
    }
  });

  console.log(JSON.stringify(notices, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
