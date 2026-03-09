'use client'

import { supabase } from '@/infra/supabase/browser-client'
import { logger } from '@/infra/observability/logger'
import type { User, Session } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: unknown }>
  signIn: (email: string, password: string) => Promise<{ error: unknown }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: unknown }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialSession?: Session | null
  initialUser?: User | null
}

const createOrUpdateUserProfile = async (user: User) => {
  try {
    const { data: existingProfile } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle()

    if (!existingProfile) {
      // 创建新的用户配置
      await supabase.from('user_profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_plan: 'free',
      })
    }
  } catch (error) {
    logger.error({ error }, 'Create/update user profile failed')
  }
}

export function AuthProvider({ children, initialSession = null, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState(!(initialSession || initialUser))

  useEffect(() => {
    let isDestroyed = false

    const getInitialUser = async () => {
      if (initialSession || initialUser) return

      const { data, error } = await supabase.auth.getUser()
      const user = data?.user ?? null

      if (isDestroyed) {
        return
      }

      if (error) {
        logger.error({ error }, 'Get user failed')
      }

      setUser(user)
      setLoading(false)
    }

    getInitialUser()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isDestroyed) {
        return
      }

      setSession(session)

      // 先设置loading为false，确保页面可以正常渲染
      setLoading(false)

      if (event === 'SIGNED_OUT') {
        setUser(null)
        return
      }

      const { data } = await supabase.auth.getUser()
      const user = data?.user ?? null
      setUser(user)

      // 如果用户登录，在后台异步创建或更新用户配置，不影响loading状态
      if (event === 'SIGNED_IN' && user) {
        // 使用Promise.resolve().then()确保异步操作不会阻塞loading状态设置
        Promise.resolve().then(async () => {
          await createOrUpdateUserProfile(user)
        })
      }

    })

    return () => {
      isDestroyed = true
      subscription.unsubscribe()
    }
  }, [initialSession, initialUser])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
