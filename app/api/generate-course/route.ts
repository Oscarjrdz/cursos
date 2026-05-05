import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional. Tu tarea es analizar el texto de un documento y generar la estructura completa de un curso de aprendizaje.

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
          "contentType": "TEXT" | "TEXT_AND_QUIZ",
          "content": "Contenido resumido de la lección (2-4 párrafos concisos)",
          "xpReward": 10
        }
      ]
    }
  ]
}

Reglas:
- Crea entre 2 y 5 módulos según la cantidad de contenido
- Cada módulo debe tener entre 2 y 5 lecciones
- Las lecciones de cierre de módulo deben ser TEXT_AND_QUIZ
- El contenido de cada lección debe ser claro, educativo y basado en el documento
- xpReward entre 10 y 30 según complejidad de la lección
- Responde en el mismo idioma del documento`

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

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (b: Buffer) => Promise<{ text: string }>
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await pdfParse(buffer)
    const text = parsed.text.slice(0, 15000)

    if (text.trim().length < 100) {
      return NextResponse.json({ error: "El PDF no tiene suficiente texto para generar un curso" }, { status: 400 })
    }

    // Llamar a GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Genera un curso basado en este documento:\n\n${text}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    })

    const raw = completion.choices[0].message.content
    if (!raw) throw new Error("Respuesta vacía de OpenAI")

    const course = JSON.parse(raw)

    // Validación básica de estructura
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

export const config = { api: { bodyParser: false } }
