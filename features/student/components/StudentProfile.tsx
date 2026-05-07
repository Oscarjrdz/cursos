"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

/* ─── Types ───────────────────────────────────────────────── */
type Achievement = { id: string; title: string; description: string; iconUrl: string | null; earnedAt: string }
type Props = {
  tenantSlug: string
  student: {
    name: string
    email: string
    phone: string | null
    avatarUrl: string | null
    xpTotal: number
    createdAt: string
  }
  streak: { currentDays: number; longestDays: number; shields: number }
  stats: {
    lessonsCompleted: number
    totalLessons: number
    coursesEnrolled: number
    coursesCompleted: number
    progressPct: number
  }
  achievements: Achievement[]
}

/* ─── SVG Icons ──────────────────────────────────────────── */
const IconFlame = ({ size = 22, color = "#FF9600" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11zm0 14a2 2 0 01-2-2c0-1.8 2-5 2-5s2 3.2 2 5a2 2 0 01-2 2z"
      fill={color} />
  </svg>
)

const IconGem = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill={color} opacity={0.85} />
    <path d="M2 9h20M6 3l4 6m4 0l4-6M12 21L8 9m4 0l4 12" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
  </svg>
)

const IconHome = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M3 12L12 3l9 9" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconTrophy = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M8 21h8M12 17v4" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 4h14v8a7 7 0 01-14 0V4z" fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" />
    <path d="M5 7H2v3a3 3 0 003 3M19 7h3v3a3 3 0 01-3 3" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconShield = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
      fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 12l2 2 4-4" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/* ─── Bottom Nav ─────────────────────────────────────────── */
function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()
  const tabs = [
    { label: "Inicio",   Icon: IconHome,   href: `/${tenantSlug}/home` },
    { label: "Ranking",  Icon: IconTrophy,  href: `/${tenantSlug}/ranking` },
    { label: "Logros",   Icon: IconShield,  href: `/${tenantSlug}/achievements` },
    { label: "Perfil",   Icon: IconUser,    href: `/${tenantSlug}/profile` },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: "#ffffff", borderTop: "2px solid #f1f5f9", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-1 py-3 px-5">
              <tab.Icon active={active} />
              <span className="text-[10px] font-bold"
                style={{ color: active ? "#7c3aed" : "#94a3b8" }}>
                {tab.label}
              </span>
              {active && (
                <div className="w-5 h-0.5 rounded-full" style={{ background: "#7c3aed" }} />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, value, label, gradient, delay }: {
  icon: React.ReactNode; value: string | number; label: string; gradient: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: "18px 16px",
        border: "1.5px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        flex: 1,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", margin: 0, textAlign: "center" }}>
        {label}
      </p>
    </motion.div>
  )
}

/* ─── Settings row ───────────────────────────────────────── */
function SettingRow({ icon, label, onClick, danger }: {
  icon: string; label: string; onClick?: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px",
        background: "none", border: "none", cursor: "pointer",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: danger ? "#ef4444" : "#0f172a", flex: 1, textAlign: "left" }}>
        {label}
      </span>
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function StudentProfile({ tenantSlug, student, streak, stats, achievements }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const firstName = student.name.split(" ")[0]

  // Avatar initials fallback
  const initials = student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  const memberSince = new Date(student.createdAt).toLocaleDateString("es-MX", {
    month: "long", year: "numeric"
  })

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push(`/${tenantSlug}/alumno`)
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40"
        style={{ background: "#ffffff", borderBottom: "2px solid #f1f5f9", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
              width={30} height={30} alt="" style={{ borderRadius: "50%" }} />
            <div className="leading-none">
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Candidatic </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>Knowledge</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl"
              style={{ background: "#fff7ed", border: "2px solid #FED7AA" }}>
              <IconFlame size={18} color="#FF9600" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#EA580C" }}>{streak.currentDays}</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl"
              style={{ background: "#faf5ff", border: "2px solid #ddd6fe" }}>
              <IconGem size={16} color="#7c3aed" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>{student.xpTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ paddingBottom: 110, maxWidth: 440, margin: "0 auto" }}>

        {/* ─── Profile Header Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-4 mt-5"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
            borderRadius: 24,
            padding: "28px 24px",
            boxShadow: "0 8px 30px rgba(124,58,237,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            position: "absolute", bottom: -20, left: -15,
            width: 70, height: 70, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative", zIndex: 1 }}>
            {/* Avatar */}
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: "3px solid rgba(255,255,255,0.3)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 900, color: "#ffffff",
              }}>
                {initials}
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.2 }}>
                {student.name}
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontWeight: 600 }}>
                Miembro desde {memberSince}
              </p>
              {student.phone && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "2px 0 0", fontWeight: 500 }}>
                  📱 {student.phone}
                </p>
              )}
            </div>
          </div>

          {/* XP Badge */}
          <div style={{
            marginTop: 18,
            display: "flex", gap: 10,
          }}>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <IconGem size={18} color="#e9d5ff" />
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#ffffff", margin: 0 }}>{student.xpTotal}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 600 }}>XP Total</p>
              </div>
            </div>
            <div style={{
              flex: 1,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <IconFlame size={18} color="#fdba74" />
              <div>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#ffffff", margin: 0 }}>{streak.longestDays}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: 600 }}>Mejor racha</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="px-4 mt-5">
          <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>📊 Estadísticas</p>
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard
              icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>}
              value={stats.lessonsCompleted}
              label="Lecciones"
              gradient="linear-gradient(135deg, #22c55e, #16a34a)"
              delay={0.1}
            />
            <StatCard
              icon={<IconFlame size={22} color="white" />}
              value={streak.currentDays}
              label="Racha actual"
              gradient="linear-gradient(135deg, #f97316, #ea580c)"
              delay={0.15}
            />
            <StatCard
              icon={<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>}
              value={stats.coursesEnrolled}
              label={stats.coursesEnrolled === 1 ? "Curso" : "Cursos"}
              gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
              delay={0.2}
            />
          </div>
        </div>

        {/* ─── Progress Overview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
          className="mx-4 mt-5"
          style={{
            background: "#ffffff",
            borderRadius: 20,
            padding: "18px 20px",
            border: "1.5px solid #f1f5f9",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>🎯 Progreso general</p>
            <span style={{ fontSize: 14, fontWeight: 900, color: "#7c3aed" }}>{stats.progressPct}%</span>
          </div>
          <div style={{
            height: 14, borderRadius: 10, background: "#f1f5f9", overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              style={{
                height: "100%", borderRadius: 10,
                background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)",
                boxShadow: "0 0 12px rgba(124,58,237,0.4)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
              {stats.lessonsCompleted} de {stats.totalLessons} lecciones
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
              {stats.coursesCompleted} {stats.coursesCompleted === 1 ? "curso completo" : "cursos completos"}
            </span>
          </div>
        </motion.div>

        {/* ─── Achievements ─── */}
        <div className="px-4 mt-5">
          <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>🏅 Logros obtenidos</p>
          {achievements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                background: "#ffffff",
                borderRadius: 20,
                padding: "28px 20px",
                border: "1.5px solid #f1f5f9",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 40, display: "block", marginBottom: 8 }}>🎖️</span>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", margin: "0 0 4px" }}>
                Aún no tienes logros
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                Completa lecciones y mantén tu racha para desbloquearlos
              </p>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {achievements.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.2 + i * 0.04, 0.5), duration: 0.3, ease: "easeOut" }}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: "14px 16px",
                    border: "1.5px solid #f1f5f9",
                    display: "flex", alignItems: "center", gap: 14,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {ach.iconUrl ? (
                      <img src={ach.iconUrl} width={26} height={26} alt="" />
                    ) : "🏆"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0 }}>{ach.title}</p>
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0", fontWeight: 500 }}>{ach.description}</p>
                  </div>
                  <span style={{ fontSize: 10, color: "#c4b5fd", fontWeight: 700 }}>
                    ✓
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Settings ─── */}
        <div className="px-4 mt-6">
          <p style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>⚙️ Configuración</p>
          <div style={{
            background: "#ffffff",
            borderRadius: 20,
            overflow: "hidden",
            border: "1.5px solid #f1f5f9",
          }}>
            <SettingRow icon="📧" label={student.email} />
            {student.phone && <SettingRow icon="📱" label={student.phone} />}
            <SettingRow icon="🔔" label="Notificaciones" />
            <SettingRow
              icon="🚪"
              label={loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              onClick={handleLogout}
              danger
            />
          </div>
        </div>

        {/* ─── Version footer ─── */}
        <div className="px-4 mt-6 mb-4 text-center">
          <p style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 600, margin: 0 }}>
            Candidatic Knowledge v1.0
          </p>
        </div>
      </div>

      <BottomNav tenantSlug={tenantSlug} />
    </div>
  )
}
