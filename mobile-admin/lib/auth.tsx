import * as SecureStore from "expo-secure-store"
import { createContext, useContext, useEffect, useState } from "react"
import { registerAdminPushToken } from "./notifications"

type User = { name: string; tenantSlug: string; tenantName: string }

type AuthState = {
  token: string | null
  user: User | null
  isLoading: boolean
  login: (token: string, name: string, tenantSlug: string, tenantName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  token: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
})

const STORE_KEY = "admin_auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY)
      .then((raw) => {
        if (raw) {
          const data = JSON.parse(raw) as { token: string; name: string; tenantSlug: string; tenantName: string }
          setToken(data.token)
          setUser({ name: data.name, tenantSlug: data.tenantSlug, tenantName: data.tenantName })
          registerAdminPushToken(data.token)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(token: string, name: string, tenantSlug: string, tenantName: string) {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify({ token, name, tenantSlug, tenantName }))
    setToken(token)
    setUser({ name, tenantSlug, tenantName })
    registerAdminPushToken(token)
  }

  async function logout() {
    await SecureStore.deleteItemAsync(STORE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
