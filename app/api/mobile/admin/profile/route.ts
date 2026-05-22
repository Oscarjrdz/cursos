import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"
import { hashPassword } from "@/lib/crypto"

// GET — admin profile (tenant info)
export async function GET(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    include: {
      users: {
        where: { role: "STUDENT" },
        select: { id: true, status: true },
      },
    },
  })

  if (!tenant)
    return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  return NextResponse.json({
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    maxStudents: tenant.maxStudents,
    adminPhone: tenant.adminPhone,
    logoUrl: tenant.logoUrl,
    expiresAt: tenant.expiresAt?.toISOString() ?? null,
    totalStudents: tenant.users.length,
    activeStudents: tenant.users.filter((u) => u.status === "ACTIVE").length,
  })
}

// PUT — update admin password
export async function PUT(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const password = (body.password ?? "").toString().trim()

  if (!password || password.length < 4)
    return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres" }, { status: 400 })

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { adminPassword: hashPassword(password) },
  })

  return NextResponse.json({ ok: true })
}

// PATCH — upload tenant logo
export async function PATCH(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session || session.role !== "TENANT_ADMIN" || !session.tenantId)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { base64, mimeType = "image/jpeg" } = body as { base64?: string; mimeType?: string }

  if (!base64)
    return NextResponse.json({ error: "No se recibió imagen (base64)" }, { status: 400 })

  const dataUri = `data:${mimeType};base64,${base64}`

  await prisma.tenant.update({
    where: { id: session.tenantId },
    data: { logoUrl: dataUri },
  })

  return NextResponse.json({ logoUrl: dataUri })
}
