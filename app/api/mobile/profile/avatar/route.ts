import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getMobileSession(req)
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") ?? ""

    // ── Strategy 1: JSON with base64 ──────────────────────────
    if (contentType.includes("application/json")) {
      const body = await req.json()
      const { base64, mimeType = "image/jpeg" } = body as { base64?: string; mimeType?: string }
      if (!base64) {
        return NextResponse.json({ error: "No se recibió imagen (base64)" }, { status: 400 })
      }

      const buffer = Buffer.from(base64, "base64")
      const extMap: Record<string, string> = {
        "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
      }
      const ext = extMap[mimeType] ?? "jpg"

      const blob = await put(`avatars/${session.userId}.${ext}`, buffer, {
        access: "public",
        contentType: mimeType,
      })

      await prisma.user.update({
        where: { id: session.userId },
        data: { avatarUrl: blob.url },
      })

      return NextResponse.json({ avatarUrl: blob.url })
    }

    // ── Strategy 2: multipart/form-data ──────────────────────
    let form: FormData
    try {
      form = await req.formData()
    } catch (e) {
      return NextResponse.json({
        error: "No se pudo leer el formulario",
        detail: e instanceof Error ? e.message : String(e),
      }, { status: 400 })
    }

    const file = form.get("avatar")
    if (!file || !(file instanceof Blob)) {
      const keys = [...form.keys()]
      return NextResponse.json({
        error: "No se recibió imagen",
        detail: `Form keys: ${keys.join(", ")}`,
      }, { status: 400 })
    }

    const fileName = (file as File).name ?? "avatar.jpg"
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg"

    const blob = await put(`avatars/${session.userId}.${ext}`, file, {
      access: "public",
    })

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: blob.url },
    })

    return NextResponse.json({ avatarUrl: blob.url })
  } catch (e) {
    console.error("Avatar upload error:", e)
    return NextResponse.json({
      error: "Error interno al subir la imagen",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
