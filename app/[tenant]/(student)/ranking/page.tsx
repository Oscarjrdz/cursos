"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useParams } from "next/navigation"

function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()
  const tabs = [
    { label: "Inicio",  icon: "🏠", href: `/${tenantSlug}/home` },
    { label: "Ranking", icon: "🏆", href: `/${tenantSlug}/ranking` },
    { label: "Logros",  icon: "🎖", href: `/${tenantSlug}/achievements` },
    { label: "Perfil",  icon: "👤", href: `/${tenantSlug}/profile` },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-0.5 py-3 px-5 transition-all"
              style={{ color: active ? "#7c3aed" : "#94a3b8" }}>
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
              {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#7c3aed" }} />}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function RankingPage() {
  const params = useParams()
  const slug = params.tenant as string

  return (
    <div className="min-h-screen pb-28" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3"
        style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png" width={28} height={28} alt="" />
          <span className="text-xs font-bold" style={{ color: "#0f172a" }}>Candidatic </span>
          <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>Knowledge</span>
        </div>
      </div>

      <div className="px-4 pt-5 max-w-lg mx-auto">
        <h1 className="text-xl font-black mb-1" style={{ color: "#0f172a" }}>🏆 Ranking</h1>
        <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>Posición semanal del equipo</p>

        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="px-4 py-3 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>
              El ranking se actualiza en tiempo real
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-5xl">🏆</span>
            <p className="font-bold text-sm" style={{ color: "#0f172a" }}>Ranking próximamente</p>
            <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
              Completa lecciones para aparecer aquí
            </p>
          </div>
        </div>
      </div>

      <BottomNav tenantSlug={slug} />
    </div>
  )
}
