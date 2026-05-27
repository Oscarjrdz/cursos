"use client"

import { useState } from "react"

type Tenant = { id: string; name: string; withToken: number }

type Props = {
  tenants: Tenant[]
  totalWithToken: number
}

export default function NotificacionesPanel({ tenants, totalWithToken }: Props) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tenantId, setTenantId] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; sent?: number; error?: string } | null>(null)

  const selectedTenant = tenants.find((t) => t.id === tenantId)
  const targetCount = tenantId === "all" ? totalWithToken : (selectedTenant?.withToken ?? 0)

  async function send() {
    if (!title.trim() || !body.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/mobile/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tenantId: tenantId === "all" ? undefined : tenantId,
        }),
      })
      const data = await res.json()
      if (!res.ok) setResult({ ok: false, error: data.error ?? "Error al enviar" })
      else setResult({ ok: true, sent: data.sent })
    } catch {
      setResult({ ok: false, error: "Error de red" })
    } finally {
      setLoading(false)
    }
  }

  const iStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 14,
    color: "#0f172a",
    background: "#fafafa",
    outline: "none",
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#0f172a" }}>Notificaciones Push</h1>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Envía notificaciones a los alumnos de la plataforma
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <p className="text-2xl font-bold" style={{ color: "#7c3aed" }}>{totalWithToken}</p>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Alumnos con notificaciones activas</p>
        </div>
        <div className="flex-1 rounded-2xl p-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>{tenants.length}</p>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Clientes activos</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl p-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <p className="font-semibold text-sm mb-5" style={{ color: "#0f172a" }}>Redactar notificación</p>

        <div className="flex flex-col gap-4">
          {/* Destinatario */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#64748b" }}>Enviar a</label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              style={iStyle}
            >
              <option value="all">Todos los alumnos ({totalWithToken})</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.withToken} alumnos)
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#64748b" }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. ¡No pierdas tu racha!"
              maxLength={80}
              style={iStyle}
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#64748b" }}>Mensaje</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="ej. Completa una lección hoy para mantener tu racha activa 🔥"
              maxLength={200}
              rows={3}
              style={{ ...iStyle, resize: "vertical" }}
            />
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#94a3b8" }}>Vista previa</p>
              <div className="rounded-xl p-3" style={{ background: "#1e1b4b" }}>
                <p className="text-xs font-bold text-white mb-0.5">{title || "Título"}</p>
                <p className="text-xs" style={{ color: "#c4b5fd" }}>{body || "Mensaje..."}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={result.ok
                ? { background: "#f0fdf4", color: "#16a34a" }
                : { background: "#fef2f2", color: "#dc2626" }}
            >
              {result.ok
                ? `✓ Enviado a ${result.sent} alumno${result.sent === 1 ? "" : "s"}`
                : result.error}
            </div>
          )}

          {/* Send button */}
          <button
            onClick={send}
            disabled={loading || !title.trim() || !body.trim() || targetCount === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "#7c3aed" }}
          >
            {loading
              ? "Enviando..."
              : targetCount === 0
              ? "Sin alumnos con notificaciones activas"
              : `Enviar a ${targetCount} alumno${targetCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  )
}
