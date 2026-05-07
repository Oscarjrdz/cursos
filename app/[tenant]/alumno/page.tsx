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
          width={64}
          height={64}
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

const CAT2 = "https://cdn-icons-png.flaticon.com/128/11051/11051186.png"

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
      background: "linear-gradient(180deg, #faf5ff 0%, #ffffff 40%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: `max(env(safe-area-inset-top, 0px), 40px) 28px ${safeBottom}`,
    }}>

      {/* Cat + bubble */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <Bubble>
          <p style={{ color: "#0f172a", fontSize: 15, fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
            ¡Hola! Ingresa tus accesos
          </p>
        </Bubble>
        <motion.img
          src={CAT2}
          alt=""
          width={64}
          height={64}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          style={{ display: "block", margin: "4px auto 0" }}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>

        {/* Phone field */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 800, color: "#7c3aed",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Teléfono
          </p>
          <div
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "0 20px", height: 66, borderRadius: 16,
              border: `3px solid ${focused === "phone" ? "#7c3aed" : "#e2e8f0"}`,
              background: focused === "phone" ? "#faf5ff" : "#ffffff",
              boxShadow: focused === "phone"
                ? "0 0 0 4px rgba(124,58,237,0.12), 0 4px 0 #e9d5ff"
                : "0 4px 0 #e2e8f0",
              transition: "all 0.2s ease",
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke={focused === "phone" ? "#7c3aed" : "#cbd5e1"} strokeWidth="2.2" strokeLinecap="round"
              style={{ flexShrink: 0, transition: "stroke 0.2s" }}>
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <circle cx="12" cy="18" r="1" fill={focused === "phone" ? "#7c3aed" : "#cbd5e1"} />
              <path d="M10 5h4" />
            </svg>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="Tu número"
              autoComplete="tel"
              inputMode="numeric"
              style={{
                flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: "0.04em",
                color: "#7c3aed", background: "transparent",
                border: "none", outline: "none",
                caretColor: "#7c3aed",
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 800, color: "#7c3aed",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Contraseña
          </p>
          <div
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "0 20px", height: 66, borderRadius: 16,
              border: `3px solid ${focused === "password" ? "#7c3aed" : "#e2e8f0"}`,
              background: focused === "password" ? "#faf5ff" : "#ffffff",
              boxShadow: focused === "password"
                ? "0 0 0 4px rgba(124,58,237,0.12), 0 4px 0 #e9d5ff"
                : "0 4px 0 #e2e8f0",
              transition: "all 0.2s ease",
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke={focused === "password" ? "#7c3aed" : "#cbd5e1"} strokeWidth="2.2" strokeLinecap="round"
              style={{ flexShrink: 0, transition: "stroke 0.2s" }}>
              <rect x="5" y="11" width="14" height="10" rx="2.5" />
              <path d="M8 11V7a4 4 0 018 0v4" />
              <circle cx="12" cy="16" r="1.5" fill={focused === "password" ? "#7c3aed" : "#cbd5e1"} />
            </svg>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              style={{
                flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: "0.06em",
                color: "#7c3aed", background: "transparent",
                border: "none", outline: "none",
                caretColor: "#7c3aed",
              }}
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 14, fontWeight: 700, textAlign: "center", padding: "12px 16px",
              borderRadius: 14, background: "#fef2f2", color: "#dc2626", margin: 0,
              border: "1px solid #fecaca", lineHeight: 1.4,
            }}
          >
            {error}
          </motion.p>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8 }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !form.phone || !form.password}
            style={{
              width: "100%", height: 58, borderRadius: 16,
              background: loading || !form.phone || !form.password
                ? "#c4b5fd" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: loading || !form.phone || !form.password
                ? "none" : "0 4px 0 #5b21b6",
              color: "#ffffff", fontSize: 16, fontWeight: 900,
              letterSpacing: "0.1em", textTransform: "uppercase" as const,
              border: "none", cursor: "pointer", lineHeight: 1.4,
            }}
          >
            {loading ? "Entrando..." : "ENTRAR"}
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
