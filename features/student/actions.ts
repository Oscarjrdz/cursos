"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function completeLesson(userId: string, lessonId: string, tenantSlug: string) {
  // Upsert completion (idempotent)
  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, xpEarned: 10 },
    update: {},
  })

  // Get lesson → course for progress recalculation
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: { modules: { include: { lessons: { select: { id: true } } } } },
          },
        },
      },
    },
  })

  if (!lesson) return

  const allLessonIds = lesson.module.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const totalLessons = allLessonIds.length

  const completedCount = await prisma.lessonCompletion.count({
    where: { userId, lessonId: { in: allLessonIds } },
  })

  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  await prisma.enrollment.updateMany({
    where: { userId, courseId: lesson.module.course.id },
    data: { progressPct, lastActivityAt: new Date(), xpTotal: { increment: 10 } },
  })

  // Update streak
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const streak = await prisma.streak.findUnique({ where: { userId } })

  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentDays: 1, longestDays: 1, lastActivityDate: today },
    })
  } else {
    const yesterday = new Date(today.getTime() - 86400000)
    const lastDate = streak.lastActivityDate ? new Date(streak.lastActivityDate.setHours(0, 0, 0, 0)) : null

    if (!lastDate || lastDate.getTime() < yesterday.getTime()) {
      await prisma.streak.update({
        where: { userId },
        data: { currentDays: 1, lastActivityDate: today },
      })
    } else if (lastDate.getTime() < today.getTime()) {
      const newDays = streak.currentDays + 1
      await prisma.streak.update({
        where: { userId },
        data: {
          currentDays: newDays,
          longestDays: Math.max(newDays, streak.longestDays),
          lastActivityDate: today,
        },
      })
    }
  }

  revalidatePath(`/${tenantSlug}/home`)
}
