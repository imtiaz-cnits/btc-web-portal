const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    console.log("RECENT NOTICES:");
    console.log(JSON.stringify(notices.map(n => ({
      id: n.id,
      title: n.title,
      type: n.type,
      category: n.category,
      filePath: n.filePath,
      hasTableData: !!n.tableData,
      hasContent: !!n.content
    })), null, 2));
  } catch (err) {
    console.error("Error querying notices:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
