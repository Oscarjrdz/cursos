import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { notFound, redirect } from "next/navigation"
import StudentRanking from "@/features/student/components/StudentRanking"

export const dynamic = "force-dynamic"

export default async function RankingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params
  const session = await getSession()

  if (!session?.userId) redirect(`/${slug}/login`)

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  // Fetch rankings
  const [enrollments, reactions, comments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { user: { tenantId: tenant.id, role: "STUDENT" } },
      orderBy: { xpTotal: "desc" },
      include: { user: { select: { id: true, name: true } } },
      take: 50,
    }),
    prisma.rankingReaction.findMany({
      where: { tenantId: tenant.id },
      select: { fromUserId: true, toUserId: true, type: true },
    }),
    prisma.rankingComment.groupBy({
      by: ["toUserId"],
      where: { tenantId: tenant.id },
      _count: { id: true },
    }),
  ])

  // Group reactions
  const reactionMap: Record<string, { counts: Record<string, number>; myReactions: string[] }> = {}
  for (const r of reactions) {
    if (!reactionMap[r.toUserId]) reactionMap[r.toUserId] = { counts: {}, myReactions: [] }
    reactionMap[r.toUserId].counts[r.type] = (reactionMap[r.toUserId].counts[r.type] || 0) + 1
    if (r.fromUserId === session.userId) reactionMap[r.toUserId].myReactions.push(r.type)
  }

  // Map comment counts
  const commentCountsMap: Record<string, number> = {}
  for (const c of comments) {
    commentCountsMap[c.toUserId] = c._count.id
  }

  const entries = enrollments.map((e, i) => ({
    rank: i + 1,
    userId: e.user.id,
    userName: e.user.name,
    xpTotal: e.xpTotal,
    reactions: reactionMap[e.user.id] ?? { counts: {}, myReactions: [] },
    commentCount: commentCountsMap[e.user.id] ?? 0,
  }))

  return (
    <StudentRanking 
      tenantSlug={slug} 
      entries={entries} 
      currentUserId={session.userId} 
    />
  )
}
