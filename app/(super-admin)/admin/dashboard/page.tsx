import { prisma } from "@/lib/prisma"
import SuperAdminDashboard from "@/features/super-admin/components/SuperAdminDashboard"

export const dynamic = "force-dynamic"

export default async function SuperAdminPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        where: { role: "STUDENT" },
        include: {
          enrollments: { select: { progressPct: true, lastActivityAt: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tenantData = tenants.map((t) => {
    const students = t.users
    const allEnrollments = students.flatMap((u) => u.enrollments)
    const avgProgress =
      allEnrollments.length > 0
        ? Math.round(allEnrollments.reduce((a, e) => a + e.progressPct, 0) / allEnrollments.length)
        : 0

    const lastActivityDate = allEnrollments
      .map((e) => e.lastActivityAt)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0]

    const lastActivity = lastActivityDate
      ? lastActivityDate >= today
        ? "Hoy"
        : lastActivityDate >= new Date(today.getTime() - 86400000)
          ? "Ayer"
          : `Hace ${Math.floor((today.getTime() - lastActivityDate.getTime()) / 86400000)} días`
      : "Sin actividad"

    const expiresIn = t.expiresAt
      ? Math.floor((t.expiresAt.getTime() - Date.now()) / 86400000)
      : 999

    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      students: { current: students.length, max: t.maxStudents },
      avgProgress,
      status: t.status,
      expiresIn,
      lastActivity,
    }
  })

  const totalStudents = tenantData.reduce((a, t) => a + t.students.current, 0)
  const globalEnrollments = tenants.flatMap((t) =>
    t.users.flatMap((u) => u.enrollments)
  )
  const globalCompletion =
    globalEnrollments.length > 0
      ? Math.round(globalEnrollments.reduce((a, e) => a + e.progressPct, 0) / globalEnrollments.length)
      : 0

  const activeToday = tenants.reduce((acc, t) => {
    const active = t.users.filter((u) =>
      u.enrollments.some((e) => e.lastActivityAt && e.lastActivityAt >= today)
    ).length
    return acc + active
  }, 0)

  return (
    <SuperAdminDashboard
      data={{
        stats: {
          totalTenants: tenants.length,
          totalStudents,
          activeToday,
          globalCompletion,
        },
        tenants: tenantData,
      }}
    />
  )
}
