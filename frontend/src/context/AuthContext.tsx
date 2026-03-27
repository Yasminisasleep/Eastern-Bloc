import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, userApi, clearToken, getToken } from '../api'

interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: (u: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (getToken()) {
      userApi.me()
        .then(setUser)
        .catch(() => { clearToken(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
