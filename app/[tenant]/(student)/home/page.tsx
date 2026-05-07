import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import StudentHome from "@/features/student/components/StudentHome"

export const dynamic = "force-dynamic"

export default async function StudentHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params
  const session = await getSession()

  if (!session?.userId) redirect(`/${slug}/login`)

  const userId = session.userId

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [user, enrollment, streak] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.enrollment.findFirst({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  select: { id: true, title: true, order: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.streak.findUnique({ where: { userId } }),
  ])

  if (!user) redirect(`/${slug}/login`)

  const completions = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  })
  const completedIds = new Set(completions.map((c) => c.lessonId))

  let foundCurrent = false
  const modules =
    enrollment?.course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => {
        const completed = completedIds.has(l.id)
        const isCurrent = !completed && !foundCurrent
        if (isCurrent) foundCurrent = true
        return { id: l.id, title: l.title, order: l.order, completed, isCurrent }
      }),
    })) ?? []

  return (
    <StudentHome
      tenantSlug={slug}
      student={{ name: user.name, xpTotal: enrollment?.xpTotal ?? 0 }}
      streak={{ currentDays: streak?.currentDays ?? 0 }}
      modules={modules}
      courseName={enrollment?.course.title ?? null}
      progressPct={enrollment?.progressPct ?? 0}
    />
  )
}
