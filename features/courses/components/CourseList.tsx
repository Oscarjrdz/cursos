"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { publishCourse, deleteCourse } from "@/features/courses/actions"

type Course = {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  moduleCount: number
  lessonCount: number
  createdAt: string
}

export default function CourseList({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        <span className="text-6xl">📚</span>
        <p className="font-semibold text-lg" style={{ color: "#0f172a" }}>Sin cursos todavía</p>
        <p className="text-sm" style={{ color: "#94a3b8" }}>Crea tu primer curso para comenzar</p>
        <Link
          href="/admin/courses/new"
          className="mt-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
          style={{ background: "#7c3aed" }}
        >
          + Crear primer curso
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, i) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold leading-snug" style={{ color: "#0f172a" }}>{course.title}</h3>
              {course.description && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "#94a3b8" }}>
                  {course.description}
                </p>
              )}
            </div>
            <span
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
              style={
                course.isPublished
                  ? { background: "#f0fdf4", color: "#16a34a" }
                  : { background: "#fffbeb", color: "#d97706" }
              }
            >
              {course.isPublished ? "Publicado" : "Borrador"}
            </span>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📦</span>
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {course.moduleCount} módulo{course.moduleCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📄</span>
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {course.lessonCount} lección{course.lessonCount !== 1 ? "es" : ""}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
            {!course.isPublished && (
              <button
                onClick={() => publishCourse(course.id)}
                className="flex-1 text-xs py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ background: "#7c3aed" }}
              >
                Publicar
              </button>
            )}
            <Link
              href={`/admin/courses/${course.id}`}
              className="flex-1 text-xs py-2 rounded-lg font-medium text-center transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              Editar
            </Link>
            <button
              onClick={async () => {
                if (confirm("¿Eliminar este curso?")) deleteCourse(course.id)
              }}
              className="text-xs px-3 py-2 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
              style={{ color: "#94a3b8" }}
            >
              🗑
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
