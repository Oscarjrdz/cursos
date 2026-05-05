import Link from "next/link"
import { prisma } from "@/lib/prisma"
import CourseList from "@/features/courses/components/CourseList"

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { modules: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const coursesWithCounts = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    isPublished: c.isPublished,
    moduleCount: c._count.modules,
    lessonCount: c.modules.reduce((acc, m) => acc + m._count.lessons, 0),
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Cursos</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Biblioteca de cursos disponibles</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
          style={{ background: "#7c3aed" }}
        >
          + Nuevo curso
        </Link>
      </div>
      <CourseList courses={coursesWithCounts} />
    </div>
  )
}
