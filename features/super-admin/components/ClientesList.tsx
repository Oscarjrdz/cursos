"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { createTenant, deleteTenant } from "@/features/super-admin/actions"

type Tenant = {
  id: string
  name: string
  slug: string
  maxStudents: number
  status: string
  expiresAt: string | null
  studentCount: number
  courseCount: number
  createdAt: string
}

function statusBadge(status: string, expiresAt: string | null) {
  if (status === "SUSPENDED") return { label: "Suspendido", bg: "#fef2f2", color: "#dc2626" }
  if (status === "EXPIRED") return { label: "Expirado", bg: "#fef2f2", color: "#dc2626" }
  if (expiresAt) {
    const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 86400000)
    if (days < 0) return { label: "Expirado", bg: "#fef2f2", color: "#dc2626" }
    if (days <= 7) return { label: "Por vencer", bg: "#fffbeb", color: "#d97706" }
  }
  return { label: "Activo", bg: "#f0fdf4", color: "#16a34a" }
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", slug: "", maxStudents: "50", expiresAt: "" })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) { setError("Nombre y slug son requeridos"); return }
    setLoading(true); setError("")
    try {
      await createTenant({ name: form.name.trim(), slug: form.slug.trim(), maxStudents: parseInt(form.maxStudents) || 50, expiresAt: form.expiresAt || undefined })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear cliente")
    } finally { setLoading(false) }
  }

  const inputStyle = { border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }

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
            <p className="font-semibold text-base" style={{ color: "#0f172a" }}>Nuevo cliente</p>
            <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Crea una nueva empresa en la plataforma</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Nombre de la empresa</label>
              <input value={form.name} onChange={set("name")} placeholder="ACME Corp"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Slug (URL)</label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0", background: "#fafafa" }}>
                <span className="px-3 py-2.5 text-sm" style={{ color: "#94a3b8", borderRight: "1px solid #e2e8f0" }}>app/</span>
                <input value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                  placeholder="acme" className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#475569" }}>Máx. alumnos</label>
                <input type="number" value={form.maxStudents} onChange={set("maxStudents")} min={1}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: "#475569" }}>Vence el</label>
                <input type="date" value={form.expiresAt} onChange={set("expiresAt")}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
              </div>
            </div>
            {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</p>}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100" style={{ background: "#f1f5f9", color: "#475569" }}>Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60" style={{ background: "#7c3aed" }}>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#fef2f2" }}>🗑</div>
            <div>
              <p className="font-semibold text-base" style={{ color: "#0f172a" }}>¿Eliminar cliente?</p>
              <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                <span className="font-medium" style={{ color: "#0f172a" }}>&ldquo;{tenant.name}&rdquo;</span>{" "}
                y todos sus datos serán eliminados permanentemente.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-100" style={{ background: "#f1f5f9", color: "#475569" }}>Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "#ef4444" }}>Eliminar</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function ClientesList({ tenants }: { tenants: Tenant[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null)

  return (
    <div className="p-8">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {confirmDelete && (
        <DeleteModal
          tenant={confirmDelete}
          onConfirm={() => { deleteTenant(confirmDelete.id); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>{tenants.length} empresa{tenants.length !== 1 ? "s" : ""} registrada{tenants.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
          style={{ background: "#7c3aed" }}>
          + Nuevo cliente
        </button>
      </div>

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <span className="text-6xl">🏢</span>
          <p className="font-semibold text-lg" style={{ color: "#0f172a" }}>Sin clientes todavía</p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>Crea tu primer cliente para comenzar</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90"
            style={{ background: "#7c3aed" }}>
            + Crear primer cliente
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tenants.map((tenant, i) => {
            const badge = statusBadge(tenant.status, tenant.expiresAt)
            return (
              <motion.div key={tenant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                  style={{ background: "#7c3aed" }}>
                  {tenant.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>{tenant.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                    /{tenant.slug} · {tenant.studentCount} alumno{tenant.studentCount !== 1 ? "s" : ""} · {tenant.courseCount} curso{tenant.courseCount !== 1 ? "s" : ""} asignado{tenant.courseCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Expiry */}
                {tenant.expiresAt && (
                  <p className="text-xs flex-shrink-0" style={{ color: "#94a3b8" }}>
                    Vence {new Date(tenant.expiresAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/clientes/${tenant.id}`}
                    className="text-xs px-4 py-2 rounded-xl font-medium transition-all hover:opacity-90 text-white"
                    style={{ background: "#7c3aed" }}>
                    Editar
                  </Link>
                  <button onClick={() => setConfirmDelete(tenant)}
                    className="text-xs px-3 py-2 rounded-xl transition-all hover:bg-red-50 hover:text-red-500"
                    style={{ color: "#94a3b8" }}>
                    🗑
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
