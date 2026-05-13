"use client"

import { useActionState, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createCourse, type CourseFormState } from "@/features/courses/actions"

type Lesson = { title: string; contentType: "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"; content: string; xpReward: number; quiz?: { question: string; options: string[]; correctIndex: number; explanation?: string }[] }
type Module = { title: string; lessons: Lesson[] }
type Theme = { title: string; subtopics: string[] }

const emptyLesson = (): Lesson => ({ title: "", contentType: "TEXT", content: "", xpReward: 10 })
const emptyModule = (): Module => ({ title: "", lessons: [emptyLesson()] })
const initialState: CourseFormState = {}

/* ═══════ Flatten themes into generation queue ═══════ */
type QueueItem = { themeTitle: string; subtopic: string; themeIdx: number; subIdx: number }

function flattenThemes(themes: Theme[]): QueueItem[] {
  const q: QueueItem[] = []
  themes.forEach((t, ti) => t.subtopics.forEach((s, si) => q.push({ themeTitle: t.title, subtopic: s, themeIdx: ti, subIdx: si })))
  return q
}

/* ═══════ PDF WIZARD ═══════ */
type WizardStep = "upload" | "outline" | "generating" | "done"

function PdfWizard({ onComplete }: { onComplete: (title: string, desc: string, modules: Module[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState<WizardStep>("upload")
  const [error, setError] = useState("")

  const [courseTitle, setCourseTitle] = useState("")
  const [courseDesc, setCourseDesc] = useState("")
  const [themes, setThemes] = useState<Theme[]>([])

  // Generation queue
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [generatedModules, setGeneratedModules] = useState<Module[]>([])
  const [statuses, setStatuses] = useState<("pending" | "loading" | "done" | "error")[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return }
    setFile(f); setError("")
  }

  // Step 1: Extract outline with themes + subtopics
  const handleExtractOutline = async () => {
    if (!file) return
    setStep("outline"); setError("")
    try {
      const fd = new FormData()
      fd.append("pdf", file)
      const res = await fetch("/api/generate-course/outline", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al analizar")
      setCourseTitle(data.outline.title)
      setCourseDesc(data.outline.description)
      setThemes(data.outline.themes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
      setStep("upload")
    }
  }

  // Step 2: Generate subtopic by subtopic
  const generateSubtopic = async (idx: number, q: QueueItem[], sts: ("pending" | "loading" | "done" | "error")[], mods: Module[]) => {
    if (!file) return { sts, mods }
    const ns = [...sts]; ns[idx] = "loading"; setStatuses(ns); setCurrentIdx(idx)
    try {
      const fd = new FormData()
      fd.append("pdf", file)
      fd.append("subtopic", q[idx].subtopic)
      fd.append("themeTitle", q[idx].themeTitle)
      fd.append("context", themes.map(t => `${t.title}: ${t.subtopics.join(", ")}`).join(" | "))

      const res = await fetch("/api/generate-course/module", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al generar")

      const mod: Module = {
        title: data.module.title,
        lessons: data.module.lessons.map((l: any) => ({
          title: l.title, contentType: l.contentType as Lesson["contentType"],
          content: l.content ?? "", xpReward: l.xpReward ?? 10, quiz: l.quiz,
        })),
      }
      const nm = [...mods]; nm[idx] = mod
      const ns2 = [...ns]; ns2[idx] = "done"
      setGeneratedModules(nm); setStatuses(ns2)
      return { sts: ns2, mods: nm }
    } catch (err) {
      const ns2 = [...ns]; ns2[idx] = "error"
      setStatuses(ns2); setError(err instanceof Error ? err.message : "Error")
      return { sts: ns2, mods }
    }
  }

  const handleStartGeneration = async () => {
    setStep("generating"); setError("")
    const q = flattenThemes(themes)
    setQueue(q)
    const initSts = q.map(() => "pending" as const)
    setStatuses(initSts)
    setGeneratedModules([])

    let sts = initSts as ("pending" | "loading" | "done" | "error")[]
    let mods: Module[] = []
    for (let i = 0; i < q.length; i++) {
      const result = await generateSubtopic(i, q, sts, mods)
      sts = result.sts; mods = result.mods
    }
    setStep("done")
  }

  const handleRetry = async (idx: number) => {
    const result = await generateSubtopic(idx, queue, statuses, generatedModules)
    if (result.sts.every(s => s === "done")) setStep("done")
  }

  const handleFinish = () => {
    onComplete(courseTitle, courseDesc, generatedModules.filter(Boolean))
  }

  const totalSubtopics = themes.reduce((a, t) => a + t.subtopics.length, 0)
  const doneCount = statuses.filter(s => s === "done").length
  const pct = queue.length > 0 ? Math.round((doneCount / queue.length) * 100) : 0

  // ── Upload ──
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className="rounded-2xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer"
          style={{ background: dragging ? "#f5f3ff" : "#f8fafc", border: `2px dashed ${dragging ? "#7c3aed" : "#e2e8f0"}` }}>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {file ? (
            <><span className="text-4xl">📄</span>
              <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p></>
          ) : (
            <><span className="text-4xl">📁</span>
              <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Arrastra tu PDF aquí</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>o haz clic para seleccionar</p></>
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

  // ── Outline loading ──
  if (step === "outline" && themes.length === 0) {
    return (
      <div className="rounded-2xl p-8 flex flex-col items-center gap-3"
        style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Analizando PDF...</p>
        <p className="text-xs text-center" style={{ color: "#94a3b8" }}>Extrayendo temas y subtemas del documento</p>
      </div>
    )
  }

  // ── Outline ready ──
  if (step === "outline" && themes.length > 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-5 space-y-2" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p className="text-sm font-semibold" style={{ color: "#15803d" }}>
            ✅ {themes.length} temas con {totalSubtopics} subtemas encontrados
          </p>
          <p className="text-xs" style={{ color: "#16a34a" }}>
            Cada subtema generará 5 lecturas + 5 evaluaciones = {totalSubtopics * 10} lecciones totales
          </p>
        </div>

        <div className="space-y-3">
          {themes.map((theme, ti) => (
            <div key={ti} className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  TEMA {ti + 1}
                </span>
                <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{theme.title}</p>
              </div>
              <div className="p-3 space-y-1" style={{ background: "#fff" }}>
                {theme.subtopics.map((sub, si) => (
                  <div key={si} className="flex items-start gap-2 py-1.5 px-2 rounded-lg"
                    style={{ background: si % 2 === 0 ? "#fafafa" : "transparent" }}>
                    <span className="text-xs mt-0.5 shrink-0" style={{ color: "#94a3b8" }}>{si + 1}.</span>
                    <p className="text-xs" style={{ color: "#334155" }}>{sub}</p>
                    <span className="text-xs shrink-0 ml-auto" style={{ color: "#c4b5fd" }}>10 lecciones</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => { setStep("upload"); setThemes([]) }}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all hover:bg-slate-100"
            style={{ background: "#f1f5f9", color: "#64748b" }}>
            ← Cambiar PDF
          </button>
          <button type="button" onClick={handleStartGeneration}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            🚀 Generar contenido ({totalSubtopics} subtemas)
          </button>
        </div>
      </div>
    )
  }

  // ── Generating / Done ──
  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 space-y-3" style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
            {step === "done" ? "✅ ¡Curso generado!" : `⏳ Generando subtema ${currentIdx + 1} de ${queue.length}...`}
          </p>
          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#ede9fe", color: "#7c3aed" }}>{pct}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
          <motion.div className="h-full rounded-full" style={{ background: "#7c3aed" }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
        <p className="text-xs" style={{ color: "#94a3b8" }}>{doneCount} de {queue.length} subtemas completados</p>
      </div>

      {/* Group by theme */}
      <div className="space-y-3">
        {themes.map((theme, ti) => {
          const themeItems = queue.map((q, qi) => ({ ...q, globalIdx: qi })).filter(q => q.themeIdx === ti)
          const themeDone = themeItems.filter(q => statuses[q.globalIdx] === "done").length
          return (
            <div key={ti} className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  TEMA {ti + 1}
                </span>
                <p className="text-sm font-medium flex-1 truncate" style={{ color: "#0f172a" }}>{theme.title}</p>
                <span className="text-xs font-bold" style={{ color: themeDone === themeItems.length ? "#16a34a" : "#94a3b8" }}>
                  {themeDone}/{themeItems.length}
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "#f1f5f9" }}>
                {themeItems.map((item) => {
                  const s = statuses[item.globalIdx]
                  const icons = { pending: "⏳", loading: "🔄", done: "✅", error: "❌" }
                  const bgs = { pending: "transparent", loading: "#fefce8", done: "#f0fdf4", error: "#fef2f2" }
                  return (
                    <div key={item.globalIdx} className="flex items-center gap-3 px-4 py-2.5 transition-all"
                      style={{ background: bgs[s] }}>
                      <span className="text-sm">{icons[s]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: "#0f172a" }}>{item.subtopic}</p>
                        {s === "loading" && <p className="text-xs" style={{ color: "#d97706" }}>Generando 5 lecturas + 5 quizzes...</p>}
                        {s === "done" && generatedModules[item.globalIdx] && (
                          <p className="text-xs" style={{ color: "#16a34a" }}>{generatedModules[item.globalIdx].lessons.length} lecciones ✓</p>
                        )}
                      </div>
                      {s === "loading" && <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />}
                      {s === "error" && (
                        <button type="button" onClick={() => handleRetry(item.globalIdx)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ background: "#ef4444" }}>
                          Reintentar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      {step === "done" && doneCount > 0 && (
        <motion.button type="button" onClick={handleFinish}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
          ✅ Revisar y guardar ({doneCount} módulos, {doneCount * 10} lecciones)
        </motion.button>
      )}
    </div>
  )
}

/* ═══════ MAIN FORM ═══════ */

export default function CourseForm() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState)
  const [modules, setModules] = useState<Module[]>([emptyModule()])
  const [activeTab, setActiveTab] = useState<"manual" | "pdf">("manual")
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [generatedDesc, setGeneratedDesc] = useState("")

  const handlePdfComplete = (title: string, desc: string, mods: Module[]) => {
    setGeneratedTitle(title); setGeneratedDesc(desc); setModules(mods); setActiveTab("manual")
  }

  const updateModule = (mIdx: number, key: keyof Module, value: string) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, [key]: value } : m)))
  const addModule = () => setModules((prev) => [...prev, emptyModule()])
  const removeModule = (mIdx: number) => setModules((prev) => prev.filter((_, i) => i !== mIdx))
  const updateLesson = (mIdx: number, lIdx: number, key: keyof Lesson, value: string | number) =>
    setModules((prev) => prev.map((m, i) =>
      i === mIdx ? { ...m, lessons: m.lessons.map((l, j) => (j === lIdx ? { ...l, [key]: value } : l)) } : m))
  const addLesson = (mIdx: number) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m)))
  const removeLesson = (mIdx: number, lIdx: number) =>
    setModules((prev) => prev.map((m, i) => (i === mIdx ? { ...m, lessons: m.lessons.filter((_, j) => j !== lIdx) } : m)))

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="modules" value={JSON.stringify(modules)} />

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
                style={{ background: "#7c3aed" }}>+ Módulo</button>
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
                  <div className="p-4 space-y-2" style={{ background: "#ffffff" }}>
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2 py-2 px-3 rounded-lg"
                        style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                        <span className="text-xs font-bold w-5" style={{ color: "#94a3b8" }}>L{lIdx + 1}</span>
                        <p className="flex-1 text-xs truncate" style={{ color: "#0f172a" }}>{lesson.title || "Sin título"}</p>
                        <span className="text-xs px-2 py-0.5 rounded shrink-0" style={{
                          background: lesson.contentType === "TEXT" ? "#f3f0ff" : "#fffbeb",
                          color: lesson.contentType === "TEXT" ? "#7c3aed" : "#d97706",
                          fontSize: 10, fontWeight: 700,
                        }}>
                          {lesson.contentType === "TEXT" ? "📝" : "❓"} {lesson.xpReward}xp
                        </span>
                        {mod.lessons.length > 1 && (
                          <button type="button" onClick={() => removeLesson(mIdx, lIdx)}
                            className="text-xs hover:text-red-500 transition-colors" style={{ color: "#cbd5e1" }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addLesson(mIdx)}
                      className="w-full py-2 rounded-xl text-xs font-medium transition-all hover:bg-violet-50"
                      style={{ border: "1px dashed #e2e8f0", color: "#94a3b8" }}>+ Lección</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {state.error && <p className="text-sm text-red-500 px-1">{state.error}</p>}

          <div className="flex gap-3 pb-8">
            <a href="/admin/courses"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#64748b" }}>Cancelar</a>
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
