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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #eef2ff 50%, #f1f5f9 100%)" }}>
      <div className="w-full max-w-sm">

        {/* Mascot + Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg"
              style={{
                background: "linear-gradient(145deg, #fde68a, #f59e0b)",
                boxShadow: "0 8px 32px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              😺
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow"
              style={{ background: "#7c3aed" }}
            >
              <span className="text-white text-xs font-bold">CK</span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#0f172a" }}>
              Candidatic Knowledge
            </h1>
            <p className="text-xs mt-1 font-medium" style={{ color: "#94a3b8" }}>
              Acceso Administrador
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7 flex flex-col gap-5"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 32px rgba(124,58,237,0.08), 0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid rgba(124,58,237,0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Teléfono">
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="8116038195"
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: "#0f172a" }}
              />
            </Field>

            <Field label="Contraseña">
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className="w-full text-sm outline-none bg-transparent"
                style={{ color: "#0f172a" }}
              />
            </Field>

            {error && (
              <p className="text-xs px-3 py-2.5 rounded-xl text-center" style={{ background: "#fef2f2", color: "#dc2626" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 mt-1"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#cbd5e1" }}>
          © 2025 Candidatic Knowledge
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: "#64748b" }}>{label}</label>
      <div
        className="flex items-center px-4 py-3 rounded-2xl transition-all"
        style={{
          border: `1.5px solid ${focused ? "#7c3aed" : "#e2e8f0"}`,
          background: focused ? "#faf5ff" : "#fafafa",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </div>
    </div>
  )
}
