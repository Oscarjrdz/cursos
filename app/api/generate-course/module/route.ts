import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 120

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional de nivel avanzado. Tu tarea es generar el contenido COMPLETO para UN SOLO subtema de un curso, basándote en el documento adjunto.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "title": "Título del subtema (será un módulo en la app)",
  "lessons": [
    {
      "title": "Lectura 1: Título descriptivo",
      "contentType": "TEXT",
      "content": "Contenido educativo detallado (3-5 párrafos con profundidad, ejemplos prácticos y casos reales)",
      "xpReward": 15
    },
    {
      "title": "Evaluación 1: Título descriptivo",
      "contentType": "TEXT_AND_QUIZ",
      "content": "Breve resumen/repaso del subtema evaluado (1-2 párrafos)",
      "quiz": [
        {
          "question": "¿Pregunta de nivel experto?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctIndex": 0,
          "explanation": "Explicación detallada de por qué esa respuesta es correcta"
        }
      ],
      "xpReward": 25
    }
  ]
}

Reglas CRÍTICAS:
- Genera EXACTAMENTE 10 lecciones, alternando lectura y evaluación:
  1. Lectura 1 (TEXT, 15 XP)
  2. Evaluación 1 (TEXT_AND_QUIZ con 5 preguntas, 25 XP)
  3. Lectura 2 (TEXT, 15 XP)
  4. Evaluación 2 (TEXT_AND_QUIZ con 5 preguntas, 25 XP)
  5. Lectura 3 (TEXT, 15 XP)
  6. Evaluación 3 (TEXT_AND_QUIZ con 5 preguntas, 25 XP)
  7. Lectura 4 (TEXT, 15 XP)
  8. Evaluación 4 (TEXT_AND_QUIZ con 5 preguntas, 25 XP)
  9. Lectura 5 (TEXT, 15 XP)
  10. Evaluación Final (TEXT_AND_QUIZ con 5 preguntas, 30 XP)
- Cada TEXT: contenido detallado de 3-5 párrafos, información práctica y ejemplos
- Cada TEXT_AND_QUIZ: exactamente 5 preguntas de nivel experto con 4 opciones
- correctIndex es el índice (0-3) de la respuesta correcta
- Distractores plausibles y técnicamente relacionados
- Responde en el mismo idioma del documento
- Solo genera contenido del subtema solicitado`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File | null
    const subtopic = formData.get("subtopic") as string | null
    const themeTitle = formData.get("themeTitle") as string | null
    const context = formData.get("context") as string | null

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Se requiere un archivo PDF" }, { status: 400 })
    }

    if (!subtopic) {
      return NextResponse.json({ error: "Se requiere el subtema" }, { status: 400 })
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

    const contextMsg = themeTitle
      ? `\n\nContexto: Este subtema pertenece al tema "${themeTitle}".${context ? `\nEstructura completa del curso: ${context}` : ""}`
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
              text: `Genera el contenido completo SOLO para el subtema: "${subtopic}".${contextMsg}\n\n5 lecturas + 5 evaluaciones = 10 lecciones alternadas. JSON válido.`,
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
      throw new Error("La IA devolvió una estructura inválida para este subtema")
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
