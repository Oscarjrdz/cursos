"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function TenantLoginPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.tenant as string

  const [form, setForm] = useState({ phone: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(`/${slug}/dashboard`)
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const iStyle = {
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    background: "#fafafa",
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f1f5f9" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#7c3aed" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>LearnFlow</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Acceso Administrador</p>
        </div>

        <div className="rounded-2xl p-6 flex flex-col gap-5"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Teléfono</label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="8116038195"
                style={iStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: "#475569" }}>Contraseña</label>
              <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••"
                style={iStyle}
                onFocus={(e) => (e.target.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            </div>

            {error && (
              <p className="text-xs px-3 py-2.5 rounded-xl" style={{ background: "#fef2f2", color: "#dc2626" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 mt-1"
              style={{ background: "#7c3aed" }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
