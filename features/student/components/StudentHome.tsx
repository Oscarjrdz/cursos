"use client"

import { motion } from "framer-motion"
import Link from "next/link"

type Props = {
  data: {
    student: { name: string; avatarUrl: string | null; xpTotal: number }
    streak: { currentDays: number; shields: number }
    enrollment: {
      course: { title: string }
      progressPct: number
      nextLesson: { id: string; title: string }
    }
    leaderboard: { rank: number; name: string; xpTotal: number; isCurrentUser: boolean }[]
    achievements: { id: string; title: string; earned: boolean }[]
  }
  tenantSlug: string
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  "ach-001": "⚡",
  "ach-002": "🔥",
  "ach-003": "🏆",
}

export default function StudentHome({ data, tenantSlug }: Props) {
  const { student, streak, enrollment, leaderboard, achievements } = data
  const firstName = student.name.split(" ")[0]

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--background)" }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-10 px-4 pt-safe-top" style={{ background: "var(--background)" }}>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--primary)" }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Bienvenida,</p>
              <p className="font-semibold text-white text-sm">{firstName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* XP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "var(--surface)" }}>
              <span className="text-yellow-400 text-sm">⚡</span>
              <span className="text-white font-bold text-sm">{student.xpTotal}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>XP</span>
            </div>

            {/* Streak Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: "var(--surface)" }}>
              <span className="text-base">🔥</span>
              <span className="text-white font-bold text-sm">{streak.currentDays}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 pt-2">

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">Racha activa</p>
              <p className="text-white text-3xl font-bold">{streak.currentDays} días 🔥</p>
              <p className="text-purple-200 text-xs mt-1">
                {streak.shields > 0 ? `${streak.shields} escudo${streak.shields > 1 ? "s" : ""} disponible${streak.shields > 1 ? "s" : ""}` : "Sin escudos"}
              </p>
            </div>
            <div className="text-6xl opacity-20">🔥</div>
          </div>
        </motion.div>

        {/* Continuar Curso */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Continúa donde dejaste</p>
              <p className="text-white font-semibold text-sm">{enrollment.course.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Siguiente: {enrollment.nextLesson.title}
              </p>
            </div>
            <span className="text-2xl ml-2">📚</span>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--muted)" }}>
              <span>Progreso</span>
              <span className="text-white font-medium">{enrollment.progressPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${enrollment.progressPct}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "var(--primary)" }}
              />
            </div>
          </div>

          <Link
            href={`/${tenantSlug}/courses/${enrollment.nextLesson.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95"
            style={{ background: "var(--primary)" }}
          >
            <span>▶</span> Practicar ahora
          </Link>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold text-sm">🏆 Ranking del equipo</p>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Esta semana</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: entry.isCurrentUser ? "rgba(124,58,237,0.2)" : "var(--surface-2)",
                  border: entry.isCurrentUser ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                }}
              >
                <span className="text-base w-5 text-center">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: entry.isCurrentUser ? "var(--primary)" : "var(--border)" }}>
                  {entry.name.charAt(0)}
                </div>
                <span className="flex-1 text-sm font-medium" style={{ color: entry.isCurrentUser ? "white" : "#d1d5db" }}>
                  {entry.name} {entry.isCurrentUser && <span className="text-xs text-purple-400">(tú)</span>}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">⚡</span>
                  <span className="text-white text-sm font-bold">{entry.xpTotal}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logros */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--surface)" }}
        >
          <p className="text-white font-semibold text-sm">🎖 Logros</p>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{
                  background: ach.earned ? "rgba(124,58,237,0.15)" : "var(--surface-2)",
                  opacity: ach.earned ? 1 : 0.4,
                }}
              >
                <span className="text-2xl">{ACHIEVEMENT_ICONS[ach.id] ?? "🏅"}</span>
                <span className="text-xs text-center leading-tight" style={{ color: ach.earned ? "#e9d5ff" : "var(--muted)" }}>
                  {ach.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-safe-bottom"
        style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-around py-3 max-w-lg mx-auto">
          {[
            { icon: "🏠", label: "Inicio", href: `/${tenantSlug}/home`, active: true },
            { icon: "📚", label: "Cursos", href: `/${tenantSlug}/courses`, active: false },
            { icon: "🏆", label: "Logros", href: `/${tenantSlug}/achievements`, active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all"
              style={{ color: item.active ? "var(--primary-light)" : "var(--muted)" }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
