"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createStudent } from "@/features/tenant-admin/actions"

type Student = {
  id: string
  name: string
  email: string
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED"
  courseName: string | null
  courseCount: number
  progress: number
  lastAccess: string
  streakDays: number
  subscriptionDaysLeft: number | null
  subscriptionExpiresAt: string | null
}

type Props = {
  tenantSlug: string
  data: {
    tenant: { name: string; slug: string; maxStudents: number }
    stats: { activeStudents: number; avgProgress: number; atRisk: number; nearExpiry: number }
    students: Student[]
  }
}

const STATUS = {
  ACTIVE: { label: "Activo", bg: "#f0fdf4", color: "#16a34a" },
  INACTIVE: { label: "Inactivo", bg: "#fffbeb", color: "#d97706" },
  EXPIRED: { label: "Expirado", bg: "#fef2f2", color: "#dc2626" },
  SUSPENDED: { label: "Suspendido", bg: "#fef2f2", color: "#dc2626" },
}

function CreateStudentModal({ tenantSlug, onClose }: { tenantSlug: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", subscriptionExpiresAt: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError("Nombre y correo son requeridos"); return }
    setLoading(true); setError("")
    try {
      await createStudent(tenantSlug, {
        name: form.name.trim(),
        email: form.email.trim(),
        subscriptionExpiresAt: form.subscriptionExpiresAt || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear alumno")
    } finally { setLoading(false) }
  }

  const iStyle = { border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }
  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#7c3aed")
  const blur = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = "#e2e8f0")

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          onClick={(e) => e.stopPropagation()}>
          <div>
            <p className="font-semibold text-base" style={{ color: "#0f172a" }}>Nuevo alumno</p>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Agrega un alumno a este cliente</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Nombre completo</label>
              <input value={form.name} onChange={set("name")} placeholder="María Torres"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={iStyle}
                onFocus={focus} onBlur={blur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Correo electrónico</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="maria@empresa.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={iStyle}
                onFocus={focus} onBlur={blur} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Suscripción vence el <span style={{ color: "#94a3b8" }}>(opcional)</span></label>
              <input type="date" value={form.subscriptionExpiresAt} onChange={set("subscriptionExpiresAt")}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={iStyle}
                onFocus={focus} onBlur={blur} />
            </div>
            {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</p>}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
                style={{ background: "#f1f5f9", color: "#475569" }}>Cancelar</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "#7c3aed" }}>
                {loading ? "Creando..." : "Crear alumno"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
          style={{ background: `${accent ?? "#7c3aed"}15` }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent ?? "#0f172a" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{sub}</p>}
    </div>
  )
}

export default function TenantAdminDashboard({ tenantSlug, data }: Props) {
  const { tenant, stats, students } = data
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push(`/${tenantSlug}/login`)
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {showCreate && <CreateStudentModal tenantSlug={tenantSlug} onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="px-8 py-5" style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Dashboard Admin</p>
            <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#0f172a" }}>{tenant.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs" style={{ color: "#94a3b8" }}>Alumnos</p>
              <p className="font-bold text-sm" style={{ color: "#0f172a" }}>
                {stats.activeStudents}
                <span style={{ color: "#94a3b8" }}>/{tenant.maxStudents}</span>
              </p>
            </div>
            <button onClick={handleLogout}
              className="text-xs px-4 py-2 rounded-xl font-medium transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#475569" }}>
              ← Salir
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Alumnos activos" value={stats.activeStudents}
            sub={`de ${tenant.maxStudents} permitidos`} accent="#7c3aed" />
          <StatCard icon="📊" label="Progreso promedio" value={`${stats.avgProgress}%`} accent="#2563eb" />
          <StatCard icon="⚠️" label="En riesgo" value={stats.atRisk}
            sub="Inactivos +3 días" accent={stats.atRisk > 0 ? "#d97706" : "#059669"} />
          <StatCard icon="⏰" label="Por vencer" value={stats.nearExpiry}
            sub="Próximos 7 días" accent={stats.nearExpiry > 0 ? "#dc2626" : "#059669"} />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Alumnos</h2>
            <button onClick={() => setShowCreate(true)}
              className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
              style={{ background: "#7c3aed" }}>
              + Nuevo alumno
            </button>
          </div>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl">👤</span>
              <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>Sin alumnos todavía</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Crea el primer alumno para este cliente</p>
              <button onClick={() => setShowCreate(true)}
                className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: "#7c3aed" }}>
                + Crear primer alumno
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                      {["Alumno", "Cursos", "Progreso", "Último acceso", "Racha", "Suscripción", "Estado", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "#94a3b8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => {
                      const st = STATUS[student.status] ?? STATUS.INACTIVE
                      const subDays = student.subscriptionDaysLeft
                      return (
                        <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-slate-50 transition-colors"
                          style={{ borderBottom: i < students.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                style={{ background: "#7c3aed" }}>
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{student.name}</p>
                                <p className="text-xs" style={{ color: "#94a3b8" }}>{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm truncate max-w-[140px]" style={{ color: "#475569" }}>
                              {student.courseName ?? <span style={{ color: "#94a3b8" }}>Sin curso</span>}
                            </p>
                            {student.courseCount > 1 && (
                              <p className="text-xs" style={{ color: "#94a3b8" }}>+{student.courseCount - 1} más</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${student.progress}%`, background: student.progress === 100 ? "#16a34a" : "#7c3aed" }} />
                              </div>
                              <span className="text-sm font-medium" style={{ color: "#0f172a" }}>{student.progress}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{student.lastAccess}</td>
                          <td className="px-5 py-4 text-sm font-medium" style={{ color: "#0f172a" }}>
                            {student.streakDays > 0 ? `🔥 ${student.streakDays}` : <span style={{ color: "#94a3b8" }}>—</span>}
                          </td>
                          <td className="px-5 py-4">
                            {subDays === null ? (
                              <span className="text-xs" style={{ color: "#94a3b8" }}>Sin límite</span>
                            ) : (
                              <span className="text-sm font-medium"
                                style={{ color: subDays <= 0 ? "#dc2626" : subDays <= 7 ? "#d97706" : "#0f172a" }}>
                                {subDays <= 0 ? "Expirada" : `${subDays}d`}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button className="text-xs px-2.5 py-1.5 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                              style={{ color: "#94a3b8" }}>
                              ···
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y" style={{ borderColor: "#f1f5f9" }}>
                {students.map((student) => {
                  const st = STATUS[student.status] ?? STATUS.INACTIVE
                  return (
                    <div key={student.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                            style={{ background: "#7c3aed" }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{student.name}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{student.email}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${student.progress}%`, background: "#7c3aed" }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: "#0f172a" }}>{student.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: "#94a3b8" }}>
                        <span>{student.lastAccess}</span>
                        <span>{student.streakDays > 0 ? `🔥 ${student.streakDays} días` : "Sin racha"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
