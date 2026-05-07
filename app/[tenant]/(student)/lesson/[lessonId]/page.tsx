import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import LessonPlayer from "@/features/student/components/LessonPlayer"

export const dynamic = "force-dynamic"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ tenant: string; lessonId: string }>
}) {
  const { tenant: slug, lessonId } = await params
  const session = await getSession()

  if (!session?.userId) redirect(`/${slug}/login`)

  const userId = session.userId

  const [lesson, enrollment] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: "asc" },
                  include: { lessons: { orderBy: { order: "asc" }, select: { id: true } } },
                },
              },
            },
          },
        },
      },
    }),
    prisma.enrollment.findFirst({ where: { userId } }),
  ])

  if (!lesson || !enrollment) notFound()

  // Flat ordered lesson list for progress display
  const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons)
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  const totalLessons = allLessons.length

  const alreadyCompleted = await prisma.lessonCompletion.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })

  return (
    <LessonPlayer
      tenantSlug={slug}
      userId={userId}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        contentType: lesson.contentType,
        contentJson: lesson.contentJson as Record<string, unknown>,
        xpReward: lesson.xpReward,
      }}
      lessonIndex={lessonIndex}
      totalLessons={totalLessons}
      alreadyCompleted={!!alreadyCompleted}
    />
  )
}
