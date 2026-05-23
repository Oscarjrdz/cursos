import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"
import { hashPassword } from "@/lib/crypto"

// PUT — update student
export async function PUT(
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

  const body = await req.json()
  const name = body.name ? body.name.toString().trim() : undefined
  const phone = body.phone !== undefined ? (body.phone ? body.phone.toString().trim() : null) : undefined
  const password = body.password ? body.password.toString().trim() : undefined

  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (phone !== undefined) updateData.phone = phone
  if (password !== undefined && password !== "") {
    updateData.password = hashPassword(password)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({ ok: true, student: { id: updated.id, name: updated.name, phone: updated.phone } })
}

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
