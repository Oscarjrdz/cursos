import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

// GET comments for a specific user in the ranking
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const toUserId = searchParams.get("toUserId")

  if (!toUserId) return NextResponse.json({ error: "Falta toUserId" }, { status: 400 })

  const comments = await prisma.rankingComment.findMany({
    where: { tenantId: session.tenantId, toUserId },
    orderBy: { createdAt: "desc" },
    take: 100, // Reasonable limit
  })

  return NextResponse.json({ comments })
}

// POST a new comment
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { toUserId, text } = body as { toUserId: string; text: string }

  if (!toUserId || !text || text.trim() === "") {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  // Get current user's name
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true },
  })

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const comment = await prisma.rankingComment.create({
    data: {
      tenantId: session.tenantId,
      fromUserId: session.userId,
      fromName: user.name,
      toUserId,
      text: text.trim(),
    },
  })

  return NextResponse.json({ comment })
}
