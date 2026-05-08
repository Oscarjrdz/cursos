import type { NextRequest } from "next/server"
import { verifySession, type SessionPayload } from "./session"

export async function getMobileSession(req: NextRequest): Promise<SessionPayload | null> {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  return verifySession(auth.slice(7))
}
