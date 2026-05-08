import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMobileSession } from "@/lib/mobile-auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getMobileSession(req)
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const contentType = req.headers.get("content-type") ?? ""

    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Se espera JSON con base64" }, { status: 400 })
    }

    const body = await req.json()
    const { base64, mimeType = "image/jpeg" } = body as { base64?: string; mimeType?: string }
    if (!base64) {
      return NextResponse.json({ error: "No se recibió imagen (base64)" }, { status: 400 })
    }

    // Store as data URI — no external storage needed
    const dataUri = `data:${mimeType};base64,${base64}`

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: dataUri },
    })

    return NextResponse.json({ avatarUrl: dataUri })
  } catch (e) {
    console.error("Avatar upload error:", e)
    return NextResponse.json({
      error: "Error interno al subir la imagen",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
