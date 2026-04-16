import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  isAuthReady: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)

  const withTimeout = async <T,>(promise: Promise<T>, label: string, timeoutMs = 5000) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(label)), timeoutMs)
        })
      ])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }

  const verifyAdminAccess = async (email: string) => {
    try {
      const { data, error } = await supabase!
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (error) {
        return { allowed: false, error: 'Não foi possível validar o acesso de administrador.' }
      }

      if (!data) {
        return { allowed: false, error: 'Acesso negado: este usuário não está cadastrado como administrador.' }
      }

      return { allowed: true }
    } catch {
      return { allowed: false, error: 'Não foi possível validar o acesso de administrador.' }
    }
  }

  const syncSession = async () => {
    try {
      if (!supabase) {
        setIsAuthenticated(false)
        return
      }

      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        'Timeout ao restaurar sessão'
      )

      if (!session?.user?.email) {
        setIsAuthenticated(false)
        return
      }

      const adminCheck = await withTimeout(
        verifyAdminAccess(session.user.email),
        'Timeout ao validar admin'
      )

      if (!adminCheck.allowed) {
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        return
      }

      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsAuthReady(true)
    }
  }

  useEffect(() => {
    void syncSession()

    if (!supabase) {
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user?.email) {
        setIsAuthenticated(false)
        return
      }

      const adminCheck = await withTimeout(
        verifyAdminAccess(session.user.email),
        'Timeout ao validar admin'
      )

      if (!adminCheck.allowed) {
        await supabase!.auth.signOut()
        setIsAuthenticated(false)
        return
      }

      setIsAuthenticated(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Supabase não está configurado neste ambiente.' }
    }

    try {
      const normalizedEmail = email.trim().toLowerCase()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      })

      if (authError) {
        return { success: false, error: authError.message || 'E-mail ou senha inválidos.' }
      }

      if (!data.session?.user?.email) {
        return { success: false, error: 'Login não retornou sessão válida. Verifique se o usuário está confirmado no Supabase.' }
      }

      const adminCheck = await verifyAdminAccess(data.session.user.email)

      if (!adminCheck.allowed) {
        await supabase!.auth.signOut()
        setIsAuthenticated(false)
        return { success: false, error: adminCheck.error }
      }

      setIsAuthenticated(true)
      return { success: true }
    } catch {
      return { success: false, error: 'Erro inesperado ao tentar conectar.' }
    }
  }

  const logout = async () => {
    if (!supabase) {
      setIsAuthenticated(false)
      sessionStorage.removeItem('popinfo_admin_access')
      return
    }

    await supabase.auth.signOut()
    setIsAuthenticated(false)
    sessionStorage.removeItem('popinfo_admin_access')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthReady, login, logout }}>
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
