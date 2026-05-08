import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

type ProfileData = {
  name: string
  email: string
  xpTotal: number
  progressPct: number
  streak: { currentDays: number; longestDays: number }
  completedLessons: number
  achievements: { title: string; description: string; earnedAt: string }[]
}

export default function ProfileScreen() {
  const router = useRouter()
  const { token, user, logout } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<ProfileData>("/api/mobile/profile", { token })
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

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/login")
        },
      },
    ])
  }

  const name = data?.name ?? user?.name ?? ""
  const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.nameText}>{name}</Text>
            {data?.email ? <Text style={styles.emailText}>{data.email}</Text> : null}
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>💎</Text>
              <Text style={styles.statValue}>{data?.xpTotal ?? 0}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{data?.streak.currentDays ?? 0}</Text>
              <Text style={styles.statLabel}>Racha actual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>{data?.completedLessons ?? 0}</Text>
              <Text style={styles.statLabel}>Lecciones</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={styles.statValue}>{data?.streak.longestDays ?? 0}</Text>
              <Text style={styles.statLabel}>Mejor racha</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progreso del curso</Text>
              <Text style={styles.progressPct}>{Math.round(data?.progressPct ?? 0)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${data?.progressPct ?? 0}%` as `${number}%` }]} />
            </View>
          </View>

          {/* Achievements */}
          {(data?.achievements?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Logros</Text>
              {data!.achievements.map((a, i) => (
                <View key={i} style={styles.achieveRow}>
                  <View style={styles.achieveIcon}>
                    <Text style={{ fontSize: 18 }}>🎖</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achieveTitle}>{a.title}</Text>
                    <Text style={styles.achieveSub} numberOfLines={1}>{a.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </ScrollView>
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
  avatarCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#f1f5f9",
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#7c3aed",
    justifyContent: "center", alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: "white" },
  nameText: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  emailText: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, minWidth: "45%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#f1f5f9",
  },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: "900", color: "#0f172a" },
  statLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  progressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#f1f5f9",
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  progressPct: { fontSize: 13, fontWeight: "800", color: "#7c3aed" },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: "#e2e8f0", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: "#7c3aed" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 10 },
  achieveRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#ffffff", borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: "#f1f5f9",
  },
  achieveIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#faf5ff",
    justifyContent: "center", alignItems: "center",
  },
  achieveTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  achieveSub: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  logoutBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5, borderColor: "#fecaca",
    borderRadius: 16, padding: 16,
    alignItems: "center", marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#dc2626" },
})
