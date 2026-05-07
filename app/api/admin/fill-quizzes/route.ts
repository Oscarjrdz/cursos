import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const maxDuration = 120

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "admin2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lessons = await prisma.lesson.findMany({
    where: { contentType: "TEXT_AND_QUIZ" },
    select: { id: true, title: true, contentJson: true },
  })

  // Process lessons missing the quiz array (including those with old single-question format)
  const missing = lessons.filter((l) => {
    const cj = l.contentJson as Record<string, unknown>
    return !Array.isArray(cj.quiz) || (cj.quiz as unknown[]).length < 5
  })

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: "All lessons already have 5-question quizzes." })
  }

  const results: { id: string; title: string; status: string }[] = []

  for (const lesson of missing) {
    const cj = lesson.contentJson as Record<string, unknown>
    const blocks = Array.isArray(cj.blocks)
      ? (cj.blocks as { text: string }[]).map((b) => b.text ?? "").filter(Boolean).join("\n\n")
      : String(cj.content ?? cj.text ?? "")

    if (!blocks.trim()) {
      results.push({ id: lesson.id, title: lesson.title, status: "skipped (no content)" })
      continue
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Eres un experto en evaluación educativa de nivel avanzado. Genera exactamente 5 preguntas de opción múltiple de NIVEL EXPERTO para evaluar la comprensión profunda del siguiente contenido.

Las preguntas deben evaluar: aplicación práctica, análisis crítico, síntesis de conceptos y juicio profesional. No hagas preguntas de memorización simple.

Devuelve ÚNICAMENTE JSON válido con esta estructura:
{
  "quiz": [
    {
      "question": "¿Pregunta de nivel experto?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0,
      "explanation": "Explicación técnica detallada de por qué esa respuesta es correcta y por qué las otras no lo son"
    }
  ]
}

Reglas:
- Exactamente 5 preguntas en el array quiz
- Cada pregunta tiene exactamente 4 opciones
- correctIndex es el índice (0-3) de la respuesta correcta
- Los distractores deben ser plausibles y técnicamente relacionados
- Las explicaciones deben ser detalladas y educativas
- Responde en el mismo idioma del contenido`,
          },
          {
            role: "user",
            content: `Título: ${lesson.title}\n\nContenido:\n${blocks.slice(0, 4000)}`,
          },
        ],
      })

      const raw = response.choices[0]?.message?.content ?? ""
      const parsed = JSON.parse(raw)

      if (!Array.isArray(parsed.quiz) || parsed.quiz.length === 0) {
        results.push({ id: lesson.id, title: lesson.title, status: "error: invalid quiz format" })
        continue
      }

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          contentJson: {
            ...cj,
            quiz: parsed.quiz,
            // Remove old single-question fields if present
            question: undefined,
            options: undefined,
            correctIndex: undefined,
            explanation: undefined,
          },
        },
      })

      results.push({ id: lesson.id, title: lesson.title, status: `updated (${parsed.quiz.length} questions)` })
    } catch (err) {
      results.push({ id: lesson.id, title: lesson.title, status: `error: ${err}` })
    }
  }

  return NextResponse.json({
    ok: true,
    updated: results.filter((r) => r.status.startsWith("updated")).length,
    results,
  })
}
