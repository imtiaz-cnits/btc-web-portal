const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing Prisma Notice Creation...");
    const notice = await prisma.notice.create({
      data: {
        title: "Test Notice Studio",
        content: "test notice content",
        type: "TABLE",
        tableData: null,
        year: "2026",
        category: "OTM",
        status: "active",
        publishDate: new Date(),
        lastDate: null,
        lotteryDate: null,
        authorId: "cmp9doolg0000vfcw6stbgzd6",
        filePath: null,
      },
    });
    console.log("Notice created successfully in DB:", notice.id);
    
    console.log("Cleaning up notice...");
    await prisma.notice.delete({ where: { id: notice.id } });
    console.log("Cleanup successful!");
  } catch (error) {
    console.error("Prisma Notice Creation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
