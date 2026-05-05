import CourseForm from "@/features/courses/components/CourseForm"

export default function NewCoursePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>
          <a href="/admin/courses" className="hover:underline">Cursos</a>
          {" / "}Nuevo
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Crear curso</h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Manual o desde un PDF con IA</p>
      </div>
      <div className="max-w-3xl">
        <CourseForm />
      </div>
    </div>
  )
}
