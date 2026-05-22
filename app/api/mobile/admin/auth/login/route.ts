import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { hashPassword } from "@/lib/crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const phone = (body.phone ?? "").toString().trim()
  const password = (body.password ?? "").toString().trim()

  if (!phone || !password)
    return NextResponse.json({ error: "Ingresa tu teléfono y contraseña" }, { status: 400 })

  const hashed = hashPassword(password)

  // Find tenant by admin phone
  const tenant = await prisma.tenant.findFirst({
    where: { adminPhone: phone, adminPassword: hashed },
  })

  if (!tenant)
    return NextResponse.json({ error: "Teléfono o contraseña incorrectos" }, { status: 401 })

  const token = await createSession({
    role: "TENANT_ADMIN",
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
  })

  return NextResponse.json({
    token,
    name: tenant.name,
    tenantSlug: tenant.slug,
    tenantName: tenant.name,
  })
}
