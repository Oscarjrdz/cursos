import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional. Tu tarea es analizar el documento adjunto y extraer TODOS los temas y subtemas que contiene.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "title": "Título sugerido para el curso completo",
  "description": "Descripción breve del curso (2-3 oraciones)",
  "themes": [
    {
      "title": "TEMA 1. Nombre del tema principal",
      "subtopics": [
        "Subtema 1: Descripción breve",
        "Subtema 2: Descripción breve",
        "Subtema 3: Descripción breve",
        "Subtema 4: Descripción breve",
        "Subtema 5: Descripción breve"
      ]
    },
    {
      "title": "TEMA 2. Nombre del segundo tema",
      "subtopics": [
        "Subtema 1: Descripción breve",
        "Subtema 2: Descripción breve"
      ]
    }
  ]
}

Reglas:
- Cubre el 100% del contenido del documento
- Extrae TODOS los temas principales (capítulos, módulos, secciones)
- Dentro de cada tema, extrae TODOS los subtemas (puntos, lecciones, apartados)
- Cada subtema se convertirá en un módulo con 5 lecturas y 5 evaluaciones, así que asegúrate de que cada subtema tiene suficiente contenido
- Responde en el mismo idioma del documento
- Solo devuelve JSON válido, sin texto adicional`

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

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

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
              text: "Extrae TODOS los temas y sus subtemas de este documento. Responde solo con JSON válido.",
            },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    })

    const raw = response.output_text
    if (!raw) throw new Error("Respuesta vacía de OpenAI")

    const outline = JSON.parse(raw)

    if (!outline.title || !Array.isArray(outline.themes) || outline.themes.length === 0) {
      throw new Error("No se pudieron extraer los temas del documento")
    }

    return NextResponse.json({ ok: true, outline })
  } catch (error) {
    console.error("generate-course/outline error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al analizar el PDF" },
      { status: 500 }
    )
  }
}
