import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres un experto en diseño instruccional. Tu tarea es analizar el documento adjunto y extraer TODOS los temas/módulos principales que se podrían convertir en un curso.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "title": "Título sugerido para el curso completo",
  "description": "Descripción breve del curso (2-3 oraciones)",
  "modules": [
    { "title": "Nombre del módulo/tema 1", "summary": "Breve resumen de qué cubre (1 oración)" },
    { "title": "Nombre del módulo/tema 2", "summary": "Breve resumen de qué cubre (1 oración)" }
  ]
}

Reglas:
- Cubre el 100% del contenido del documento
- Si el documento tiene módulos/capítulos/secciones explícitas, úsalos como módulos
- Cada módulo debe representar un tema lo suficientemente amplio para generar 5 lecturas y 5 evaluaciones
- No hay límite de módulos: crea tantos como requiera el contenido
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
              text: "Extrae la lista de todos los temas/módulos de este documento. Responde solo con JSON válido.",
            },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    })

    const raw = response.output_text
    if (!raw) throw new Error("Respuesta vacía de OpenAI")

    const outline = JSON.parse(raw)

    if (!outline.title || !Array.isArray(outline.modules) || outline.modules.length === 0) {
      throw new Error("No se pudieron extraer los módulos del documento")
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
