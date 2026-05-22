import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// POST — reset student progress
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: userId } = await params

  // Verify student belongs to this tenant
  const student = await prisma.user.findFirst({
    where: { id: userId, tenantId: session.tenantId, role: "STUDENT" },
  })
  if (!student)
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })

  await prisma.$transaction([
    prisma.lessonCompletion.deleteMany({ where: { userId } }),
    prisma.enrollment.updateMany({
      where: { userId },
      data: { progressPct: 0, xpTotal: 0, lastActivityAt: null, completedAt: null },
    }),
    prisma.streak.updateMany({
      where: { userId },
      data: { currentDays: 0, longestDays: 0, lastActivityDate: null },
    }),
  ])

  return NextResponse.json({ ok: true })
}
