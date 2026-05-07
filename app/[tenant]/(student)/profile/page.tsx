import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import StudentProfile from "@/features/student/components/StudentProfile"

export const dynamic = "force-dynamic"

export default async function ProfilePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params
  const session = await getSession()

  if (!session?.userId) redirect(`/${slug}/login`)

  const userId = session.userId

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  // Fetch user, enrollments, streak, achievements in parallel
  const [user, enrollments, streak, userAchievements, lessonCompletionsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, avatarUrl: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { userId },
      select: {
        progressPct: true,
        xpTotal: true,
        completedAt: true,
        course: {
          select: {
            modules: {
              select: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.lessonCompletion.count({ where: { userId } }),
  ])

  if (!user) redirect(`/${slug}/login`)

  // Calculate stats
  const totalXp = enrollments.reduce((sum, e) => sum + e.xpTotal, 0)
  const totalLessons = enrollments.reduce(
    (sum, e) => sum + e.course.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  )
  const coursesCompleted = enrollments.filter((e) => e.completedAt).length
  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPct, 0) / enrollments.length)
      : 0

  const achievements = userAchievements.map((ua) => ({
    id: ua.achievement.id,
    title: ua.achievement.title,
    description: ua.achievement.description,
    iconUrl: ua.achievement.iconUrl,
    earnedAt: ua.earnedAt.toISOString(),
  }))

  return (
    <StudentProfile
      tenantSlug={slug}
      student={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        xpTotal: totalXp,
        createdAt: user.createdAt.toISOString(),
      }}
      streak={{
        currentDays: streak?.currentDays ?? 0,
        longestDays: streak?.longestDays ?? 0,
        shields: streak?.shields ?? 0,
      }}
      stats={{
        lessonsCompleted: lessonCompletionsCount,
        totalLessons,
        coursesEnrolled: enrollments.length,
        coursesCompleted,
        progressPct: avgProgress,
      }}
      achievements={achievements}
    />
  )
}
