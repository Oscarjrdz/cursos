"use client"

import { useActionState, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createCourse, type CourseFormState } from "@/features/courses/actions"

type Lesson = { title: string; contentType: "TEXT" | "QUIZ" | "TEXT_AND_QUIZ"; content: string; xpReward: number }
type Module = { title: string; lessons: Lesson[] }

const emptyLesson = (): Lesson => ({ title: "", contentType: "TEXT", content: "", xpReward: 10 })
const emptyModule = (): Module => ({ title: "", lessons: [emptyLesson()] })

const initialState: CourseFormState = {}

type GeneratedCourse = { title: string; description: string; modules: Module[] }

function PdfUploadPanel({ onGenerated }: { onGenerated: (course: GeneratedCourse) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setErrorMsg("Solo se aceptan archivos PDF"); return }
    setFile(f)
    setErrorMsg("")
    setStatus("idle")
  }

  const handleGenerate = async () => {
    if (!file) return
    setStatus("loading")
    setErrorMsg("")
    try {
      const formData = new FormData()
      formData.append("pdf", file)
      const res = await fetch("/api/generate-course", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al generar")
      onGenerated(data.course)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado")
      setStatus("error")
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => status !== "loading" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className="rounded-2xl p-8 flex flex-col items-center gap-3 transition-all"
        style={{
          cursor: status === "loading" ? "default" : "pointer",
          background: dragging ? "#f5f3ff" : "#f8fafc",
          border: `2px dashed ${dragging ? "#7c3aed" : "#e2e8f0"}`,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {file ? (
          <>
            <span className="text-4xl">📄</span>
            <p className="font-medium text-sm" style={{ color: "#0f172a" }}>{file.name}</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {status !== "loading" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus("idle") }}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                style={{ color: "#94a3b8" }}
              >
                Cambiar archivo
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-4xl">📁</span>
            <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Arrastra tu PDF aquí</p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>o haz clic para seleccionar</p>
            <button
              type="button"
              className="mt-1 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "#7c3aed" }}
            >
              Seleccionar PDF
            </button>
          </>
        )}
      </div>

      {errorMsg && <p className="text-sm text-red-500 px-1">{errorMsg}</p>}

      {file && status !== "loading" && (
        <motion.button
          type="button"
          onClick={handleGenerate}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          🤖 Generar curso con IA
        </motion.button>
      )}

      {status === "loading" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl p-6 flex flex-col items-center gap-3"
          style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="font-medium text-sm" style={{ color: "#0f172a" }}>Analizando PDF con IA...</p>
          <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
            GPT-4 está leyendo el documento y creando la estructura del curso. Puede tomar 15-30 segundos.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default function CourseForm() {
  const [state, formAction, isPending] = useActionState(createCourse, initialState)
  const [modules, setModules] = useState<Module[]>([emptyModule()])
  const [activeTab, setActiveTab] = useState<"manual" | "pdf">("manual")
  const [generatedTitle, setGeneratedTitle] = useState("")
  const [generatedDesc, setGeneratedDesc] = useState("")

  const handleGenerated = (course: GeneratedCourse) => {
    setGeneratedTitle(course.title)
    setGeneratedDesc(course.description)
    setModules(course.modules.map((m) => ({
      title: m.title,
      lessons: m.lessons.map((l) => ({
        title: l.title,
        contentType: l.contentType as Lesson["contentType"],
        content: l.content,
        xpReward: l.xpReward ?? 10,
      })),
    })))
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
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              activeTab === tab
                ? { background: "#7c3aed", color: "white" }
                : { color: "#94a3b8" }
            }
          >
            {tab === "manual" ? "✍️ Manual" : "📄 Desde PDF"}
          </button>
        ))}
      </div>

      {activeTab === "pdf" && <PdfUploadPanel onGenerated={handleGenerated} />}

      {activeTab === "manual" && (
        <div className="space-y-6">
          {/* Curso info */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
          >
            <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>Información del curso</h2>

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "#64748b" }}>Título *</label>
              <input
                name="title"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                placeholder="Ej. Fundamentos de Marketing Digital"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-violet-300"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a" }}
              />
              {state.fieldErrors?.title && <p className="text-xs text-red-500">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: "#64748b" }}>Descripción</label>
              <textarea
                name="description"
                value={generatedDesc}
                onChange={(e) => setGeneratedDesc(e.target.value)}
                placeholder="¿De qué trata este curso?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-violet-300"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a" }}
              />
            </div>
          </div>

          {/* Módulos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm" style={{ color: "#0f172a" }}>
                Módulos y lecciones
                <span className="ml-2 text-xs font-normal" style={{ color: "#94a3b8" }}>({modules.length} módulos)</span>
              </h2>
              <button
                type="button"
                onClick={addModule}
                className="text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-90 text-white"
                style={{ background: "#7c3aed" }}
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
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-3"
                    style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
                  >
                    <span className="text-xs font-bold w-5" style={{ color: "#7c3aed" }}>M{mIdx + 1}</span>
                    <input
                      value={mod.title}
                      onChange={(e) => updateModule(mIdx, "title", e.target.value)}
                      placeholder={`Nombre del módulo ${mIdx + 1}`}
                      className="flex-1 bg-transparent text-sm font-medium outline-none"
                      style={{ color: "#0f172a" }}
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        className="text-xs px-2 py-1 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                        style={{ color: "#94a3b8" }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3" style={{ background: "#ffffff" }}>
                    <AnimatePresence>
                      {mod.lessons.map((lesson, lIdx) => (
                        <motion.div
                          key={lIdx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl p-4 space-y-3"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold w-5" style={{ color: "#94a3b8" }}>L{lIdx + 1}</span>
                            <input
                              value={lesson.title}
                              onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)}
                              placeholder="Título de la lección"
                              className="flex-1 bg-transparent text-sm outline-none"
                              style={{ color: "#0f172a" }}
                            />
                            {mod.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(mIdx, lIdx)}
                                className="text-xs hover:text-red-500 transition-colors"
                                style={{ color: "#94a3b8" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs" style={{ color: "#64748b" }}>Tipo</label>
                              <select
                                value={lesson.contentType}
                                onChange={(e) => updateLesson(mIdx, lIdx, "contentType", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                                style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
                              >
                                <option value="TEXT">📝 Solo texto</option>
                                <option value="QUIZ">❓ Solo quiz</option>
                                <option value="TEXT_AND_QUIZ">📝❓ Texto + Quiz</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs" style={{ color: "#64748b" }}>XP</label>
                              <input
                                type="number"
                                min={5}
                                max={100}
                                value={lesson.xpReward}
                                onChange={(e) => updateLesson(mIdx, lIdx, "xpReward", Number(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                                style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs" style={{ color: "#64748b" }}>Contenido</label>
                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(mIdx, lIdx, "content", e.target.value)}
                              placeholder="Escribe el contenido de la lección..."
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                              style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => addLesson(mIdx)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium transition-all hover:bg-violet-50 hover:border-violet-300"
                      style={{ border: "1px dashed #e2e8f0", color: "#94a3b8" }}
                    >
                      + Agregar lección
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {state.error && <p className="text-sm text-red-500 px-1">{state.error}</p>}

          <div className="flex gap-3 pb-8">
            <a
              href="/admin/courses"
              className="flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all hover:bg-slate-100"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "#7c3aed" }}
            >
              {isPending ? "Guardando..." : "Guardar curso"}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
