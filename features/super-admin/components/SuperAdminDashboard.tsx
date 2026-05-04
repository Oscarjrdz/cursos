"use client"

import { motion } from "framer-motion"
import Link from "next/link"

type TenantStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED"

type Tenant = {
  id: string
  name: string
  slug: string
  students: { current: number; max: number }
  avgProgress: number
  status: TenantStatus
  expiresIn: number
  lastActivity: string
}

type Props = {
  data: {
    stats: { totalTenants: number; totalStudents: number; activeToday: number; globalCompletion: number }
    tenants: Tenant[]
  }
}

function healthStatus(tenant: Tenant): { color: string; dot: string; label: string } {
  if (tenant.status === "SUSPENDED" || tenant.expiresIn < 0) return { color: "#f87171", dot: "bg-red-400", label: "Expirado" }
  if (tenant.expiresIn <= 5 || tenant.students.current / tenant.students.max >= 0.9)
    return { color: "#fbbf24", dot: "bg-yellow-400", label: "Atención" }
  return { color: "#4ade80", dot: "bg-green-400", label: "OK" }
}

export default function SuperAdminDashboard({ data }: Props) {
  const { stats, tenants } = data

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>LearnFlow</p>
            <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm px-4 py-2 rounded-xl font-medium text-white"
              style={{ background: "var(--primary)" }}>
              + Nuevo cliente
            </button>
            <Link href="/" className="text-xs px-3 py-2 rounded-xl" style={{ background: "var(--surface)", color: "var(--muted)" }}>
              ← Salir
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Global Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { icon: "🏢", label: "Clientes activos", value: stats.totalTenants },
            { icon: "👥", label: "Alumnos totales", value: stats.totalStudents },
            { icon: "⚡", label: "Activos hoy", value: stats.activeToday },
            { icon: "📊", label: "Completitud global", value: `${stats.globalCompletion}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: "var(--surface)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span>{s.icon}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Tenants */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold text-white">Clientes</h2>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {tenants.map((tenant, i) => {
              const health = healthStatus(tenant)
              const usagePct = (tenant.students.current / tenant.students.max) * 100

              return (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Semáforo */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${health.dot}`} />
                        <div className={`w-3 h-3 rounded-full ${health.dot} absolute inset-0 animate-ping opacity-50`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{tenant.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          app.com/{tenant.slug} · Último acceso: {tenant.lastActivity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: `${health.color}22`, color: health.color }}
                      >
                        {health.label}
                      </span>
                      <Link
                        href={`/${tenant.slug}/dashboard`}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                        style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                      >
                        Ver →
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {/* Alumnos */}
                    <div>
                      <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                        Alumnos {tenant.students.current}/{tenant.students.max}
                      </p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${usagePct}%`,
                            background: usagePct >= 90 ? "#f87171" : "var(--primary)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Progreso */}
                    <div>
                      <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                        Progreso promedio {tenant.avgProgress}%
                      </p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width: `${tenant.avgProgress}%`, background: "#8b5cf6" }} />
                      </div>
                    </div>

                    {/* Vencimiento */}
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--muted)" }}>Vence en</p>
                      <p className="text-sm font-semibold mt-0.5"
                        style={{ color: tenant.expiresIn <= 0 ? "#f87171" : tenant.expiresIn <= 5 ? "#fbbf24" : "white" }}>
                        {tenant.expiresIn <= 0 ? "Expirado" : `${tenant.expiresIn} días`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
