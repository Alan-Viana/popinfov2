import React, { createContext, useContext, useEffect, useState } from 'react'
import { adminLogin } from '../api/admin'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('popinfo_admin_token')
    setIsAuthenticated(Boolean(token))
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    let result: Awaited<ReturnType<typeof adminLogin>>
    try {
      result = await adminLogin(email, password)
    } catch {
      return { success: false, error: 'Falha ao autenticar.' }
    }

    if (!result.ok) return { success: false, error: result.error }

    sessionStorage.setItem('popinfo_admin_token', result.token)
    setIsAuthenticated(true)
    return { success: true }
  }

  const logout = () => {
    sessionStorage.removeItem('popinfo_admin_token')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
