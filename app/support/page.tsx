"use client"

import { useState } from "react"

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? "ok" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F7F7F7",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "0 0 40px",
    }}>
      {/* Header */}
      <div style={{
        background: "#7c3aed",
        padding: "48px 24px 32px",
        textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 28,
        }}>
          🎧
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>
          Support
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          We&apos;re here to help. Send us a message and we&apos;ll respond within 24 hours.
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        {status === "ok" ? (
          <div style={{
            background: "#fff", borderRadius: 22, padding: "40px 24px",
            textAlign: "center", border: "2px solid #e5e7eb",
            borderBottom: "5px solid #D5D5D5",
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>
              Message sent!
            </h2>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              We&apos;ll get back to you at <strong>{form.email}</strong> within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: "#fff", borderRadius: 22, padding: "20px 16px",
              border: "2px solid #e5e7eb", borderBottom: "5px solid #D5D5D5",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {[
                { key: "name", label: "Full name", placeholder: "John Doe", type: "text" },
                { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
                { key: "subject", label: "Subject", placeholder: "e.g. Can't log in to the app", type: "text" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    required
                    type={type}
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb",
                      borderRadius: 14, fontSize: 15, color: "#0f172a", background: "#F7F7F7",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{
                    width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb",
                    borderRadius: 14, fontSize: 15, color: "#0f172a", background: "#F7F7F7",
                    outline: "none", boxSizing: "border-box", resize: "vertical",
                  }}
                />
              </div>

              {status === "error" && (
                <p style={{
                  color: "#dc2626", fontSize: 13, margin: 0,
                  background: "#fef2f2", padding: "10px 14px", borderRadius: 10,
                }}>
                  Something went wrong. Try again or email soporte@candidatic.com
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: "#7c3aed", color: "#fff", border: "none",
                  borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 900,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                  borderBottom: "4px solid #5b21b6", width: "100%",
                }}
              >
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        )}

        {/* Contact info */}
        <div style={{
          background: "#fff", borderRadius: 18, padding: "16px",
          border: "2px solid #e5e7eb", borderBottom: "4px solid #D5D5D5",
          marginTop: 16, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: "rgba(124,58,237,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>
            ✉️
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#64748b" }}>Direct email</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>soporte@candidatic.com</p>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
          © {new Date().getFullYear()} Candidatic. All rights reserved.
        </p>
      </div>
    </div>
  )
}
