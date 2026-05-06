import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import TenantEditPage from "@/features/super-admin/components/TenantEditPage"

export const dynamic = "force-dynamic"

export default async function EditClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [tenant, allCourses] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id },
      include: { tenantCourses: { select: { courseId: true } } },
    }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, description: true, _count: { select: { modules: true } } },
      orderBy: { title: "asc" },
    }),
  ])

  if (!tenant) notFound()

  return (
    <TenantEditPage
      tenant={{
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        maxStudents: tenant.maxStudents,
        status: tenant.status,
        expiresAt: tenant.expiresAt?.toISOString().split("T")[0] ?? "",
        assignedCourseIds: tenant.tenantCourses.map((tc) => tc.courseId),
      }}
      courses={allCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        moduleCount: c._count.modules,
      }))}
    />
  )
}
