import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "admin2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lessons = await prisma.lesson.findMany({
    select: { id: true, title: true, contentType: true, contentJson: true },
    orderBy: { createdAt: "asc" },
  })

  const summary = lessons.map((l) => {
    const cj = l.contentJson as Record<string, unknown>
    const hasBlocks = Array.isArray(cj.blocks) && (cj.blocks as unknown[]).length > 0
    const hasQuizArray = Array.isArray(cj.quiz)
    const quizCount = hasQuizArray ? (cj.quiz as unknown[]).length : 0
    const hasSingleQuestion = !!cj.question

    return {
      id: l.id,
      title: l.title,
      contentType: l.contentType,
      hasBlocks,
      hasQuizArray,
      quizCount,
      hasSingleQuestion,
      contentJsonKeys: Object.keys(cj),
    }
  })

  const withQuiz = summary.filter((l) => l.hasQuizArray && l.quizCount > 0)
  const withSingleQ = summary.filter((l) => l.hasSingleQuestion && !l.hasQuizArray)
  const noQuiz = summary.filter((l) => l.contentType === "TEXT_AND_QUIZ" && !l.hasQuizArray && !l.hasSingleQuestion)

  return NextResponse.json({
    total: lessons.length,
    withQuizArray: withQuiz.length,
    withSingleQuestion: withSingleQ.length,
    missingQuiz: noQuiz.length,
    lessons: summary,
  })
}
