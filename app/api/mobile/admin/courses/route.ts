import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// GET — list courses for this tenant
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const tenantCourses = await prisma.tenantCourse.findMany({
    where: { tenantId: session.tenantId },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: { select: { id: true } } },
            orderBy: { order: "asc" },
          },
          enrollments: {
            where: {
              user: { tenantId: session.tenantId },
            },
            select: { id: true },
          },
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  })

  const courses = tenantCourses.map((tc) => ({
    id: tc.course.id,
    title: tc.course.title,
    description: tc.course.description,
    moduleCount: tc.course.modules.length,
    lessonCount: tc.course.modules.reduce((a, m) => a + m.lessons.length, 0),
    enrolledCount: tc.course.enrollments.length,
  }))

  return NextResponse.json({ courses })
}
