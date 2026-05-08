import { useRef, useState } from "react"
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useAuth } from "../lib/auth"
import { apiRequest } from "../lib/api"

type LoginResponse = { token: string; name: string; tenantSlug: string }

/* ── Duolingo-style input field ──────────────────────────────── */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder: string
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"]
  secureTextEntry?: boolean
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"]
  returnKeyType?: React.ComponentProps<typeof TextInput>["returnKeyType"]
  onSubmitEditing?: () => void
  inputRef?: React.RefObject<TextInput | null>
}) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.fieldBox,
        focused && styles.fieldBoxFocused,
      ]}>
        <TextInput
          ref={inputRef}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#b0bec5"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  )
}

/* ── Screen ──────────────────────────────────────────────────── */
export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const passwordRef = useRef<TextInput>(null)

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      setError("Ingresa tu teléfono y contraseña")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await apiRequest<LoginResponse>("/api/mobile/auth/login", {
        method: "POST",
        body: { phone: phone.trim(), password: password.trim() },
      })
      await login(data.token, data.name, data.tenantSlug)
      router.replace("/(tabs)")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mascot + Brand ── */}
        <View style={styles.hero}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/11051/11051168.png" }}
            style={styles.cat}
          />
          <Text style={styles.brandName}>Candidatic Knowledge</Text>
          <Text style={styles.brandSub}>Inicia sesión para seguir aprendiendo</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          <Field
            label="Teléfono"
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej: 5512345678"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            inputRef={passwordRef}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Entrar →</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>© 2025 Candidatic Knowledge</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f4ff" },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },

  /* hero */
  hero: { alignItems: "center", marginBottom: 36 },
  cat: { width: 90, height: 90, borderRadius: 45, marginBottom: 16 },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },

  /* card */
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    gap: 16,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.1)",
  },

  /* field */
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  fieldBox: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldBoxFocused: {
    borderColor: "#7c3aed",
    backgroundColor: "#faf5ff",
  },
  fieldInput: { fontSize: 15, color: "#0f172a", padding: 0 },

  /* error */
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", textAlign: "center" },

  /* button */
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#5b21b6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "900", letterSpacing: 0.3 },

  footer: {
    marginTop: 32,
    fontSize: 11,
    color: "#cbd5e1",
    textAlign: "center",
  },
})
