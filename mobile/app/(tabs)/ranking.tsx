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
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type Entry = { rank: number; userId: string; userName: string; xpTotal: number }
type RankingData = { entries: Entry[]; currentUserId: string }

const MEDALS = ["🥇", "🥈", "🥉"]

function Avatar({ name, highlight }: { name: string; highlight: boolean }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
  return (
    <View style={[
      styles.avatar,
      highlight && { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
    ]}>
      <Text style={[styles.avatarText, highlight && { color: "white" }]}>{initials}</Text>
    </View>
  )
}

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
        <Text style={styles.title}>🏆 Ranking</Text>
        <Text style={styles.subtitle}>Posición del equipo</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={data?.entries ?? []}
          keyExtractor={(item) => item.userId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏆</Text>
              <Text style={styles.emptyTitle}>Ranking próximamente</Text>
              <Text style={styles.emptySub}>Completa lecciones para aparecer aquí</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.userId === data?.currentUserId
            const medal = MEDALS[item.rank - 1]
            return (
              <View style={[styles.row, isMe && styles.rowHighlight]}>
                <Text style={styles.rank}>{medal ?? `#${item.rank}`}</Text>
                <Avatar name={item.userName} highlight={isMe} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, isMe && { color: "#7c3aed" }]} numberOfLines={1}>
                    {item.userName}
                    {isMe ? "  (tú)" : ""}
                  </Text>
                  <Text style={styles.xpLabel}>{item.xpTotal} XP</Text>
                </View>
                <View style={[styles.xpBadge, isMe && { backgroundColor: "#7c3aed" }]}>
                  <Text style={[styles.xpNum, isMe && { color: "white" }]}>{item.xpTotal}</Text>
                </View>
              </View>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#f1f5f9",
  },
  rowHighlight: {
    borderColor: "#ddd6fe",
    backgroundColor: "#faf5ff",
  },
  rank: { fontSize: 22, width: 36, textAlign: "center" },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#f1f5f9",
    borderWidth: 2, borderColor: "#e2e8f0",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800", color: "#475569" },
  name: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  xpLabel: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  xpBadge: {
    backgroundColor: "#f3f0ff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpNum: { fontSize: 13, fontWeight: "800", color: "#7c3aed" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  emptySub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
})
