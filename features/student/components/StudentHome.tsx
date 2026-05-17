"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Lesson = { id: string; title: string; order: number; completed: boolean; isCurrent: boolean }
type Module = { id: string; title: string; order: number; lessons: Lesson[] }
type Props = {
  tenantSlug: string
  student: { name: string; xpTotal: number }
  streak: { currentDays: number }
  modules: Module[]
  courseName: string | null
  progressPct: number
}

/* ─── SVG Icons ──────────────────────────────────────────────── */
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

const IconCheck = ({ size = 30, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const IconLock = ({ size = 26, color = "#94a3b8" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="5" y="11" width="14" height="10" rx="2" fill={color} fillOpacity="0.15" stroke={color} />
    <path d="M8 11V7a4 4 0 018 0v4" />
    <circle cx="12" cy="16" r="1.5" fill={color} />
  </svg>
)

const IconBook = ({ size = 28, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M9 7h6M9 11h4" />
  </svg>
)

const IconStar = ({ filled, size = 14 }: { filled: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FFCC00" : "#CBD5E1"} stroke={filled ? "#F59E0B" : "#CBD5E1"} strokeWidth="1">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

const IconPlay = ({ size = 18, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
)

/* ─── Stars row ──────────────────────────────────────────────── */
function Stars({ completed }: { completed: boolean }) {
  return (
    <div className="flex gap-0.5 justify-center mt-1">
      {[0, 1, 2].map(i => <IconStar key={i} filled={completed} size={13} />)}
    </div>
  )
}

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()
  const tabs = [
    { label: "Inicio",   Icon: IconHome,   href: `/${tenantSlug}/home` },
    { label: "Ranking",  Icon: IconTrophy,  href: `/${tenantSlug}/ranking` },
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

/* ─── Module banner ──────────────────────────────────────────── */
const BANNER_GRADIENTS = [
  ["#7c3aed", "#6d28d9"],
  ["#0891b2", "#0e7490"],
  ["#059669", "#047857"],
  ["#d97706", "#b45309"],
  ["#e11d48", "#be123c"],
  ["#2563eb", "#1d4ed8"],
  ["#7c3aed", "#9333ea"],
  ["#0d9488", "#0f766e"],
  ["#dc2626", "#b91c1c"],
]

function ModuleBanner({ module, colorIdx }: { module: Module; colorIdx: number }) {
  const [from, to] = BANNER_GRADIENTS[colorIdx % BANNER_GRADIENTS.length]
  const completed = module.lessons.every(l => l.completed)
  const started = module.lessons.some(l => l.completed)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(colorIdx * 0.04, 0.2), duration: 0.3, ease: "easeOut" }}
      className="mx-4 mb-8 rounded-2xl overflow-hidden"
      style={{ boxShadow: `0 6px 20px ${from}40` }}>
      <div style={{ background: `linear-gradient(135deg, ${from}, ${to})`, padding: "14px 18px" }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
              Módulo {module.order}
            </p>
            <p style={{ color: "#ffffff", fontSize: 15, fontWeight: 800, lineHeight: 1.3, maxWidth: 220 }}>
              {module.title}
            </p>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {completed
              ? <IconCheck size={22} color="white" />
              : started
                ? <IconBook size={20} color="white" />
                : <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M4 6h16M4 12h10M4 18h7" /></svg>
            }
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
          <div className="h-full rounded-full" style={{
            width: `${module.lessons.length === 0 ? 0 : Math.round(module.lessons.filter(l => l.completed).length / module.lessons.length * 100)}%`,
            background: "rgba(255,255,255,0.9)",
          }} />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Lesson node ────────────────────────────────────────────── */
function LessonNode({ lesson, tenantSlug, colorIdx }: { lesson: Lesson; tenantSlug: string; colorIdx: number }) {
  const [from] = BANNER_GRADIENTS[colorIdx % BANNER_GRADIENTS.length]
  const size = 72

  if (lesson.completed) {
    return (
      <div className="flex flex-col items-center">
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: "linear-gradient(135deg, #4ade80, #22c55e)",
          boxShadow: "0 6px 20px rgba(34,197,94,0.4), 0 2px 0 #15803d",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconCheck size={32} color="white" />
        </div>
        <Stars completed={true} />
        <p className="text-[10px] font-semibold text-center mt-1.5 leading-tight" style={{ color: "#64748b", maxWidth: 80 }}>
          {lesson.title}
        </p>
      </div>
    )
  }

  if (lesson.isCurrent) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        {/* START label */}
        <div className="px-4 py-1 rounded-full text-xs font-black" style={{ background: from, color: "white", letterSpacing: "0.08em" }}>
          INICIAR
        </div>
        {/* Pulsing node */}
        <div className="relative" style={{ width: size + 20, height: size + 20 }}>
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: from,
            }}
          />
          <Link href={`/${tenantSlug}/lesson/${lesson.id}`}
            style={{
              position: "absolute", inset: 10, borderRadius: "50%",
              background: `linear-gradient(135deg, ${from}, ${BANNER_GRADIENTS[colorIdx % BANNER_GRADIENTS.length][1]})`,
              boxShadow: `0 6px 20px ${from}60, 0 3px 0 ${BANNER_GRADIENTS[colorIdx % BANNER_GRADIENTS.length][1]}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
            }}>
            <IconPlay size={26} color="white" />
          </Link>
        </div>
        <Stars completed={false} />
        <p className="text-[11px] font-bold text-center leading-tight" style={{ color: from, maxWidth: 90 }}>
          {lesson.title}
        </p>
      </div>
    )
  }

  // Locked
  return (
    <div className="flex flex-col items-center" style={{ opacity: 0.55 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "#e2e8f0",
        border: "4px solid #cbd5e1",
        boxShadow: "0 2px 0 #94a3b8",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <IconLock size={28} color="#94a3b8" />
      </div>
      <Stars completed={false} />
      <p className="text-[10px] font-medium text-center mt-1.5 leading-tight" style={{ color: "#94a3b8", maxWidth: 80 }}>
        {lesson.title}
      </p>
    </div>
  )
}

/* ─── Connector ──────────────────────────────────────────────── */
function Connector({ completed }: { completed: boolean }) {
  return (
    <div style={{ width: 4, height: 36, borderRadius: 4, margin: "2px 0",
      background: completed ? "linear-gradient(#22c55e, #4ade80)" : "#e2e8f0" }} />
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function StudentHome({ tenantSlug, student, streak, modules, courseName, progressPct }: Props) {
  const firstName = student.name.split(" ")[0]
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)
  const completedLessons = modules.reduce((a, m) => a + m.lessons.filter(l => l.completed).length, 0)

  return (
    <div style={{ minHeight: "100dvh", background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40"
        style={{ background: "#ffffff", borderBottom: "2px solid #f1f5f9", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
              width={30} height={30} alt="" style={{ borderRadius: "50%" }} />
            <div className="leading-none">
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Candidatic </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>Knowledge</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl"
              style={{ background: "#fff7ed", border: "2px solid #FED7AA" }}>
              <IconFlame size={18} color="#FF9600" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#EA580C" }}>{streak.currentDays}</span>
            </div>
            {/* XP */}
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

        {/* Course header */}
        {courseName && (
          <div className="px-4 pt-5 pb-4">
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>
              Hola, {firstName}
            </p>
            <h1 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 12, lineHeight: 1.2 }}>
              {courseName}
            </h1>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed", flexShrink: 0 }}>
                {completedLessons}/{totalLessons}
              </span>
            </div>
          </div>
        )}

        {/* ── Learning path ── */}
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBook size={40} color="#94a3b8" />
            </div>
            <p style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Sin cursos asignados</p>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>Tu instructor te asignará un curso pronto</p>
          </div>
        ) : (
          <>
            {modules.map((module, mIdx) => (
              <div key={module.id}>
                <ModuleBanner module={module} colorIdx={mIdx} />

                {/* Nodes */}
                <div className="flex flex-col items-center px-4 mb-10">
                  {module.lessons.map((lesson, lIdx) => {
                    const isLeft = lIdx % 2 === 0
                    const offset = "22%"
                    return (
                      <div key={lesson.id} className="flex flex-col items-center w-full">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(mIdx * 0.03 + lIdx * 0.05, 0.4), duration: 0.3, ease: "easeOut" }}
                          style={{
                            alignSelf: isLeft ? "flex-start" : "flex-end",
                            marginLeft: isLeft ? offset : undefined,
                            marginRight: !isLeft ? offset : undefined,
                          }}>
                          <LessonNode lesson={lesson} tenantSlug={tenantSlug} colorIdx={mIdx} />
                        </motion.div>

                        {lIdx < module.lessons.length - 1 && (
                          <Connector completed={lesson.completed} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* All done */}
            {completedLessons === totalLessons && totalLessons > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="mx-4 mt-2 rounded-3xl p-6 text-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>
                <div className="flex justify-center gap-1 mb-3">
                  {[0,1,2].map(i => <IconStar key={i} filled size={28} />)}
                </div>
                <p style={{ color: "#ffffff", fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
                  ¡Curso completado!
                </p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
                  Eres increíble, {firstName}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <BottomNav tenantSlug={tenantSlug} />
    </div>
  )
}
