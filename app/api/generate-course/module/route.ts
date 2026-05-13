import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 120

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional de nivel avanzado. Tu tarea es generar el contenido COMPLETO para UN SOLO módulo de un curso, basándote en el documento adjunto.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "title": "Título del módulo",
  "lessons": [
    {
      "title": "Título de la lección de lectura",
      "contentType": "TEXT",
      "content": "Contenido educativo detallado de la lección (3-5 párrafos con profundidad técnica, información práctica y ejemplos)",
      "xpReward": 10
    },
    {
      "title": "Título de la evaluación",
      "contentType": "TEXT_AND_QUIZ",
      "content": "Breve resumen/repaso del tema evaluado (1-2 párrafos)",
      "quiz": [
        {
          "question": "¿Pregunta de nivel experto?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctIndex": 0,
          "explanation": "Explicación técnica detallada de por qué esa respuesta es la correcta"
        }
      ],
      "xpReward": 25
    }
  ]
}

Reglas CRÍTICAS:
- Genera EXACTAMENTE 10 lecciones para este módulo, alternando:
  1. Lectura 1 (TEXT) — 15 XP
  2. Evaluación 1 (TEXT_AND_QUIZ con 5 preguntas) — 25 XP
  3. Lectura 2 (TEXT) — 15 XP
  4. Evaluación 2 (TEXT_AND_QUIZ con 5 preguntas) — 25 XP
  5. Lectura 3 (TEXT) — 15 XP
  6. Evaluación 3 (TEXT_AND_QUIZ con 5 preguntas) — 25 XP
  7. Lectura 4 (TEXT) — 15 XP
  8. Evaluación 4 (TEXT_AND_QUIZ con 5 preguntas) — 25 XP
  9. Lectura 5 (TEXT) — 15 XP
  10. Evaluación 5 (TEXT_AND_QUIZ con 5 preguntas) — 30 XP (evaluación final del módulo)
- Cada lección TEXT debe tener contenido detallado de 3-5 párrafos
- Cada lección TEXT_AND_QUIZ debe tener exactamente 5 preguntas en el campo "quiz"
- Las preguntas deben ser de NIVEL EXPERTO: evalúan aplicación, análisis y juicio crítico
- Cada pregunta tiene exactamente 4 opciones; correctIndex es el índice (0-3) de la correcta
- Los distractores deben ser plausibles y técnicamente relacionados
- Responde en el mismo idioma del documento
- Solo genera contenido relacionado al módulo solicitado, NO de otros módulos`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File | null
    const moduleTitle = formData.get("moduleTitle") as string | null
    const moduleIndex = formData.get("moduleIndex") as string | null
    const allModules = formData.get("allModules") as string | null

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Se requiere un archivo PDF" }, { status: 400 })
    }

    if (!moduleTitle) {
      return NextResponse.json({ error: "Se requiere el título del módulo" }, { status: 400 })
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

    const contextMsg = allModules
      ? `\n\nContexto: El curso completo tiene estos módulos: ${allModules}.\nTú solo debes generar el contenido del módulo ${moduleIndex ?? ""}: "${moduleTitle}".`
      : ""

    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: file.name,
              file_data: `data:application/pdf;base64,${base64}`,
            } as any,
            {
              type: "input_text",
              text: `Genera el contenido completo SOLO para el módulo: "${moduleTitle}".${contextMsg}\n\nDebe tener exactamente 5 lecturas y 5 evaluaciones (10 lecciones en total, alternadas). Responde únicamente con JSON válido.`,
            },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    })

    const raw = response.output_text
    if (!raw) throw new Error("Respuesta vacía de OpenAI")

    const moduleData = JSON.parse(raw)

    if (!moduleData.title || !Array.isArray(moduleData.lessons) || moduleData.lessons.length === 0) {
      throw new Error("La IA devolvió una estructura inválida para este módulo")
    }

    return NextResponse.json({ ok: true, module: moduleData })
  } catch (error) {
    console.error("generate-course/module error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar el módulo" },
      { status: 500 }
    )
  }
}
