"use client"

import { useState, useTransition, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { toggleRankingReaction, getRankingComments, addRankingComment } from "../actions"
import { motion, AnimatePresence } from "framer-motion"

/* ─── Types ──────────────────────────────────────────────── */
type Reactions = { counts: Record<string, number>; myReactions: string[] }
type Entry = { rank: number; userId: string; userName: string; xpTotal: number; reactions: Reactions; commentCount: number }
type Comment = { id: string; fromUserId: string; fromName: string; text: string; createdAt: Date }

type Props = {
  tenantSlug: string
  entries: Entry[]
  currentUserId: string
}

/* ─── Constants & Colors ─────────────────────────────────── */
const REACTION_TYPES = [
  { key: "fire",      emoji: "🔥", label: "Fuego" },
  { key: "love",      emoji: "❤️", label: "Love" },
  { key: "crown",     emoji: "👑", label: "Corona" },
  { key: "gem",       emoji: "💎", label: "Gema" },
  { key: "lightning", emoji: "⚡", label: "Rayo" },
  { key: "brain",     emoji: "🧠", label: "Genio" },
  { key: "like",      emoji: "👍", label: "Like" },
  { key: "bullseye",  emoji: "🎯", label: "Meta" },
] as const

const DUO = {
  green: "#58CC02",
  gold: "#FFC800",
  goldDark: "#E5A800",
  blue: "#1CB0F6",
  blueDark: "#1899D6",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  bg: "#f8fafc",
  card: "#FFFFFF",
  text: "#3C3C3C",
  textMuted: "#AFAFAF",
  border: "#E5E5E5",
  orange: "#FF9600"
}

const RANK_CONFIG: Record<number, { bg: string; border: string; text: string; label: string }> = {
  1: { bg: "rgba(255,200,0,0.15)", border: DUO.gold, text: DUO.goldDark, label: "🥇" },
  2: { bg: "rgba(192,192,192,0.15)", border: DUO.silver, text: "#808080", label: "🥈" },
  3: { bg: "rgba(205,127,50,0.15)", border: DUO.bronze, text: "#8B4513", label: "🥉" },
}

/* ─── SVG Icons ──────────────────────────────────────────── */
const IconHome = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M3 12L12 3l9 9" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconTrophy = ({ active, color }: { active?: boolean; color?: string }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M8 21h8M12 17v4" stroke={color || (active ? "#7c3aed" : "#94a3b8")} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 4h14v8a7 7 0 01-14 0V4z" fill={color || (active ? "#7c3aed" : "none")} fillOpacity="0.15"
      stroke={color || (active ? "#7c3aed" : "#94a3b8")} strokeWidth="2" />
    <path d="M5 7H2v3a3 3 0 003 3M19 7h3v3a3 3 0 01-3 3" stroke={color || (active ? "#7c3aed" : "#94a3b8")} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconShield = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z"
      fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 12l2 2 4-4" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconUser = ({ active }: { active: boolean }) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" fill={active ? "#7c3aed" : "none"} fillOpacity="0.15"
      stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const IconFlame = ({ size = 22, color = "#FF9600" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11zm0 14a2 2 0 01-2-2c0-1.8 2-5 2-5s2 3.2 2 5a2 2 0 01-2 2z" fill={color} />
  </svg>
)

const IconGem = ({ size = 16, color = "#A855F7" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill={color} />
    <path d="M12 21L8 9l4-6 4 6-4 12z" fill="#C084FC" opacity={0.5} />
  </svg>
)

const IconCrown = ({ size = 22, color = DUO.gold }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 8l4 10h12l4-10-5 4-5-6-5 6-5-4z" fill={color} />
    <path d="M6 18h12v2.5H6V18z" fill={color} opacity={0.8} />
    <circle cx={12} cy={8} r={1.5} fill="#FFFFFF" opacity={0.5} />
    <circle cx={7} cy={12} r={1} fill="#FFFFFF" opacity={0.3} />
    <circle cx={17} cy={12} r={1} fill="#FFFFFF" opacity={0.3} />
  </svg>
)

/* ─── Bottom Nav ─────────────────────────────────────────────── */
function BottomNav({ tenantSlug }: { tenantSlug: string }) {
  const pathname = usePathname()
  const tabs = [
    { label: "Inicio",   Icon: IconHome,   href: `/${tenantSlug}/home` },
    { label: "Ranking",  Icon: IconTrophy,  href: `/${tenantSlug}/ranking` },
    { label: "Perfil",   Icon: IconUser,    href: `/${tenantSlug}/profile` },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: "#ffffff", borderTop: "2px solid #f1f5f9", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              className="flex flex-col items-center gap-1 py-3 px-5">
              <tab.Icon active={active} />
              <span className="text-[10px] font-bold"
                style={{ color: active ? "#7c3aed" : "#94a3b8" }}>
                {tab.label}
              </span>
              {active && (
                <div className="w-5 h-0.5 rounded-full" style={{ background: "#7c3aed" }} />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────── */
export default function StudentRanking({ tenantSlug, entries: initialEntries, currentUserId }: Props) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries)
  const [isPending, startTransition] = useTransition()
  
  // Comments Modal State
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  // Sync initial
  useEffect(() => { setEntries(initialEntries) }, [initialEntries])

  // Toggle Reaction Optimistic Update
  const handleToggleReaction = (toUserId: string, type: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.userId !== toUserId) return entry
      
      const wasActive = entry.reactions.myReactions.includes(type)
      const newMyReactions = wasActive
        ? entry.reactions.myReactions.filter(r => r !== type)
        : [...entry.reactions.myReactions, type]
      
      const newCounts = { ...entry.reactions.counts }
      newCounts[type] = (newCounts[type] ?? 0) + (wasActive ? -1 : 1)
      if (newCounts[type] <= 0) delete newCounts[type]
      
      return { ...entry, reactions: { counts: newCounts, myReactions: newMyReactions } }
    }))

    startTransition(async () => {
      try {
        await toggleRankingReaction(tenantSlug, toUserId, type)
      } catch (e) {
        // En caso de error podríamos revertir el estado
      }
    })
  }

  // Open comments
  const handleOpenComments = async (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName })
    setLoadingComments(true)
    setComments([])
    try {
      const res = await getRankingComments(tenantSlug, userId)
      setComments(res)
    } catch (e) { }
    setLoadingComments(false)
  }

  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || submittingComment || !selectedUser) return
    setSubmittingComment(true)
    try {
      const newComment = await addRankingComment(tenantSlug, selectedUser.id, commentText)
      setComments(prev => [newComment, ...prev])
      setCommentText("")
      // Update count optimistically
      setEntries(prev => prev.map(e => e.userId === selectedUser.id ? { ...e, commentCount: e.commentCount + 1 } : e))
    } catch (e) {
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: DUO.bg }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-5 py-3" style={{ background: DUO.card, borderBottom: `3px solid ${DUO.border}` }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <IconTrophy active={false} color={DUO.gold} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DUO.text, lineHeight: 1.1 }}>Ranking</h1>
            <p style={{ fontSize: 12, fontWeight: 600, color: DUO.textMuted }}>Tabla de posiciones semanal</p>
          </div>
        </div>
      </div>

      <div className="pb-28 max-w-lg mx-auto p-4">
        {entries.length > 0 && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2" 
               style={{ background: "rgba(255,150,0,0.1)", borderColor: "rgba(255,150,0,0.2)" }}>
            <IconFlame size={20} />
            <span style={{ fontSize: 13, fontWeight: 700, color: DUO.orange }}>
              {entries.length} competidores activos
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {entries.map((item) => {
            const isMe = item.userId === currentUserId
            const isTop3 = item.rank <= 3
            const config = RANK_CONFIG[item.rank]

            return (
              <div key={item.userId} className="rounded-2xl p-3.5 border-2 relative"
                style={{
                  background: isTop3 ? config.bg : isMe ? "rgba(28,176,246,0.06)" : DUO.card,
                  borderColor: isTop3 ? config.border : isMe ? DUO.blue : DUO.border,
                  borderBottomWidth: "4px",
                  borderBottomColor: isTop3 ? `${config.border}40` : isMe ? `${DUO.blueDark}40` : "#D5D5D5"
                }}>
                
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ background: isTop3 ? config.border : "#F0F0F0" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: isTop3 ? "#fff" : DUO.textMuted }}>
                      {config?.label ?? item.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <div className="relative flex items-center justify-center w-11 h-11 rounded-full border-[3px]"
                    style={{
                      borderColor: isTop3 ? config.border : isMe ? DUO.blue : "#E5E5E5",
                      background: isMe ? DUO.blue : isTop3 ? config.border : "#F0F0F0"
                    }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: isMe || isTop3 ? "#fff" : "#777" }}>
                      {item.userName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </span>
                    {isTop3 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <IconCrown size={14} color={[DUO.gold, "#C0C0C0", "#CD7F32"][item.rank - 1]} />
                      </div>
                    )}
                  </div>

                  {/* Name & XP */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: isMe ? DUO.blue : DUO.text }}>
                      {item.userName} {isMe && "(tú)"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <IconGem size={12} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: DUO.textMuted }}>{item.xpTotal} XP</span>
                    </div>
                  </div>

                  {/* XP Badge */}
                  <div className="px-3 py-1.5 rounded-xl"
                    style={{ background: isTop3 ? config.border : isMe ? DUO.blue : "#F0F0F0" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: isTop3 || isMe ? "#fff" : DUO.textMuted }}>
                      {item.xpTotal}
                    </span>
                  </div>
                </div>

                {/* Reactions & Comments Row */}
                <ReactionBar 
                  reactions={item.reactions}
                  isMe={isMe}
                  commentCount={item.commentCount}
                  onToggle={(type) => handleToggleReaction(item.userId, type)}
                  onOpenComments={() => handleOpenComments(item.userId, item.userName)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav tenantSlug={tenantSlug} />

      {/* Comments Modal (Bottom Sheet style) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/40" 
            />
            
            {/* Sheet */}
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-[70vh] flex flex-col bg-white rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">Mensajes para {selectedUser.name}</h3>
                <button onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                  ✕
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4">
                {loadingComments ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-purple-600 rounded-full" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-slate-400 font-semibold mt-10">Se el primero en dejar un mensaje 💬</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-500">
                          {c.fromName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-sm border-2 border-slate-100 border-b-4 border-b-slate-200">
                        <p className="text-[13px] font-bold text-slate-800 mb-1">{c.fromName}</p>
                        <p className="text-sm text-slate-600 leading-snug">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t-2 border-slate-100 bg-white flex items-end gap-2">
                <textarea 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Escribe un mensaje animador..."
                  className="flex-1 bg-slate-100 rounded-xl border-2 border-slate-200 px-4 py-3 min-h-[44px] max-h-[100px] text-sm text-slate-800 focus:outline-none focus:border-purple-500 resize-none"
                  rows={1}
                />
                <button 
                  disabled={!commentText.trim() || submittingComment}
                  onClick={handleSubmitComment}
                  className="w-11 h-11 shrink-0 rounded-full bg-blue-500 flex items-center justify-center border-b-4 border-b-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submittingComment ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full" />
                  ) : (
                    <span className="text-white font-black text-xl leading-none -mt-1">↑</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Reaction Bar Subcomponent ──────────────────────────── */
function ReactionBar({ 
  reactions, isMe, commentCount, onToggle, onOpenComments 
}: { 
  reactions: Reactions; isMe: boolean; commentCount: number; onToggle: (t: string) => void; onOpenComments: () => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const totalCount = Object.values(reactions.counts).reduce((a, b) => a + b, 0)
  const receivedTypes = REACTION_TYPES.filter(r => (reactions.counts[r.key] ?? 0) > 0)

  if (!expanded) {
    return (
      <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap">
        {receivedTypes.map(r => {
          const isActive = reactions.myReactions.includes(r.key)
          return (
            <div key={r.key} className="flex items-center gap-1 rounded-full px-2 py-1 border-[1.5px]"
              style={{
                background: isActive ? "rgba(28,176,246,0.08)" : "#F5F5F5",
                borderColor: isActive ? DUO.blue : "#E8E8E8"
              }}>
              <span style={{ fontSize: 13 }}>{r.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? DUO.blue : DUO.textMuted }}>
                {reactions.counts[r.key]}
              </span>
            </div>
          )
        })}
        
        <div className="flex-1" />

        <button onClick={onOpenComments}
          className="rounded-full px-2.5 py-1 border-[1.5px] bg-[#F5F5F5] hover:opacity-80 transition-opacity active:scale-95"
          style={{ borderColor: "#E8E8E8" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DUO.textMuted }}>
            💬 {commentCount > 0 ? commentCount : "Dejar un mensaje"}
          </span>
        </button>

        {!isMe && (
          <button onClick={() => setExpanded(true)}
            className="rounded-full px-2.5 py-1 border-[1.5px] border-dashed bg-[#F5F5F5] hover:opacity-80 transition-opacity active:scale-95"
            style={{ borderColor: "#E8E8E8" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DUO.textMuted }}>
              {totalCount > 0 ? "+" : "😀+"}
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center mt-2.5 pt-2.5 border-t border-slate-100 w-full overflow-x-auto pb-1 hide-scrollbar">
      <div className="flex items-center gap-1">
        {REACTION_TYPES.map(r => {
          const isActive = reactions.myReactions.includes(r.key)
          const count = reactions.counts[r.key] ?? 0
          return (
            <button key={r.key}
              onClick={() => { onToggle(r.key); setExpanded(false); }}
              className="flex flex-col items-center justify-center min-w-[36px] px-1.5 py-1 rounded-xl border-[1.5px] hover:scale-110 active:scale-95 transition-all"
              style={{
                background: isActive ? "rgba(28,176,246,0.1)" : "transparent",
                borderColor: isActive ? DUO.blue : "transparent"
              }}>
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, color: isActive ? DUO.blue : DUO.textMuted }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <button onClick={() => setExpanded(false)}
        className="ml-2 shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] hover:bg-slate-200 transition-colors">
        ✕
      </button>
    </div>
  )
}
