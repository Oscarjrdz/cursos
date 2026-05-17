import { prisma } from "./lib/prisma";

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "talentpro" } });
  console.log("Tenant:", tenant);
  if (tenant) {
    const students = await prisma.user.findMany({ where: { tenantId: tenant.id } });
    console.log("Users:", students.map(u => ({ id: u.id, name: u.name, phone: u.phone, password: u.password, role: u.role })));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
