import { PrismaClient } from "@prisma/client"
import path from "path"

process.env.DATABASE_URL = `file:${path.join(__dirname, "dev.db")}`

const prisma = new PrismaClient()

async function main() {
  // Tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      slug: "acme",
      name: "ACME Corp",
      maxStudents: 50,
      status: "ACTIVE",
    },
  })

  // Super Admin
  await prisma.user.upsert({
    where: { email: "oscar@learnflow.app" },
    update: {},
    create: {
      email: "oscar@learnflow.app",
      name: "Oscar",
      role: "SUPER_ADMIN",
      tenantId: null,
      status: "ACTIVE",
    },
  })

  // Admin del tenant
  const tenantAdmin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      email: "admin@acme.com",
      name: "Admin ACME",
      role: "TENANT_ADMIN",
      tenantId: tenant.id,
      status: "ACTIVE",
    },
  })

  // Alumnos de prueba
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "ana@acme.com" },
      update: {},
      create: {
        email: "ana@acme.com",
        name: "Ana García",
        role: "STUDENT",
        tenantId: tenant.id,
        status: "ACTIVE",
      },
    }),
    prisma.user.upsert({
      where: { email: "carlos@acme.com" },
      update: {},
      create: {
        email: "carlos@acme.com",
        name: "Carlos López",
        role: "STUDENT",
        tenantId: tenant.id,
        status: "ACTIVE",
      },
    }),
    prisma.user.upsert({
      where: { email: "maria@acme.com" },
      update: {},
      create: {
        email: "maria@acme.com",
        name: "María Torres",
        role: "STUDENT",
        tenantId: tenant.id,
        status: "ACTIVE",
      },
    }),
  ])

  // Curso de prueba
  const course = await prisma.course.upsert({
    where: { id: "course-demo-001" },
    update: {},
    create: {
      id: "course-demo-001",
      title: "Fundamentos de Ventas B2B",
      description: "Aprende las bases del proceso de ventas empresarial",
      isPublished: true,
    },
  })

  // Habilitar curso en el tenant
  await prisma.tenantCourse.upsert({
    where: { tenantId_courseId: { tenantId: tenant.id, courseId: course.id } },
    update: {},
    create: { tenantId: tenant.id, courseId: course.id },
  })

  // Módulos y lecciones
  const module1 = await prisma.module.upsert({
    where: { id: "module-001" },
    update: {},
    create: {
      id: "module-001",
      courseId: course.id,
      title: "Introducción al proceso de ventas",
      order: 1,
    },
  })

  const lessons = await Promise.all([
    prisma.lesson.upsert({
      where: { id: "lesson-001" },
      update: {},
      create: {
        id: "lesson-001",
        moduleId: module1.id,
        title: "¿Qué es una venta B2B?",
        order: 1,
        contentType: "TEXT",
        contentJson: JSON.stringify({
          blocks: [{ type: "paragraph", text: "La venta B2B (Business to Business) es el proceso de vender productos o servicios de una empresa a otra..." }],
        }),
        xpReward: 10,
      },
    }),
    prisma.lesson.upsert({
      where: { id: "lesson-002" },
      update: {},
      create: {
        id: "lesson-002",
        moduleId: module1.id,
        title: "El ciclo de ventas",
        order: 2,
        contentType: "TEXT_AND_QUIZ",
        contentJson: JSON.stringify({
          blocks: [{ type: "paragraph", text: "El ciclo de ventas B2B típicamente incluye: prospección, calificación, propuesta, negociación y cierre..." }],
          quiz: { question: "¿Cuál es la primera etapa del ciclo de ventas?", options: ["Negociación", "Prospección", "Cierre", "Propuesta"], answer: 1 },
        }),
        xpReward: 20,
      },
    }),
    prisma.lesson.upsert({
      where: { id: "lesson-003" },
      update: {},
      create: {
        id: "lesson-003",
        moduleId: module1.id,
        title: "Identificando al decisor",
        order: 3,
        contentType: "TEXT",
        contentJson: JSON.stringify({
          blocks: [{ type: "paragraph", text: "En ventas B2B es clave identificar quién toma la decisión de compra dentro de la organización..." }],
        }),
        xpReward: 10,
      },
    }),
  ])

  // Enrolments y progreso para los alumnos
  const ana = students[0]
  const carlos = students[1]
  const maria = students[2]

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: ana.id, courseId: course.id } },
    update: {},
    create: { userId: ana.id, courseId: course.id, progressPct: 66, xpTotal: 30, lastActivityAt: new Date() },
  })
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: carlos.id, courseId: course.id } },
    update: {},
    create: { userId: carlos.id, courseId: course.id, progressPct: 33, xpTotal: 10, lastActivityAt: new Date(Date.now() - 3 * 86400000) },
  })
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: maria.id, courseId: course.id } },
    update: {},
    create: { userId: maria.id, courseId: course.id, progressPct: 100, xpTotal: 40, lastActivityAt: new Date(), completedAt: new Date() },
  })

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

  // Achievements base
  const achievements = await Promise.all([
    prisma.achievement.upsert({ where: { id: "ach-001" }, update: {}, create: { id: "ach-001", title: "Primera lección", description: "Completaste tu primera lección", triggerType: "LESSONS_COMPLETED", triggerValue: 1 } }),
    prisma.achievement.upsert({ where: { id: "ach-002" }, update: {}, create: { id: "ach-002", title: "Racha de fuego", description: "5 días seguidos", triggerType: "STREAK_DAYS", triggerValue: 5 } }),
    prisma.achievement.upsert({ where: { id: "ach-003" }, update: {}, create: { id: "ach-003", title: "Curso completado", description: "Terminaste un curso completo", triggerType: "COURSES_COMPLETED", triggerValue: 1 } }),
  ])

  // Logro para María (curso completado)
  await prisma.userAchievement.upsert({
    where: { userId_achievementId: { userId: maria.id, achievementId: achievements[2].id } },
    update: {},
    create: { userId: maria.id, achievementId: achievements[2].id },
  })

  console.log("✅ Seed completado")
  console.log(`   Tenant: ${tenant.name} (slug: ${tenant.slug})`)
  console.log(`   Usuarios: 1 super admin, 1 tenant admin, 3 alumnos`)
  console.log(`   Curso: ${course.title}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
