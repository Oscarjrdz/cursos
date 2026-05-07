import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { hashPassword } from "@/lib/crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { phone, password, slug } = await req.json()

  const tenant = await prisma.tenant.findUnique({ where: { slug } })

  if (!tenant?.adminPhone || !tenant?.adminPassword) {
    return NextResponse.json({ error: "Este cliente no tiene credenciales configuradas" }, { status: 401 })
  }

  if (tenant.adminPhone !== phone || tenant.adminPassword !== hashPassword(password)) {
    return NextResponse.json({ error: "Teléfono o contraseña incorrectos" }, { status: 401 })
  }

  const token = await createSession({
    role: "TENANT_ADMIN",
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set("lf_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  return res
}
