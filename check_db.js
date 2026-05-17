const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const envData = fs.readFileSync(".env.production", "utf8");
const dbUrlMatch = envData.match(/POSTGRES_URL="([^"]+)"/);
if (!dbUrlMatch) throw new Error("No URL found");

async function main() {
  const sql = neon(dbUrlMatch[1]);
  const tenants = await sql`SELECT id, slug, "adminPhone", "adminPassword" FROM "Tenant" WHERE slug = 'talentpro'`;
  console.log("Tenants:", tenants);
  if (tenants.length > 0) {
    const users = await sql`SELECT id, name, phone, role FROM "User" WHERE "tenantId" = ${tenants[0].id}`;
    console.log("Users:", users);
  }
}
main().catch(console.error);
