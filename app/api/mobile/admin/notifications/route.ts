import { NextRequest, NextResponse } from "next/server"
import { getMobileSession } from "@/lib/mobile-auth"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/push-notifications"

export async function POST(req: NextRequest) {
  const mobileSession = await getMobileSession(req)
  const webSession = mobileSession ? null : await getSession()
  const role = mobileSession?.role ?? webSession?.role
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { title, body, tenantId, targetType } = await req.json()
  if (!title || !body) {
    return NextResponse.json({ error: "Título y mensaje son requeridos" }, { status: 400 })
  }

  let tokens: string[] = []

  if (targetType === "admins") {
    const tenants = await prisma.tenant.findMany({
      where: {
        adminPushToken: { not: null },
        ...(tenantId ? { id: tenantId } : {}),
      },
      select: { adminPushToken: true },
    })
    tokens = tenants.map((t) => t.adminPushToken).filter(Boolean) as string[]
  } else {
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        pushToken: { not: null },
        ...(tenantId ? { tenantId } : {}),
      },
      select: { pushToken: true },
    })
    tokens = students.map((s) => s.pushToken).filter(Boolean) as string[]
  }

  if (tokens.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  await sendPushNotification({ to: tokens, title, body })

  return NextResponse.json({ ok: true, sent: tokens.length })
}
