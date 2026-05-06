"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { createTenant, deleteTenant } from "@/features/super-admin/actions"

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

const statsMeta = [
  { label: "Clientes activos", key: "totalTenants" as const, icon: "🏢", color: "#7c3aed" },
  { label: "Alumnos totales", key: "totalStudents" as const, icon: "👥", color: "#2563eb" },
  { label: "Activos hoy", key: "activeToday" as const, icon: "⚡", color: "#059669" },
  { label: "Completitud global", key: "globalCompletion" as const, icon: "📊", color: "#dc2626", suffix: "%" },
]

function CreateModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", slug: "", maxStudents: "50", expiresAt: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Nombre y slug son requeridos")
      return
    }
    setLoading(true)
    setError("")
    try {
      await createTenant({
        name: form.name.trim(),
        slug: form.slug.trim(),
        maxStudents: parseInt(form.maxStudents) || 50,
        expiresAt: form.expiresAt || undefined,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p className="font-semibold text-base" style={{ color: "#0f172a" }}>Nuevo cliente</p>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Crea una nueva empresa en la plataforma</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Nombre de la empresa</label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="ACME Corp"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                  background: "#fafafa",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Slug (URL)</label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}>
                <span className="px-3 py-2.5 text-sm" style={{ color: "#94a3b8", borderRight: "1px solid #e2e8f0" }}>
                  plataforma.com/
                </span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                  placeholder="acme"
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                  style={{ color: "#0f172a" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#475569" }}>Máx. alumnos</label>
                <input
                  type="number"
                  value={form.maxStudents}
                  onChange={set("maxStudents")}
                  min={1}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#475569" }}>Vence el (opcional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={set("expiresAt")}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "#7c3aed" }}
              >
                {loading ? "Creando..." : "Crear cliente"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function DeleteModal({ tenant, onConfirm, onCancel }: { tenant: Tenant; onConfirm: () => void; onCancel: () => void }) {
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#fef2f2" }}>
              🗑
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: "#0f172a" }}>¿Eliminar cliente?</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                <span className="font-medium" style={{ color: "#0f172a" }}>&ldquo;{tenant.name}&rdquo;</span>{" "}
                y todos sus datos serán eliminados permanentemente.
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

export default function SuperAdminDashboard({ data }: Props) {
  const { tenants } = data
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null)

  return (
    <div className="p-8">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {confirmDelete && (
        <DeleteModal
          tenant={confirmDelete}
          onConfirm={() => {
            deleteTenant(confirmDelete.id)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Resumen general de la plataforma</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statsMeta.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.label}</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${s.color}15` }}>
                {s.icon}
              </span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
              {data.stats[s.key]}{s.suffix ?? ""}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Clientes</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90"
            style={{ background: "#7c3aed" }}
          >
            + Nuevo cliente
          </button>
        </div>

        <div
          className="grid px-6 py-3 text-xs font-medium"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
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

        {tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🏢</span>
            <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>Sin clientes todavía</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>Crea tu primer cliente para comenzar</p>
          </div>
        ) : (
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
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 100px",
                    borderBottom: i < tenants.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
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

                  <div>
                    <p className="text-sm font-medium" style={{ color: "#0f172a" }}>
                      {tenant.students.current}
                      <span className="font-normal" style={{ color: "#94a3b8" }}>/{tenant.students.max}</span>
                    </p>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-24" style={{ background: "#e2e8f0" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${usagePct}%`, background: usagePct >= 90 ? "#dc2626" : "#7c3aed" }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{tenant.avgProgress}%</p>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-24" style={{ background: "#e2e8f0" }}>
                      <div className="h-full rounded-full" style={{ width: `${tenant.avgProgress}%`, background: "#2563eb" }} />
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: tenant.expiresIn <= 0 ? "#dc2626" : tenant.expiresIn <= 5 ? "#d97706" : "#0f172a",
                      }}
                    >
                      {tenant.expiresIn >= 999 ? "Sin vencimiento" : tenant.expiresIn <= 0 ? "Expirado" : `${tenant.expiresIn} días`}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/${tenant.slug}/dashboard`}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                      style={{ background: "#f1f5f9", color: "#475569" }}
                    >
                      Ver →
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(tenant)}
                      className="text-xs px-2 py-1.5 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                      style={{ color: "#94a3b8" }}
                    >
                      🗑
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
