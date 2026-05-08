import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path, Circle, Rect } from "react-native-svg"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type Entry = { rank: number; userId: string; userName: string; xpTotal: number }
type RankingData = { entries: Entry[]; currentUserId: string }

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

/* ─── Rank Row ───────────────────────────────────────────── */
function RankRow({ item, isMe }: { item: Entry; isMe: boolean }) {
  const config = RANK_CONFIG[item.rank]
  const isTop3 = item.rank <= 3
  return (
    <View style={[
      styles.row,
      isTop3 && { borderColor: config?.border, backgroundColor: config?.bg, borderBottomWidth: 4, borderBottomColor: config?.border + "40" },
      isMe && !isTop3 && styles.rowMe,
    ]}>
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

/* ─── Main Screen ────────────────────────────────────────── */
export default function RankingScreen() {
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
            <RankRow item={item} isMe={item.userId === data?.currentUserId} />
          )}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: DUO.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5D5D5",
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
})
