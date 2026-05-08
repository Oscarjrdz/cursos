import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function POST(req: NextRequest) {
  const session = await getMobileSession(req)
  if (!session?.userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "No se pudo leer el formulario" }, { status: 400 })
  }

  const file = form.get("avatar")
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 })
  }

  // Derive extension — RN may send "avatar.jpg" or just "image.jpg"
  const fileName = (file as File).name ?? "avatar.jpg"
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg"
  const allowedExts = ["jpg", "jpeg", "png", "webp"]
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: "Tipo de imagen no permitido" }, { status: 400 })
  }

  const blob = await put(`avatars/${session.userId}.${ext}`, file, {
    access: "public",
  })

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: blob.url },
  })

  return NextResponse.json({ avatarUrl: blob.url })
}

