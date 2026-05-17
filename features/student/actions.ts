"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

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

export async function toggleRankingReaction(tenantSlug: string, toUserId: string, type: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error("No autorizado")

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) throw new Error("Tenant no encontrado")

  const existing = await prisma.rankingReaction.findFirst({
    where: {
      tenantId: tenant.id,
      fromUserId: session.userId,
      toUserId,
      type,
    },
  })

  if (existing) {
    await prisma.rankingReaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.rankingReaction.create({
      data: {
        tenantId: tenant.id,
        fromUserId: session.userId,
        toUserId,
        type,
      },
    })
  }
}

export async function getRankingComments(tenantSlug: string, toUserId: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error("No autorizado")

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) throw new Error("Tenant no encontrado")

  const comments = await prisma.rankingComment.findMany({
    where: { tenantId: tenant.id, toUserId },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return comments
}

export async function addRankingComment(tenantSlug: string, toUserId: string, text: string) {
  const session = await getSession()
  if (!session?.userId) throw new Error("No autorizado")

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
  if (!tenant) throw new Error("Tenant no encontrado")

  if (!text || text.trim() === "") throw new Error("Comentario vacío")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  })
  if (!user) throw new Error("Usuario no encontrado")

  const comment = await prisma.rankingComment.create({
    data: {
      tenantId: tenant.id,
      fromUserId: session.userId,
      fromName: user.name,
      toUserId,
      text: text.trim(),
    },
  })

  return comment
}
