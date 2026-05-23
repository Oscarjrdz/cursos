import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "../../lib/auth"
import { apiRequest, getApiBase } from "../../lib/api"

type ProfileData = {
  tenantName: string; tenantSlug: string; maxStudents: number
  adminPhone: string | null; totalStudents: number; activeStudents: number
  logoUrl: string | null; expiresAt: string | null
}

const DUO = {
  green: "#58CC02", blue: "#1CB0F6", blueDark: "#1899D6",
  red: "#FF4B4B", purple: "#A855F7", orange: "#FF9600",
  bg: "#F7F7F7", card: "#FFFFFF", text: "#3C3C3C",
  textMuted: "#AFAFAF", border: "#E5E5E5",
}

function StatCard({ icon, value, label, bgColor, borderColor }: {
  icon: React.ReactNode; value: string | number; label: string
  bgColor: string; borderColor: string
}) {
  return (
    <View style={[styles.statCard, { borderColor, borderBottomWidth: 4 }]}>
      <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>{icon}</View>
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
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  const isExpired = data?.expiresAt ? new Date(data.expiresAt) < new Date() : false

  const fetchData = useCallback(async () => {
    try {
      const d = await apiRequest<ProfileData>("/api/mobile/admin/profile", { token })
      setData(d)
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  const onRefresh = () => { setRefreshing(true); fetchData() }

  // Show expired overlay every 30s
  useEffect(() => {
    if (!isExpired) return
    setShowExpiredModal(true)
    const interval = setInterval(() => setShowExpiredModal(true), 30000)
    return () => clearInterval(interval)
  }, [isExpired])

  async function handlePickLogo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos para el logo de la empresa.")
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
    if (!base64) { Alert.alert("Error", "No se pudo leer la imagen"); return }

    setUploading(true)
    try {
      const sizeInBytes = base64.length * 0.75
      if (sizeInBytes > 3_000_000) throw new Error("La imagen es muy grande. Intenta con una más pequeña.")
      const mimeType = asset.mimeType ?? "image/jpeg"
      const base_ = getApiBase()
      const res = await fetch(`${base_}/api/mobile/admin/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType }),
      })
      if (!res.ok) {
        const errBody = await res.text()
        let detail = "Error al subir el logo"
        try { const parsed = JSON.parse(errBody); detail = parsed.detail || parsed.error || detail } catch {}
        throw new Error(`${res.status}: ${detail}`)
      }
      const { logoUrl } = await res.json()
      setData(prev => prev ? { ...prev, logoUrl } : prev)
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudo subir el logo")
    } finally { setUploading(false) }
  }

  async function handleChangePassword() {
    if (!newPassword.trim() || newPassword.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres")
      return
    }
    setSaving(true)
    try {
      await apiRequest("/api/mobile/admin/profile", {
        method: "PUT", token, body: { password: newPassword.trim() },
      })
      Alert.alert("Listo", "Contraseña actualizada")
      setNewPassword(""); setShowPassword(false)
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Error al actualizar")
    } finally { setSaving(false) }
  }

  function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => {
        await logout()
        router.replace("/login")
      }},
    ])
  }

  const tenantName = data?.tenantName ?? user?.tenantName ?? ""
  const initials = tenantName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🏢 Empresa</Text>
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
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroBlobLeft} />
            <View style={styles.heroBlobRight} />
            <Pressable onPress={handlePickLogo} style={styles.avatarWrap} disabled={uploading}>
              {data?.logoUrl ? (
                <Image source={{ uri: data.logoUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              {uploading && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
              <View style={styles.cameraBtn}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </Pressable>
            <Text style={styles.nameText}>{tenantName}</Text>
            <Text style={styles.slugText}>/{data?.tenantSlug}</Text>
          </View>

          {/* Stats */}
          <Text style={styles.sectionTitle}>📊 Resumen</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Ionicons name="people" size={22} color={DUO.green} />}
              value={data?.activeStudents ?? 0}
              label="Activos"
              bgColor="rgba(88,204,2,0.12)"
              borderColor={DUO.green}
            />
            <StatCard
              icon={<Ionicons name="person-add" size={22} color={DUO.blue} />}
              value={`${data?.totalStudents ?? 0}/${data?.maxStudents ?? 0}`}
              label="Contratados"
              bgColor="rgba(28,176,246,0.12)"
              borderColor={DUO.blue}
            />
          </View>

          {/* Contact info */}
          <Text style={styles.sectionTitle}>📇 Información</Text>
          <View style={styles.infoCard}>
            {data?.adminPhone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={DUO.purple} />
                <View>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{data.adminPhone}</Text>
                </View>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color={DUO.blue} />
              <View>
                <Text style={styles.infoLabel}>Slug</Text>
                <Text style={styles.infoValue}>{data?.tenantSlug}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={18} color={DUO.green} />
              <View>
                <Text style={styles.infoLabel}>Límite de alumnos</Text>
                <Text style={styles.infoValue}>{data?.maxStudents}</Text>
              </View>
            </View>
            {data?.expiresAt && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color={isExpired ? DUO.red : DUO.green} />
                <View>
                  <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
                  <Text style={[styles.infoValue, isExpired && { color: DUO.red }]}>
                    {new Date(data.expiresAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                    {isExpired ? "  ⚠️ Vencida" : "  ✅"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Change password */}
          <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
          <View style={styles.passwordCard}>
            {!showPassword ? (
              <Pressable style={styles.changePassBtn} onPress={() => setShowPassword(true)}>
                <Ionicons name="key-outline" size={18} color={DUO.purple} />
                <Text style={styles.changePassText}>Cambiar contraseña</Text>
                <Ionicons name="chevron-forward" size={16} color={DUO.textMuted} />
              </Pressable>
            ) : (
              <View style={styles.passForm}>
                <TextInput
                  style={styles.passInput}
                  placeholder="Nueva contraseña"
                  placeholderTextColor={DUO.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <View style={styles.passActions}>
                  <Pressable style={styles.passCancelBtn} onPress={() => { setShowPassword(false); setNewPassword("") }}>
                    <Text style={styles.passCancelText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.passSaveBtn, saving && { opacity: 0.5 }]}
                    onPress={handleChangePassword}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.passSaveText}>Guardar</Text>}
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Logout */}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={DUO.red} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>

          <Text style={styles.version}>Admin Knowledge v1.0</Text>
        </ScrollView>
      )}

      {/* License expired modal */}
      <LicenseExpiredModal visible={showExpiredModal} onClose={() => setShowExpiredModal(false)} />
    </View>
  )
}

/* ─── License Expired Modal ──────────────────────────────── */
function LicenseExpiredModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const bounceAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!visible) return
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [visible, bounceAnim])
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={expStyles.overlay}>
        <View style={expStyles.card}>
          <View style={expStyles.accent} />
          <Animated.View style={[expStyles.iconWrap, { transform: [{ translateY: bounceAnim }] }]}>
            <Text style={{ fontSize: 44 }}>🔒</Text>
          </Animated.View>
          <Text style={expStyles.title}>Licencia vencida</Text>
          <Text style={expStyles.desc}>Tu acceso ha expirado y no puedes crear ni editar contenido.</Text>
          <Text style={expStyles.highlight}>Contacta a tu administrador para renovar tu licencia</Text>
          <View style={expStyles.contactBox}>
            <Ionicons name="mail-outline" size={16} color={DUO.purple} />
            <Text style={expStyles.contactText}>soporte@candidatic.com</Text>
          </View>
          <Pressable style={expStyles.btn} onPress={onClose}>
            <Text style={expStyles.btnText}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
const expStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 28, width: "100%", maxWidth: 360, alignItems: "center", overflow: "hidden", borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 5, borderBottomColor: "#D5D5D5" },
  accent: { height: 6, width: "100%", backgroundColor: DUO.purple },
  iconWrap: { width: 88, height: 88, borderRadius: 22, backgroundColor: "rgba(168,85,247,0.08)", borderWidth: 2, borderColor: "rgba(168,85,247,0.2)", justifyContent: "center", alignItems: "center", marginTop: 28 },
  title: { fontSize: 20, fontWeight: "900", color: DUO.text, marginTop: 16 },
  desc: { fontSize: 13, fontWeight: "600", color: DUO.textMuted, textAlign: "center", marginTop: 8, paddingHorizontal: 28 },
  highlight: { fontSize: 14, fontWeight: "800", color: DUO.purple, textAlign: "center", marginTop: 8, paddingHorizontal: 28 },
  contactBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(168,85,247,0.06)", borderWidth: 1.5, borderColor: "rgba(168,85,247,0.15)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, marginTop: 16 },
  contactText: { fontSize: 13, fontWeight: "700", color: DUO.purple },
  btn: { backgroundColor: DUO.purple, borderRadius: 16, paddingVertical: 14, alignItems: "center", width: "80%", marginTop: 20, marginBottom: 28, borderBottomWidth: 4, borderBottomColor: "#7e22ce" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "900" },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.bg },
  header: {
    backgroundColor: DUO.card, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 3, borderBottomColor: "#E5E5E5",
  },
  title: { fontSize: 22, fontWeight: "900", color: DUO.text },

  /* Hero */
  heroCard: {
    backgroundColor: DUO.card, borderRadius: 22, padding: 28, alignItems: "center",
    marginBottom: 20, borderWidth: 2, borderColor: DUO.border,
    borderBottomWidth: 5, borderBottomColor: "#D5D5D5",
    overflow: "hidden", position: "relative",
  },
  heroBlobLeft: {
    position: "absolute", top: -30, left: -30, width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(124,58,237,0.08)",
  },
  heroBlobRight: {
    position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(28,176,246,0.08)",
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#7c3aed",
    justifyContent: "center", alignItems: "center",
    borderWidth: 4, borderColor: "#5b21b6",
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: "white" },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarImg: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: "#5b21b6",
  },
  avatarLoadingOverlay: {
    position: "absolute", top: 0, left: 0, width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
  },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: DUO.green, justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "white",
  },
  nameText: { fontSize: 20, fontWeight: "900", color: DUO.text, marginTop: 12 },
  slugText: { fontSize: 13, color: DUO.textMuted, fontWeight: "600", marginTop: 2 },

  /* Stats */
  sectionTitle: { fontSize: 16, fontWeight: "900", color: DUO.text, marginBottom: 12 },
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: DUO.card, borderRadius: 16, padding: 16,
    alignItems: "center", borderWidth: 2, borderColor: DUO.border,
  },
  statIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: "900", color: DUO.text },
  statLabel: { fontSize: 11, color: DUO.textMuted, fontWeight: "700", marginTop: 2 },

  /* Info */
  infoCard: {
    backgroundColor: DUO.card, borderRadius: 18, padding: 16, marginBottom: 20,
    borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 4, borderBottomColor: "#D5D5D5",
    gap: 14,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoLabel: { fontSize: 11, fontWeight: "700", color: DUO.textMuted },
  infoValue: { fontSize: 14, fontWeight: "700", color: DUO.text },

  /* Password */
  passwordCard: {
    backgroundColor: DUO.card, borderRadius: 18, marginBottom: 20,
    borderWidth: 2, borderColor: DUO.border, borderBottomWidth: 4, borderBottomColor: "#D5D5D5",
    overflow: "hidden",
  },
  changePassBtn: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 16,
  },
  changePassText: { fontSize: 14, fontWeight: "700", color: DUO.text, flex: 1 },
  passForm: { padding: 16, gap: 10 },
  passInput: {
    backgroundColor: "#F5F5F5", borderWidth: 2, borderColor: DUO.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: "600", color: DUO.text,
  },
  passActions: { flexDirection: "row", gap: 8 },
  passCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  passCancelText: { fontSize: 14, fontWeight: "700", color: DUO.textMuted },
  passSaveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
    backgroundColor: DUO.purple, borderBottomWidth: 3, borderBottomColor: "#7e22ce",
  },
  passSaveText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  /* Logout */
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "rgba(255,75,75,0.08)", borderWidth: 2, borderColor: "rgba(255,75,75,0.25)",
    borderBottomWidth: 4, borderBottomColor: "rgba(255,75,75,0.3)",
    borderRadius: 16, padding: 16, marginTop: 4,
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: DUO.red },

  version: {
    textAlign: "center", fontSize: 11, color: "#D5D5D5", fontWeight: "700",
    marginTop: 20, marginBottom: 8,
  },
})
