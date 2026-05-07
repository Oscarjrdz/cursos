import { NextRequest, NextResponse } from "next/server"
import { createSession, hashPassword } from "@/lib/session"

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE ?? "8116038195"
const SUPER_ADMIN_PASSWORD_HASH = hashPassword(process.env.SUPER_ADMIN_PASSWORD ?? "1983")

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json()

  if (phone !== SUPER_ADMIN_PHONE || hashPassword(password) !== SUPER_ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Teléfono o contraseña incorrectos" }, { status: 401 })
  }

  const token = await createSession({ role: "SUPER_ADMIN" })
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
