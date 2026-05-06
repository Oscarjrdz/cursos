import { prisma } from "@/lib/prisma"
import ClientesList from "@/features/super-admin/components/ClientesList"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: { select: { users: true, tenantCourses: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const data = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    maxStudents: t.maxStudents,
    status: t.status,
    expiresAt: t.expiresAt?.toISOString() ?? null,
    studentCount: t._count.users,
    courseCount: t._count.tenantCourses,
    createdAt: t.createdAt.toISOString(),
  }))

  return <ClientesList tenants={data} />
}
