import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json()

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
  }

  await resend.emails.send({
    from: "Candidatic Support <onboarding@resend.dev>",
    to: "oscarjrdz@gmail.com",
    replyTo: email,
    subject: `[Support] ${subject}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#7c3aed;margin:0 0 16px">Nueva solicitud de soporte</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#6b7280;width:90px">Nombre</td><td style="padding:8px 0;font-weight:600;color:#111827">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600;color:#111827">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Asunto</td><td style="padding:8px 0;font-weight:600;color:#111827">${subject}</td></tr>
        </table>
        <hr style="margin:16px 0;border:none;border-top:1px solid #f3f4f6"/>
        <p style="font-size:14px;color:#374151;white-space:pre-wrap">${message}</p>
        <hr style="margin:16px 0;border:none;border-top:1px solid #f3f4f6"/>
        <p style="font-size:12px;color:#9ca3af;margin:0">Enviado desde knowledge.candidatic.com/support</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
