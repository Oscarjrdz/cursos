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
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../lib/auth"
import { apiRequest } from "../lib/api"

type LoginResponse = { token: string; name: string; tenantSlug: string }

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
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
  icon: React.ComponentProps<typeof Ionicons>["name"]
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"]
  secureTextEntry?: boolean
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"]
  returnKeyType?: React.ComponentProps<typeof TextInput>["returnKeyType"]
  onSubmitEditing?: () => void
  inputRef?: React.RefObject<TextInput | null>
}) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, focused && styles.fieldBoxFocused]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? "#7c3aed" : "#94a3b8"}
          style={styles.fieldIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#c4c9d4"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#94a3b8"
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.catWrap}>
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/128/11051/11051168.png" }}
              style={styles.cat}
            />
          </View>
          <Text style={styles.brandName}>Candidatic Knowledge</Text>
          <Text style={styles.brandSub}>Inicia sesión para seguir aprendiendo</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Field
            label="TELÉFONO"
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej: 5512345678"
            icon="phone-portrait-outline"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Field
            label="CONTRASEÑA"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            icon="lock-closed-outline"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            inputRef={passwordRef}
          />

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.button, loading && styles.buttonDisabled, pressed && { opacity: 0.85 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </View>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>© 2025 Candidatic Knowledge</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f3ff" },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },

  /* hero */
  hero: { alignItems: "center", marginBottom: 32 },
  catWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cat: { width: 72, height: 72, borderRadius: 36 },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1e1b4b",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 13,
    color: "#7c7a9a",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
    letterSpacing: 0.1,
  },

  /* card */
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 28,
    gap: 18,
    shadowColor: "#4c1d95",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },

  /* field */
  fieldWrap: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6366f1",
    letterSpacing: 1.2,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    backgroundColor: "#fafafa",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  fieldBoxFocused: {
    borderColor: "#7c3aed",
    backgroundColor: "#faf5ff",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldIcon: { width: 20 },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1e1b4b",
    padding: 0,
  },

  /* error */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", flex: 1 },

  /* button */
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 2,
    shadowColor: "#5b21b6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },

  footer: {
    marginTop: 28,
    fontSize: 11,
    color: "#c4c9d4",
    textAlign: "center",
    letterSpacing: 0.3,
  },
})
