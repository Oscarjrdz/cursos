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

  // Find TEXT_AND_QUIZ lessons without quiz data
  const lessons = await prisma.lesson.findMany({
    where: { contentType: "TEXT_AND_QUIZ" },
    select: { id: true, title: true, contentJson: true },
  })

  const missing = lessons.filter((l) => {
    const cj = l.contentJson as Record<string, unknown>
    return !cj.question
  })

  if (missing.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: "All quizzes already have questions." })
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
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Genera una pregunta de opción múltiple para evaluar la comprensión del siguiente contenido educativo.
Devuelve ÚNICAMENTE JSON válido con esta estructura:
{
  "question": "¿Pregunta de comprensión?",
  "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "correctIndex": 0,
  "explanation": "Breve explicación de por qué es correcta"
}
Reglas: exactamente 4 opciones, correctIndex es el índice (0-3) de la respuesta correcta, responde en el mismo idioma del contenido.`,
          },
          {
            role: "user",
            content: `Título de la lección: ${lesson.title}\n\nContenido:\n${blocks.slice(0, 3000)}`,
          },
        ],
      })

      const raw = response.choices[0]?.message?.content ?? ""
      const quiz = JSON.parse(raw)

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          contentJson: {
            ...cj,
            question: quiz.question,
            options: quiz.options,
            correctIndex: quiz.correctIndex,
            explanation: quiz.explanation,
          },
        },
      })

      results.push({ id: lesson.id, title: lesson.title, status: "updated" })
    } catch (err) {
      results.push({ id: lesson.id, title: lesson.title, status: `error: ${err}` })
    }
  }

  return NextResponse.json({ ok: true, updated: results.filter((r) => r.status === "updated").length, results })
}
