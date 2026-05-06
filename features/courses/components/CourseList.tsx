"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

function DeleteModal({
  course,
  onConfirm,
  onCancel,
}: {
  course: Course
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "#fef2f2" }}
            >
              🗑
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: "#0f172a" }}>
                ¿Eliminar curso?
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                <span className="font-medium" style={{ color: "#0f172a" }}>&ldquo;{course.title}&rdquo;</span>{" "}
                será eliminado permanentemente. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#475569" }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "#ef4444" }}
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function CourseList({ courses }: { courses: Course[] }) {
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null)

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
    <>
      {confirmDelete && (
        <DeleteModal
          course={confirmDelete}
          onConfirm={() => {
            deleteCourse(confirmDelete.id)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

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
                onClick={() => setConfirmDelete(course)}
                className="text-xs px-3 py-2 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                style={{ color: "#94a3b8" }}
              >
                🗑
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  )
}
