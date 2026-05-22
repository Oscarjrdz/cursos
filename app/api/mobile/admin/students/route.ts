import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"
import { hashPassword } from "@/lib/crypto"

// GET — list students
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    include: {
      users: {
        where: { role: "STUDENT" },
        include: {
          enrollments: {
            include: { course: { select: { id: true, title: true } } },
            orderBy: { lastActivityAt: "desc" },
          },
          streak: true,
        },
        orderBy: { createdAt: "desc" },
      },
      tenantCourses: {
        include: { course: { select: { id: true, title: true } } },
        orderBy: { assignedAt: "asc" },
      },
    },
  })

  if (!tenant)
    return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000)
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000)

  const students = tenant.users.map((u) => {
    const primaryEnrollment = u.enrollments[0]
    const allProgress = u.enrollments.map((e) => e.progressPct)
    const avgProgress = allProgress.length
      ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length)
      : 0

    const lastActivity = u.enrollments
      .map((e) => e.lastActivityAt)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0]

    const lastAccess = lastActivity
      ? lastActivity >= today
        ? "Hoy"
        : lastActivity >= new Date(today.getTime() - 86400000)
          ? "Ayer"
          : `Hace ${Math.floor((today.getTime() - lastActivity.getTime()) / 86400000)} días`
      : "Nunca"

    const subDays = u.subscriptionExpiresAt
      ? Math.floor((u.subscriptionExpiresAt.getTime() - Date.now()) / 86400000)
      : null

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      status: u.status,
      courseName: primaryEnrollment?.course.title ?? null,
      courseCount: u.enrollments.length,
      progress: avgProgress,
      lastAccess,
      lastActivityAt: lastActivity?.toISOString() ?? null,
      streakDays: u.streak?.currentDays ?? 0,
      subscriptionDaysLeft: subDays,
      subscriptionExpiresAt: u.subscriptionExpiresAt?.toISOString().split("T")[0] ?? null,
      enrolledCourseIds: u.enrollments.map((e) => e.courseId),
    }
  })

  const activeStudents = students.filter((s) => s.status === "ACTIVE").length
  const avgProgress = students.length
    ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)
    : 0
  const atRisk = students.filter(
    (s) => !s.lastActivityAt || new Date(s.lastActivityAt) < threeDaysAgo
  ).length
  const nearExpiry = students.filter(
    (s) => s.subscriptionExpiresAt && new Date(s.subscriptionExpiresAt) <= sevenDaysFromNow
  ).length

  const availableCourses = tenant.tenantCourses.map((tc) => ({
    id: tc.course.id,
    title: tc.course.title,
  }))

  return NextResponse.json({
    tenant: { name: tenant.name, slug: tenant.slug, maxStudents: tenant.maxStudents },
    stats: { activeStudents, avgProgress, atRisk, nearExpiry },
    students,
    availableCourses,
  })
}

// POST — create student
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const name = (body.name ?? "").toString().trim()
  const email = (body.email ?? "").toString().trim()
  const phone = body.phone ? body.phone.toString().trim() : null
  const password = body.password ? body.password.toString().trim() : null

  if (!name || !email)
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 400 })

  await prisma.user.create({
    data: {
      name,
      email,
      role: "STUDENT",
      tenantId: session.tenantId,
      status: "ACTIVE",
      phone,
      password: password ? hashPassword(password) : null,
    },
  })

  return NextResponse.json({ ok: true })
}
