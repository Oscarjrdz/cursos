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
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
              <Link href="/admin/dashboard" className="hover:text-white transition-colors">Super Admin</Link>
              {" / "}Cursos
            </p>
            <h1 className="text-2xl font-bold text-white">Biblioteca de cursos</h1>
          </div>
          <Link
            href="/admin/courses/new"
            className="px-4 py-2 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)" }}
          >
            + Nuevo curso
          </Link>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto">
        <CourseList courses={coursesWithCounts} />
      </div>
    </div>
  )
}
