import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { hashPassword } from "@/lib/crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const phone = (body.phone ?? "").toString().trim()
  const password = (body.password ?? "").toString().trim()
  const slug = (body.slug ?? "").toString().trim()

  if (!phone || !password || !slug) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  const hashed = hashPassword(password)

  // Try tenant admin first
  if (tenant.adminPhone && tenant.adminPassword) {
    if (tenant.adminPhone.trim() === phone && tenant.adminPassword === hashed) {
      const token = await createSession({
        role: "TENANT_ADMIN",
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      })
      const res = NextResponse.json({ ok: true, role: "TENANT_ADMIN" })
      res.cookies.set("lf_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return res
    }
  }

  // Try student login — allow any status except SUSPENDED
  const student = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      phone: phone,
      password: hashed,
      role: "STUDENT",
      status: { not: "SUSPENDED" },
    },
    select: { id: true, name: true },
  })

  if (!student) {
    return NextResponse.json({ error: "Teléfono o contraseña incorrectos" }, { status: 401 })
  }

  const token = await createSession({
    role: "STUDENT",
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    userId: student.id,
  })

  const res = NextResponse.json({ ok: true, role: "STUDENT", name: student.name })
  res.cookies.set("lf_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  return res
}
