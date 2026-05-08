import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from "expo-image-picker"
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg"
import { useAuth } from "../../lib/auth"
import { apiRequest, getApiBase } from "../../lib/api"

type ProfileData = {
  name: string
  email: string
  avatarUrl: string | null
  xpTotal: number
  progressPct: number
  streak: { currentDays: number; longestDays: number }
  completedLessons: number
  achievements: { title: string; description: string; earnedAt: string }[]
}

/* ─── Duolingo-style SVG Icons ───────────────────────────── */

const IconGem = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="#A855F7" />
    <Path d="M2 9h20" stroke="#FFFFFF" strokeWidth={1} opacity={0.35} />
    <Path d="M12 21L8 9l4-6 4 6-4 12z" fill="#C084FC" opacity={0.5} />
    <Path d="M8 9l4-6 4 6" fill="#FFFFFF" opacity={0.2} />
  </Svg>
)

const IconFlame = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11z"
      fill="#FF9600"
    />
    <Path
      d="M12 2s-5 6.5-5 11a5 5 0 0010 0c0-4.5-5-11-5-11z"
      fill="#FF4500"
      opacity={0.3}
    />
    <Path
      d="M12 10s-2 3.2-2 5a2 2 0 004 0c0-1.8-2-5-2-5z"
      fill="#FFD700"
    />
    <Path
      d="M11 12s-1 2-1 3a1.2 1.2 0 002.4 0c0-1-1.4-3-1.4-3z"
      fill="#FFFFFF"
      opacity={0.35}
    />
  </Svg>
)

const IconCheckBadge = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="#58CC02" />
    <Circle cx={12} cy={12} r={10} fill="#46A302" opacity={0.15} />
    <Path d="M7 12.5l3 3 7-7" stroke="#FFFFFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={8} cy={8} r={2} fill="#FFFFFF" opacity={0.15} />
  </Svg>
)

const IconTrophyProfile = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h12v9a6 6 0 01-12 0V3z" fill="#FFC800" />
    <Path d="M8 5h2v6a4 4 0 01-2-.5V5z" fill="#FFFFFF" opacity={0.3} />
    <Path d="M6 5H4a2 2 0 00-2 2v1a3 3 0 003 3h1" stroke="#FFC800" strokeWidth={2} strokeLinecap="round" />
    <Path d="M18 5h2a2 2 0 012 2v1a3 3 0 01-3 3h-1" stroke="#FFC800" strokeWidth={2} strokeLinecap="round" />
    <Rect x={10.5} y={16} width={3} height={3} rx={0.5} fill="#E5A800" />
    <Rect x={7} y={19} width={10} height={2.5} rx={1.2} fill="#E5A800" />
  </Svg>
)

const IconMedal = ({ size = 24 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Ribbon */}
    <Path d="M8 2l-3 8h4l3 2 3-2h4l-3-8H8z" fill="#FF4B4B" />
    <Path d="M8 2l-3 8h4l3 2" fill="#FF6B6B" opacity={0.4} />
    {/* Medal circle */}
    <Circle cx={12} cy={15} r={6.5} fill="#FFC800" />
    <Circle cx={12} cy={15} r={5} fill="#FFD633" />
    {/* Star */}
    <Path
      d="M12 11l1.2 2.4 2.6.38-1.9 1.85.45 2.6L12 17l-2.35 1.23.45-2.6-1.9-1.85 2.6-.38L12 11z"
      fill="#FFFFFF"
      opacity={0.6}
    />
  </Svg>
)

const IconCamera = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
      fill="#FFFFFF"
    />
    <Circle cx={12} cy={13} r={4} fill="#1CB0F6" />
    <Circle cx={10.5} cy={11.5} r={1.2} fill="#FFFFFF" opacity={0.5} />
  </Svg>
)

const IconDoor = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 2h10a2 2 0 012 2v16a2 2 0 01-2 2H5V2z" fill="#FF4B4B" />
    <Path d="M5 2h4v20H5V2z" fill="#FF6B6B" opacity={0.3} />
    <Circle cx={13} cy={12} r={1.2} fill="#FFD700" />
    {/* Arrow */}
    <Path d="M17 12h5m-3-3l3 3-3 3" stroke="#FF4B4B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

const IconProgress = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke="#E2E8F0" strokeWidth={3} />
    <Path d="M12 2a10 10 0 018.66 5" stroke="#1CB0F6" strokeWidth={3} strokeLinecap="round" />
    <Path d="M12 2a10 10 0 00-8.66 5" stroke="#58CC02" strokeWidth={3} strokeLinecap="round" />
    <Circle cx={12} cy={12} r={4} fill="#7C3AED" />
    <Path d="M10 12l1.5 1.5 3-3" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

/* ─── Color system ───────────────────────────────────────── */
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
  bg: "#F7F7F7",
  cardBg: "#FFFFFF",
  textPrimary: "#3C3C3C",
  textSecondary: "#AFAFAF",
  border: "#E5E5E5",
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon, value, label, bgColor, borderColor }: {
  icon: React.ReactNode
  value: string | number
  label: string
  bgColor: string
  borderColor: string
}) {
  return (
    <View style={[styles.statCard, { borderColor, borderBottomWidth: 4 }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const { token, user, logout } = useAuth()
  const insets = useSafeAreaInsets()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para cambiar tu avatar.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    const base64 = asset.base64
    if (!base64) {
      Alert.alert("Error", "No se pudo leer la imagen")
      return
    }

    setUploading(true)
    try {
      const base = getApiBase()

      // Check size — Vercel limit is ~4.5MB, base64 adds ~33% overhead
      const sizeInBytes = base64.length * 0.75
      if (sizeInBytes > 3_000_000) {
        throw new Error("La imagen es muy grande. Intenta con una foto más pequeña.")
      }

      const mimeType = asset.mimeType ?? "image/jpeg"

      const res = await fetch(`${base}/api/mobile/profile/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64, mimeType }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error("Avatar upload failed:", res.status, errBody)
        // Show the actual server error for debugging
        let detail = "Error al subir la imagen"
        try {
          const parsed = JSON.parse(errBody)
          detail = parsed.detail || parsed.error || detail
        } catch { /* not JSON */ }
        throw new Error(`${res.status}: ${detail}`)
      }
      const { avatarUrl } = await res.json()
      setData(prev => prev ? { ...prev, avatarUrl } : prev)
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudo subir la foto")
    } finally {
      setUploading(false)
    }
  }

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
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>👤 Perfil</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DUO.blue} />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DUO.blue} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Avatar Card ── */}
          <View style={styles.heroCard}>
            {/* Decorative blobs */}
            <View style={styles.heroBlobLeft} />
            <View style={styles.heroBlobRight} />

            <Pressable onPress={handlePickPhoto} style={styles.avatarWrap} disabled={uploading}>
              {data?.avatarUrl ? (
                <Image source={{ uri: data.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              {/* Camera button */}
              <View style={styles.cameraBtn}>
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <IconCamera size={14} />
                )}
              </View>
            </Pressable>

            <Text style={styles.nameText}>{name}</Text>
            {data?.email ? <Text style={styles.emailText}>{data.email}</Text> : null}

            {/* XP + Streak mini badges */}
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <IconGem size={16} />
                <Text style={styles.heroBadgeText}>{data?.xpTotal ?? 0} XP</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: "rgba(255,150,0,0.15)" }]}>
                <IconFlame size={16} />
                <Text style={[styles.heroBadgeText, { color: DUO.orange }]}>{data?.streak.currentDays ?? 0} días</Text>
              </View>
            </View>
          </View>

          {/* ── Stats Grid ── */}
          <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<IconGem size={22} />}
              value={data?.xpTotal ?? 0}
              label="XP Total"
              bgColor="rgba(168,85,247,0.12)"
              borderColor={DUO.purple}
            />
            <StatCard
              icon={<IconFlame size={22} />}
              value={data?.streak.currentDays ?? 0}
              label="Racha actual"
              bgColor="rgba(255,150,0,0.12)"
              borderColor={DUO.orange}
            />
            <StatCard
              icon={<IconCheckBadge size={22} />}
              value={data?.completedLessons ?? 0}
              label="Lecciones"
              bgColor="rgba(88,204,2,0.12)"
              borderColor={DUO.green}
            />
            <StatCard
              icon={<IconTrophyProfile size={22} />}
              value={data?.streak.longestDays ?? 0}
              label="Mejor racha"
              bgColor="rgba(255,200,0,0.12)"
              borderColor={DUO.gold}
            />
          </View>

          {/* ── Progress Card ── */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <IconProgress size={20} />
              <Text style={styles.progressLabel}>Progreso del curso</Text>
              <Text style={styles.progressPct}>{Math.round(data?.progressPct ?? 0)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${data?.progressPct ?? 0}%` as `${number}%` }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressFooterText}>
                {data?.completedLessons ?? 0} lecciones completadas
              </Text>
              <Text style={[styles.progressFooterText, { color: DUO.green }]}>
                ¡Sigue así! 💪
              </Text>
            </View>
          </View>

          {/* ── Achievements ── */}
          {(data?.achievements?.length ?? 0) > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏅 Logros obtenidos</Text>
              {data!.achievements.map((a, i) => (
                <View key={i} style={styles.achieveRow}>
                  <View style={styles.achieveIcon}>
                    <IconMedal size={26} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.achieveTitle}>{a.title}</Text>
                    <Text style={styles.achieveSub} numberOfLines={1}>{a.description}</Text>
                  </View>
                  <View style={styles.achieveCheck}>
                    <IconCheckBadge size={18} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Logout ── */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <IconDoor size={20} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>

          {/* Version */}
          <Text style={styles.version}>Candidatic Knowledge v1.0</Text>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },

  /* Header */
  header: {
    backgroundColor: DUO.cardBg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#E5E5E5",
  },
  title: { fontSize: 22, fontWeight: "900", color: DUO.textPrimary },

  /* Hero Card */
  heroCard: {
    backgroundColor: DUO.cardBg,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 5,
    borderBottomColor: "#D5D5D5",
    overflow: "hidden",
    position: "relative",
  },
  heroBlobLeft: {
    position: "absolute",
    top: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(28,176,246,0.08)",
  },
  heroBlobRight: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(88,204,2,0.08)",
  },

  /* Avatar */
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: DUO.blue,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DUO.blue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: DUO.blueDark,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "white" },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DUO.green,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  nameText: { fontSize: 20, fontWeight: "900", color: DUO.textPrimary },
  emailText: { fontSize: 13, color: DUO.textSecondary, fontWeight: "600", marginTop: 4 },

  /* Hero badges */
  heroBadgeRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(168,85,247,0.1)",
  },
  heroBadgeText: { fontSize: 13, fontWeight: "800", color: DUO.purple },

  /* Stats */
  sectionTitle: { fontSize: 16, fontWeight: "900", color: DUO.textPrimary, marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: "45%" as unknown as number,
    backgroundColor: DUO.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: DUO.border,
  },
  statIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: "900", color: DUO.textPrimary },
  statLabel: { fontSize: 11, color: DUO.textSecondary, fontWeight: "700", marginTop: 2 },

  /* Progress */
  progressCard: {
    backgroundColor: DUO.cardBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5D5D5",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressLabel: { fontSize: 14, fontWeight: "800", color: DUO.textPrimary, flex: 1 },
  progressPct: { fontSize: 16, fontWeight: "900", color: DUO.green },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E5E5E5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: DUO.green,
  },
  progressFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  progressFooterText: { fontSize: 11, color: DUO.textSecondary, fontWeight: "600" },

  /* Achievements */
  section: { marginBottom: 20 },
  achieveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: DUO.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: DUO.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5D5D5",
  },
  achieveIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,200,0,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  achieveTitle: { fontSize: 14, fontWeight: "800", color: DUO.textPrimary },
  achieveSub: { fontSize: 11, color: DUO.textSecondary, fontWeight: "600", marginTop: 2 },
  achieveCheck: { marginLeft: "auto" },

  /* Logout */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,75,75,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,75,75,0.25)",
    borderBottomWidth: 4,
    borderBottomColor: "rgba(255,75,75,0.3)",
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: DUO.red },

  /* Version */
  version: {
    textAlign: "center",
    fontSize: 11,
    color: "#D5D5D5",
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
})
