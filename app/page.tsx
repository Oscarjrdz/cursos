import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #eef2ff 50%, #f1f5f9 100%)" }}>
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <img src="https://cdn-icons-png.flaticon.com/128/11051/11051168.png" width={72} height={72} alt="Candidatic Knowledge" />
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Candidatic <span style={{ color: "#7c3aed" }}>Knowledge</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Plataforma de aprendizaje</p>
        </div>
        <Link href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#7c3aed" }}>
          Acceso Super Admin →
        </Link>
      </div>
    </div>
  )
}
