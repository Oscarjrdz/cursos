"use client"

import { useState } from "react"
import Link from "next/link"
import { updateTenant, assignCourse, unassignCourse } from "@/features/super-admin/actions"

type Course = {
  id: string
  title: string
  description: string | null
  moduleCount: number
}

type Tenant = {
  id: string
  name: string
  slug: string
  maxStudents: number
  status: string
  expiresAt: string
  assignedCourseIds: string[]
}

const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
const inputStyle = { border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }

export default function TenantEditPage({ tenant, courses }: { tenant: Tenant; courses: Course[] }) {
  const [form, setForm] = useState({
    name: tenant.name,
    slug: tenant.slug,
    maxStudents: String(tenant.maxStudents),
    status: tenant.status,
    expiresAt: tenant.expiresAt,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [assigned, setAssigned] = useState<Set<string>>(new Set(tenant.assignedCourseIds))
  const [toggling, setToggling] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(""); setSaved(false)
    try {
      await updateTenant(tenant.id, {
        name: form.name,
        slug: form.slug,
        maxStudents: parseInt(form.maxStudents) || 50,
        status: form.status,
        expiresAt: form.expiresAt || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally { setSaving(false) }
  }

  async function handleToggle(courseId: string) {
    setToggling(courseId)
    const isAssigned = assigned.has(courseId)
    try {
      if (isAssigned) {
        await unassignCourse(tenant.id, courseId)
        setAssigned((prev) => { const next = new Set(prev); next.delete(courseId); return next })
      } else {
        await assignCourse(tenant.id, courseId)
        setAssigned((prev) => new Set(prev).add(courseId))
      }
    } finally { setToggling(null) }
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/clientes"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-200"
          style={{ background: "#f1f5f9", color: "#475569" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>{tenant.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Editar datos y cursos asignados</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <p className="font-semibold text-sm mb-5" style={{ color: "#0f172a" }}>Datos del cliente</p>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Nombre</label>
              <input value={form.name} onChange={set("name")} className={inputClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Slug (URL)</label>
              <input value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                className={inputClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Máx. alumnos</label>
              <input type="number" value={form.maxStudents} onChange={set("maxStudents")} min={1}
                className={inputClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Estado</label>
              <select value={form.status} onChange={set("status")}
                className={inputClass} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="ACTIVE">Activo</option>
                <option value="SUSPENDED">Suspendido</option>
                <option value="EXPIRED">Expirado</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Vence el</label>
              <input type="date" value={form.expiresAt} onChange={set("expiresAt")}
                className={inputClass} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
          </div>

          {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</p>}

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs font-medium" style={{ color: "#16a34a" }}>✓ Guardado</span>
            ) : <span />}
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#7c3aed" }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>

      {/* Course assignment */}
      <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>Cursos asignados</p>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              {assigned.size} de {courses.length} curso{courses.length !== 1 ? "s" : ""} publicado{courses.length !== 1 ? "s" : ""} asignado{assigned.size !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <span className="text-3xl">📚</span>
            <p className="text-sm" style={{ color: "#94a3b8" }}>No hay cursos publicados todavía</p>
            <Link href="/admin/courses/new" className="text-xs font-medium mt-1" style={{ color: "#7c3aed" }}>
              Crear un curso →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {courses.map((course) => {
              const isAssigned = assigned.has(course.id)
              const isToggling = toggling === course.id
              return (
                <div key={course.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{
                    border: `1px solid ${isAssigned ? "#ddd6fe" : "#f1f5f9"}`,
                    background: isAssigned ? "#faf5ff" : "#fafafa",
                  }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{course.title}</p>
                    {course.description && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#94a3b8" }}>{course.description}</p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                      {course.moduleCount} módulo{course.moduleCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(course.id)}
                    disabled={isToggling}
                    className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50"
                    style={isAssigned
                      ? { background: "#7c3aed", color: "#ffffff" }
                      : { background: "#f1f5f9", color: "#475569" }}>
                    {isToggling ? "..." : isAssigned ? "✓ Asignado" : "Asignar"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
