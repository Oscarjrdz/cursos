"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const QuizItemSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
  explanation: z.string().optional(),
})

const LessonSchema = z.object({
  title: z.string().min(1),
  contentType: z.enum(["TEXT", "QUIZ", "TEXT_AND_QUIZ"]),
  content: z.string().min(1),
  xpReward: z.coerce.number().min(5).max(100),
  quiz: z.array(QuizItemSchema).optional(),
})

const ModuleSchema = z.object({
  title: z.string().min(1),
  lessons: z.array(LessonSchema),
})

const CourseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  modules: z.array(ModuleSchema).min(1, "Agrega al menos un módulo"),
})

export type CourseFormState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createCourse(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    modules: JSON.parse((formData.get("modules") as string) ?? "[]"),
  }

  const parsed = CourseSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { title, description, modules } = parsed.data

  const course = await prisma.course.create({
    data: {
      title,
      description,
      isPublished: false,
      modules: {
        create: modules.map((mod, modIdx) => ({
          title: mod.title,
          order: modIdx + 1,
          lessons: {
            create: mod.lessons.map((lesson, lessonIdx) => ({
              title: lesson.title,
              order: lessonIdx + 1,
              contentType: lesson.contentType,
              contentJson: {
                blocks: [{ type: "paragraph", text: lesson.content }],
                ...(lesson.quiz && lesson.quiz.length > 0 && { quiz: lesson.quiz }),
              },
              xpReward: lesson.xpReward,
            })),
          },
        })),
      },
    },
  })

  revalidatePath("/admin/courses")
  redirect(`/admin/courses`)
}

export async function publishCourse(courseId: string) {
  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  })
  revalidatePath("/admin/courses")
}

export async function deleteCourse(courseId: string) {
  await prisma.$transaction([
    prisma.tenantCourse.deleteMany({ where: { courseId } }),
    prisma.enrollment.deleteMany({ where: { courseId } }),
    prisma.course.delete({ where: { id: courseId } }),
  ])
  revalidatePath("/admin/courses")
}

// ── Course editor actions ────────────────────────────────────────────────────

export async function updateCourseAction(courseId: string, data: { title: string; description?: string }) {
  await prisma.course.update({
    where: { id: courseId },
    data: { title: data.title.trim(), description: data.description?.trim() ?? null },
  })
  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath("/admin/courses")
}

export async function updateModuleAction(moduleId: string, data: { title: string }) {
  const mod = await prisma.module.update({
    where: { id: moduleId },
    data: { title: data.title.trim() },
    select: { courseId: true },
  })
  revalidatePath(`/admin/courses/${mod.courseId}`)
}

export async function updateLessonAction(
  lessonId: string,
  data: { title: string; contentType: "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"; contentJson: Record<string, unknown>; xpReward: number }
) {
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: data.title.trim(),
      contentType: data.contentType,
      contentJson: data.contentJson as Parameters<typeof prisma.lesson.update>[0]["data"]["contentJson"],
      xpReward: data.xpReward,
    },
  })
  const mod = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: { select: { courseId: true } } } })
  revalidatePath(`/admin/courses/${mod?.module.courseId ?? ""}`)
}

export async function addLessonAction(moduleId: string) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { _count: { select: { lessons: true } } },
  })
  if (!mod) return null
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: "Nueva lección",
      order: mod._count.lessons + 1,
      contentType: "TEXT",
      contentJson: { blocks: [{ type: "paragraph", text: "Escribe aquí el contenido de la lección..." }] },
      xpReward: 10,
    },
  })
  revalidatePath(`/admin/courses/${mod.courseId}`)
  return {
    id: lesson.id,
    title: lesson.title,
    order: lesson.order,
    contentType: lesson.contentType as "TEXT" | "QUIZ" | "TEXT_AND_QUIZ",
    contentJson: lesson.contentJson as Record<string, unknown>,
    xpReward: lesson.xpReward,
  }
}

export async function deleteLessonAction(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  })
  if (!lesson) return
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath(`/admin/courses/${lesson.module.courseId}`)
}

export async function addModuleAction(courseId: string) {
  const count = await prisma.module.count({ where: { courseId } })
  const mod = await prisma.module.create({
    data: {
      courseId,
      title: "Nuevo módulo",
      order: count + 1,
      lessons: {
        create: [{
          title: "Nueva lección",
          order: 1,
          contentType: "TEXT",
          contentJson: { blocks: [{ type: "paragraph", text: "Escribe aquí el contenido de la lección..." }] },
          xpReward: 10,
        }],
      },
    },
    include: { lessons: true },
  })
  revalidatePath(`/admin/courses/${courseId}`)
  return {
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: mod.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order,
      contentType: l.contentType as "TEXT" | "QUIZ" | "TEXT_AND_QUIZ",
      contentJson: l.contentJson as Record<string, unknown>,
      xpReward: l.xpReward,
    })),
  }
}

export async function deleteModuleAction(moduleId: string) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } })
  if (!mod) return
  await prisma.module.delete({ where: { id: moduleId } })
  revalidatePath(`/admin/courses/${mod.courseId}`)
}
