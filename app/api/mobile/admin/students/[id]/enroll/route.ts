import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// POST — enroll student in course
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: userId } = await params
  const body = await req.json()
  const courseId = (body.courseId ?? "").toString().trim()

  if (!courseId)
    return NextResponse.json({ error: "courseId es requerido" }, { status: 400 })

  // Verify student belongs to this tenant
  const student = await prisma.user.findFirst({
    where: { id: userId, tenantId: session.tenantId, role: "STUDENT" },
  })
  if (!student)
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  })

  return NextResponse.json({ ok: true })
}

// DELETE — unenroll student from course
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id: userId } = await params
  const body = await req.json()
  const courseId = (body.courseId ?? "").toString().trim()

  if (!courseId)
    return NextResponse.json({ error: "courseId es requerido" }, { status: 400 })

  await prisma.enrollment.deleteMany({ where: { userId, courseId } })

  return NextResponse.json({ ok: true })
}
