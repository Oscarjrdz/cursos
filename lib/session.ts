import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export type SessionPayload = {
  role: "SUPER_ADMIN" | "TENANT_ADMIN"
  tenantId?: string
  tenantSlug?: string
}

const COOKIE_NAME = "lf_session"
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "learnflow-dev-secret-change-in-production"
)

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export async function setSessionCookie(res: NextResponse, payload: SessionPayload) {
  const token = await createSession(payload)
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export function deleteSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
}

export function getSessionFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value
}

