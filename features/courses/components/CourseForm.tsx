"use client"

import { useActionState, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createCourse, type CourseFormState } from "@/features/courses/actions"

type Lesson = { title: string; contentType: "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"; content: string; xpReward: number }
type Module = { title: string; lessons: Lesson[] }

const emptyLesson = (): Lesson => ({ title: "", contentType: "TEXT", content: "", xpReward: 10 })
const emptyModule = (): Module => ({ title: "", lessons: [emptyLesson()] })

const initialState: CourseFormState = {}

export default function CourseForm() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState)
  const [modules, setModules] = useState<Module[]>([emptyModule()])
  const [activeTab, setActiveTab] = useState<"manual" | "pdf">("manual")

  // Module helpers
  const updateModule = (mIdx: number, key: keyof Module, value: string) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, [key]: value } : m)))

  const addModule = () => setModules((prev) => [...prev, emptyModule()])
  const removeModule = (mIdx: number) => setModules((prev) => prev.filter((_, i) => i !== mIdx))

  // Lesson helpers
  const updateLesson = (mIdx: number, lIdx: number, key: keyof Lesson, value: string | number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mIdx
          ? { ...m, lessons: m.lessons.map((l, j) => (j === lIdx ? { ...l, [key]: value } : l)) }
          : m
      )
    )

  const addLesson = (mIdx: number) =>
    setModules((prev) =>
      prev.map((m, i) => (i === mIdx ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m))
    )

  const removeLesson = (mIdx: number, lIdx: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lIdx) } : m
      )
    )

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="modules" value={JSON.stringify(modules)} />

      {/* Tabs manual / PDF */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface)" }}>
        {(["manual", "pdf"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              activeTab === tab
                ? { background: "var(--primary)", color: "white" }
                : { color: "var(--muted)" }
            }
          >
            {tab === "manual" ? "✍️ Manual" : "📄 Desde PDF"}
          </button>
        ))}
      </div>

      {activeTab === "pdf" && (
        <div className="rounded-2xl p-6 text-center space-y-3" style={{ background: "var(--surface)", border: "2px dashed var(--border)" }}>
          <span className="text-4xl">🤖</span>
          <p className="text-white font-medium">Generación con IA desde PDF</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Sube un PDF y Claude generará la estructura del curso automáticamente.
          </p>
          <span className="inline-block text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>
            TODO — pendiente de configurar Claude API
          </span>
        </div>
      )}

      {activeTab === "manual" && (
        <div className="space-y-6">
          {/* Info básica del curso */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--surface)" }}>
            <h2 className="text-white font-semibold">Información del curso</h2>

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Título *</label>
              <input
                name="title"
                placeholder="Ej. Fundamentos de Marketing Digital"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all focus:ring-2"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  // @ts-ignore
                  "--tw-ring-color": "var(--primary)",
                }}
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-red-400">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Descripción</label>
              <textarea
                name="description"
                placeholder="¿De qué trata este curso?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none transition-all focus:ring-2"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          {/* Módulos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Módulos y lecciones</h2>
              <button
                type="button"
                onClick={addModule}
                className="text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ background: "var(--surface)", color: "var(--primary-light)" }}
              >
                + Módulo
              </button>
            </div>

            <AnimatePresence>
              {modules.map((mod, mIdx) => (
                <motion.div
                  key={mIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {/* Module header */}
                  <div className="px-5 py-4 flex items-center gap-3" style={{ background: "var(--surface)" }}>
                    <span className="text-xs font-bold text-white opacity-40 w-5">M{mIdx + 1}</span>
                    <input
                      value={mod.title}
                      onChange={(e) => updateModule(mIdx, "title", e.target.value)}
                      placeholder={`Nombre del módulo ${mIdx + 1}`}
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:opacity-40"
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-red-500/20 hover:text-red-400"
                        style={{ color: "var(--muted)" }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="p-4 space-y-3" style={{ background: "var(--surface-2)" }}>
                    <AnimatePresence>
                      {mod.lessons.map((lesson, lIdx) => (
                        <motion.div
                          key={lIdx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl p-4 space-y-3"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-40 text-white w-5">L{lIdx + 1}</span>
                            <input
                              value={lesson.title}
                              onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)}
                              placeholder={`Título de la lección`}
                              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:opacity-40"
                            />
                            {mod.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(mIdx, lIdx)}
                                className="text-xs hover:text-red-400 transition-colors"
                                style={{ color: "var(--muted)" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs" style={{ color: "var(--muted)" }}>Tipo</label>
                              <select
                                value={lesson.contentType}
                                onChange={(e) => updateLesson(mIdx, lIdx, "contentType", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                              >
                                <option value="TEXT">📝 Solo texto</option>
                                <option value="QUIZ">❓ Solo quiz</option>
                                <option value="TEXT_AND_QUIZ">📝❓ Texto + Quiz</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs" style={{ color: "var(--muted)" }}>XP</label>
                              <input
                                type="number"
                                min={5}
                                max={100}
                                value={lesson.xpReward}
                                onChange={(e) => updateLesson(mIdx, lIdx, "xpReward", Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs" style={{ color: "var(--muted)" }}>Contenido</label>
                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(mIdx, lIdx, "content", e.target.value)}
                              placeholder="Escribe el contenido de la lección..."
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none resize-none"
                              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => addLesson(mIdx)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-90 border-dashed"
                      style={{ border: "1px dashed var(--border)", color: "var(--muted)" }}
                    >
                      + Agregar lección
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Error general */}
          {state.error && (
            <p className="text-sm text-red-400 px-1">{state.error}</p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <a
              href="/admin/courses"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all hover:opacity-90"
              style={{ background: "var(--surface)", color: "var(--muted)" }}
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {isPending ? "Guardando..." : "Guardar curso"}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
