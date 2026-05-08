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

  const student = await prisma.user.findFirst({
    where: { phone, role: "STUDENT", status: { not: "SUSPENDED" }, password: hashed },
    select: { id: true, name: true, tenantId: true },
  })

  if (!student)
    return NextResponse.json({ error: "Teléfono o contraseña incorrectos" }, { status: 401 })

  if (!student.tenantId)
    return NextResponse.json({ error: "Alumno sin empresa asignada" }, { status: 400 })

  const tenant = await prisma.tenant.findUnique({
    where: { id: student.tenantId },
    select: { id: true, slug: true },
  })

  if (!tenant)
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })

  const token = await createSession({
    role: "STUDENT",
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    userId: student.id,
  })

  return NextResponse.json({ token, name: student.name, tenantSlug: tenant.slug })
}
