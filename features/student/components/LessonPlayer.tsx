"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useRouter } from "next/navigation"
import { completeLesson } from "@/features/student/actions"

type QuizItem = { question: string; options: string[]; correctIndex: number; explanation?: string }
type LessonProps = {
  tenantSlug: string; userId: string
  lesson: { id: string; title: string; contentType: string; contentJson: Record<string, unknown>; xpReward: number }
  lessonIndex: number; totalLessons: number; alreadyCompleted: boolean
}
type QuizState = "idle" | "correct" | "wrong"
type Step = { type: "content"; idx: number } | { type: "quiz"; idx: number }

/* ─── Parse ─────────────────────────────────────────────────── */
function parseContent(cj: Record<string, unknown>) {
  let raw = ""
  if (Array.isArray(cj.blocks)) raw = (cj.blocks as { text: string }[]).map(b => b.text ?? "").filter(Boolean).join("\n\n")
  else raw = String(cj.content ?? cj.text ?? "")
  const paragraphs = raw.split("\n\n").map(p => p.trim()).filter(Boolean)
  let quiz: QuizItem[] = []
  if (Array.isArray(cj.quiz)) quiz = cj.quiz as QuizItem[]
  else if (cj.question) quiz = [{ question: cj.question as string, options: cj.options as string[], correctIndex: cj.correctIndex as number, explanation: cj.explanation as string | undefined }]
  return { paragraphs, quiz }
}

/* ─── SVG Icons ─────────────────────────────────────────────── */
const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)
const IcoBook = ({ color = "#7c3aed" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    <path d="M9 7h6M9 11h4"/>
  </svg>
)
const IcoBolt = ({ color = "#f59e0b" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)
const IcoCheck = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
)
const IcoX = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)
const IcoHeart = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#f43f5e" : "none"} stroke={filled ? "#f43f5e" : "#cbd5e1"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
)
const IcoStar = ({ filled, size = 36 }: { filled: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FFCC00" : "#e2e8f0"} stroke={filled ? "#f59e0b" : "#cbd5e1"} strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const IcoTrophy = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
    <path d="M8 21h8M12 17v4"/><path d="M5 4h14v8a7 7 0 01-14 0V4z"/>
    <path d="M5 7H2v3a3 3 0 003 3M19 7h3v3a3 3 0 01-3 3"/>
  </svg>
)
const IcoArrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const IcoFlame = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff9600">
    <path d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11zm0 14a2 2 0 01-2-2c0-1.8 2-5 2-5s2 3.2 2 5a2 2 0 01-2 2z"/>
  </svg>
)

/* ─── Progress dots ──────────────────────────────────────────── */
function ProgressDots({ steps, currentIdx }: { steps: Step[]; currentIdx: number }) {
  return (
    <div className="flex items-center gap-1 flex-1 px-2">
      {steps.map((s, i) => (
        <motion.div key={i}
          animate={{ scaleX: i === currentIdx ? 1 : 1 }}
          className="h-2 rounded-full flex-1"
          style={{
            background: i < currentIdx ? "#22c55e"
              : i === currentIdx ? (s.type === "content" ? "#7c3aed" : "#f59e0b")
                : "#e2e8f0",
            maxWidth: i === currentIdx ? 999 : 999,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  )
}

/* ─── Content slide ──────────────────────────────────────────── */
function ContentSlide({ text, paraIdx, paraTotal, lessonTitle }: {
  text: string; paraIdx: number; paraTotal: number; lessonTitle: string
}) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="max-w-lg mx-auto">
        {/* Header badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f3f0ff" }}>
            <IcoBook color="#7c3aed" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: "#7c3aed" }}>Lectura</p>
            <p className="text-[10px]" style={{ color: "#94a3b8" }}>{paraIdx + 1} de {paraTotal} secciones</p>
          </div>
        </div>

        {/* Paragraph number indicator */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: paraTotal }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= paraIdx ? "#7c3aed" : "#e2e8f0" }} />
          ))}
        </div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-5"
          style={{ background: "#ffffff", border: "1.5px solid #ede9fe", boxShadow: "0 4px 24px rgba(124,58,237,0.07)" }}>
          {/* First sentence highlighted */}
          {sentences.length > 0 && (
            <p className="text-base font-bold leading-snug mb-3" style={{ color: "#0f172a" }}>
              {sentences[0]}
            </p>
          )}
          {sentences.length > 1 && (
            <p className="text-sm leading-relaxed" style={{ color: "#475569", lineHeight: 1.75 }}>
              {sentences.slice(1).join(" ")}
            </p>
          )}
        </motion.div>

        {/* Tip banner for first slide */}
        {paraIdx === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-start gap-3 mt-4 px-4 py-3 rounded-2xl"
            style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}>
            <IcoBook color="#a78bfa" />
            <p className="text-xs leading-relaxed" style={{ color: "#7c3aed" }}>
              <strong>Tip:</strong> Lee con atención. Al finalizar las secciones vendrán 5 preguntas de evaluación.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Quiz slide ─────────────────────────────────────────────── */
function QuizSlide({ item, quizIdx, quizTotal, selected, onSelect, quizState, lives }: {
  item: QuizItem; quizIdx: number; quizTotal: number
  selected: number | null; onSelect: (i: number) => void; quizState: QuizState; lives: number
}) {
  const shakeControls = useAnimation()

  useEffect(() => {
    if (quizState === "wrong") shakeControls.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } })
  }, [quizState, shakeControls])

  function optionStyle(i: number): React.CSSProperties {
    const base: React.CSSProperties = { background: "#ffffff", border: "2.5px solid #e2e8f0", color: "#0f172a", cursor: "pointer" }
    if (quizState === "idle") {
      if (selected === i) return { ...base, border: "2.5px solid #7c3aed", background: "#faf5ff", color: "#7c3aed" }
      return base
    }
    if (i === item.correctIndex) return { ...base, border: "2.5px solid #22c55e", background: "#f0fdf4", color: "#15803d" }
    if (selected === i) return { ...base, border: "2.5px solid #ef4444", background: "#fef2f2", color: "#dc2626" }
    return { ...base, opacity: 0.4 }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fffbeb" }}>
              <IcoBolt color="#f59e0b" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>Evaluación</p>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>Pregunta {quizIdx + 1} de {quizTotal}</p>
            </div>
          </div>
          {/* Lives */}
          <div className="flex gap-1">
            {[0, 1, 2].map(i => <IcoHeart key={i} filled={i < lives} />)}
          </div>
        </div>

        {/* Quiz progress dots */}
        <div className="flex gap-1.5 mb-5">
          {Array.from({ length: quizTotal }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full" style={{
              background: i < quizIdx ? "#22c55e" : i === quizIdx ? "#f59e0b" : "#e2e8f0"
            }} />
          ))}
        </div>

        {/* Question */}
        <motion.div animate={shakeControls}
          className="rounded-3xl p-5 mb-5"
          style={{ background: "#fffbeb", border: "1.5px solid #fde68a", boxShadow: "0 4px 20px rgba(245,158,11,0.1)" }}>
          <p className="text-base font-bold leading-snug text-center" style={{ color: "#0f172a" }}>
            {item.question}
          </p>
        </motion.div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {item.options.map((opt, i) => (
            <motion.button key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
              whileTap={quizState === "idle" ? { scale: 0.97 } : {}}
              onClick={() => quizState === "idle" && onSelect(i)}
              className="w-full text-left px-4 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 transition-all"
              style={optionStyle(i)}>
              {/* Letter badge */}
              <span className="w-7 h-7 rounded-xl text-center text-xs font-black leading-7 flex-shrink-0"
                style={{
                  background: quizState !== "idle" && i === item.correctIndex ? "#22c55e"
                    : quizState !== "idle" && selected === i ? "#ef4444"
                      : selected === i && quizState === "idle" ? "#7c3aed"
                        : "#f1f5f9",
                  color: (quizState !== "idle" && (i === item.correctIndex || selected === i)) || (selected === i && quizState === "idle") ? "white" : "#64748b",
                }}>
                {["A", "B", "C", "D"][i]}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {/* Feedback icon */}
              {quizState !== "idle" && i === item.correctIndex && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#22c55e" }}>
                  <IcoCheck size={16} />
                </motion.div>
              )}
              {quizState !== "idle" && selected === i && i !== item.correctIndex && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#ef4444" }}>
                  <IcoX size={16} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {quizState !== "idle" && item.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-2xl px-4 py-3"
              style={{
                background: quizState === "correct" ? "#f0fdf4" : "#fef2f2",
                border: `1.5px solid ${quizState === "correct" ? "#bbf7d0" : "#fecaca"}`,
              }}>
              <p className="text-xs font-semibold mb-1" style={{ color: quizState === "correct" ? "#15803d" : "#dc2626" }}>
                {quizState === "correct" ? "✦ ¡Correcto!" : "✦ Respuesta incorrecta"}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: quizState === "correct" ? "#16a34a" : "#ef4444" }}>
                {item.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─── Feedback banner ────────────────────────────────────────── */
function FeedbackBanner({ state, onContinue, isLast, combo }: {
  state: QuizState; onContinue: () => void; isLast: boolean; combo: number
}) {
  if (state === "idle") return null
  const correct = state === "correct"
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="px-5 pt-4 pb-5"
        style={{ background: correct ? "#f0fdf4" : "#fef2f2", borderTop: `2.5px solid ${correct ? "#22c55e" : "#ef4444"}` }}>
        <div className="max-w-lg mx-auto">
          {/* Combo badge */}
          {correct && combo >= 3 && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
              className="flex items-center gap-1 mb-2">
              <IcoFlame />
              <span className="text-xs font-black" style={{ color: "#ea580c" }}>
                ¡Racha de {combo}! Sigue así
              </span>
            </motion.div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: correct ? "#22c55e" : "#ef4444" }}>
                  {correct ? <IcoCheck size={18} /> : <IcoX size={18} />}
                </motion.div>
                <p className="font-black text-sm" style={{ color: correct ? "#15803d" : "#dc2626" }}>
                  {correct ? "¡Correcto!" : "Incorrecto"}
                </p>
              </div>
              <p className="text-xs mt-0.5" style={{ color: correct ? "#16a34a" : "#ef4444" }}>
                {correct ? "¡Excelente razonamiento!" : "Revisa la explicación"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white flex-shrink-0"
              style={{ background: correct ? "#22c55e" : "#ef4444", boxShadow: `0 4px 0 ${correct ? "#15803d" : "#dc2626"}` }}>
              {isLast ? "Finalizar" : "Siguiente"}
              <IcoArrow />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Celebration ────────────────────────────────────────────── */
function CelebrationScreen({ xpReward, tenantSlug, score, total, onRestart }: {
  xpReward: number; tenantSlug: string; score: number; total: number; onRestart: () => void
}) {
  const router = useRouter()
  const pct = total > 0 ? Math.round((score / total) * 100) : 100
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "linear-gradient(160deg, #faf5ff 0%, #f0f9ff 100%)", zIndex: 100 }}>

      {/* Cat */}
      <motion.img
        src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
        width={110} height={110} alt=""
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
      />

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-black mt-4 mb-1" style={{ color: "#0f172a" }}>
          {pct === 100 ? "¡Perfecto!" : pct >= 60 ? "¡Bien hecho!" : "¡Lección completada!"}
        </h1>
        {total > 0 && (
          <p className="text-sm" style={{ color: "#64748b" }}>{score} de {total} respuestas correctas</p>
        )}
      </motion.div>

      {/* Stars */}
      {total > 0 && (
        <div className="flex gap-2 mt-5">
          {[1, 2, 3].map((s, i) => (
            <motion.div key={s}
              initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 400 }}>
              <IcoStar filled={s <= stars} size={44} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="flex gap-3 mt-5">
        {total > 0 && (
          <div className="flex flex-col items-center px-5 py-4 rounded-2xl"
            style={{ background: "#ffffff", border: "2px solid #ddd6fe", boxShadow: "0 4px 20px rgba(124,58,237,0.08)" }}>
            <span className="text-3xl font-black" style={{ color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444" }}>
              {pct}%
            </span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: "#94a3b8" }}>precisión</span>
          </div>
        )}
        <div className="flex flex-col items-center px-5 py-4 rounded-2xl"
          style={{ background: "#ffffff", border: "2px solid #ddd6fe", boxShadow: "0 4px 20px rgba(124,58,237,0.08)" }}>
          <div className="flex items-center gap-1">
            <IcoBolt color="#7c3aed" />
            <span className="text-3xl font-black" style={{ color: "#7c3aed" }}>+{xpReward}</span>
          </div>
          <span className="text-xs font-semibold mt-0.5" style={{ color: "#94a3b8" }}>XP ganados</span>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        className="mt-8 w-full max-w-xs flex flex-col gap-3">
        <motion.button whileTap={{ scale: 0.96 }}
          onClick={() => router.push(`/${tenantSlug}/home`)}
          className="w-full py-4 rounded-2xl text-sm font-black text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 5px 0 #5b21b6" }}>
          Continuar →
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }}
          onClick={onRestart}
          className="w-full py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "#f1f5f9", color: "#475569" }}>
          Repetir lección
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function LessonPlayer({ tenantSlug, userId, lesson, lessonIndex, totalLessons, alreadyCompleted }: LessonProps) {
  const router = useRouter()
  const { paragraphs, quiz } = parseContent(lesson.contentJson)

  const steps: Step[] = [
    ...paragraphs.map((_, i): Step => ({ type: "content", idx: i })),
    ...quiz.map((_, i): Step => ({ type: "quiz", idx: i })),
  ]
  if (steps.length === 0) steps.push({ type: "content", idx: 0 })

  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [slideDir, setSlideDir] = useState(1)

  const currentStep = steps[stepIdx]
  const isLastStep = stepIdx === steps.length - 1

  function handleClose() { router.push(`/${tenantSlug}/home`) }

  function handleSelect(i: number) {
    if (quizState !== "idle") return
    setSelected(i)
    const correct = i === quiz[currentStep.idx].correctIndex
    setQuizState(correct ? "correct" : "wrong")
    if (correct) { setScore(s => s + 1); setCombo(c => c + 1) }
    else { setLives(l => Math.max(0, l - 1)); setCombo(0) }
  }

  async function handleContinue() {
    if (isLastStep) {
      if (!alreadyCompleted && !saving) {
        setSaving(true)
        await completeLesson(userId, lesson.id, tenantSlug)
        setSaving(false)
      }
      setDone(true)
      return
    }
    setSlideDir(1)
    setStepIdx(s => s + 1)
    setSelected(null)
    setQuizState("idle")
  }

  function handleRestart() {
    setStepIdx(0); setSelected(null); setQuizState("idle")
    setScore(0); setLives(3); setCombo(0); setDone(false)
  }

  if (done) {
    return (
      <CelebrationScreen
        xpReward={alreadyCompleted ? 0 : lesson.xpReward}
        tenantSlug={tenantSlug}
        score={score}
        total={quiz.length}
        onRestart={handleRestart}
      />
    )
  }

  const contentVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: -dir * 40 }),
  }

  const showContinueBtn = currentStep.type === "content" || (currentStep.type === "quiz" && quizState !== "idle")
  const showWaitBtn = currentStep.type === "quiz" && quizState === "idle" && selected === null

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#f8fafc" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ background: "#ffffff", borderBottom: "1.5px solid #f1f5f9" }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#f1f5f9" }}>
          <IcoClose />
        </motion.button>
        <ProgressDots steps={steps} currentIdx={stepIdx} />
        <div className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: currentStep.type === "content" ? "#f3f0ff" : "#fffbeb",
            color: currentStep.type === "content" ? "#7c3aed" : "#d97706" }}>
          {stepIdx + 1}/{steps.length}
        </div>
      </div>

      {/* Lesson subtitle */}
      <div className="px-5 pt-3" style={{ background: "#ffffff" }}>
        <div className="max-w-lg mx-auto pb-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
            Lección {lessonIndex + 1} de {totalLessons}
          </p>
          <p className="text-sm font-bold leading-tight mt-0.5" style={{ color: "#0f172a" }}>
            {lesson.title}
          </p>
        </div>
      </div>

      {/* ── Content area ── */}
      <AnimatePresence mode="wait" custom={slideDir}>
        <motion.div
          key={`${currentStep.type}-${currentStep.idx}`}
          custom={slideDir}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="flex-1 flex flex-col overflow-hidden">

          {currentStep.type === "content" && (
            <ContentSlide
              text={paragraphs[currentStep.idx] ?? ""}
              paraIdx={currentStep.idx}
              paraTotal={paragraphs.length}
              lessonTitle={lesson.title}
            />
          )}

          {currentStep.type === "quiz" && (
            <QuizSlide
              item={quiz[currentStep.idx]}
              quizIdx={currentStep.idx}
              quizTotal={quiz.length}
              selected={selected}
              onSelect={handleSelect}
              quizState={quizState}
              lives={lives}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Bottom actions ── */}
      {currentStep.type === "quiz" && quizState !== "idle" ? (
        <FeedbackBanner state={quizState} onContinue={handleContinue} isLast={isLastStep} combo={combo} />
      ) : showContinueBtn ? (
        <div className="px-5 py-4" style={{ background: "#f8fafc", borderTop: "1.5px solid #f1f5f9" }}>
          <div className="max-w-lg mx-auto">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 4px 0 #5b21b6",
              }}>
              {saving ? "Guardando..." : isLastStep ? "Finalizar lección" : currentStep.type === "content" && steps[stepIdx + 1]?.type === "quiz" ? "Ir a evaluación →" : "Continuar →"}
            </motion.button>
          </div>
        </div>
      ) : showWaitBtn ? (
        <div className="px-5 py-4" style={{ background: "#f8fafc", borderTop: "1.5px solid #f1f5f9" }}>
          <div className="max-w-lg mx-auto">
            <button disabled
              className="w-full py-4 rounded-2xl text-sm font-bold opacity-40"
              style={{ background: "#e2e8f0", color: "#94a3b8" }}>
              Selecciona una respuesta
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
