import { prisma } from "@/lib/prisma"
import { cache } from "react"

export const getTenantBySlug = cache(async (slug: string) => {
  return prisma.tenant.findUnique({
    where: { slug },
  })
})

export function assertTenantAccess(userTenantId: string | null, tenantId: string, role: string) {
  if (role === "SUPER_ADMIN") return
  if (userTenantId !== tenantId) {
    throw new Error("Unauthorized: tenant mismatch")
  }
}
