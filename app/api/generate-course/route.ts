import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional. Tu tarea es analizar el documento adjunto y generar la estructura COMPLETA de un curso de aprendizaje, sin omitir ningún tema.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta, sin texto adicional:
{
  "title": "Título del curso",
  "description": "Descripción breve del curso (2-3 oraciones)",
  "modules": [
    {
      "title": "Nombre del módulo",
      "lessons": [
        {
          "title": "Título de la lección",
          "contentType": "TEXT",
          "content": "Contenido educativo detallado de la lección (3-5 párrafos)",
          "xpReward": 10
        },
        {
          "title": "Título de lección con quiz",
          "contentType": "TEXT_AND_QUIZ",
          "content": "Contenido educativo detallado de la lección (3-5 párrafos)",
          "question": "¿Pregunta de comprensión sobre el contenido?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correctIndex": 0,
          "explanation": "Explicación breve de por qué esa respuesta es correcta",
          "xpReward": 20
        }
      ]
    }
  ]
}

Reglas CRÍTICAS:
- DEBES cubrir el 100% del contenido del documento, sin omitir ningún tema, módulo o sección
- Si el documento tiene módulos explícitos (ej. "Módulo 1", "Módulo 2"...), crea un módulo del curso por cada uno
- Cada módulo debe tener entre 1 y 4 lecciones según su profundidad
- La última lección de cada módulo debe ser TEXT_AND_QUIZ (con question, options, correctIndex y explanation)
- Las lecciones TEXT_AND_QUIZ deben tener exactamente 4 opciones; correctIndex es el índice (0-3) de la correcta
- El contenido de cada lección debe ser claro, detallado y educativo, expandiendo lo del documento
- xpReward entre 10 y 30 según complejidad de la lección
- Responde en el mismo idioma del documento
- No hay límite máximo de módulos: crea tantos como requiera el contenido`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File | null

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Se requiere un archivo PDF" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El PDF no puede superar 10MB" }, { status: 400 })
    }

    // Enviar PDF directamente a OpenAI (Responses API con soporte nativo de PDF)
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              text: "Genera el curso completo basado en este documento. Cubre el 100% del contenido. Responde únicamente con JSON válido.",
            },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    })

    const raw = response.output_text
    if (!raw) throw new Error("Respuesta vacía de OpenAI")

    const course = JSON.parse(raw)

    if (!course.title || !Array.isArray(course.modules) || course.modules.length === 0) {
      throw new Error("La IA devolvió una estructura inválida")
    }

    return NextResponse.json({ ok: true, course })
  } catch (error) {
    console.error("generate-course error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar el curso" },
      { status: 500 }
    )
  }
}
