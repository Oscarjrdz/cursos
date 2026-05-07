import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import TenantAdminDashboard from "@/features/tenant-admin/components/TenantAdminDashboard"

export const dynamic = "force-dynamic"

export default async function TenantDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      users: {
        where: { role: "STUDENT" },
        include: {
          enrollments: {
            include: { course: { select: { id: true, title: true } } },
            orderBy: { lastActivityAt: "desc" },
          },
          streak: true,
        },
        orderBy: { createdAt: "desc" },
      },
      tenantCourses: {
        include: { course: { select: { id: true, title: true } } },
        orderBy: { assignedAt: "asc" },
      },
    },
  })

  if (!tenant) notFound()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000)
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000)

  const students = tenant.users.map((u) => {
    const primaryEnrollment = u.enrollments[0]
    const allProgress = u.enrollments.map((e) => e.progressPct)
    const avgProgress = allProgress.length
      ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length)
      : 0

    const lastActivity = u.enrollments
      .map((e) => e.lastActivityAt)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0]

    const lastAccess = lastActivity
      ? lastActivity >= today
        ? "Hoy"
        : lastActivity >= new Date(today.getTime() - 86400000)
          ? "Ayer"
          : `Hace ${Math.floor((today.getTime() - lastActivity.getTime()) / 86400000)} días`
      : "Nunca"

    const subDays = u.subscriptionExpiresAt
      ? Math.floor((u.subscriptionExpiresAt.getTime() - Date.now()) / 86400000)
      : null

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      hasPassword: !!u.password,
      status: u.status as "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED",
      courseName: primaryEnrollment?.course.title ?? null,
      courseCount: u.enrollments.length,
      progress: avgProgress,
      lastAccess,
      lastActivityAt: lastActivity?.toISOString() ?? null,
      streakDays: u.streak?.currentDays ?? 0,
      subscriptionDaysLeft: subDays,
      subscriptionExpiresAt: u.subscriptionExpiresAt?.toISOString().split("T")[0] ?? null,
      enrolledCourseIds: u.enrollments.map((e) => e.courseId),
    }
  })

  const activeStudents = students.filter((s) => s.status === "ACTIVE").length
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)
    : 0
  const atRisk = students.filter(
    (s) => !s.lastActivityAt || new Date(s.lastActivityAt) < threeDaysAgo
  ).length
  const nearExpiry = students.filter(
    (s) => s.subscriptionExpiresAt && new Date(s.subscriptionExpiresAt) <= sevenDaysFromNow
  ).length

  const availableCourses = tenant.tenantCourses.map((tc) => ({
    id: tc.course.id,
    title: tc.course.title,
  }))

  return (
    <TenantAdminDashboard
      tenantSlug={slug}
      data={{
        tenant: { name: tenant.name, slug: tenant.slug, maxStudents: tenant.maxStudents },
        stats: { activeStudents, avgProgress, atRisk, nearExpiry },
        students,
        availableCourses,
      }}
    />
  )
}
