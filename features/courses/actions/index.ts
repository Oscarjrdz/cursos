"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const LessonSchema = z.object({
  title: z.string().min(1),
  contentType: z.enum(["TEXT", "QUIZ", "TEXT_AND_QUIZ"]),
  content: z.string().min(1),
  xpReward: z.coerce.number().min(5).max(100),
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
              contentJson: { blocks: [{ type: "paragraph", text: lesson.content }] },
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
  await prisma.course.delete({ where: { id: courseId } })
  revalidatePath("/admin/courses")
}
