import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect } from "react-native-svg"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type Reactions = { counts: Record<string, number>; myReactions: string[] }
type Entry = { rank: number; userId: string; userName: string; xpTotal: number; reactions: Reactions; commentCount: number }
type RankingData = { entries: Entry[]; currentUserId: string }
type Comment = { id: string; fromUserId: string; fromName: string; text: string; createdAt: string }

/* ─── Reaction config ────────────────────────────────────── */
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

/* ─── Duolingo Colors ────────────────────────────────────── */
const DUO = {
  green: "#58CC02",
  greenDark: "#46A302",
  gold: "#FFC800",
  goldDark: "#E5A800",
  blue: "#1CB0F6",
  blueDark: "#1899D6",
  red: "#FF4B4B",
  purple: "#A855F7",
  orange: "#FF9600",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  bg: "#F7F7F7",
  card: "#FFFFFF",
  text: "#3C3C3C",
  textMuted: "#AFAFAF",
  border: "#E5E5E5",
}

/* ─── SVG Icons ──────────────────────────────────────────── */
const IconTrophy = ({ size = 28, color = DUO.gold }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12v9a6 6 0 01-12 0V3z" fill={color} />
    <Path d="M8 5h2v6a4 4 0 01-2-.5V5z" fill="#FFFFFF" opacity={0.3} />
    <Path d="M6 5H4a2 2 0 00-2 2v1a3 3 0 003 3h1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M18 5h2a2 2 0 012 2v1a3 3 0 01-3 3h-1" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Rect x={10.5} y={16} width={3} height={3} rx={0.5} fill={color} opacity={0.7} />
    <Rect x={7} y={19} width={10} height={2.5} rx={1.2} fill={color} opacity={0.7} />
  </Svg>
)

const IconFlame = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11z" fill="#FF9600" />
    <Path d="M12 10s-2 3.2-2 5a2 2 0 004 0c0-1.8-2-5-2-5z" fill="#FFD700" />
  </Svg>
)

const IconGem = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="#A855F7" />
    <Path d="M12 21L8 9l4-6 4 6-4 12z" fill="#C084FC" opacity={0.5} />
  </Svg>
)

const IconCrown = ({ size = 22, color = DUO.gold }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 8l4 10h12l4-10-5 4-5-6-5 6-5-4z" fill={color} />
    <Path d="M6 18h12v2.5H6V18z" fill={color} opacity={0.8} />
    <Circle cx={12} cy={8} r={1.5} fill="#FFFFFF" opacity={0.5} />
    <Circle cx={7} cy={12} r={1} fill="#FFFFFF" opacity={0.3} />
    <Circle cx={17} cy={12} r={1} fill="#FFFFFF" opacity={0.3} />
  </Svg>
)

const IconStar = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={DUO.gold} />
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87" fill="#FFFFFF" opacity={0.2} />
  </Svg>
)

/* ─── Medal colors per rank ──────────────────────────────── */
const RANK_CONFIG: Record<number, { bg: string; border: string; text: string; label: string }> = {
  1: { bg: "rgba(255,200,0,0.15)", border: DUO.gold, text: DUO.goldDark, label: "🥇" },
  2: { bg: "rgba(192,192,192,0.15)", border: DUO.silver, text: "#808080", label: "🥈" },
  3: { bg: "rgba(205,127,50,0.15)", border: DUO.bronze, text: "#8B4513", label: "🥉" },
}

/* ─── Avatar Component ───────────────────────────────────── */
function Avatar({ name, rank, isMe }: { name: string; rank: number; isMe: boolean }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  const colors = rank <= 3
    ? [DUO.gold, DUO.silver, DUO.bronze][rank - 1]
    : isMe ? DUO.blue : "#E5E5E5"
  return (
    <View style={[styles.avatar, { borderColor: colors, backgroundColor: isMe ? DUO.blue : rank <= 3 ? colors : "#F0F0F0" }]}>
      <Text style={[styles.avatarText, { color: isMe || rank <= 3 ? "#FFFFFF" : "#777" }]}>{initials}</Text>
      {rank <= 3 && (
        <View style={styles.crownWrap}>
          <IconCrown size={14} color={[DUO.gold, "#C0C0C0", "#CD7F32"][rank - 1]} />
        </View>
      )}
    </View>
  )
}

/* ─── Reaction Bar Component ─────────────────────────────── */
function ReactionBar({
  reactions,
  isMe,
  onToggle,
  disabled,
  commentCount,
  onOpenComments
}: {
  reactions: Reactions
  isMe: boolean
  onToggle: (type: string) => void
  disabled: boolean
  commentCount: number
  onOpenComments: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const totalCount = Object.values(reactions.counts).reduce((a, b) => a + b, 0)

  // Show summary (received reactions) + expand button
  if (!expanded) {
    const receivedTypes = REACTION_TYPES.filter(r => (reactions.counts[r.key] ?? 0) > 0)
    return (
      <View style={styles.reactionRow}>
        {/* Show received reactions summary */}
        {receivedTypes.length > 0 && (
          <View style={styles.reactionSummary}>
            {receivedTypes.map(r => (
              <View key={r.key} style={[
                styles.reactionChip,
                reactions.myReactions.includes(r.key) && styles.reactionChipActive,
              ]}>
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                <Text style={[
                  styles.reactionCount,
                  reactions.myReactions.includes(r.key) && styles.reactionCountActive,
                ]}>{reactions.counts[r.key]}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flex: 1 }} />

        {/* Comments Button */}
        <Pressable
          onPress={onOpenComments}
          style={({ pressed }) => [styles.commentBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.commentBtnText}>💬 {commentCount > 0 ? commentCount : "Dejar un mensaje"}</Text>
        </Pressable>

        {/* Add reaction button (not for self) */}
        {!isMe && (
          <Pressable
            onPress={() => setExpanded(true)}
            style={({ pressed }) => [styles.addReactionBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.addReactionText}>
              {totalCount > 0 ? "+" : "😀+"}
            </Text>
          </Pressable>
        )}
      </View>
    )
  }

  // Expanded: show all reaction options
  return (
    <View style={styles.reactionExpandedWrap}>
      <View style={styles.reactionExpandedRow}>
        {REACTION_TYPES.map(r => {
          const isActive = reactions.myReactions.includes(r.key)
          const count = reactions.counts[r.key] ?? 0
          return (
            <Pressable
              key={r.key}
              onPress={() => { onToggle(r.key); setExpanded(false) }}
              disabled={disabled}
              style={({ pressed }) => [
                styles.reactionOption,
                isActive && styles.reactionOptionActive,
                pressed && { transform: [{ scale: 1.2 }] },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
              {count > 0 && (
                <Text style={[styles.reactionOptionCount, isActive && { color: DUO.blue }]}>
                  {count}
                </Text>
              )}
            </Pressable>
          )
        })}
      </View>
      <Pressable onPress={() => setExpanded(false)} style={styles.reactionCloseBtn}>
        <Text style={styles.reactionCloseText}>✕</Text>
      </Pressable>
    </View>
  )
}

/* ─── Rank Row ───────────────────────────────────────────── */
function RankRow({
  item,
  isMe,
  onToggleReaction,
  reactionLoading,
  onOpenComments
}: {
  item: Entry
  isMe: boolean
  onToggleReaction: (toUserId: string, type: string) => void
  reactionLoading: boolean
  onOpenComments: (userId: string, userName: string) => void
}) {
  const config = RANK_CONFIG[item.rank]
  const isTop3 = item.rank <= 3
  return (
    <View style={[
      styles.row,
      isTop3 && { borderColor: config?.border, backgroundColor: config?.bg, borderBottomWidth: 4, borderBottomColor: config?.border + "40" },
      isMe && !isTop3 && styles.rowMe,
    ]}>
      {/* Top section: rank + avatar + name + xp */}
      <View style={styles.rowTop}>
        {/* Rank number */}
        <View style={[styles.rankBadge, isTop3 && { backgroundColor: config?.border }]}>
          <Text style={[styles.rankText, isTop3 && { color: "#FFFFFF" }]}>
            {config?.label ?? item.rank}
          </Text>
        </View>

        {/* Avatar */}
        <Avatar name={item.userName} rank={item.rank} isMe={isMe} />

        {/* Name & XP */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, isMe && { color: DUO.blue, fontWeight: "900" }]} numberOfLines={1}>
            {item.userName}
            {isMe ? "  (tú)" : ""}
          </Text>
          <View style={styles.xpRow}>
            <IconGem size={12} />
            <Text style={styles.xpLabel}>{item.xpTotal} XP</Text>
          </View>
        </View>

        {/* XP Badge */}
        <View style={[
          styles.xpBadge,
          isTop3 && { backgroundColor: config?.border },
          isMe && !isTop3 && { backgroundColor: DUO.blue },
        ]}>
          <Text style={[
            styles.xpNum,
            (isTop3 || isMe) && { color: "#FFFFFF" },
          ]}>{item.xpTotal}</Text>
        </View>
      </View>

      {/* Reactions section */}
      <ReactionBar
        reactions={item.reactions}
        isMe={isMe}
        onToggle={(type) => onToggleReaction(item.userId, type)}
        disabled={reactionLoading}
        commentCount={item.commentCount}
        onOpenComments={() => onOpenComments(item.userId, item.userName)}
      />
    </View>
  )
}

/* ─── Empty State ────────────────────────────────────────── */
function EmptyRanking() {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyCard}>
        <IconTrophy size={56} color={DUO.gold} />
        <Text style={styles.emptyTitle}>¡El ranking viene pronto!</Text>
        <Text style={styles.emptySub}>Completa lecciones para ganar XP y aparecer aquí</Text>
        <View style={styles.emptyStars}>
          <IconStar size={20} />
          <IconStar size={26} />
          <IconStar size={20} />
        </View>
      </View>
    </View>
  )
}

/* ─── Comments Modal ─────────────────────────────────────── */
function CommentsModal({
  visible,
  onClose,
  userId,
  userName,
  token,
  onCommentAdded
}: {
  visible: boolean
  onClose: () => void
  userId: string
  userName: string
  token: string | null
  onCommentAdded: () => void
}) {
  const insets = useSafeAreaInsets()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!visible || !userId) return
    setLoading(true)
    apiRequest<{ comments: Comment[] }>(`/api/mobile/comments?toUserId=${userId}`, { token })
      .then(res => setComments(res.comments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [visible, userId, token])

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await apiRequest<{ comment: Comment }>("/api/mobile/comments", {
        method: "POST",
        token,
        body: { toUserId: userId, text }
      })
      setComments(prev => [res.comment, ...prev])
      setText("")
      onCommentAdded()
    } catch (e) {
      // Handle error silently
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalContent, { paddingBottom: insets.bottom || 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mensajes para {userName}</Text>
            <Pressable onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator color={DUO.blue} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              inverted
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <Text style={styles.emptyCommentsText}>Se el primero en dejar un mensaje 💬</Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {item.fromName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{item.fromName}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />
          )}

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.commentInputWrap}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe un mensaje animador..."
                placeholderTextColor={DUO.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                maxLength={200}
              />
              <Pressable 
                onPress={handleSubmit} 
                disabled={!text.trim() || submitting}
                style={[styles.commentSubmitBtn, (!text.trim() || submitting) && { opacity: 0.5 }]}
              >
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.commentSubmitText}>↑</Text>}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  )
}

/* ─── Main Screen ────────────────────────────────────────── */
export default function RankingScreen() {
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reactionLoading, setReactionLoading] = useState(false)

  // Modal State
  const [commentsModalVisible, setCommentsModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<RankingData>("/api/mobile/ranking", { token })
      setData(d)
    } catch {
      // silent
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  const handleToggleReaction = useCallback(async (toUserId: string, type: string) => {
    if (!data) return
    setReactionLoading(true)

    // Optimistic update
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        entries: prev.entries.map(entry => {
          if (entry.userId !== toUserId) return entry
          const wasActive = entry.reactions.myReactions.includes(type)
          const newMyReactions = wasActive
            ? entry.reactions.myReactions.filter(r => r !== type)
            : [...entry.reactions.myReactions, type]
          const newCounts = { ...entry.reactions.counts }
          newCounts[type] = (newCounts[type] ?? 0) + (wasActive ? -1 : 1)
          if (newCounts[type] <= 0) delete newCounts[type]
          return { ...entry, reactions: { counts: newCounts, myReactions: newMyReactions } }
        }),
      }
    })

    try {
      await apiRequest("/api/mobile/reactions", {
        method: "POST",
        token,
        body: { toUserId, type },
      })
    } catch {
      // Revert on error
      fetchData()
    } finally {
      setReactionLoading(false)
    }
  }, [data, token, fetchData])

  const handleOpenComments = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName })
    setCommentsModalVisible(true)
  }

  const handleCommentAdded = () => {
    if (!selectedUser) return
    // Optimistically update comment count in list
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        entries: prev.entries.map(entry => {
          if (entry.userId === selectedUser.id) {
            return { ...entry, commentCount: (entry.commentCount || 0) + 1 }
          }
          return entry
        })
      }
    })
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconTrophy size={30} color={DUO.gold} />
          <View>
            <Text style={styles.title}>Ranking</Text>
            <Text style={styles.subtitle}>Tabla de posiciones semanal</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DUO.gold} />
        </View>
      ) : (
        <FlatList
          data={data?.entries ?? []}
          keyExtractor={(item) => item.userId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DUO.gold} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyRanking />}
          ListHeaderComponent={
            (data?.entries?.length ?? 0) > 0 ? (
              <View style={styles.headerBanner}>
                <View style={styles.bannerInner}>
                  <IconFlame size={20} />
                  <Text style={styles.bannerText}>
                    {data!.entries.length} competidores activos
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <RankRow
              item={item}
              isMe={item.userId === data?.currentUserId}
              onToggleReaction={handleToggleReaction}
              reactionLoading={reactionLoading}
              onOpenComments={handleOpenComments}
            />
          )}
        />
      )}

      {selectedUser && (
        <CommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          token={token}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },

  /* Header */
  header: {
    backgroundColor: DUO.card,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: DUO.border,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "900", color: DUO.text },
  subtitle: { fontSize: 12, color: DUO.textMuted, fontWeight: "600", marginTop: 1 },

  /* Header banner */
  headerBanner: { marginBottom: 14 },
  bannerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,150,0,0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "rgba(255,150,0,0.2)",
  },
  bannerText: { fontSize: 13, fontWeight: "700", color: DUO.orange },

  /* Row */
  row: {
    backgroundColor: DUO.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5D5D5",
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowMe: {
    borderColor: DUO.blue,
    backgroundColor: "rgba(28,176,246,0.06)",
    borderBottomColor: DUO.blueDark + "40",
  },

  /* Rank */
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { fontSize: 14, fontWeight: "900", color: DUO.textMuted },

  /* Avatar */
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: { fontSize: 15, fontWeight: "900" },
  crownWrap: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
  },

  /* Name */
  name: { fontSize: 14, fontWeight: "700", color: DUO.text },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  xpLabel: { fontSize: 11, color: DUO.textMuted, fontWeight: "600" },

  /* XP Badge */
  xpBadge: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  xpNum: { fontSize: 14, fontWeight: "900", color: DUO.textMuted },

  /* Reactions */
  reactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexWrap: "wrap",
  },
  reactionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  reactionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
  },
  reactionChipActive: {
    backgroundColor: "rgba(28,176,246,0.08)",
    borderColor: DUO.blue,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 12, fontWeight: "800", color: DUO.textMuted },
  reactionCountActive: { color: DUO.blue },
  
  commentBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
  },
  commentBtnText: { fontSize: 13, fontWeight: "700", color: DUO.textMuted },

  addReactionBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderStyle: "dashed",
  },
  addReactionText: { fontSize: 13, fontWeight: "700", color: DUO.textMuted },

  reactionExpandedWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
  },
  reactionExpandedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    flexWrap: "wrap",
  },
  reactionOption: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    minWidth: 36,
  },
  reactionOptionActive: {
    backgroundColor: "rgba(28,176,246,0.1)",
    borderColor: DUO.blue,
    borderRadius: 12,
  },
  reactionOptionCount: {
    fontSize: 10,
    fontWeight: "800",
    color: DUO.textMuted,
    marginTop: 1,
  },
  reactionCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  reactionCloseText: { fontSize: 12, fontWeight: "900", color: DUO.textMuted },

  /* Empty */
  emptyWrap: { paddingTop: 40, alignItems: "center" },
  emptyCard: {
    backgroundColor: DUO.card,
    borderRadius: 22,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 5,
    borderBottomColor: "#D5D5D5",
    width: "100%",
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: DUO.text, marginTop: 16 },
  emptySub: { fontSize: 13, color: DUO.textMuted, fontWeight: "600", marginTop: 6, textAlign: "center" },
  emptyStars: { flexDirection: "row", gap: 6, marginTop: 16, alignItems: "center" },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: DUO.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: DUO.border,
    backgroundColor: DUO.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DUO.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "900",
    color: DUO.textMuted,
  },
  modalLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsList: {
    padding: 16,
    gap: 16,
  },
  emptyCommentsText: {
    textAlign: "center",
    color: DUO.textMuted,
    fontWeight: "600",
    marginTop: 40,
    fontSize: 15,
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#666",
  },
  commentBubble: {
    flex: 1,
    backgroundColor: DUO.card,
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5D5D5",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "800",
    color: DUO.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  commentInputWrap: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: DUO.card,
    borderTopWidth: 2,
    borderTopColor: DUO.border,
    alignItems: "flex-end",
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: DUO.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 15,
    color: DUO.text,
  },
  commentSubmitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DUO.blue,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: DUO.blueDark,
  },
  commentSubmitText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
})
