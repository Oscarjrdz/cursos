import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.userId

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

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

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

  return NextResponse.json({
    student: { name: user.name, xpTotal: enrollment?.xpTotal ?? 0 },
    streak: { currentDays: streak?.currentDays ?? 0 },
    modules,
    courseName: enrollment?.course.title ?? null,
    progressPct: enrollment?.progressPct ?? 0,
  })
}
