import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import CourseEditor from "@/features/courses/components/CourseEditor"

export const dynamic = "force-dynamic"

export default async function CourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  })

  if (!course) notFound()

  return (
    <CourseEditor
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        isPublished: course.isPublished,
        modules: course.modules.map((m) => ({
          id: m.id,
          title: m.title,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            order: l.order,
            contentType: l.contentType as "TEXT" | "QUIZ" | "TEXT_AND_QUIZ",
            contentJson: l.contentJson as Record<string, unknown>,
            xpReward: l.xpReward,
          })),
        })),
      }}
    />
  )
}
