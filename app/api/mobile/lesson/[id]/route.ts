import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: lessonId } = await params
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

  if (!lesson || !enrollment)
    return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 })

  const allLessons = lesson.module.course.modules.flatMap((m) => m.lessons)
  const lessonIndex = allLessons.findIndex((l) => l.id === lessonId)

  const alreadyCompleted = await prisma.lessonCompletion.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    contentType: lesson.contentType,
    contentJson: lesson.contentJson,
    xpReward: lesson.xpReward,
    lessonIndex,
    totalLessons: allLessons.length,
    alreadyCompleted: !!alreadyCompleted,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: lessonId } = await params
  const userId = session.userId

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, xpEarned: 10 },
    update: {},
  })

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

  if (!lesson) return NextResponse.json({ xpEarned: 10 })

  const allLessonIds = lesson.module.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const completedCount = await prisma.lessonCompletion.count({
    where: { userId, lessonId: { in: allLessonIds } },
  })
  const progressPct = allLessonIds.length > 0
    ? Math.round((completedCount / allLessonIds.length) * 100) : 0

  await prisma.enrollment.updateMany({
    where: { userId, courseId: lesson.module.course.id },
    data: { progressPct, lastActivityAt: new Date(), xpTotal: { increment: 10 } },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const streak = await prisma.streak.findUnique({ where: { userId } })

  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentDays: 1, longestDays: 1, lastActivityDate: today },
    })
  } else {
    const yesterday = new Date(today.getTime() - 86400000)
    const lastDate = streak.lastActivityDate
      ? new Date(new Date(streak.lastActivityDate).setHours(0, 0, 0, 0))
      : null

    if (!lastDate || lastDate.getTime() < yesterday.getTime()) {
      await prisma.streak.update({
        where: { userId },
        data: { currentDays: 1, lastActivityDate: today },
      })
    } else if (lastDate.getTime() < today.getTime()) {
      const newDays = streak.currentDays + 1
      await prisma.streak.update({
        where: { userId },
        data: { currentDays: newDays, longestDays: Math.max(newDays, streak.longestDays), lastActivityDate: today },
      })
    }
  }

  return NextResponse.json({ xpEarned: 10 })
}
