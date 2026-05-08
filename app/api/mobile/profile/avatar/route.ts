import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("avatar") as File | null
  if (!file) return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const blob = await put(`avatars/${session.userId}.${ext}`, file, {
    access: "public",
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
  })

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: blob.url },
  })

  return NextResponse.json({ avatarUrl: blob.url })
}
