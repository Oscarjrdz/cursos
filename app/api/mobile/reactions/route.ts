import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

const VALID_TYPES = ["like", "love", "fire", "gem", "brain", "lightning", "crown", "bullseye"] as const

// GET — fetch all reactions for the tenant (grouped by toUserId)
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const reactions = await prisma.rankingReaction.findMany({
    where: { tenantId: session.tenantId },
    select: { fromUserId: true, toUserId: true, type: true },
  })

  // Group by toUserId → { [userId]: { counts: { fire: 3, ... }, myReactions: ["fire","love"] } }
  const grouped: Record<string, { counts: Record<string, number>; myReactions: string[] }> = {}

  for (const r of reactions) {
    if (!grouped[r.toUserId]) grouped[r.toUserId] = { counts: {}, myReactions: [] }
    grouped[r.toUserId].counts[r.type] = (grouped[r.toUserId].counts[r.type] || 0) + 1
    if (r.fromUserId === session.userId) grouped[r.toUserId].myReactions.push(r.type)
  }

  return NextResponse.json({ reactions: grouped, currentUserId: session.userId })
}

// POST — toggle a reaction
export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { toUserId, type } = body as { toUserId: string; type: string }

  if (!toUserId || !type) return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number]))
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  if (toUserId === session.userId)
    return NextResponse.json({ error: "No puedes reaccionar a ti mismo" }, { status: 400 })

  // Check if reaction exists → toggle
  const existing = await prisma.rankingReaction.findUnique({
    where: {
      tenantId_fromUserId_toUserId_type: {
        tenantId: session.tenantId,
        fromUserId: session.userId,
        toUserId,
        type,
      },
    },
  })

  if (existing) {
    await prisma.rankingReaction.delete({ where: { id: existing.id } })
    return NextResponse.json({ action: "removed", type })
  } else {
    await prisma.rankingReaction.create({
      data: {
        tenantId: session.tenantId,
        fromUserId: session.userId,
        toUserId,
        type,
      },
    })
    return NextResponse.json({ action: "added", type })
  }
}
