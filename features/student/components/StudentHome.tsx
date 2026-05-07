"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Lesson = {
  id: string
  title: string
  order: number
  completed: boolean
  isCurrent: boolean
}

type Module = {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

type Props = {
  tenantSlug: string
  student: { name: string; xpTotal: number }
  streak: { currentDays: number }
  modules: Module[]
  courseName: string | null
  progressPct: number
}

const MODULE_COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#e11d48",
  "#0891b2", "#7c3aed", "#059669",
]

const NODE_ICONS = ["📖", "💡", "🎯", "🏋️", "⭐", "🚀", "💎", "🔑", "🌟", "🎪", "📝", "🧠"]

/* ─── Bottom Nav ─────────────────────────────────────────── */
function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()

  const tabs = [
    { label: "Inicio",   icon: "🏠", href: `/${tenantSlug}/home` },
    { label: "Ranking",  icon: "🏆", href: `/${tenantSlug}/ranking` },
    { label: "Logros",   icon: "🎖", href: `/${tenantSlug}/achievements` },
    { label: "Perfil",   icon: "👤", href: `/${tenantSlug}/profile` },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 py-3 px-5 transition-all"
              style={{ color: active ? "#7c3aed" : "#94a3b8" }}>
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
              {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#7c3aed" }} />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Lesson node ────────────────────────────────────────── */
function LessonNode({ lesson, tenantSlug, icon }: { lesson: Lesson; tenantSlug: string; icon: string }) {
  const size = 64

  if (lesson.completed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div style={{
          width: size, height: size, borderRadius: "50%",
          background: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
        }}>
          <span style={{ fontSize: 28, color: "#ffffff" }}>✓</span>
        </div>
        <span className="text-[10px] font-medium text-center leading-tight max-w-[80px]"
          style={{ color: "#94a3b8" }}>
          {lesson.title}
        </span>
      </div>
    )
  }

  if (lesson.isCurrent) {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Pulsing ring */}
        <div className="relative" style={{ width: size + 16, height: size + 16 }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: "#7c3aed", opacity: 0.3,
            }}
          />
          <Link href={`/${tenantSlug}/lesson/${lesson.id}`}
            style={{
              position: "absolute", inset: 8, borderRadius: "50%",
              background: "#7c3aed",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(124,58,237,0.45)",
              textDecoration: "none",
            }}>
            <span style={{ fontSize: 26 }}>{icon}</span>
          </Link>
        </div>
        <span className="text-[11px] font-semibold text-center leading-tight max-w-[90px]"
          style={{ color: "#7c3aed" }}>
          {lesson.title}
        </span>
        <Link href={`/${tenantSlug}/lesson/${lesson.id}`}
          className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-md transition-all active:scale-95"
          style={{ background: "#7c3aed", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
          COMENZAR
        </Link>
      </div>
    )
  }

  // Locked
  return (
    <div className="flex flex-col items-center gap-2" style={{ opacity: 0.5 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "#e2e8f0", border: "3px solid #cbd5e1",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 22 }}>🔒</span>
      </div>
      <span className="text-[10px] font-medium text-center leading-tight max-w-[80px]"
        style={{ color: "#94a3b8" }}>
        {lesson.title}
      </span>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function StudentHome({ tenantSlug, student, streak, modules, courseName, progressPct }: Props) {
  const firstName = student.name.split(" ")[0]
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)
  const completedLessons = modules.reduce((a, m) => a + m.lessons.filter((l) => l.completed).length, 0)

  // Flat list of all lessons for icon assignment
  let globalLessonIndex = 0

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 px-4"
        style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between py-3 max-w-lg mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
              width={28} height={28} alt="" style={{ borderRadius: "50%" }} />
            <div className="leading-none">
              <span className="text-xs font-bold" style={{ color: "#0f172a" }}>Candidatic </span>
              <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>Knowledge</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: "#fff7ed", border: "1.5px solid #fed7aa" }}>
              <span className="text-sm leading-none">🔥</span>
              <span className="text-xs font-bold" style={{ color: "#ea580c" }}>{streak.currentDays}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: "#faf5ff", border: "1.5px solid #ddd6fe" }}>
              <span className="text-sm leading-none">⚡</span>
              <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>{student.xpTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="pb-28 max-w-lg mx-auto">

        {/* Course header */}
        {courseName && (
          <div className="px-4 pt-5 pb-3">
            <p className="text-xs font-semibold mb-1" style={{ color: "#94a3b8" }}>
              Hola, {firstName} 👋
            </p>
            <h1 className="text-base font-bold" style={{ color: "#0f172a" }}>{courseName}</h1>
            {/* Overall progress bar */}
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] font-medium mb-1" style={{ color: "#94a3b8" }}>
                <span>{completedLessons} de {totalLessons} lecciones</span>
                <span style={{ color: "#7c3aed" }}>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Learning path ── */}
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
            <span className="text-5xl">📚</span>
            <p className="font-bold text-base" style={{ color: "#0f172a" }}>Sin cursos asignados</p>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Tu instructor te asignará un curso pronto
            </p>
          </div>
        ) : (
          <div className="px-4 pt-2">
            {modules.map((module, mIdx) => {
              const color = MODULE_COLORS[mIdx % MODULE_COLORS.length]
              return (
                <div key={module.id} className="mb-4">
                  {/* Module banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mIdx * 0.05 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-6 mx-auto max-w-xs"
                    style={{ background: color }}>
                    <span className="text-white text-sm font-bold opacity-80">Módulo {module.order}</span>
                    <span className="text-white text-sm font-bold flex-1 text-center">{module.title}</span>
                  </motion.div>

                  {/* Lesson nodes zig-zag */}
                  <div className="flex flex-col items-center">
                    {module.lessons.map((lesson, lIdx) => {
                      const icon = NODE_ICONS[globalLessonIndex % NODE_ICONS.length]
                      globalLessonIndex++
                      const isLeft = lIdx % 2 === 0

                      return (
                        <div key={lesson.id} className="flex flex-col items-center w-full">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: mIdx * 0.05 + lIdx * 0.06 }}
                            style={{
                              alignSelf: isLeft ? "flex-start" : "flex-end",
                              marginLeft: isLeft ? "10%" : undefined,
                              marginRight: !isLeft ? "10%" : undefined,
                            }}>
                            <LessonNode lesson={lesson} tenantSlug={tenantSlug} icon={icon} />
                          </motion.div>

                          {/* Connector line */}
                          {lIdx < module.lessons.length - 1 && (
                            <div style={{
                              width: 3, height: 40,
                              background: "linear-gradient(#e2e8f0, #e2e8f0)",
                              borderRadius: 2,
                              margin: "4px 0",
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Spacer between modules */}
                  {mIdx < modules.length - 1 && <div className="h-8" />}
                </div>
              )
            })}

            {/* All done banner */}
            {completedLessons === totalLessons && totalLessons > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 rounded-3xl p-6 text-center"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white font-bold text-lg">¡Curso completado!</p>
                <p className="text-purple-200 text-sm mt-1">Eres increíble, {firstName}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <BottomNav tenantSlug={tenantSlug} />
    </div>
  )
}
