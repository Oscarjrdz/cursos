import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// GET — course detail with modules, lessons, and enrollment info
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  // Verify course is assigned to this tenant
  const tenantCourse = await prisma.tenantCourse.findUnique({
    where: { tenantId_courseId: { tenantId: session.tenantId, courseId: id } },
  })
  if (!tenantCourse)
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            select: { id: true, title: true, order: true, contentType: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      enrollments: {
        where: { user: { tenantId: session.tenantId } },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  })

  if (!course)
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  // Get all tenant students to show who is NOT enrolled
  const allStudents = await prisma.user.findMany({
    where: { tenantId: session.tenantId, role: "STUDENT" },
    select: { id: true, name: true },
  })

  const enrolledIds = new Set(course.enrollments.map((e) => e.userId))

  return NextResponse.json({
    id: course.id,
    title: course.title,
    description: course.description,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      order: m.order,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        contentType: l.contentType,
      })),
    })),
    enrolledStudents: course.enrollments.map((e) => ({
      id: e.user.id,
      name: e.user.name,
      progress: Math.round(e.progressPct),
    })),
    unenrolledStudents: allStudents
      .filter((s) => !enrolledIds.has(s.id))
      .map((s) => ({ id: s.id, name: s.name })),
  })
}
