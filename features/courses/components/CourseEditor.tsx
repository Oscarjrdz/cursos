"use client"

import { useState, useTransition, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  updateCourseAction,
  updateModuleAction,
  updateLessonAction,
  addLessonAction,
  deleteLessonAction,
  addModuleAction,
  deleteModuleAction,
  publishCourse,
} from "@/features/courses/actions"

// ── Types ────────────────────────────────────────────────────────────────────
type ContentType = "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"
type QuizItem = { question: string; options: string[]; correctIndex: number; explanation?: string }
type LessonData = { id: string; title: string; order: number; contentType: ContentType; contentJson: Record<string, unknown>; xpReward: number }
type ModuleData = { id: string; title: string; order: number; lessons: LessonData[] }
type CourseData = { id: string; title: string; description: string | null; isPublished: boolean; modules: ModuleData[] }
type LessonDraft = { id: string; moduleId: string; title: string; contentType: ContentType; xpReward: number; content: string; quiz: QuizItem[] }

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseLesson(lesson: LessonData, moduleId: string): LessonDraft {
  const cj = lesson.contentJson
  let content = ""
  if (Array.isArray(cj.blocks)) content = (cj.blocks as { text: string }[]).map(b => b.text ?? "").filter(Boolean).join("\n\n")
  else content = String(cj.content ?? cj.text ?? "")
  const quiz: QuizItem[] = Array.isArray(cj.quiz) ? (cj.quiz as QuizItem[]) : []
  return { id: lesson.id, moduleId, title: lesson.title, contentType: lesson.contentType, xpReward: lesson.xpReward, content, quiz }
}

function draftToContentJson(draft: LessonDraft): Record<string, unknown> {
  const blocks = draft.content.split("\n\n").map(t => t.trim()).filter(Boolean).map(text => ({ type: "paragraph", text }))
  const result: Record<string, unknown> = { blocks }
  if (draft.quiz.length > 0) result.quiz = draft.quiz
  return result
}

function newQuizItem(): QuizItem {
  return { question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" }
}

// ── Icons ────────────────────────────────────────────────────────────────────
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <path d="M9 18l6-6-6-6" />
  </svg>
)
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const IcoTrash = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
)
const IcoBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
)
const IcoBolt = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)
const IcoEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IcoEdit = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

// ── Inline editable title ─────────────────────────────────────────────────────
function InlineEdit({ value, onSave, className, style, placeholder }: {
  value: string; onSave: (v: string) => void
  className?: string; style?: React.CSSProperties; placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function start() { setDraft(value); setEditing(true); setTimeout(() => inputRef.current?.select(), 10) }
  function commit() { if (draft.trim()) onSave(draft.trim()); setEditing(false) }
  function cancel() { setEditing(false) }

  if (editing) return (
    <input
      ref={inputRef}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel() }}
      className={className}
      style={{ ...style, outline: "none", background: "transparent", borderBottom: "2px solid #7c3aed" }}
      placeholder={placeholder}
    />
  )
  return (
    <span
      onClick={start}
      title="Clic para editar"
      className={className}
      style={{ ...style, cursor: "text", display: "flex", alignItems: "center", gap: 4 }}
    >
      {value}
      <span style={{ opacity: 0.4, flexShrink: 0 }}><IcoEdit /></span>
    </span>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function CourseSidebar({
  modules, selectedId, onSelect, onAddLesson, onDeleteLesson, onAddModule, onDeleteModule, onUpdateModuleTitle,
}: {
  modules: ModuleData[]
  selectedId: string | null
  onSelect: (lesson: LessonData, moduleId: string) => void
  onAddLesson: (moduleId: string) => void
  onDeleteLesson: (lessonId: string, moduleId: string) => void
  onAddModule: () => void
  onDeleteModule: (moduleId: string) => void
  onUpdateModuleTitle: (moduleId: string, title: string) => void
}) {
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(
    Object.fromEntries(modules.map(m => [m.id, true]))
  )

  function toggle(id: string) { setOpenModules(p => ({ ...p, [id]: !p[id] })) }

  return (
    <aside style={{
      width: 260, flexShrink: 0, borderRight: "1px solid #e2e8f0",
      background: "#ffffff", overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "12px 12px 4px", flex: 1 }}>
        {modules.map((mod) => (
          <div key={mod.id} style={{ marginBottom: 4 }}>
            {/* Module header */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 8px",
                borderRadius: 10, cursor: "pointer", userSelect: "none",
                background: "#f8fafc",
              }}
            >
              <button
                onClick={() => toggle(mod.id)}
                style={{ flexShrink: 0, color: "#94a3b8", lineHeight: 0, background: "none", border: "none", cursor: "pointer" }}
              >
                <IcoChevron open={openModules[mod.id] ?? true} />
              </button>
              <span style={{ fontSize: 13, marginRight: 2 }}>📦</span>
              <InlineEdit
                value={mod.title}
                onSave={(v) => onUpdateModuleTitle(mod.id, v)}
                className="flex-1 text-xs font-semibold truncate"
                style={{ color: "#0f172a", fontSize: 12, fontWeight: 600, minWidth: 0 }}
              />
              <button
                onClick={() => onDeleteModule(mod.id)}
                title="Eliminar módulo"
                style={{
                  flexShrink: 0, lineHeight: 0, background: "none", border: "none", cursor: "pointer",
                  color: "#cbd5e1", padding: 2, borderRadius: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color = "#cbd5e1")}
              >
                <IcoTrash size={12} />
              </button>
            </div>

            {/* Lessons */}
            <AnimatePresence>
              {(openModules[mod.id] ?? true) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden", paddingLeft: 16 }}
                >
                  {mod.lessons.map((lesson) => {
                    const isSelected = selectedId === lesson.id
                    return (
                      <div key={lesson.id}
                        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                        <button
                          onClick={() => onSelect(lesson, mod.id)}
                          style={{
                            flex: 1, textAlign: "left", padding: "6px 8px",
                            borderRadius: 8, cursor: "pointer", border: "none",
                            background: isSelected ? "#f3f0ff" : "transparent",
                            color: isSelected ? "#7c3aed" : "#475569",
                            display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.15s",
                          }}
                        >
                          <span style={{ flexShrink: 0, color: isSelected ? "#7c3aed" : "#94a3b8", lineHeight: 0 }}>
                            <IcoBook />
                          </span>
                          <span style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lesson.title}
                          </span>
                          {isSelected && <span style={{ flexShrink: 0, lineHeight: 0, color: "#7c3aed" }}><IcoCheck /></span>}
                        </button>
                        <button
                          onClick={() => onDeleteLesson(lesson.id, mod.id)}
                          style={{
                            flexShrink: 0, lineHeight: 0, background: "none", border: "none",
                            cursor: "pointer", color: "#e2e8f0", padding: 2, borderRadius: 4,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#e2e8f0")}
                        >
                          <IcoTrash size={11} />
                        </button>
                      </div>
                    )
                  })}

                  {/* Add lesson */}
                  <button
                    onClick={() => onAddLesson(mod.id)}
                    style={{
                      width: "100%", padding: "5px 8px", borderRadius: 8,
                      border: "1.5px dashed #e2e8f0", background: "transparent", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5, marginTop: 2, marginBottom: 6,
                      color: "#94a3b8", fontSize: 11, fontWeight: 500,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8" }}
                  >
                    <IcoPlus /> Añadir lección
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Add module */}
      <div style={{ padding: "8px 12px 12px" }}>
        <button
          onClick={onAddModule}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 10,
            border: "1.5px dashed #e2e8f0", background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            color: "#94a3b8", fontSize: 12, fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#94a3b8" }}
        >
          <IcoPlus /> Añadir módulo
        </button>
      </div>
    </aside>
  )
}

// ── Quiz item card ────────────────────────────────────────────────────────────
function QuizCard({ item, index, onChange, onDelete }: {
  item: QuizItem; index: number
  onChange: (updated: QuizItem) => void
  onDelete: () => void
}) {
  const letters = ["A", "B", "C", "D"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        background: "#ffffff", border: "1.5px solid #e2e8f0",
        borderRadius: 16, padding: "16px 18px", marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>Pregunta {index + 1}</span>
        <button
          onClick={onDelete}
          style={{ background: "#fef2f2", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#ef4444", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
        >
          <IcoTrash size={11} /> Eliminar
        </button>
      </div>

      {/* Question */}
      <textarea
        value={item.question}
        onChange={e => onChange({ ...item, question: e.target.value })}
        placeholder="Escribe la pregunta aquí..."
        rows={2}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10,
          border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 500,
          resize: "vertical", fontFamily: "inherit", background: "#f8fafc",
          color: "#0f172a", outline: "none", marginBottom: 12, boxSizing: "border-box",
        }}
        onFocus={e => (e.target.style.borderColor = "#7c3aed")}
        onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
      />

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {item.options.map((opt, i) => {
          const isCorrect = item.correctIndex === i
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => onChange({ ...item, correctIndex: i })}
                title="Marcar como correcta"
                style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  border: isCorrect ? "2px solid #22c55e" : "2px solid #e2e8f0",
                  background: isCorrect ? "#22c55e" : "#ffffff",
                  color: isCorrect ? "#ffffff" : "#94a3b8",
                  fontWeight: 800, fontSize: 11, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}
              >
                {letters[i]}
              </button>
              <input
                value={opt}
                onChange={e => {
                  const opts = [...item.options]; opts[i] = e.target.value
                  onChange({ ...item, options: opts })
                }}
                placeholder={`Opción ${letters[i]}`}
                style={{
                  flex: 1, padding: "7px 12px", borderRadius: 8,
                  border: isCorrect ? "1.5px solid #22c55e" : "1.5px solid #e2e8f0",
                  background: isCorrect ? "#f0fdf4" : "#f8fafc",
                  fontSize: 12, fontFamily: "inherit", outline: "none",
                  color: isCorrect ? "#15803d" : "#0f172a",
                  transition: "all 0.15s",
                }}
                onFocus={e => !isCorrect && (e.target.style.borderColor = "#a78bfa")}
                onBlur={e => !isCorrect && (e.target.style.borderColor = "#e2e8f0")}
              />
              {isCorrect && (
                <span style={{ flexShrink: 0, color: "#22c55e", lineHeight: 0 }}><IcoCheck /></span>
              )}
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>
          Explicación (opcional)
        </p>
        <textarea
          value={item.explanation ?? ""}
          onChange={e => onChange({ ...item, explanation: e.target.value })}
          placeholder="Explica por qué esa es la respuesta correcta..."
          rows={2}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8,
            border: "1.5px solid #e2e8f0", fontSize: 12,
            resize: "vertical", fontFamily: "inherit", background: "#f8fafc",
            color: "#475569", outline: "none", boxSizing: "border-box",
          }}
          onFocus={e => (e.target.style.borderColor = "#7c3aed")}
          onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>
    </motion.div>
  )
}

// ── Preview (phone mockup) ────────────────────────────────────────────────────
function LessonPreview({ draft }: { draft: LessonDraft }) {
  const paragraphs = draft.content.split("\n\n").map(t => t.trim()).filter(Boolean)

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px", background: "#f1f5f9", minHeight: "100%", overflowY: "auto" }}>
      <div style={{
        width: 360, background: "#f8fafc",
        borderRadius: 32, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 10px #1e293b",
        border: "1px solid #334155",
      }}>
        {/* Status bar */}
        <div style={{ background: "#ffffff", padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>9:41</span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[3, 2, 1].map(h => <div key={h} style={{ width: 3, height: h * 3 + 2, background: "#0f172a", borderRadius: 1 }} />)}
            <div style={{ width: 14, height: 7, border: "1.5px solid #0f172a", borderRadius: 2, marginLeft: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: 1, top: 1, right: 1, bottom: 1, background: "#0f172a", borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div style={{ background: "#ffffff", padding: "8px 14px 10px", borderBottom: "1.5px solid #f1f5f9" }}>
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 99, marginBottom: 8 }}>
            <div style={{ width: "40%", height: "100%", background: "#7c3aed", borderRadius: 99 }} />
          </div>
          <p style={{ fontSize: 9, color: "#94a3b8", margin: 0 }}>Lección 1 de X</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", margin: "2px 0 0" }}>{draft.title}</p>
        </div>

        {/* Content area */}
        <div style={{ maxHeight: 520, overflowY: "auto", padding: "14px" }}>
          {/* Text content */}
          {(draft.contentType === "TEXT" || draft.contentType === "TEXT_AND_QUIZ") && paragraphs.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📖</div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", margin: 0 }}>LECTURA</p>
                  <p style={{ fontSize: 8, color: "#94a3b8", margin: 0 }}>1 de {paragraphs.length} secciones</p>
                </div>
              </div>
              <div style={{ background: "#ffffff", border: "1.5px solid #ede9fe", borderRadius: 16, padding: "12px 14px", marginBottom: 12 }}>
                {paragraphs.slice(0, 1).map((p, i) => (
                  <p key={i} style={{ fontSize: 11, color: "#0f172a", fontWeight: 700, margin: 0, lineHeight: 1.5 }}>{p.split(/(?<=[.!?])\s+/)[0]}</p>
                ))}
                {paragraphs[0] && paragraphs[0].split(/(?<=[.!?])\s+/).length > 1 && (
                  <p style={{ fontSize: 10, color: "#475569", margin: "6px 0 0", lineHeight: 1.6 }}>
                    {paragraphs[0].split(/(?<=[.!?])\s+/).slice(1).join(" ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quiz preview */}
          {(draft.contentType === "QUIZ" || draft.contentType === "TEXT_AND_QUIZ") && draft.quiz.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", margin: 0 }}>EVALUACIÓN</p>
                  <p style={{ fontSize: 8, color: "#94a3b8", margin: 0 }}>Pregunta 1 de {draft.quiz.length}</p>
                </div>
              </div>
              <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 16, padding: "10px 12px", marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textAlign: "center", color: "#0f172a", margin: 0 }}>
                  {draft.quiz[0].question || "¿Pregunta de evaluación?"}
                </p>
              </div>
              {draft.quiz[0].options.slice(0, 4).map((opt, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                  padding: "7px 10px", borderRadius: 10,
                  background: "#ffffff", border: "2px solid #e2e8f0",
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, background: "#f1f5f9",
                    fontSize: 8, fontWeight: 800, color: "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {["A","B","C","D"][i]}
                  </span>
                  <span style={{ fontSize: 9, color: "#0f172a" }}>{opt || `Opción ${["A","B","C","D"][i]}`}</span>
                </div>
              ))}
            </div>
          )}

          {/* Continue button */}
          <div style={{ marginTop: 12, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", borderRadius: 14, padding: "11px", textAlign: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#ffffff" }}>Continuar →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Lesson editor panel ───────────────────────────────────────────────────────
function LessonEditorPanel({
  draft, onChange, onSave, saving,
}: {
  draft: LessonDraft
  onChange: (d: LessonDraft) => void
  onSave: () => void
  saving: boolean
}) {
  const [tab, setTab] = useState<"content" | "quiz" | "preview">("content")

  const contentTypeLabels: Record<ContentType, string> = {
    TEXT: "Solo texto",
    QUIZ: "Solo quiz",
    TEXT_AND_QUIZ: "Texto + Quiz",
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f8fafc" }}>
      {/* Lesson meta bar */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "14px 24px 12px" }}>
        {/* Title */}
        <input
          value={draft.title}
          onChange={e => onChange({ ...draft, title: e.target.value })}
          placeholder="Título de la lección"
          style={{
            width: "100%", fontSize: 18, fontWeight: 700, color: "#0f172a",
            background: "transparent", border: "none", outline: "none",
            borderBottom: "2px solid transparent", padding: "0 0 4px",
            fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box",
          }}
          onFocus={e => (e.target.style.borderBottomColor = "#7c3aed")}
          onBlur={e => (e.target.style.borderBottomColor = "transparent")}
        />

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* XP */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", borderRadius: 8, padding: "4px 10px" }}>
            <IcoBolt />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#92400e" }}>XP:</span>
            <input
              type="number"
              min={5} max={100}
              value={draft.xpReward}
              onChange={e => onChange({ ...draft, xpReward: Number(e.target.value) })}
              style={{ width: 44, fontSize: 12, fontWeight: 700, color: "#d97706", background: "transparent", border: "none", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {/* Content type */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Tipo:</span>
            <select
              value={draft.contentType}
              onChange={e => onChange({ ...draft, contentType: e.target.value as ContentType })}
              style={{
                fontSize: 11, fontWeight: 600, color: "#7c3aed", background: "#f3f0ff",
                border: "1.5px solid #ddd6fe", borderRadius: 8, padding: "4px 8px",
                outline: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {(["TEXT", "QUIZ", "TEXT_AND_QUIZ"] as ContentType[]).map(t => (
                <option key={t} value={t}>{contentTypeLabels[t]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", padding: "0 24px", gap: 0 }}>
        {([
          { id: "content", label: "Contenido", icon: "📝" },
          { id: "quiz", label: `Quiz (${draft.quiz.length})`, icon: "⚡" },
          { id: "preview", label: "Vista previa", icon: "👁" },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
              color: tab === t.id ? "#7c3aed" : "#94a3b8",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.15s",
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Contenido tab */}
        {tab === "content" && (
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>
              CONTENIDO DE LA LECCIÓN
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
              Separa los párrafos con una línea en blanco. Cada párrafo se muestra como una diapositiva al alumno.
            </p>
            <textarea
              value={draft.content}
              onChange={e => onChange({ ...draft, content: e.target.value })}
              placeholder="Escribe el contenido de la lección aquí...&#10;&#10;Cada párrafo separado por una línea en blanco será una diapositiva independiente para el alumno."
              style={{
                width: "100%", minHeight: 320, padding: "14px 16px",
                borderRadius: 14, border: "1.5px solid #e2e8f0",
                fontSize: 13, lineHeight: 1.8, fontFamily: "inherit",
                color: "#0f172a", background: "#ffffff", outline: "none",
                resize: "vertical", boxSizing: "border-box",
              }}
              onFocus={e => (e.target.style.borderColor = "#7c3aed")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
              {draft.content.split("\n\n").filter(p => p.trim()).length} párrafo(s) = {draft.content.split("\n\n").filter(p => p.trim()).length} diapositiva(s)
            </p>
          </div>
        )}

        {/* Quiz tab */}
        {tab === "quiz" && (
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", margin: 0 }}>PREGUNTAS DE EVALUACIÓN</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                  Haz clic en la letra para marcar la respuesta correcta
                </p>
              </div>
              <button
                onClick={() => onChange({ ...draft, quiz: [...draft.quiz, newQuizItem()] })}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                  background: "#7c3aed", color: "#ffffff", border: "none", borderRadius: 10,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <IcoPlus /> Agregar pregunta
              </button>
            </div>

            {draft.quiz.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px 24px",
                border: "2px dashed #e2e8f0", borderRadius: 16, background: "#ffffff",
              }}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>⚡</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Sin preguntas todavía</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Agrega preguntas para evaluar al alumno</p>
              </div>
            ) : (
              <AnimatePresence>
                {draft.quiz.map((item, i) => (
                  <QuizCard
                    key={i}
                    item={item}
                    index={i}
                    onChange={updated => {
                      const q = [...draft.quiz]; q[i] = updated; onChange({ ...draft, quiz: q })
                    }}
                    onDelete={() => {
                      const q = draft.quiz.filter((_, idx) => idx !== i); onChange({ ...draft, quiz: q })
                    }}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Preview tab */}
        {tab === "preview" && <LessonPreview draft={draft} />}
      </div>

      {/* Save bar */}
      <div style={{
        background: "#ffffff", borderTop: "1px solid #e2e8f0",
        padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
      }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 24px",
            background: saving ? "#a78bfa" : "#7c3aed", color: "#ffffff",
            border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer", transition: "background 0.2s",
          }}
        >
          {saving ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".3" />
                <path d="M21 12a9 9 0 00-9-9" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <IcoCheck /> Guardar cambios
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

// ── Main CourseEditor ─────────────────────────────────────────────────────────
export default function CourseEditor({ course }: { course: CourseData }) {
  const [modules, setModules] = useState<ModuleData[]>(course.modules)
  const [isPublished, setIsPublished] = useState(course.isPublished)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<LessonDraft | null>(null)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [isPending, startTransition] = useTransition()

  function selectLesson(lesson: LessonData, moduleId: string) {
    if (draft && selectedId !== lesson.id) {
      // switching away — draft is not auto-saved; that's intentional
    }
    setSelectedId(lesson.id)
    setDraft(parseLesson(lesson, moduleId))
    setSaveState("idle")
  }

  async function handleSave() {
    if (!draft) return
    setSaveState("saving")
    await updateLessonAction(draft.id, {
      title: draft.title,
      contentType: draft.contentType,
      contentJson: draftToContentJson(draft),
      xpReward: draft.xpReward,
    })
    // Update local module tree title
    setModules(prev => prev.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === draft.id ? { ...l, title: draft.title, contentType: draft.contentType, xpReward: draft.xpReward } : l),
    })))
    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 2000)
  }

  async function handleAddLesson(moduleId: string) {
    const newLesson = await addLessonAction(moduleId)
    if (!newLesson) return
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m))
    selectLesson(newLesson, moduleId)
  }

  async function handleDeleteLesson(lessonId: string, moduleId: string) {
    if (!confirm("¿Eliminar esta lección?")) return
    await deleteLessonAction(lessonId)
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m))
    if (selectedId === lessonId) { setSelectedId(null); setDraft(null) }
  }

  async function handleAddModule() {
    const newMod = await addModuleAction(course.id)
    if (!newMod) return
    setModules(prev => [...prev, newMod])
    if (newMod.lessons[0]) selectLesson(newMod.lessons[0], newMod.id)
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("¿Eliminar este módulo y todas sus lecciones?")) return
    await deleteModuleAction(moduleId)
    setModules(prev => prev.filter(m => m.id !== moduleId))
    if (draft?.moduleId === moduleId) { setSelectedId(null); setDraft(null) }
  }

  function handleUpdateModuleTitle(moduleId: string, title: string) {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title } : m))
    startTransition(() => { updateModuleAction(moduleId, { title }) })
  }

  function handleUpdateCourseTitle(title: string) {
    startTransition(() => { updateCourseAction(course.id, { title }) })
  }

  async function handlePublish() {
    await publishCourse(course.id)
    setIsPublished(true)
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalModules = modules.length

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#f1f5f9" }}>
      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Top bar ── */}
      <div style={{
        background: "#ffffff", borderBottom: "1px solid #e2e8f0",
        padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <Link
          href="/admin/courses"
          style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", textDecoration: "none", fontSize: 12, fontWeight: 500, flexShrink: 0 }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Cursos
        </Link>

        <span style={{ color: "#e2e8f0", fontSize: 16 }}>/</span>

        <InlineEdit
          value={course.title}
          onSave={handleUpdateCourseTitle}
          className="font-semibold"
          style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", flex: 1, minWidth: 0 }}
        />

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Stats */}
          <span style={{ fontSize: 11, color: "#94a3b8", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
            {totalModules} módulo{totalModules !== 1 ? "s" : ""} · {totalLessons} lección{totalLessons !== 1 ? "es" : ""}
          </span>

          {/* Save indicator */}
          <AnimatePresence>
            {saveState === "saved" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ fontSize: 11, color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              >
                <IcoCheck /> Guardado
              </motion.span>
            )}
          </AnimatePresence>

          {/* Status badge */}
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
            background: isPublished ? "#f0fdf4" : "#fffbeb",
            color: isPublished ? "#16a34a" : "#d97706",
          }}>
            {isPublished ? "Publicado" : "Borrador"}
          </span>

          {/* Publish button */}
          {!isPublished && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handlePublish}
              style={{
                padding: "7px 16px", background: "#7c3aed", color: "#ffffff",
                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              Publicar
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <CourseSidebar
          modules={modules}
          selectedId={selectedId}
          onSelect={selectLesson}
          onAddLesson={handleAddLesson}
          onDeleteLesson={handleDeleteLesson}
          onAddModule={handleAddModule}
          onDeleteModule={handleDeleteModule}
          onUpdateModuleTitle={handleUpdateModuleTitle}
        />

        {draft ? (
          <LessonEditorPanel
            draft={draft}
            onChange={setDraft}
            onSave={handleSave}
            saving={saveState === "saving"}
          />
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 12, color: "#94a3b8",
          }}>
            <span style={{ fontSize: 48 }}>✏️</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", margin: 0 }}>Selecciona una lección para editarla</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Elige una lección del panel izquierdo</p>
          </div>
        )}
      </div>
    </div>
  )
}
