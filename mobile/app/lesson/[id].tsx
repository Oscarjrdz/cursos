import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../../lib/auth"
import { apiRequest } from "../../lib/api"

/* ── Types ─────────────────────────────────────────────────── */
type QuizItem = { question: string; options: string[]; correctIndex: number; explanation?: string }
type LessonData = {
  id: string; title: string; contentType: string
  contentJson: Record<string, unknown>; xpReward: number
  lessonIndex: number; totalLessons: number; alreadyCompleted: boolean
}
type QuizState = "idle" | "correct" | "wrong"
type Step = { type: "content"; idx: number } | { type: "quiz"; idx: number }

/* ── Parse content ──────────────────────────────────────────── */
function parseContent(cj: Record<string, unknown>) {
  let raw = ""
  if (Array.isArray(cj.blocks))
    raw = (cj.blocks as { text: string }[]).map((b) => b.text ?? "").filter(Boolean).join("\n\n")
  else raw = String(cj.content ?? cj.text ?? "")
  const paragraphs = raw.split("\n\n").map((p) => p.trim()).filter(Boolean)
  let quiz: QuizItem[] = []
  if (Array.isArray(cj.quiz)) quiz = cj.quiz as QuizItem[]
  else if (cj.question) quiz = [{ question: cj.question as string, options: cj.options as string[], correctIndex: cj.correctIndex as number, explanation: cj.explanation as string | undefined }]
  return { paragraphs, quiz }
}

/* ── Content slide ──────────────────────────────────────────── */
function ContentSlide({ text, paraIdx, paraTotal }: {
  text: string; paraIdx: number; paraTotal: number
}) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      {/* Badge */}
      <View style={styles.badge}>
        <View style={[styles.badgeIcon, { backgroundColor: "#f3f0ff" }]}>
          <Text style={{ fontSize: 18 }}>📖</Text>
        </View>
        <View>
          <Text style={[styles.badgeType, { color: "#7c3aed" }]}>Lectura</Text>
          <Text style={styles.badgeSub}>{paraIdx + 1} de {paraTotal} secciones</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotRow}>
        {Array.from({ length: paraTotal }).map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= paraIdx ? "#7c3aed" : "#e2e8f0" }]} />
        ))}
      </View>

      {/* Card */}
      <View style={styles.contentCard}>
        {sentences.length > 0 && (
          <Text style={styles.sentence1}>{sentences[0]}</Text>
        )}
        {sentences.length > 1 && (
          <Text style={styles.sentenceRest}>{sentences.slice(1).join(" ")}</Text>
        )}
      </View>

      {paraIdx === 0 && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: "700" }}>Tip:</Text> Lee con atención. Al finalizar vendrán preguntas de evaluación.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

/* ── Quiz slide ─────────────────────────────────────────────── */
function QuizSlide({ item, quizIdx, quizTotal, selected, onSelect, quizState, lives, shakeAnim }: {
  item: QuizItem; quizIdx: number; quizTotal: number
  selected: number | null; onSelect: (i: number) => void
  quizState: QuizState; lives: number
  shakeAnim: Animated.Value
}) {
  function optionBg(i: number) {
    if (quizState === "idle") {
      return selected === i ? "#faf5ff" : "#ffffff"
    }
    if (i === item.correctIndex) return "#f0fdf4"
    if (selected === i) return "#fef2f2"
    return "#ffffff"
  }
  function optionBorder(i: number) {
    if (quizState === "idle") return selected === i ? "#7c3aed" : "#e2e8f0"
    if (i === item.correctIndex) return "#22c55e"
    if (selected === i) return "#ef4444"
    return "#e2e8f0"
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      {/* Badge */}
      <View style={[styles.badge, { justifyContent: "space-between" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles.badgeIcon, { backgroundColor: "#fffbeb" }]}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </View>
          <View>
            <Text style={[styles.badgeType, { color: "#f59e0b" }]}>Evaluación</Text>
            <Text style={styles.badgeSub}>Pregunta {quizIdx + 1} de {quizTotal}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.25 }}>❤️</Text>
          ))}
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.dotRow}>
        {Array.from({ length: quizTotal }).map((_, i) => (
          <View key={i} style={[styles.dot, {
            backgroundColor: i < quizIdx ? "#22c55e" : i === quizIdx ? "#f59e0b" : "#e2e8f0",
          }]} />
        ))}
      </View>

      {/* Question card with shake */}
      <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.questionText}>{item.question}</Text>
      </Animated.View>

      {/* Options */}
      {item.options.map((opt, i) => (
        <Pressable
          key={i}
          onPress={() => quizState === "idle" && onSelect(i)}
          style={[styles.option, {
            backgroundColor: optionBg(i),
            borderColor: optionBorder(i),
            opacity: quizState !== "idle" && i !== item.correctIndex && i !== selected ? 0.45 : 1,
          }]}
        >
          <View style={[styles.letterBadge, {
            backgroundColor: quizState !== "idle" && i === item.correctIndex ? "#22c55e"
              : quizState !== "idle" && selected === i ? "#ef4444"
                : selected === i ? "#7c3aed" : "#f1f5f9",
          }]}>
            <Text style={[styles.letterText, {
              color: (quizState !== "idle" && (i === item.correctIndex || selected === i)) || selected === i
                ? "white" : "#64748b",
            }]}>
              {["A", "B", "C", "D"][i]}
            </Text>
          </View>
          <Text style={[styles.optionText, { color: optionBorder(i) === "#22c55e" ? "#15803d" : optionBorder(i) === "#ef4444" ? "#dc2626" : "#0f172a" }]}
            numberOfLines={3}>
            {opt}
          </Text>
          {quizState !== "idle" && i === item.correctIndex && (
            <Text style={{ fontSize: 16, marginLeft: 4 }}>✅</Text>
          )}
          {quizState !== "idle" && selected === i && i !== item.correctIndex && (
            <Text style={{ fontSize: 16, marginLeft: 4 }}>❌</Text>
          )}
        </Pressable>
      ))}

      {/* Explanation */}
      {quizState !== "idle" && item.explanation && (
        <View style={[styles.explanation, {
          backgroundColor: quizState === "correct" ? "#f0fdf4" : "#fef2f2",
          borderColor: quizState === "correct" ? "#bbf7d0" : "#fecaca",
        }]}>
          <Text style={[styles.explLabel, { color: quizState === "correct" ? "#15803d" : "#dc2626" }]}>
            {quizState === "correct" ? "✦ ¡Correcto!" : "✦ Respuesta incorrecta"}
          </Text>
          <Text style={[styles.explText, { color: quizState === "correct" ? "#16a34a" : "#ef4444" }]}>
            {item.explanation}
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

/* ── Celebration ─────────────────────────────────────────────── */
function CelebrationScreen({ xpReward, score, total, onRestart, onContinue }: {
  xpReward: number; score: number; total: number; onRestart: () => void; onContinue: () => void
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 100
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : 1

  return (
    <View style={styles.celebRoot}>
      <Text style={{ fontSize: 80, marginBottom: 8 }}>😺</Text>
      <Text style={styles.celebTitle}>
        {pct === 100 ? "¡Perfecto!" : pct >= 60 ? "¡Bien hecho!" : "¡Lección completada!"}
      </Text>
      {total > 0 && (
        <Text style={styles.celebSub}>{score} de {total} respuestas correctas</Text>
      )}
      {total > 0 && (
        <View style={styles.starsRow}>
          {[1, 2, 3].map((s) => (
            <Text key={s} style={{ fontSize: 40, opacity: s <= stars ? 1 : 0.2 }}>⭐</Text>
          ))}
        </View>
      )}
      <View style={styles.celebStats}>
        {total > 0 && (
          <View style={styles.celebStat}>
            <Text style={[styles.celebStatNum, { color: pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444" }]}>
              {pct}%
            </Text>
            <Text style={styles.celebStatLabel}>precisión</Text>
          </View>
        )}
        <View style={styles.celebStat}>
          <Text style={[styles.celebStatNum, { color: "#7c3aed" }]}>+{xpReward}</Text>
          <Text style={styles.celebStatLabel}>XP ganados</Text>
        </View>
      </View>
      <Pressable style={styles.celebBtn} onPress={onContinue}>
        <Text style={styles.celebBtnText}>Continuar →</Text>
      </Pressable>
      <Pressable style={styles.restartBtn} onPress={onRestart}>
        <Text style={styles.restartText}>Repetir lección</Text>
      </Pressable>
    </View>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const insets = useSafeAreaInsets()
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)

  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const shakeAnim = useRef(new Animated.Value(0)).current

  const fetchLesson = useCallback(async () => {
    try {
      const d = await apiRequest<LessonData>(`/api/mobile/lesson/${id}`, { token })
      setLesson(d)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { fetchLesson() }, [fetchLesson])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    )
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <Text style={{ color: "#94a3b8" }}>Lección no encontrada</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#7c3aed", fontWeight: "700" }}>Volver</Text>
        </Pressable>
      </View>
    )
  }

  const { paragraphs, quiz } = parseContent(lesson.contentJson)
  const steps: Step[] = [
    ...paragraphs.map((_, i): Step => ({ type: "content", idx: i })),
    ...quiz.map((_, i): Step => ({ type: "quiz", idx: i })),
  ]
  if (steps.length === 0) steps.push({ type: "content", idx: 0 })

  const currentStep = steps[stepIdx]
  const isLastStep = stepIdx === steps.length - 1

  function handleSelect(i: number) {
    if (quizState !== "idle") return
    setSelected(i)
    const correct = i === quiz[currentStep.idx].correctIndex
    setQuizState(correct ? "correct" : "wrong")
    if (correct) { setScore((s) => s + 1); setCombo((c) => c + 1) }
    else {
      setLives((l) => Math.max(0, l - 1))
      setCombo(0)
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start()
    }
  }

  async function handleContinue() {
    if (isLastStep) {
      if (!lesson!.alreadyCompleted && !saving) {
        setSaving(true)
        try {
          await apiRequest(`/api/mobile/lesson/${id}`, { method: "POST", token })
        } catch { /* silent */ }
        setSaving(false)
      }
      setDone(true)
      return
    }
    setStepIdx((s) => s + 1)
    setSelected(null)
    setQuizState("idle")
  }

  function handleRestart() {
    setStepIdx(0); setSelected(null); setQuizState("idle")
    setScore(0); setLives(3); setCombo(0); setDone(false)
  }

  if (done) {
    return (
      <CelebrationScreen
        xpReward={lesson.alreadyCompleted ? 0 : lesson.xpReward}
        score={score}
        total={quiz.length}
        onRestart={handleRestart}
        onContinue={() => router.replace("/(tabs)")}
      />
    )
  }

  const isContentStep = currentStep.type === "content"
  const showContinueBtn = isContentStep || (currentStep.type === "quiz" && quizState !== "idle")
  const showWaitBtn = currentStep.type === "quiz" && quizState === "idle" && selected === null
  const isGoToQuiz = isContentStep && steps[stepIdx + 1]?.type === "quiz"

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={{ fontSize: 16, color: "#64748b" }}>✕</Text>
        </Pressable>
        {/* Progress bar */}
        <View style={styles.progressBarWrap}>
          {steps.map((s, i) => (
            <View key={i} style={[styles.progressSeg, {
              backgroundColor: i < stepIdx ? "#22c55e"
                : i === stepIdx ? (s.type === "content" ? "#7c3aed" : "#f59e0b")
                  : "#e2e8f0",
            }]} />
          ))}
        </View>
        <View style={[styles.stepBadge, {
          backgroundColor: isContentStep ? "#f3f0ff" : "#fffbeb",
        }]}>
          <Text style={[styles.stepText, { color: isContentStep ? "#7c3aed" : "#d97706" }]}>
            {stepIdx + 1}/{steps.length}
          </Text>
        </View>
      </View>

      {/* Lesson title */}
      <View style={styles.titleBar}>
        <Text style={styles.lessonMeta}>Lección {lesson.lessonIndex + 1} de {lesson.totalLessons}</Text>
        <Text style={styles.lessonTitle} numberOfLines={1}>{lesson.title}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {isContentStep ? (
          <ContentSlide
            text={paragraphs[currentStep.idx] ?? ""}
            paraIdx={currentStep.idx}
            paraTotal={paragraphs.length}
          />
        ) : (
          <QuizSlide
            item={quiz[currentStep.idx]}
            quizIdx={currentStep.idx}
            quizTotal={quiz.length}
            selected={selected}
            onSelect={handleSelect}
            quizState={quizState}
            lives={lives}
            shakeAnim={shakeAnim}
          />
        )}
      </View>

      {/* Bottom feedback banner */}
      {currentStep.type === "quiz" && quizState !== "idle" ? (
        <View style={[styles.feedbackBar, {
          backgroundColor: quizState === "correct" ? "#f0fdf4" : "#fef2f2",
          borderTopColor: quizState === "correct" ? "#22c55e" : "#ef4444",
          paddingBottom: insets.bottom + 12,
        }]}>
          {quizState === "correct" && combo >= 3 && (
            <Text style={styles.comboText}>🔥 ¡Racha de {combo}! Sigue así</Text>
          )}
          <View style={styles.feedbackRow}>
            <View>
              <Text style={[styles.feedbackLabel, { color: quizState === "correct" ? "#15803d" : "#dc2626" }]}>
                {quizState === "correct" ? "¡Correcto!" : "Incorrecto"}
              </Text>
              <Text style={[styles.feedbackSub, { color: quizState === "correct" ? "#16a34a" : "#ef4444" }]}>
                {quizState === "correct" ? "¡Excelente razonamiento!" : "Revisa la explicación"}
              </Text>
            </View>
            <Pressable
              style={[styles.nextBtn, { backgroundColor: quizState === "correct" ? "#22c55e" : "#ef4444" }]}
              onPress={handleContinue}
            >
              <Text style={styles.nextBtnText}>{isLastStep ? "Finalizar" : "Siguiente →"}</Text>
            </Pressable>
          </View>
        </View>
      ) : showContinueBtn ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable style={[styles.continueBtn, saving && { opacity: 0.6 }]} onPress={handleContinue} disabled={saving}>
            <Text style={styles.continueBtnText}>
              {saving ? "Guardando..." : isLastStep ? "Finalizar lección" : isGoToQuiz ? "Ir a evaluación →" : "Continuar →"}
            </Text>
          </Pressable>
        </View>
      ) : showWaitBtn ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.waitBtn}>
            <Text style={styles.waitBtnText}>Selecciona una respuesta</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1.5,
    borderBottomColor: "#f1f5f9",
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center", alignItems: "center",
  },
  progressBarWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
    height: 8,
  },
  progressSeg: { flex: 1, borderRadius: 4 },
  stepBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  stepText: { fontSize: 12, fontWeight: "700" },
  titleBar: {
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  lessonMeta: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  lessonTitle: { fontSize: 14, fontWeight: "800", color: "#0f172a", marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  badgeIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  badgeType: { fontSize: 12, fontWeight: "700" },
  badgeSub: { fontSize: 10, color: "#94a3b8" },
  dotRow: { flexDirection: "row", gap: 4, marginBottom: 16 },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  contentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5, borderColor: "#ede9fe",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12,
  },
  sentence1: { fontSize: 16, fontWeight: "700", color: "#0f172a", lineHeight: 24, marginBottom: 10 },
  sentenceRest: { fontSize: 14, color: "#475569", lineHeight: 22 },
  tipBox: {
    backgroundColor: "#faf5ff",
    borderWidth: 1, borderColor: "#ede9fe",
    borderRadius: 14, padding: 14, marginTop: 14,
  },
  tipText: { fontSize: 13, color: "#7c3aed", lineHeight: 19 },
  questionCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#fde68a",
  },
  questionText: { fontSize: 15, fontWeight: "700", color: "#0f172a", textAlign: "center", lineHeight: 22 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 2.5, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10,
  },
  letterBadge: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  letterText: { fontSize: 12, fontWeight: "900" },
  optionText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  explanation: {
    borderWidth: 1.5, borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 12, marginTop: 4,
  },
  explLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  explText: { fontSize: 12, lineHeight: 18 },
  feedbackBar: {
    borderTopWidth: 2.5,
    paddingHorizontal: 20, paddingTop: 14,
  },
  comboText: { fontSize: 12, fontWeight: "800", color: "#ea580c", marginBottom: 8 },
  feedbackRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  feedbackLabel: { fontSize: 14, fontWeight: "900" },
  feedbackSub: { fontSize: 12, marginTop: 2 },
  nextBtn: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 14,
  },
  nextBtnText: { color: "white", fontSize: 14, fontWeight: "900" },
  bottomBar: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1.5, borderTopColor: "#f1f5f9",
  },
  continueBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 16, paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#5b21b6",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 4,
  },
  continueBtnText: { color: "white", fontSize: 15, fontWeight: "900" },
  waitBtn: {
    backgroundColor: "#e2e8f0",
    borderRadius: 16, paddingVertical: 16, alignItems: "center",
  },
  waitBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "700" },
  celebRoot: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: 32, backgroundColor: "#faf5ff",
  },
  celebTitle: { fontSize: 28, fontWeight: "900", color: "#0f172a", marginBottom: 6 },
  celebSub: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  starsRow: { flexDirection: "row", gap: 6, marginBottom: 20 },
  celebStats: { flexDirection: "row", gap: 12, marginBottom: 32 },
  celebStat: {
    backgroundColor: "#ffffff", borderWidth: 2, borderColor: "#ddd6fe",
    borderRadius: 16, paddingHorizontal: 24, paddingVertical: 16, alignItems: "center",
  },
  celebStatNum: { fontSize: 28, fontWeight: "900" },
  celebStatLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  celebBtn: {
    backgroundColor: "#7c3aed", borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 48,
    marginBottom: 12,
    shadowColor: "#5b21b6",
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 0,
    elevation: 4,
  },
  celebBtnText: { color: "white", fontSize: 16, fontWeight: "900" },
  restartBtn: {
    backgroundColor: "#f1f5f9", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  restartText: { color: "#475569", fontSize: 14, fontWeight: "600" },
})
