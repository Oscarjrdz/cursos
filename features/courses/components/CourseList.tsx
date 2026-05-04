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
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-6xl">📚</span>
        <p className="text-white font-semibold text-lg">Sin cursos todavía</p>
        <p style={{ color: "var(--muted)" }} className="text-sm">Crea tu primer curso para comenzar</p>
        <Link
          href="/admin/courses/new"
          className="mt-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
          style={{ background: "var(--primary)" }}
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
          style={{ background: "var(--surface)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white leading-snug">{course.title}</h3>
              {course.description && (
                <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>
                  {course.description}
                </p>
              )}
            </div>
            <span
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
              style={
                course.isPublished
                  ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                  : { background: "rgba(245,158,11,0.15)", color: "#fbbf24" }
              }
            >
              {course.isPublished ? "Publicado" : "Borrador"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📦</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {course.moduleCount} módulo{course.moduleCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📄</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {course.lessonCount} lección{course.lessonCount !== 1 ? "es" : ""}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            {!course.isPublished && (
              <button
                onClick={() => publishCourse(course.id)}
                className="flex-1 text-xs py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--primary)" }}
              >
                Publicar
              </button>
            )}
            <Link
              href={`/admin/courses/${course.id}`}
              className="flex-1 text-xs py-2 rounded-lg font-medium text-center transition-all hover:opacity-90"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              Editar
            </Link>
            <button
              onClick={async () => {
                if (confirm("¿Eliminar este curso?")) deleteCourse(course.id)
              }}
              className="text-xs px-3 py-2 rounded-lg transition-all hover:bg-red-500/20 hover:text-red-400"
              style={{ color: "var(--muted)" }}
            >
              🗑
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
