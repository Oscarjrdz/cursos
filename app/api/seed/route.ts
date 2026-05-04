import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Ruta temporal para poblar la DB en producción.
// Protegida con SEED_SECRET. Borrar después del primer uso.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-seed-secret")
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Tenant demo
    const tenant = await prisma.tenant.upsert({
      where: { slug: "acme" },
      update: {},
      create: { slug: "acme", name: "ACME Corp", maxStudents: 50, status: "ACTIVE" },
    })

    // Super Admin
    await prisma.user.upsert({
      where: { email: "oscar@learnflow.app" },
      update: {},
      create: { email: "oscar@learnflow.app", name: "Oscar", role: "SUPER_ADMIN", status: "ACTIVE" },
    })

    // Admin del tenant
    await prisma.user.upsert({
      where: { email: "admin@acme.com" },
      update: {},
      create: { email: "admin@acme.com", name: "Admin ACME", role: "TENANT_ADMIN", tenantId: tenant.id, status: "ACTIVE" },
    })

    // Alumnos
    const [ana, carlos, maria] = await Promise.all([
      prisma.user.upsert({
        where: { email: "ana@acme.com" },
        update: {},
        create: { email: "ana@acme.com", name: "Ana García", role: "STUDENT", tenantId: tenant.id, status: "ACTIVE" },
      }),
      prisma.user.upsert({
        where: { email: "carlos@acme.com" },
        update: {},
        create: { email: "carlos@acme.com", name: "Carlos López", role: "STUDENT", tenantId: tenant.id, status: "ACTIVE" },
      }),
      prisma.user.upsert({
        where: { email: "maria@acme.com" },
        update: {},
        create: { email: "maria@acme.com", name: "María Torres", role: "STUDENT", tenantId: tenant.id, status: "ACTIVE" },
      }),
    ])

    // Curso
    const course = await prisma.course.upsert({
      where: { id: "course-demo-001" },
      update: {},
      create: { id: "course-demo-001", title: "Fundamentos de Ventas B2B", description: "Aprende las bases del proceso de ventas empresarial", isPublished: true },
    })

    await prisma.tenantCourse.upsert({
      where: { tenantId_courseId: { tenantId: tenant.id, courseId: course.id } },
      update: {},
      create: { tenantId: tenant.id, courseId: course.id },
    })

    // Módulo y lecciones
    const module1 = await prisma.module.upsert({
      where: { id: "module-001" },
      update: {},
      create: { id: "module-001", courseId: course.id, title: "Introducción al proceso de ventas", order: 1 },
    })

    await Promise.all([
      prisma.lesson.upsert({
        where: { id: "lesson-001" },
        update: {},
        create: {
          id: "lesson-001", moduleId: module1.id, title: "¿Qué es una venta B2B?",
          order: 1, contentType: "TEXT", xpReward: 10,
          contentJson: { blocks: [{ type: "paragraph", text: "La venta B2B (Business to Business) es el proceso de vender productos o servicios de una empresa a otra." }] },
        },
      }),
      prisma.lesson.upsert({
        where: { id: "lesson-002" },
        update: {},
        create: {
          id: "lesson-002", moduleId: module1.id, title: "El ciclo de ventas",
          order: 2, contentType: "TEXT_AND_QUIZ", xpReward: 20,
          contentJson: {
            blocks: [{ type: "paragraph", text: "El ciclo de ventas B2B incluye: prospección, calificación, propuesta, negociación y cierre." }],
            quiz: { question: "¿Cuál es la primera etapa del ciclo de ventas?", options: ["Negociación", "Prospección", "Cierre", "Propuesta"], answer: 1 },
          },
        },
      }),
      prisma.lesson.upsert({
        where: { id: "lesson-003" },
        update: {},
        create: {
          id: "lesson-003", moduleId: module1.id, title: "Identificando al decisor",
          order: 3, contentType: "TEXT", xpReward: 10,
          contentJson: { blocks: [{ type: "paragraph", text: "En ventas B2B es clave identificar quién toma la decisión de compra dentro de la organización." }] },
        },
      }),
    ])

    // Enrollments
    await Promise.all([
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: ana.id, courseId: course.id } },
        update: {},
        create: { userId: ana.id, courseId: course.id, progressPct: 66, xpTotal: 30, lastActivityAt: new Date() },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: carlos.id, courseId: course.id } },
        update: {},
        create: { userId: carlos.id, courseId: course.id, progressPct: 33, xpTotal: 10, lastActivityAt: new Date(Date.now() - 3 * 86400000) },
      }),
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId: maria.id, courseId: course.id } },
        update: {},
        create: { userId: maria.id, courseId: course.id, progressPct: 100, xpTotal: 40, lastActivityAt: new Date(), completedAt: new Date() },
      }),
    ])

    // Streaks
    await Promise.all([
      prisma.streak.upsert({ where: { userId: ana.id }, update: {}, create: { userId: ana.id, currentDays: 5, longestDays: 5, lastActivityDate: new Date(), shields: 1 } }),
      prisma.streak.upsert({ where: { userId: carlos.id }, update: {}, create: { userId: carlos.id, currentDays: 1, longestDays: 4, lastActivityDate: new Date(Date.now() - 3 * 86400000) } }),
      prisma.streak.upsert({ where: { userId: maria.id }, update: {}, create: { userId: maria.id, currentDays: 12, longestDays: 12, lastActivityDate: new Date(), shields: 2 } }),
    ])

    // Leaderboard
    await Promise.all([
      prisma.leaderboardEntry.upsert({ where: { tenantId_userId: { tenantId: tenant.id, userId: maria.id } }, update: {}, create: { tenantId: tenant.id, userId: maria.id, userName: maria.name, xpTotal: 40, rank: 1 } }),
      prisma.leaderboardEntry.upsert({ where: { tenantId_userId: { tenantId: tenant.id, userId: ana.id } }, update: {}, create: { tenantId: tenant.id, userId: ana.id, userName: ana.name, xpTotal: 30, rank: 2 } }),
      prisma.leaderboardEntry.upsert({ where: { tenantId_userId: { tenantId: tenant.id, userId: carlos.id } }, update: {}, create: { tenantId: tenant.id, userId: carlos.id, userName: carlos.name, xpTotal: 10, rank: 3 } }),
    ])

    // Achievements
    const achievements = await Promise.all([
      prisma.achievement.upsert({ where: { id: "ach-001" }, update: {}, create: { id: "ach-001", title: "Primera lección", description: "Completaste tu primera lección", triggerType: "LESSONS_COMPLETED", triggerValue: 1 } }),
      prisma.achievement.upsert({ where: { id: "ach-002" }, update: {}, create: { id: "ach-002", title: "Racha de fuego", description: "5 días seguidos", triggerType: "STREAK_DAYS", triggerValue: 5 } }),
      prisma.achievement.upsert({ where: { id: "ach-003" }, update: {}, create: { id: "ach-003", title: "Curso completado", description: "Terminaste un curso completo", triggerType: "COURSES_COMPLETED", triggerValue: 1 } }),
    ])

    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: maria.id, achievementId: achievements[2].id } },
      update: {},
      create: { userId: maria.id, achievementId: achievements[2].id },
    })

    return NextResponse.json({ ok: true, message: "Seed completado", tenant: tenant.slug })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
