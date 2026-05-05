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

function statusBadge(tenant: Tenant) {
  if (tenant.status === "SUSPENDED" || tenant.expiresIn < 0)
    return { label: "Expirado", bg: "#fef2f2", color: "#dc2626" }
  if (tenant.expiresIn <= 5 || tenant.students.current / tenant.students.max >= 0.9)
    return { label: "Atención", bg: "#fffbeb", color: "#d97706" }
  return { label: "Activo", bg: "#f0fdf4", color: "#16a34a" }
}

const stats = [
  { label: "Clientes activos", key: "totalTenants" as const, icon: "🏢", color: "#7c3aed" },
  { label: "Alumnos totales", key: "totalStudents" as const, icon: "👥", color: "#2563eb" },
  { label: "Activos hoy", key: "activeToday" as const, icon: "⚡", color: "#059669" },
  { label: "Completitud global", key: "globalCompletion" as const, icon: "📊", color: "#dc2626", suffix: "%" },
]

export default function SuperAdminDashboard({ data }: Props) {
  const { tenants } = data

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Resumen general de la plataforma</p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.label}</span>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${s.color}15` }}
              >
                {s.icon}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
              {data.stats[s.key]}{s.suffix ?? ""}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Tenants table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Clientes</h2>
          <button
            className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
            style={{ background: "#7c3aed" }}
          >
            + Nuevo cliente
          </button>
        </div>

        {/* Table header */}
        <div
          className="grid px-6 py-3 text-xs font-medium"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
            color: "#94a3b8",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafafa",
          }}
        >
          <span>Cliente</span>
          <span>Alumnos</span>
          <span>Progreso</span>
          <span>Vencimiento</span>
          <span />
        </div>

        <div>
          {tenants.map((tenant, i) => {
            const badge = statusBadge(tenant)
            const usagePct = Math.min((tenant.students.current / tenant.students.max) * 100, 100)

            return (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="grid px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
                  borderBottom: i < tenants.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Name */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{tenant.name}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    /{tenant.slug} · {tenant.lastActivity}
                  </p>
                </div>

                {/* Students */}
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                    {tenant.students.current}
                    <span className="font-normal" style={{ color: "#94a3b8" }}>/{tenant.students.max}</span>
                  </p>
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-24" style={{ background: "#e2e8f0" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${usagePct}%`,
                        background: usagePct >= 90 ? "#dc2626" : "#7c3aed",
                      }}
                    />
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{tenant.avgProgress}%</p>
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-24" style={{ background: "#e2e8f0" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${tenant.avgProgress}%`, background: "#2563eb" }}
                    />
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: tenant.expiresIn <= 0 ? "#dc2626" : tenant.expiresIn <= 5 ? "#d97706" : "#0f172a",
                    }}
                  >
                    {tenant.expiresIn <= 0 ? "Expirado" : `${tenant.expiresIn} días`}
                  </p>
                </div>

                {/* Action */}
                <div className="flex justify-end">
                  <Link
                    href={`/${tenant.slug}/dashboard`}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ background: "#f1f5f9", color: "#475569" }}
                  >
                    Ver →
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
