"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"

type Screen = "splash" | "login" | "onboard1" | "onboard2"

const CAT = "https://cdn-icons-png.flaticon.com/128/11051/11051168.png"

/* ─── Speech bubble ─────────────────────────────────────── */
function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="px-6 py-4 rounded-3xl text-center max-w-xs mx-auto"
        style={{
          background: "#ffffff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          border: "1.5px solid #e2e8f0",
        }}
      >
        {children}
      </div>
      {/* tail pointing down */}
      <div
        style={{
          width: 0, height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "14px solid #ffffff",
          margin: "0 auto",
          filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.06))",
        }}
      />
    </div>
  )
}

/* ─── Floating cat ──────────────────────────────────────── */
function Cat({ size }: { size: number }) {
  return (
    <motion.img
      src={CAT}
      alt="Kiti"
      width={size}
      height={size}
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
      style={{ display: "block" }}
    />
  )
}

/* ─── Continue button ───────────────────────────────────── */
function ContinueBtn({
  label = "CONTINUAR",
  onClick,
  disabled,
  style,
}: {
  label?: string
  onClick: () => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl text-sm font-black tracking-widest text-white uppercase disabled:opacity-50 transition-all"
      style={{ background: "#7c3aed", boxShadow: "0 4px 0 #5b21b6", ...style }}
    >
      {label}
    </motion.button>
  )
}

/* ─── Screen: Splash ────────────────────────────────────── */
function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-between min-h-screen px-6 py-12"
      style={{ background: "#7c3aed" }}
    >
      <div />

      {/* Cat centered */}
      <div className="flex flex-col items-center gap-6">
        <motion.img
          src={CAT}
          alt="Kiti"
          width={160}
          height={160}
          animate={{ y: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
        <div className="text-center">
          <p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-1">
            Candidatic
          </p>
          <h1
            className="text-white font-black"
            style={{ fontSize: 42, letterSpacing: -1, lineHeight: 1 }}
          >
            Knowledge
          </h1>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs space-y-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-sm font-black tracking-widest uppercase transition-all"
          style={{ background: "#ffffff", color: "#7c3aed", boxShadow: "0 4px 0 rgba(0,0,0,0.15)" }}
        >
          COMENZAR
        </motion.button>
        <p className="text-white/50 text-center text-xs">Acceso para alumnos</p>
      </div>
    </div>
  )
}

/* ─── Screen: Login ─────────────────────────────────────── */
function LoginScreen({ slug, onSuccess }: { slug: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ phone: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const [focused, setFocused] = useState<string | null>(null)

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
      if (data.role !== "STUDENT") { setError("Solo alumnos pueden entrar por aquí"); return }
      onSuccess()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-14 pb-10"
      style={{ background: "#ffffff" }}>

      {/* Cat + bubble */}
      <div className="flex flex-col items-center gap-0 mb-8 w-full">
        <Bubble>
          <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
            ¡Hola! Ingresa tus credenciales para continuar
          </p>
        </Bubble>
        <div className="mt-1">
          <Cat size={100} />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4 flex-1">
        {[
          { key: "phone", label: "Teléfono", type: "tel", placeholder: "8116038195" },
          { key: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: "#64748b" }}>{label}</label>
            <div
              className="flex items-center px-4 py-3.5 rounded-2xl transition-all"
              style={{
                border: `2px solid ${focused === key ? "#7c3aed" : "#e2e8f0"}`,
                background: focused === key ? "#faf5ff" : "#f8fafc",
              }}
              onFocus={() => setFocused(key)}
              onBlur={() => setFocused(null)}
            >
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={placeholder}
                className="w-full text-sm outline-none bg-transparent font-medium"
                style={{ color: "#0f172a" }}
              />
            </div>
          </div>
        ))}

        {error && (
          <p className="text-xs text-center px-3 py-2.5 rounded-xl"
            style={{ background: "#fef2f2", color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div className="mt-auto pt-4">
          <ContinueBtn
            label={loading ? "Entrando..." : "ENTRAR"}
            onClick={() => {}}
            disabled={loading}
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
          />
          <button type="submit" className="hidden" />
        </div>
      </form>
    </div>
  )
}

/* ─── Screen: Onboarding 1 ───────────────────────────────── */
function Onboard1({ name, onNext }: { name?: string; onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 pt-16 pb-10"
      style={{ background: "#ffffff" }}>
      <div />

      <div className="flex flex-col items-center gap-0 w-full">
        <Bubble>
          <p className="text-base font-bold leading-snug" style={{ color: "#0f172a" }}>
            {name ? `¡Hola, ${name}! ` : "¡Hola! "}
            Soy <span style={{ color: "#7c3aed" }}>Kiti</span>, tu asistente de aprendizaje 🐱
          </p>
        </Bubble>
        <div className="mt-1">
          <Cat size={120} />
        </div>
      </div>

      <div className="w-full max-w-xs">
        <ContinueBtn onClick={onNext} />
      </div>
    </div>
  )
}

/* ─── Screen: Onboarding 2 ───────────────────────────────── */
function Onboard2({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 pt-16 pb-10"
      style={{ background: "#ffffff" }}>
      <div />

      <div className="flex flex-col items-center gap-0 w-full">
        <Bubble>
          <p className="text-base font-bold leading-snug" style={{ color: "#0f172a" }}>
            Tienes lecciones esperándote.{" "}
            <span style={{ color: "#7c3aed" }}>¡Empecemos!</span> 🚀
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: "#94a3b8" }}>
            Gana XP, mantén tu racha y llega al top del ranking
          </p>
        </Bubble>
        <div className="mt-1">
          <Cat size={120} />
        </div>
      </div>

      <div className="w-full max-w-xs">
        <ContinueBtn
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
  const [studentName, setStudentName] = useState<string | undefined>()

  const screens: Record<Screen, React.ReactNode> = {
    splash: <SplashScreen onNext={() => setScreen("login")} />,
    login: (
      <LoginScreen
        slug={slug}
        onSuccess={() => setScreen("onboard1")}
      />
    ),
    onboard1: <Onboard1 name={studentName} onNext={() => setScreen("onboard2")} />,
    onboard2: <Onboard2 tenantSlug={slug} />,
  }

  const slideVariants = {
    enter: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  }

  return (
    <div className="overflow-hidden" style={{ maxWidth: 430, margin: "0 auto", minHeight: "100svh" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
        >
          {screens[screen]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
