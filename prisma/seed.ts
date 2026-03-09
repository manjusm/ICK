import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL_TCP || process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  const email = "admin@ickstockholm.se";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log("Updated role to ADMIN");
    }
  } else {
    const passwordHash = await hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Admin",
        email,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Admin user created: ${email} / password: admin123`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
