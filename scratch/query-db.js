const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(
      "ALL USERS:",
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isAccountVerified: u.isAccountVerified,
      })),
    );

    const admin = await prisma.user.findFirst({
      where: { email: "admin@gmail.com" },
    });

    if (admin) {
      console.log("Found admin user:", admin);
      const passValid = await bcrypt.compare("12345678", admin.password);
      console.log("Is password '12345678' correct?", passValid);
    } else {
      console.log("admin@gmail.com not found!");
    }
  } catch (err) {
    console.error("Error querying db:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
