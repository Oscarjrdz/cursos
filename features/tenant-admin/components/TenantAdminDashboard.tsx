"use client"

import { motion } from "framer-motion"
import Link from "next/link"

type Student = {
  id: string
  name: string
  email: string
  course: string
  progress: number
  lastAccess: string
  streakDays: number
  status: "ACTIVE" | "INACTIVE" | "EXPIRED"
  subscriptionDaysLeft: number
}

type Props = {
  data: {
    tenant: { name: string; slug: string; maxStudents: number }
    stats: { activeStudents: number; avgProgress: number; atRisk: number; nearExpiry: number }
    students: Student[]
  }
}

const STATUS_COLORS = {
  ACTIVE: { bg: "rgba(34,197,94,0.15)", text: "#4ade80", label: "Activo" },
  INACTIVE: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", label: "Inactivo" },
  EXPIRED: { bg: "rgba(239,68,68,0.15)", text: "#f87171", label: "Expirado" },
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--surface)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: color ?? "white" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  )
}

export default function TenantAdminDashboard({ data }: Props) {
  const { tenant, stats, students } = data

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>Dashboard Admin</p>
            <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--muted)" }}>Alumnos</p>
              <p className="font-bold text-white">{stats.activeStudents}<span style={{ color: "var(--muted)" }}>/{tenant.maxStudents}</span></p>
            </div>
            <Link
              href="/"
              className="text-xs px-3 py-2 rounded-xl"
              style={{ background: "var(--surface)", color: "var(--muted)" }}
            >
              ← Salir
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatCard icon="👥" label="Alumnos activos" value={stats.activeStudents} sub={`de ${tenant.maxStudents} permitidos`} />
          <StatCard icon="📊" label="Progreso promedio" value={`${stats.avgProgress}%`} />
          <StatCard icon="⚠️" label="En riesgo" value={stats.atRisk} sub="Inactivos +3 días" color="#fbbf24" />
          <StatCard icon="⏰" label="Por vencer" value={stats.nearExpiry} sub="Próximos 7 días" color={stats.nearExpiry > 0 ? "#f87171" : "white"} />
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-white">Alumnos</h2>
            <button
              className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--primary)" }}
            >
              + Nuevo alumno
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Alumno", "Curso", "Progreso", "Último acceso", "Racha", "Suscripción", "Estado", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => {
                  const st = STATUS_COLORS[student.status]
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "var(--primary)" }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{student.name}</p>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-300 max-w-[160px] truncate">{student.course}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                            <div className="h-full rounded-full" style={{ width: `${student.progress}%`, background: student.progress === 100 ? "#22c55e" : "var(--primary)" }} />
                          </div>
                          <span className="text-sm text-white">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "var(--muted)" }}>{student.lastAccess}</td>
                      <td className="px-5 py-4 text-sm text-white">
                        {student.streakDays > 0 ? `🔥 ${student.streakDays}` : <span style={{ color: "var(--muted)" }}>—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${student.subscriptionDaysLeft <= 7 ? "text-red-400" : "text-white"}`}>
                          {student.subscriptionDaysLeft}d
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.text }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                          style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                          ···
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "var(--border)" }}>
            {students.map((student) => {
              const st = STATUS_COLORS[student.status]
              return (
                <div key={student.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ background: "var(--primary)" }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{student.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{student.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full" style={{ width: `${student.progress}%`, background: "var(--primary)" }} />
                    </div>
                    <span className="text-xs text-white">{student.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                    <span>Último acceso: {student.lastAccess}</span>
                    <span>{student.streakDays > 0 ? `🔥 ${student.streakDays} días` : "Sin racha"}</span>
                    <span className={student.subscriptionDaysLeft <= 7 ? "text-red-400" : ""}>{student.subscriptionDaysLeft}d restantes</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
