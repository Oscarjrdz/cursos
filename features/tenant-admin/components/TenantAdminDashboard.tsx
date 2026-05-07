"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { createStudent, updateStudent, setStudentCredentials, deleteStudent } from "@/features/tenant-admin/actions"

type Student = {
  id: string
  name: string
  email: string
  phone: string | null
  hasPassword: boolean
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
  ACTIVE:    { label: "Activo",     bg: "#f0fdf4", color: "#16a34a" },
  INACTIVE:  { label: "Inactivo",   bg: "#fffbeb", color: "#d97706" },
  EXPIRED:   { label: "Expirado",   bg: "#fef2f2", color: "#dc2626" },
  SUSPENDED: { label: "Suspendido", bg: "#fef2f2", color: "#dc2626" },
}

const iStyle = { border: "1px solid #e2e8f0", color: "#0f172a", background: "#fafafa" }
const focus  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "#7c3aed")
const blur   = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = "#e2e8f0")

/* ─── Create modal ─────────────────────────────────────────── */
function CreateModal({ tenantSlug, onClose }: { tenantSlug: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", subscriptionExpiresAt: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError("Nombre y correo son requeridos"); return }
    setLoading(true); setError("")
    try { await createStudent(tenantSlug, { name: form.name.trim(), email: form.email.trim(), subscriptionExpiresAt: form.subscriptionExpiresAt || undefined }); onClose() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Error") }
    finally { setLoading(false) }
  }

  return (
    <Backdrop onClose={onClose}>
      <p className="font-semibold text-base mb-1" style={{ color: "#0f172a" }}>Nuevo alumno</p>
      <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>Agrega un alumno a este cliente</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nombre completo"><input value={form.name} onChange={set("name")} placeholder="María Torres" className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} /></Field>
        <Field label="Correo electrónico"><input type="email" value={form.email} onChange={set("email")} placeholder="maria@empresa.com" className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} /></Field>
        <Field label="Suscripción vence el (opcional)"><input type="date" value={form.subscriptionExpiresAt} onChange={set("subscriptionExpiresAt")} className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} /></Field>
        {error && <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626" }}>{error}</p>}
        <div className="flex gap-3 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: "#f1f5f9", color: "#475569" }}>Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: "#7c3aed" }}>{loading ? "Creando..." : "Crear alumno"}</button>
        </div>
      </form>
    </Backdrop>
  )
}

/* ─── Edit modal ────────────────────────────────────────────── */
function EditModal({ student, tenantSlug, onClose }: { student: Student; tenantSlug: string; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "access">("info")

  /* Info */
  const [info, setInfo] = useState({ name: student.name, email: student.email, status: student.status, subscriptionExpiresAt: student.subscriptionExpiresAt ?? "" })
  const [savingInfo, setSavingInfo] = useState(false)
  const [savedInfo,  setSavedInfo]  = useState(false)
  const [infoError,  setInfoError]  = useState("")
  const setI = (k: keyof typeof info) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setInfo(f => ({ ...f, [k]: e.target.value }))

  async function submitInfo(e: React.FormEvent) {
    e.preventDefault()
    setSavingInfo(true); setInfoError(""); setSavedInfo(false)
    try {
      await updateStudent(tenantSlug, student.id, { name: info.name, email: info.email, status: info.status, subscriptionExpiresAt: info.subscriptionExpiresAt || undefined })
      setSavedInfo(true); setTimeout(() => setSavedInfo(false), 2500)
    } catch (err: unknown) { setInfoError(err instanceof Error ? err.message : "Error") }
    finally { setSavingInfo(false) }
  }

  /* Credentials */
  const [creds, setCreds] = useState({ phone: student.phone ?? "", password: "" })
  const [savingCreds, setSavingCreds] = useState(false)
  const [savedCreds,  setSavedCreds]  = useState(false)
  const [credsError,  setCredsError]  = useState("")

  async function submitCreds(e: React.FormEvent) {
    e.preventDefault()
    if (!creds.phone.trim() || !creds.password.trim()) { setCredsError("Teléfono y contraseña son requeridos"); return }
    setSavingCreds(true); setCredsError(""); setSavedCreds(false)
    try {
      await setStudentCredentials(tenantSlug, student.id, { phone: creds.phone.trim(), password: creds.password })
      setSavedCreds(true); setCreds(c => ({ ...c, password: "" })); setTimeout(() => setSavedCreds(false), 2500)
    } catch (err: unknown) { setCredsError(err instanceof Error ? err.message : "Error") }
    finally { setSavingCreds(false) }
  }

  /* Delete */
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteStudent(student.id, tenantSlug)
    onClose()
  }

  return (
    <Backdrop onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: "#7c3aed" }}>
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>{student.name}</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>{student.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "#f1f5f9" }}>
        {(["info", "access"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === t ? { background: "#ffffff", color: "#7c3aed", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "#94a3b8" }}>
            {t === "info" ? "Datos" : "Acceso"}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        <form onSubmit={submitInfo} className="flex flex-col gap-4">
          <Field label="Nombre"><input value={info.name} onChange={setI("name")} className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} /></Field>
          <Field label="Correo"><input type="email" value={info.email} onChange={setI("email")} className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Estado</label>
              <select value={info.status} onChange={setI("status")} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={iStyle} onFocus={focus} onBlur={blur}>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="EXPIRED">Expirado</option>
                <option value="SUSPENDED">Suspendido</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Suscripción vence</label>
              <input type="date" value={info.subscriptionExpiresAt} onChange={setI("subscriptionExpiresAt")} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={iStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>
          {infoError && <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626" }}>{infoError}</p>}
          <div className="flex items-center justify-between pt-1">
            {savedInfo && <span className="text-xs font-medium" style={{ color: "#16a34a" }}>✓ Guardado</span>}
            <button type="submit" disabled={savingInfo} className="ml-auto px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: "#7c3aed" }}>{savingInfo ? "Guardando..." : "Guardar"}</button>
          </div>

          {/* Delete */}
          <div className="pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
            {!confirmDel ? (
              <button type="button" onClick={() => setConfirmDel(true)} className="text-xs font-medium transition-all hover:opacity-80" style={{ color: "#ef4444" }}>Eliminar alumno</button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-xs flex-1" style={{ color: "#64748b" }}>¿Confirmar eliminación?</p>
                <button type="button" onClick={() => setConfirmDel(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "#f1f5f9", color: "#475569" }}>No</button>
                <button type="button" onClick={handleDelete} disabled={deleting} className="text-xs px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: "#ef4444" }}>{deleting ? "..." : "Sí, eliminar"}</button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Access tab */}
      {tab === "access" && (
        <form onSubmit={submitCreds} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: "#faf5ff", border: "1px solid #ddd6fe", color: "#7c3aed" }}>
            {student.hasPassword ? "✓ Este alumno ya tiene credenciales configuradas" : "Este alumno aún no tiene acceso configurado"}
          </div>
          <Field label="Teléfono (usuario)">
            <input value={creds.phone} onChange={e => setCreds(c => ({ ...c, phone: e.target.value }))} placeholder="8116038195" className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} />
          </Field>
          <Field label={student.hasPassword ? "Nueva contraseña" : "Contraseña"}>
            <input type="password" value={creds.password} onChange={e => setCreds(c => ({ ...c, password: e.target.value }))} placeholder="••••••••" className="w-full text-sm outline-none bg-transparent" style={{ color: "#0f172a" }} />
          </Field>
          {credsError && <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626" }}>{credsError}</p>}
          <div className="flex items-center justify-between pt-1">
            {savedCreds && <span className="text-xs font-medium" style={{ color: "#16a34a" }}>✓ Credenciales guardadas</span>}
            <button type="submit" disabled={savingCreds} className="ml-auto px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60" style={{ background: "#7c3aed" }}>{savingCreds ? "Guardando..." : "Guardar acceso"}</button>
          </div>
        </form>
      )}
    </Backdrop>
  )
}

/* ─── Shared backdrop ───────────────────────────────────────── */
function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }} transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-md rounded-2xl p-6"
          style={{ background: "#ffffff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          onClick={e => e.stopPropagation()}>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "#475569" }}>{label}</label>
      <div className="flex items-center px-3 py-2.5 rounded-xl transition-all"
        style={{ border: `1.5px solid ${focused ? "#7c3aed" : "#e2e8f0"}`, background: focused ? "#faf5ff" : "#fafafa" }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        {children}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${accent ?? "#7c3aed"}15` }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent ?? "#0f172a" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{sub}</p>}
    </div>
  )
}

/* ─── Main dashboard ────────────────────────────────────────── */
export default function TenantAdminDashboard({ tenantSlug, data }: Props) {
  const { tenant, stats, students } = data
  const [showCreate, setShowCreate]   = useState(false)
  const [editing,    setEditing]      = useState<Student | null>(null)
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push(`/${tenantSlug}/login`)
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {showCreate && <CreateModal tenantSlug={tenantSlug} onClose={() => setShowCreate(false)} />}
      {editing    && <EditModal student={editing} tenantSlug={tenantSlug} onClose={() => setEditing(null)} />}

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
              <p className="font-bold text-sm" style={{ color: "#0f172a" }}>{stats.activeStudents}<span style={{ color: "#94a3b8" }}>/{tenant.maxStudents}</span></p>
            </div>
            <button onClick={handleLogout} className="text-xs px-4 py-2 rounded-xl font-medium transition-all hover:bg-slate-100" style={{ background: "#f1f5f9", color: "#475569" }}>← Salir</button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Alumnos activos"  value={stats.activeStudents} sub={`de ${tenant.maxStudents} permitidos`} accent="#7c3aed" />
          <StatCard icon="📊" label="Progreso promedio" value={`${stats.avgProgress}%`} accent="#2563eb" />
          <StatCard icon="⚠️" label="En riesgo"         value={stats.atRisk} sub="Inactivos +3 días" accent={stats.atRisk > 0 ? "#d97706" : "#059669"} />
          <StatCard icon="⏰" label="Por vencer"         value={stats.nearExpiry} sub="Próximos 7 días" accent={stats.nearExpiry > 0 ? "#dc2626" : "#059669"} />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Alumnos</h2>
            <button onClick={() => setShowCreate(true)} className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90" style={{ background: "#7c3aed" }}>+ Nuevo alumno</button>
          </div>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl">👤</span>
              <p className="font-semibold text-sm" style={{ color: "#0f172a" }}>Sin alumnos todavía</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Crea el primer alumno para este cliente</p>
              <button onClick={() => setShowCreate(true)} className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90" style={{ background: "#7c3aed" }}>+ Crear primer alumno</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                    {["Alumno", "Curso", "Progreso", "Último acceso", "Racha", "Suscripción", "Estado", ""].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => {
                    const st = STATUS[student.status] ?? STATUS.INACTIVE
                    const subDays = student.subscriptionDaysLeft
                    return (
                      <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="hover:bg-slate-50 transition-colors"
                        style={{ borderBottom: i < students.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "#7c3aed" }}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{student.name}</p>
                              <p className="text-xs" style={{ color: "#94a3b8" }}>{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm truncate max-w-[140px]" style={{ color: "#475569" }}>{student.courseName ?? <span style={{ color: "#94a3b8" }}>Sin curso</span>}</p>
                          {student.courseCount > 1 && <p className="text-xs" style={{ color: "#94a3b8" }}>+{student.courseCount - 1} más</p>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                              <div className="h-full rounded-full" style={{ width: `${student.progress}%`, background: student.progress === 100 ? "#16a34a" : "#7c3aed" }} />
                            </div>
                            <span className="text-sm font-medium" style={{ color: "#0f172a" }}>{student.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#94a3b8" }}>{student.lastAccess}</td>
                        <td className="px-5 py-4 text-sm font-medium" style={{ color: "#0f172a" }}>
                          {student.streakDays > 0 ? `🔥 ${student.streakDays}` : <span style={{ color: "#94a3b8" }}>—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {subDays === null
                            ? <span className="text-xs" style={{ color: "#94a3b8" }}>Sin límite</span>
                            : <span className="text-sm font-medium" style={{ color: subDays <= 0 ? "#dc2626" : subDays <= 7 ? "#d97706" : "#0f172a" }}>
                                {subDays <= 0 ? "Expirada" : `${subDays}d`}
                              </span>
                          }
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => setEditing(student)}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
                            style={{ background: "#f1f5f9", color: "#475569" }}>
                            Editar
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
