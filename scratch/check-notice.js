const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notice = await prisma.notice.findUnique({
    where: { id: 'cmpcq66qp0001if047aunjeqx' }
  });
  console.log(JSON.stringify(notice, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
