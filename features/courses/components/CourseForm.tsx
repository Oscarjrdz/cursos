"use client"

import { useActionState, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createCourse, type CourseFormState } from "@/features/courses/actions"

type Lesson = { title: string; contentType: "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"; content: string; xpReward: number; quiz?: { question: string; options: string[]; correctIndex: number; explanation?: string }[] }
type Module = { title: string; lessons: Lesson[] }
type OutlineModule = { title: string; summary: string }

const emptyLesson = (): Lesson => ({ title: "", contentType: "TEXT", content: "", xpReward: 10 })
const emptyModule = (): Module => ({ title: "", lessons: [emptyLesson()] })

const initialState: CourseFormState = {}

/* ════════════════════════════════════════════════════════
   PDF WIZARD — Step-by-step module generation
   ════════════════════════════════════════════════════════ */

type WizardStep = "upload" | "outline" | "generating" | "done"

function PdfWizard({ onComplete }: { onComplete: (title: string, desc: string, modules: Module[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<WizardStep>("upload")
  const [error, setError] = useState("")

  // Outline state
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDesc, setCourseDesc] = useState("")
  const [outlineModules, setOutlineModules] = useState<OutlineModule[]>([])

  // Generation state
  const [generatedModules, setGeneratedModules] = useState<Module[]>([])
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0)
  const [moduleStatus, setModuleStatus] = useState<("pending" | "loading" | "done" | "error")[]>([])

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return }
    setFile(f)
    setError("")
  }

  // Step 1: Extract outline
  const handleExtractOutline = async () => {
    if (!file) return
    setStep("outline")
    setError("")
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await fetch("/api/generate-course/outline", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al analizar")
      setCourseTitle(data.outline.title)
      setCourseDesc(data.outline.description)
      setOutlineModules(data.outline.modules)
      setModuleStatus(data.outline.modules.map(() => "pending" as const))
      setGeneratedModules([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
      setStep("upload")
    }
  }

  // Step 2: Generate one module
  const generateModule = async (idx: number) => {
    if (!file) return
    const newStatus = [...moduleStatus]
    newStatus[idx] = "loading"
    setModuleStatus(newStatus)
    setCurrentModuleIdx(idx)

    try {
      const formData = new FormData()
      formData.append("pdf", file)
      formData.append("moduleTitle", outlineModules[idx].title)
      formData.append("moduleIndex", String(idx + 1))
      formData.append("allModules", outlineModules.map((m, i) => `${i + 1}. ${m.title}`).join(", "))

      const res = await fetch("/api/generate-course/module", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al generar módulo")

      const mod: Module = {
        title: data.module.title,
        lessons: data.module.lessons.map((l: any) => ({
          title: l.title,
          contentType: l.contentType as Lesson["contentType"],
          content: l.content ?? "",
          xpReward: l.xpReward ?? 10,
          quiz: l.quiz,
        })),
      }

      const updated = [...generatedModules]
      updated[idx] = mod
      setGeneratedModules(updated)

      const ns = [...moduleStatus]
      ns[idx] = "done"
      setModuleStatus(ns)
    } catch (err) {
      const ns = [...moduleStatus]
      ns[idx] = "error"
      setModuleStatus(ns)
      setError(err instanceof Error ? err.message : "Error al generar módulo")
    }
  }

  // Step 2b: Start sequential generation
  const handleStartGeneration = async () => {
    setStep("generating")
    setError("")
    for (let i = 0; i < outlineModules.length; i++) {
      await generateModule(i)
    }
    setStep("done")
  }

  // Step 3: Finish
  const handleFinish = () => {
    const validModules = generatedModules.filter(Boolean)
    onComplete(courseTitle, courseDesc, validModules)
  }

  // ── Upload Step ──
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className="rounded-2xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer"
          style={{
            background: dragging ? "#f5f3ff" : "#f8fafc",
            border: `2px dashed ${dragging ? "#7c3aed" : "#e2e8f0"}`,
          }}
        >
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {file ? (
            <>
              <span className="text-4xl">📄</span>
              <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <span className="text-4xl">📁</span>
              <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Arrastra tu PDF aquí</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}

        {file && (
          <motion.button type="button" onClick={handleExtractOutline}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            🤖 Analizar PDF y extraer temas
          </motion.button>
        )}
      </div>
    )
  }

  // ── Outline Step (loading) ──
  if (step === "outline" && outlineModules.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center gap-3"
        style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Analizando PDF...</p>
        <p className="text-xs text-center" style={{ color: "#94a3b8" }}>Extrayendo la estructura de temas del documento</p>
      </div>
    )
  }

  // ── Outline Step (ready) ──
  if (step === "outline" && outlineModules.length > 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p className="text-sm font-semibold" style={{ color: "#15803d" }}>✅ Se encontraron {outlineModules.length} temas en el PDF</p>
          <p className="text-xs" style={{ color: "#16a34a" }}>Cada tema generará 5 lecturas + 5 evaluaciones (10 lecciones)</p>
        </div>

        <div className="rounded-2xl p-4 space-y-1" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#64748b" }}>CURSO: {courseTitle}</p>
          {outlineModules.map((m, i) => (
            <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: i % 2 === 0 ? "#f8fafc" : "transparent" }}>
              <span className="text-xs font-bold mt-0.5 w-6 shrink-0" style={{ color: "#7c3aed" }}>M{i + 1}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#0f172a" }}>{m.title}</p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{m.summary}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => { setStep("upload"); setOutlineModules([]) }}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
            style={{ background: "#f1f5f9", color: "#64748b" }}>
            ← Cambiar PDF
          </button>
          <button type="button" onClick={handleStartGeneration}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            🚀 Generar contenido tema por tema
          </button>
        </div>
      </div>
    )
  }

  // ── Generating / Done Step ──
  const doneCount = moduleStatus.filter(s => s === "done").length
  const totalCount = outlineModules.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
            {step === "done" ? "✅ ¡Curso generado!" : `⏳ Generando módulo ${currentModuleIdx + 1} de ${totalCount}...`}
          </p>
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#ede9fe", color: "#7c3aed" }}>
            {pct}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
          <motion.div className="h-full rounded-full" style={{ background: "#7c3aed" }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Module list with status */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
        {outlineModules.map((m, i) => {
          const s = moduleStatus[i]
          const icons = { pending: "⏳", loading: "🔄", done: "✅", error: "❌" }
          const bgs = { pending: "transparent", loading: "#fefce8", done: "#f0fdf4", error: "#fef2f2" }
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3 transition-all"
              style={{ background: bgs[s], borderBottom: i < outlineModules.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <span className="text-base">{icons[s]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#0f172a" }}>{m.title}</p>
                {s === "loading" && (
                  <p className="text-xs" style={{ color: "#d97706" }}>Generando 5 lecturas + 5 evaluaciones...</p>
                )}
                {s === "done" && generatedModules[i] && (
                  <p className="text-xs" style={{ color: "#16a34a" }}>{generatedModules[i].lessons.length} lecciones generadas</p>
                )}
                {s === "error" && (
                  <p className="text-xs text-red-500">Error al generar. Se puede reintentar.</p>
                )}
              </div>
              {s === "loading" && <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />}
              {s === "error" && (
                <button type="button" onClick={() => generateModule(i)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ background: "#ef4444" }}>
                  Reintentar
                </button>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      {/* Done actions */}
      {step === "done" && doneCount > 0 && (
        <motion.button type="button" onClick={handleFinish}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
          ✅ Revisar y guardar curso ({doneCount} módulos, {doneCount * 10} lecciones)
        </motion.button>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN FORM
   ════════════════════════════════════════════════════════ */

export default function CourseForm() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState)
  const [modules, setModules] = useState<Module[]>([emptyModule()])
  const [activeTab, setActiveTab] = useState<"manual" | "pdf">("manual")
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [generatedDesc, setGeneratedDesc] = useState("")

  const handlePdfComplete = (title: string, desc: string, mods: Module[]) => {
    setGeneratedTitle(title)
    setGeneratedDesc(desc)
    setModules(mods)
    setActiveTab("manual")
  }

  const updateModule = (mIdx: number, key: keyof Module, value: string) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, [key]: value } : m)))
  const addModule = () => setModules((prev) => [...prev, emptyModule()])
  const removeModule = (mIdx: number) => setModules((prev) => prev.filter((_, i) => i !== mIdx))

  const updateLesson = (mIdx: number, lIdx: number, key: keyof Lesson, value: string | number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mIdx ? { ...m, lessons: m.lessons.map((l, j) => (j === lIdx ? { ...l, [key]: value } : l)) } : m
      )
    )
  const addLesson = (mIdx: number) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m)))
  const removeLesson = (mIdx: number, lIdx: number) =>
    setModules((prev) =>
      prev.map((m, i) => (i === mIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lIdx) } : m))
    )

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="modules" value={JSON.stringify(modules)} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#f1f5f9" }}>
        {(["manual", "pdf"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={activeTab === tab ? { background: "#7c3aed", color: "white" } : { color: "#94a3b8" }}>
            {tab === "manual" ? "✍️ Manual" : "📄 Desde PDF"}
          </button>
        ))}
      </div>

      {activeTab === "pdf" && <PdfWizard onComplete={handlePdfComplete} />}

      {activeTab === "manual" && (
        <div className="space-y-6">
          {/* Curso info */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
            <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Información del curso</h2>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "#64748b" }}>Título *</label>
              <input name="title" value={generatedTitle} onChange={(e) => setGeneratedTitle(e.target.value)}
                placeholder="Ej. Fundamentos de Marketing Digital" required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-300"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a" }} />
              {state.fieldErrors?.title && <p className="text-xs text-red-500">{state.fieldErrors.title[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "#64748b" }}>Descripción</label>
              <textarea name="description" value={generatedDesc} onChange={(e) => setGeneratedDesc(e.target.value)}
                placeholder="¿De qué trata este curso?" rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-violet-300"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a" }} />
            </div>
          </div>

          {/* Módulos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>
                Módulos y lecciones
                <span className="ml-2 text-xs font-normal" style={{ color: "#94a3b8" }}>
                  ({modules.length} módulos, {modules.reduce((a, m) => a + m.lessons.length, 0)} lecciones)
                </span>
              </h2>
              <button type="button" onClick={addModule}
                className="text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-90 text-white"
                style={{ background: "#7c3aed" }}>
                + Módulo
              </button>
            </div>

            <AnimatePresence>
              {modules.map((mod, mIdx) => (
                <motion.div key={mIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                  <div className="px-5 py-4 flex items-center gap-3"
                    style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <span className="text-xs font-bold w-5" style={{ color: "#7c3aed" }}>M{mIdx + 1}</span>
                    <input value={mod.title} onChange={(e) => updateModule(mIdx, "title", e.target.value)}
                      placeholder={`Nombre del módulo ${mIdx + 1}`}
                      className="flex-1 bg-transparent text-sm font-medium outline-none" style={{ color: "#0f172a" }} />
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{mod.lessons.length} lecciones</span>
                    {modules.length > 1 && (
                      <button type="button" onClick={() => removeModule(mIdx)}
                        className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                        style={{ color: "#94a3b8" }}>✕</button>
                    )}
                  </div>
                  <div className="p-4 space-y-3" style={{ background: "#ffffff" }}>
                    <AnimatePresence>
                      {mod.lessons.map((lesson, lIdx) => (
                        <motion.div key={lIdx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="rounded-xl p-4 space-y-3"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold w-5" style={{ color: "#94a3b8" }}>L{lIdx + 1}</span>
                            <input value={lesson.title} onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)}
                              placeholder="Título de la lección"
                              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#0f172a" }} />
                            <span className="text-xs px-2 py-0.5 rounded" style={{
                              background: lesson.contentType === "TEXT" ? "#f3f0ff" : lesson.contentType === "TEXT_AND_QUIZ" ? "#fffbeb" : "#f0fdf4",
                              color: lesson.contentType === "TEXT" ? "#7c3aed" : lesson.contentType === "TEXT_AND_QUIZ" ? "#d97706" : "#16a34a",
                              fontSize: 10, fontWeight: 700,
                            }}>
                              {lesson.contentType === "TEXT" ? "📝 Lectura" : lesson.contentType === "TEXT_AND_QUIZ" ? "📝❓ Quiz" : "❓ Quiz"}
                            </span>
                            {mod.lessons.length > 1 && (
                              <button type="button" onClick={() => removeLesson(mIdx, lIdx)}
                                className="text-xs hover:text-red-500 transition-colors" style={{ color: "#94a3b8" }}>✕</button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button type="button" onClick={() => addLesson(mIdx)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-violet-50 hover:border-violet-300"
                      style={{ border: "1px dashed #e2e8f0", color: "#94a3b8" }}>
                      + Agregar lección
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {state.error && <p className="text-sm text-red-500 px-1">{state.error}</p>}

          <div className="flex gap-3 pb-8">
            <a href="/admin/courses"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#64748b" }}>
              Cancelar
            </a>
            <button type="submit" disabled={isPending}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#7c3aed" }}>
              {isPending ? "Guardando..." : "Guardar curso"}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
