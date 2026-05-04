import CourseForm from "@/features/courses/components/CourseForm"

export default function NewCoursePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
            Super Admin / <a href="/admin/courses" className="hover:text-white transition-colors">Cursos</a> / Nuevo
          </p>
          <h1 className="text-2xl font-bold text-white">Crear curso</h1>
        </div>
      </div>
      <div className="px-6 py-6 max-w-3xl mx-auto">
        <CourseForm />
      </div>
    </div>
  )
}
