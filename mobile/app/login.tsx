import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Easing,
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

type Screen = "splash" | "login" | "onboard1" | "onboard2"
type LoginResponse = { token: string; name: string; tenantSlug: string }

const CAT1 = "https://cdn-icons-png.flaticon.com/128/11051/11051168.png"
const CAT2 = "https://cdn-icons-png.flaticon.com/128/11051/11051186.png"
const CAT3 = "https://cdn-icons-png.flaticon.com/128/11051/11051207.png"

/* ── Floating cat ─────────────────────────────────────── */
function FloatingCat({ uri, size = 64 }: { uri: string; size?: number }) {
  const y = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -10, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(y, { toValue: 0,  duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start()
    return () => y.stopAnimation()
  }, [y])
  return (
    <Animated.Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, transform: [{ translateY: y }] }}
    />
  )
}

/* ── Speech bubble with downward tail ─────────────────── */
function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bubbleWrap}>
      <View style={styles.bubbleBox}>{children}</View>
      <View style={styles.bubbleTail} />
    </View>
  )
}

/* ── Purple button ─────────────────────────────────────── */
function PurpleBtn({ label, onPress, loading, disabled }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.purpleBtn, (disabled || loading) && styles.purpleBtnDisabled, pressed && { opacity: 0.88 }]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading
        ? <ActivityIndicator color="white" />
        : <Text style={styles.purpleBtnText}>{label}</Text>
      }
    </Pressable>
  )
}

/* ── Input field ───────────────────────────────────────── */
function Field({
  label, value, onChangeText, placeholder, icon,
  keyboardType = "default", secureTextEntry = false,
  returnKeyType = "next", onSubmitEditing, inputRef,
}: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder: string; icon: React.ComponentProps<typeof Ionicons>["name"]
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"]
  secureTextEntry?: boolean
  returnKeyType?: React.ComponentProps<typeof TextInput>["returnKeyType"]
  onSubmitEditing?: () => void
  inputRef?: React.RefObject<TextInput | null>
}) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldBox, focused && styles.fieldBoxFocused]}>
        <Ionicons name={icon} size={20} color={focused ? "#7c3aed" : "#cbd5e1"} style={{ width: 22 }} />
        <TextInput
          ref={inputRef}
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#c4c9d4"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !show}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShow(s => !s)} hitSlop={8}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

/* ════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════ */

function SplashScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.splashRoot}>
      <StatusBar style="light" />
      <View />
      <View style={styles.splashCenter}>
        <Text style={styles.splashWelcome}>Bienvenido</Text>
        <FloatingCat uri={CAT1} size={72} />
        <View style={styles.splashBrand}>
          <Text style={styles.splashSub}>Candidatic</Text>
          <Text style={styles.splashTitle}>Knowledge</Text>
        </View>
      </View>
      <View style={styles.splashBottom}>
        <Pressable
          style={({ pressed }) => [styles.whiteBtn, pressed && { opacity: 0.88 }]}
          onPress={onNext}
        >
          <Text style={styles.whiteBtnText}>COMENZAR</Text>
        </Pressable>
        <Text style={styles.splashFooter}>Acceso exclusivo para alumnos</Text>
      </View>
    </View>
  )
}

function LoginFormScreen({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { login } = useAuth()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const passwordRef = useRef<TextInput>(null)

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) { setError("Ingresa tu teléfono y contraseña"); return }
    setError(null); setLoading(true)
    try {
      const data = await apiRequest<LoginResponse>("/api/mobile/auth/login", {
        method: "POST",
        body: { phone: phone.trim(), password: password.trim() },
      })
      await login(data.token, data.name, data.tenantSlug)
      onSuccess(data.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.loginScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Bubble + cat */}
        <View style={styles.loginHero}>
          <Bubble>
            <Text style={styles.bubbleText}>¡Hola! Ingresa tus accesos</Text>
          </Bubble>
          <View style={{ marginTop: 4 }}>
            <FloatingCat uri={CAT2} size={72} />
          </View>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Field
            label="TELÉFONO"
            value={phone}
            onChangeText={setPhone}
            placeholder="Tu número"
            icon="phone-portrait-outline"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <Field
            label="CONTRASEÑA"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
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
          <PurpleBtn
            label="ENTRAR"
            onPress={handleLogin}
            loading={loading}
            disabled={!phone || !password}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Onboard1Screen({ onNext, name }: { onNext: () => void; name: string }) {
  const firstName = name.split(" ")[0] || "Alumno"
  return (
    <View style={styles.onboardRoot}>
      <StatusBar style="dark" />
      <View />
      <View style={styles.onboardCenter}>
        <Bubble>
          <Text style={styles.bubbleText}>
            ¡Hola <Text style={styles.bubblePurple}>{firstName}</Text>!{" "}
            Soy <Text style={styles.bubblePurple}>Knowy</Text> y te doy la bienvenida a este mundo de conocimiento 🌟
          </Text>
        </Bubble>
        <View style={{ marginTop: 4 }}>
          <FloatingCat uri={CAT1} size={72} />
        </View>
      </View>
      <View style={styles.onboardBottom}>
        <PurpleBtn label="CONTINUAR" onPress={onNext} />
      </View>
    </View>
  )
}

function Onboard2Screen({ name }: { name: string }) {
  const router = useRouter()
  const firstName = name.split(" ")[0] || "Alumno"
  return (
    <View style={styles.onboardRoot}>
      <StatusBar style="dark" />
      <View />
      <View style={styles.onboardCenter}>
        <Bubble>
          <Text style={[styles.bubbleText, { fontSize: 20, fontWeight: "900" }]}>
            Todo está listo, <Text style={styles.bubblePurple}>{firstName}</Text> 🎉
          </Text>
          <Text style={[styles.bubbleText, { marginTop: 8, fontWeight: "600" }]}>
            Tienes lecciones esperándote.{" "}
            <Text style={styles.bubblePurple}>¡Empecemos!</Text> 🚀
          </Text>
          <Text style={[styles.bubbleText, { marginTop: 6, color: "#94a3b8", fontSize: 13 }]}>
            Gana XP, mantén tu racha y llega al top
          </Text>
        </Bubble>
        <View style={{ marginTop: 4 }}>
          <FloatingCat uri={CAT3} size={72} />
        </View>
      </View>
      <View style={styles.onboardBottom}>
        <PurpleBtn label="COMENZAR MI CURSO" onPress={() => router.replace("/(tabs)")} />
      </View>
    </View>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════════════ */
export default function LoginScreen() {
  const [screen, setScreen] = useState<Screen>("splash")
  const [studentName, setStudentName] = useState("")
  const fadeAnim = useRef(new Animated.Value(1)).current

  function goTo(next: Screen) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setScreen(next)
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start()
    })
  }

  const screens: Record<Screen, React.ReactNode> = {
    splash:   <SplashScreen onNext={() => goTo("login")} />,
    login:    <LoginFormScreen onSuccess={(name) => { setStudentName(name); goTo("onboard1") }} />,
    onboard1: <Onboard1Screen onNext={() => goTo("onboard2")} name={studentName} />,
    onboard2: <Onboard2Screen name={studentName} />,
  }

  return (
    <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
      {screens[screen]}
    </Animated.View>
  )
}

/* ════════════════════════════════════════════════════════
   STYLES
   ════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  flex: { flex: 1 },

  /* splash */
  splashRoot: {
    flex: 1,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  splashCenter: { alignItems: "center", gap: 20 },
  splashWelcome: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  splashBrand: { alignItems: "center", gap: 4 },
  splashSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  splashTitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },
  splashBottom: { width: "100%", maxWidth: 340, alignItems: "center", gap: 12 },
  splashFooter: { color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center" },

  /* white button (on splash) */
  whiteBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 4,
  },
  whiteBtnText: {
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  /* login form screen */
  loginScroll: {
    flexGrow: 1,
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: "#faf5ff",
  },
  loginHero: { alignItems: "center", marginBottom: 28 },

  /* card */
  card: {
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
  fieldLabel: { fontSize: 11, fontWeight: "800", color: "#6366f1", letterSpacing: 1.2 },
  fieldBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 14, backgroundColor: "#fafafa",
    paddingHorizontal: 14, paddingVertical: 14,
  },
  fieldBoxFocused: {
    borderColor: "#7c3aed", backgroundColor: "#faf5ff",
    shadowColor: "#7c3aed", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 2,
  },
  fieldInput: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1e1b4b", padding: 0 },

  /* error */
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fef2f2", borderWidth: 1.5, borderColor: "#fecaca",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  errorText: { color: "#dc2626", fontSize: 13, fontWeight: "600", flex: 1 },

  /* purple button */
  purpleBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#5b21b6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  purpleBtnDisabled: { backgroundColor: "#c4b5fd", shadowOpacity: 0, elevation: 0 },
  purpleBtnText: { color: "white", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  /* speech bubble */
  bubbleWrap: { width: "100%", alignItems: "center" },
  bubbleBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  bubbleTail: {
    width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 14,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#ffffff",
    alignSelf: "center",
  },
  bubbleText: { color: "#0f172a", fontSize: 15, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  bubblePurple: { color: "#7c3aed", fontWeight: "900" },

  /* onboard screens */
  onboardRoot: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 72,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  onboardCenter: { alignItems: "center", gap: 4, width: "100%" },
  onboardBottom: { width: "100%", maxWidth: 340 },
})
