import Constants from "expo-constants"

export function getApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl) return envUrl
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri ?? "localhost:8081"
    const ip = hostUri.split(":")[0]
    return `http://${ip}:3000`
  }
  return "https://knowledge.candidatic.com"
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<T> {
  const base = getApiBase()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`

  const res = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de red" }))
    throw new Error((err as { error: string }).error ?? "Error desconocido")
  }

  return res.json() as Promise<T>
}
