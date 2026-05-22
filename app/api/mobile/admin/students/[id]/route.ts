import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// DELETE — delete student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  // Verify student belongs to this tenant
  const student = await prisma.user.findFirst({
    where: { id, tenantId: session.tenantId, role: "STUDENT" },
  })
  if (!student)
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })

  // Delete related data first
  await prisma.$transaction([
    prisma.lessonCompletion.deleteMany({ where: { userId: id } }),
    prisma.enrollment.deleteMany({ where: { userId: id } }),
    prisma.streak.deleteMany({ where: { userId: id } }),
    prisma.userAchievement.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ])

  return NextResponse.json({ ok: true })
}
