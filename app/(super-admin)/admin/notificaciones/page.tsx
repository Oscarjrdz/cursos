import { prisma } from "@/lib/prisma"
import NotificacionesPanel from "@/features/super-admin/components/NotificacionesPanel"

export const dynamic = "force-dynamic"

export default async function NotificacionesPage() {
  const tenants = await prisma.tenant.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const counts = await prisma.user.groupBy({
    by: ["tenantId"],
    where: { role: "STUDENT", pushToken: { not: null } },
    _count: { id: true },
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.tenantId, c._count.id]))

  const totalWithToken = counts.reduce((a, c) => a + c._count.id, 0)

  return (
    <NotificacionesPanel
      tenants={tenants.map((t) => ({ id: t.id, name: t.name, withToken: countMap[t.id] ?? 0 }))}
      totalWithToken={totalWithToken}
    />
  )
}
