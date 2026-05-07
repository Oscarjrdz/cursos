"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { completeLesson } from "@/features/student/actions"

type QuizItem = {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

type LessonProps = {
  tenantSlug: string
  userId: string
  lesson: {
    id: string
    title: string
    contentType: string
    contentJson: Record<string, unknown>
    xpReward: number
  }
  lessonIndex: number
  totalLessons: number
  alreadyCompleted: boolean
}

type QuizState = "idle" | "correct" | "wrong"

/* ─── Parse content ──────────────────────────────────────── */
function parseContent(contentJson: Record<string, unknown>) {
  let content = ""
  if (Array.isArray(contentJson.blocks)) {
    content = (contentJson.blocks as { type: string; text: string }[])
      .map((b) => b.text ?? "")
      .filter(Boolean)
      .join("\n\n")
  } else {
    content = ((contentJson.content ?? contentJson.text ?? "") as string)
  }

  let quiz: QuizItem[] = []
  if (Array.isArray(contentJson.quiz)) {
    quiz = contentJson.quiz as QuizItem[]
  } else if (contentJson.question) {
    quiz = [{
      question: contentJson.question as string,
      options: contentJson.options as string[],
      correctIndex: contentJson.correctIndex as number,
      explanation: contentJson.explanation as string | undefined,
    }]
  }

  return { content, quiz }
}

/* ─── Progress bar ───────────────────────────────────────── */
function ProgressBar({ step, total, onClose }: { step: number; total: number; onClose: () => void }) {
  const pct = total > 0 ? (step / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 px-4 py-3"
      style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
      <button onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{ background: "#f1f5f9" }}>
        <span style={{ color: "#64748b", fontSize: 14 }}>✕</span>
      </button>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
        />
      </div>
      <span className="text-xs font-bold flex-shrink-0" style={{ color: "#7c3aed" }}>
        {step}/{total}
      </span>
    </div>
  )
}

/* ─── Text content view ──────────────────────────────────── */
function TextContent({ content, title }: { content: string; title: string }) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <div className="max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
          style={{ background: "#faf5ff" }}>
          <span style={{ fontSize: 32 }}>📖</span>
        </div>
        <h2 className="text-xl font-bold text-center mb-5" style={{ color: "#0f172a" }}>{title}</h2>
        <div
          className="text-sm leading-relaxed rounded-2xl p-5"
          style={{ background: "#ffffff", color: "#334155", border: "1px solid #e2e8f0",
            whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          {content || "Lee esta lección y presiona Continuar cuando estés listo."}
        </div>
      </div>
    </div>
  )
}

/* ─── Quiz view ──────────────────────────────────────────── */
function QuizContent({
  item, quizIdx, quizTotal, selected, onSelect, quizState,
}: {
  item: QuizItem
  quizIdx: number
  quizTotal: number
  selected: number | null
  onSelect: (i: number) => void
  quizState: QuizState
}) {
  function optionStyle(i: number): React.CSSProperties {
    const base: React.CSSProperties = {
      background: "#ffffff",
      border: "2px solid #e2e8f0",
      color: "#0f172a",
    }
    if (quizState === "idle") {
      if (selected === i) return { ...base, border: "2px solid #7c3aed", background: "#faf5ff", color: "#7c3aed" }
      return base
    }
    if (i === item.correctIndex) return { ...base, border: "2px solid #22c55e", background: "#f0fdf4", color: "#15803d" }
    if (selected === i && i !== item.correctIndex) return { ...base, border: "2px solid #ef4444", background: "#fef2f2", color: "#dc2626" }
    return { ...base, opacity: 0.45 }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#faf5ff" }}>
            <span style={{ fontSize: 22 }}>🧠</span>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "#f1f5f9", color: "#64748b" }}>
            Pregunta {quizIdx + 1} de {quizTotal}
          </span>
        </div>

        <h2 className="text-lg font-bold text-center mb-6 leading-snug" style={{ color: "#0f172a" }}>
          {item.question}
        </h2>

        <div className="flex flex-col gap-3">
          {item.options.map((opt, i) => (
            <motion.button
              key={i}
              whileTap={quizState === "idle" ? { scale: 0.97 } : {}}
              onClick={() => quizState === "idle" && onSelect(i)}
              className="w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all"
              style={optionStyle(i)}>
              <span className="inline-block w-6 h-6 rounded-full text-center text-xs font-bold mr-3 leading-6"
                style={{ background: "#f1f5f9", color: "#64748b", minWidth: 24 }}>
                {["A", "B", "C", "D"][i]}
              </span>
              {opt}
            </motion.button>
          ))}
        </div>

        {quizState !== "idle" && item.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl text-sm"
            style={{
              background: quizState === "correct" ? "#f0fdf4" : "#fef2f2",
              color: quizState === "correct" ? "#15803d" : "#dc2626",
              border: `1px solid ${quizState === "correct" ? "#bbf7d0" : "#fecaca"}`,
              lineHeight: 1.5,
            }}>
            {item.explanation}
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Feedback banner ────────────────────────────────────── */
function FeedbackBanner({ state, onContinue, isLast }: { state: QuizState; onContinue: () => void; isLast: boolean }) {
  if (state === "idle") return null
  const correct = state === "correct"
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="px-5 py-5"
        style={{
          background: correct ? "#f0fdf4" : "#fef2f2",
          borderTop: `2px solid ${correct ? "#22c55e" : "#ef4444"}`,
        }}>
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm" style={{ color: correct ? "#15803d" : "#dc2626" }}>
              {correct ? "✓ ¡Correcto!" : "✗ Incorrecto"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: correct ? "#16a34a" : "#ef4444" }}>
              {correct ? "¡Excelente razonamiento!" : "Revisa la explicación y continúa"}
            </p>
          </div>
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white flex-shrink-0 transition-all active:scale-95"
            style={{ background: correct ? "#22c55e" : "#ef4444" }}>
            {isLast ? "Finalizar" : "Siguiente →"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Celebration screen ─────────────────────────────────── */
function CelebrationScreen({
  xpReward, tenantSlug, score, total, onRestart,
}: {
  xpReward: number
  tenantSlug: string
  score: number
  total: number
  onRestart: () => void
}) {
  const router = useRouter()
  const pct = total > 0 ? Math.round((score / total) * 100) : 100
  const perfect = score === total && total > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)", zIndex: 100 }}>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.1, duration: 0.5 }}>
        <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
          width={100} height={100} alt="" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-black mt-5 mb-1" style={{ color: "#0f172a" }}>
          {perfect ? "¡Perfecto!" : "¡Lección completada!"}
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          {total > 0 ? `${score} de ${total} respuestas correctas` : "Lección completada"}
        </p>
      </motion.div>

      {/* Score ring */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-5 flex items-center gap-5">
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl"
            style={{ background: "#ffffff", border: "2px solid #ddd6fe", boxShadow: "0 4px 24px rgba(124,58,237,0.10)" }}>
            <span className="text-4xl font-black" style={{ color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444" }}>
              {pct}%
            </span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: "#94a3b8" }}>precisión</span>
          </div>
          <div className="flex flex-col items-center px-6 py-4 rounded-2xl"
            style={{ background: "#ffffff", border: "2px solid #ddd6fe", boxShadow: "0 4px 24px rgba(124,58,237,0.10)" }}>
            <span className="text-4xl font-black" style={{ color: "#7c3aed" }}>+{xpReward}</span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: "#94a3b8" }}>XP ganados</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={() => router.push(`/${tenantSlug}/home`)}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>
          Continuar →
        </button>
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: "#f1f5f9", color: "#64748b" }}>
          Repetir lección
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export default function LessonPlayer({
  tenantSlug, userId, lesson, lessonIndex, totalLessons, alreadyCompleted,
}: LessonProps) {
  const router = useRouter()
  const { content, quiz } = parseContent(lesson.contentJson)

  const hasText = !!content
  const hasQuiz = quiz.length > 0

  // total steps: 1 text + N quiz questions
  const totalSteps = (hasText ? 1 : 0) + (hasQuiz ? quiz.length : 0) || 1

  const [phase, setPhase] = useState<"text" | "quiz">(hasText ? "text" : "quiz")
  const [quizIdx, setQuizIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const currentStepNum = phase === "text" ? 1 : (hasText ? 1 : 0) + quizIdx + 1

  function handleClose() {
    router.push(`/${tenantSlug}/home`)
  }

  function handleSelect(i: number) {
    if (quizState !== "idle") return
    setSelected(i)
    const correct = i === quiz[quizIdx].correctIndex
    setQuizState(correct ? "correct" : "wrong")
    if (correct) setScore((s) => s + 1)
  }

  async function handleContinue() {
    if (phase === "text") {
      if (hasQuiz) {
        setPhase("quiz")
        setQuizIdx(0)
        setSelected(null)
        setQuizState("idle")
      } else {
        await finish()
      }
      return
    }

    // quiz phase
    if (quizIdx < quiz.length - 1) {
      setQuizIdx((q) => q + 1)
      setSelected(null)
      setQuizState("idle")
    } else {
      await finish()
    }
  }

  async function finish() {
    if (!alreadyCompleted && !saving) {
      setSaving(true)
      await completeLesson(userId, lesson.id, tenantSlug)
      setSaving(false)
    }
    setDone(true)
  }

  function handleRestart() {
    setPhase(hasText ? "text" : "quiz")
    setQuizIdx(0)
    setSelected(null)
    setQuizState("idle")
    setScore(0)
    setDone(false)
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

  const isLastStep = phase === "quiz" && quizIdx === quiz.length - 1

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#f8fafc" }}>
      <ProgressBar step={currentStepNum} total={totalSteps} onClose={handleClose} />

      <div className="px-5 pt-4 pb-0">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-semibold text-center" style={{ color: "#94a3b8" }}>
            Lección {lessonIndex + 1} de {totalLessons}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase === "text" ? "text" : `quiz-${quizIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col overflow-hidden">
          {phase === "text" && <TextContent content={content} title={lesson.title} />}
          {phase === "quiz" && hasQuiz && (
            <QuizContent
              item={quiz[quizIdx]}
              quizIdx={quizIdx}
              quizTotal={quiz.length}
              selected={selected}
              onSelect={handleSelect}
              quizState={quizState}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom actions */}
      {phase === "quiz" && quizState !== "idle" ? (
        <FeedbackBanner state={quizState} onContinue={handleContinue} isLast={isLastStep} />
      ) : phase === "text" ? (
        <div className="px-5 py-4" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleContinue}
              disabled={saving}
              className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
              {saving ? "Guardando..." : hasQuiz ? "Continuar al quiz →" : "Finalizar lección ✓"}
            </button>
          </div>
        </div>
      ) : phase === "quiz" && selected === null ? (
        <div className="px-5 py-4" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div className="max-w-lg mx-auto">
            <button
              disabled
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all opacity-40"
              style={{ background: "#e2e8f0", color: "#94a3b8" }}>
              Selecciona una respuesta
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
