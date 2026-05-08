import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.userId

  const [user, enrollment, streak, completedCount, achievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.enrollment.findFirst({ where: { userId }, select: { xpTotal: true, progressPct: true } }),
    prisma.streak.findUnique({ where: { userId }, select: { currentDays: true, longestDays: true } }),
    prisma.lessonCompletion.count({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { title: true, description: true } } },
      orderBy: { earnedAt: "desc" },
      take: 10,
    }),
  ])

  return NextResponse.json({
    name: user?.name ?? "",
    email: user?.email ?? "",
    xpTotal: enrollment?.xpTotal ?? 0,
    progressPct: enrollment?.progressPct ?? 0,
    streak: { currentDays: streak?.currentDays ?? 0, longestDays: streak?.longestDays ?? 0 },
    completedLessons: completedCount,
    achievements: achievements.map((a) => ({
      title: a.achievement.title,
      description: a.achievement.description,
      earnedAt: a.earnedAt.toISOString(),
    })),
  })
}
