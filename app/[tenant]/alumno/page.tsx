"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"

type Screen = "splash" | "login" | "onboard1" | "onboard2"

const CAT = "https://cdn-icons-png.flaticon.com/128/11051/11051168.png"

/* ─── Safe bottom padding ───────────────────────────────── */
const safeBottom = "max(env(safe-area-inset-bottom, 0px), 24px)"

/* ─── Speech bubble ─────────────────────────────────────── */
function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          border: "1.5px solid #e2e8f0",
          borderRadius: 24,
          padding: "16px 20px",
          textAlign: "center",
          maxWidth: 300,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
      {/* tail pointing down to cat */}
      <div style={{
        width: 0, height: 0,
        borderLeft: "12px solid transparent",
        borderRight: "12px solid transparent",
        borderTop: "14px solid #ffffff",
        margin: "0 auto",
        filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.05))",
      }} />
    </div>
  )
}

/* ─── Floating cat ──────────────────────────────────────── */
function Cat({ size }: { size: number }) {
  return (
    <motion.img
      src={CAT}
      alt=""
      width={size}
      height={size}
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
      style={{ display: "block", margin: "0 auto" }}
    />
  )
}

/* ─── Purple button ─────────────────────────────────────── */
function PurpleBtn({ label, onClick, disabled }: {
  label: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "18px",
        borderRadius: 20,
        background: disabled ? "#c4b5fd" : "#7c3aed",
        boxShadow: disabled ? "none" : "0 4px 0 #5b21b6",
        color: "#ffffff",
        fontSize: 14,
        fontWeight: 900,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </motion.button>
  )
}

/* ─── Screen: Splash ────────────────────────────────────── */
function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#7c3aed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `env(safe-area-inset-top, 48px) 32px ${safeBottom}`,
    }}>
      <div />

      {/* Cat + brand */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <h1 style={{ color: "#ffffff", fontSize: 48, fontWeight: 900,
          letterSpacing: -1, lineHeight: 1, margin: 0, textAlign: "center" }}>
          Bienvenido
        </h1>
        <motion.img
          src={CAT}
          alt=""
          width={96}
          height={96}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
            Candidatic
          </p>
          <p style={{ color: "#ffffff", fontSize: 36, fontWeight: 900,
            letterSpacing: -1, lineHeight: 1, margin: 0 }}>
            Knowledge
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          style={{
            width: "100%", padding: "18px", borderRadius: 20,
            background: "#ffffff", color: "#7c3aed",
            fontSize: 14, fontWeight: 900, letterSpacing: "0.1em",
            textTransform: "uppercase", border: "none", cursor: "pointer",
            boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
          }}
        >
          COMENZAR
        </motion.button>
        <p style={{ color: "rgba(255,255,255,0.45)", textAlign: "center", fontSize: 12, margin: 0 }}>
          Acceso exclusivo para alumnos
        </p>
      </div>
    </div>
  )
}

/* ─── Screen: Login ─────────────────────────────────────── */
function LoginScreen({ slug, onSuccess }: { slug: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ phone: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focused, setFocused] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.phone || !form.password) return
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone.trim(), password: form.password.trim(), slug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      if (data.role !== "STUDENT") { setError("Solo alumnos pueden entrar por aquí"); return }
      onSuccess()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `max(env(safe-area-inset-top, 0px), 48px) 24px ${safeBottom}`,
    }}>
      {/* Cat + bubble */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <Bubble>
          <p style={{ color: "#0f172a", fontSize: 15, fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
            ¡Hola! Ingresa tus datos para continuar
          </p>
        </Bubble>
        <Cat size={96} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {[
          { key: "phone",    label: "Teléfono",   type: "tel",      placeholder: "8116038195" },
          { key: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{label}</label>
            <div
              onFocus={() => setFocused(key)}
              onBlur={() => setFocused(null)}
              style={{
                display: "flex", alignItems: "center",
                padding: "14px 16px", borderRadius: 16,
                border: `2px solid ${focused === key ? "#7c3aed" : "#e2e8f0"}`,
                background: focused === key ? "#faf5ff" : "#f8fafc",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={placeholder}
                autoComplete={key === "phone" ? "tel" : "current-password"}
                style={{
                  width: "100%", fontSize: 16, fontWeight: 500,
                  color: "#0f172a", background: "transparent",
                  border: "none", outline: "none",
                }}
              />
            </div>
          </div>
        ))}

        {error && (
          <p style={{
            fontSize: 13, textAlign: "center", padding: "10px 14px",
            borderRadius: 12, background: "#fef2f2", color: "#dc2626", margin: 0,
          }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !form.phone || !form.password}
            style={{
              width: "100%", padding: "18px", borderRadius: 20,
              background: loading || !form.phone || !form.password ? "#c4b5fd" : "#7c3aed",
              boxShadow: "0 4px 0 #5b21b6",
              color: "#ffffff", fontSize: 14, fontWeight: 900,
              letterSpacing: "0.1em", textTransform: "uppercase",
              border: "none", cursor: "pointer",
            }}
          >
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </motion.button>
        </div>
      </form>
    </div>
  )
}

/* ─── Screen: Onboarding 1 ───────────────────────────────── */
function Onboard1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: `max(env(safe-area-inset-top, 0px), 56px) 24px ${safeBottom}`,
    }}>
      <div />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <Bubble>
          <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
            ¡Hola! Soy <span style={{ color: "#7c3aed" }}>Kiti</span>,{" "}
            tu asistente de aprendizaje 🐱
          </p>
        </Bubble>
        <Cat size={130} />
      </div>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <PurpleBtn label="CONTINUAR" onClick={onNext} />
      </div>
    </div>
  )
}

/* ─── Screen: Onboarding 2 ───────────────────────────────── */
function Onboard2({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  return (
    <div style={{
      minHeight: "100dvh",
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: `max(env(safe-area-inset-top, 0px), 56px) 24px ${safeBottom}`,
    }}>
      <div />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <Bubble>
          <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
            Tienes lecciones esperándote.{" "}
            <span style={{ color: "#7c3aed" }}>¡Empecemos!</span> 🚀
          </p>
          <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500, marginTop: 8, marginBottom: 0 }}>
            Gana XP, mantén tu racha y llega al top
          </p>
        </Bubble>
        <Cat size={130} />
      </div>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <PurpleBtn
          label="COMENZAR MI CURSO"
          onClick={() => router.push(`/${tenantSlug}/home`)}
        />
      </div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────── */
export default function AlumnoPage() {
  const params = useParams()
  const slug = params.tenant as string
  const [screen, setScreen] = useState<Screen>("splash")

  const slideVariants = {
    enter:  { x: "100%", opacity: 0 },
    center: { x: 0,       opacity: 1 },
    exit:   { x: "-40%",  opacity: 0 },
  }

  const content: Record<Screen, React.ReactNode> = {
    splash:   <SplashScreen onNext={() => setScreen("login")} />,
    login:    <LoginScreen slug={slug} onSuccess={() => setScreen("onboard1")} />,
    onboard1: <Onboard1 onNext={() => setScreen("onboard2")} />,
    onboard2: <Onboard2 tenantSlug={slug} />,
  }

  return (
    /* fixed container clips slide animation without hiding content */
    <div style={{ position: "fixed", inset: 0, overflowX: "hidden" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
          style={{ position: "absolute", inset: 0, overflowY: "auto" }}
        >
          {content[screen]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
