import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const tenant = await prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { base64, mimeType = "image/jpeg" } = body as { base64?: string; mimeType?: string }

    if (!base64) {
      return NextResponse.json({ error: "No se recibió imagen (base64)" }, { status: 400 })
    }

    // Store as data URI — same approach as avatar upload
    const dataUri = `data:${mimeType};base64,${base64}`

    await prisma.tenant.update({
      where: { slug },
      data: { logoUrl: dataUri },
    })

    return NextResponse.json({ logoUrl: dataUri })
  } catch (e) {
    console.error("Logo upload error:", e)
    return NextResponse.json({
      error: "Error interno al subir el logo",
      detail: e instanceof Error ? e.message : String(e),
    }, { status: 500 })
  }
}
