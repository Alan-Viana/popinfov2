import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://trrdtunzcyzzjyacyxxd.supabase.co'
const supabaseAnonKey = 'sb_publishable_D5xl4TJDqARZp9Q4Y1Zpgg_2uKcmZfX'

const isValidSupabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co')
  } catch {
    return false
  }
}

const isValidSupabaseKey = (key: string) => {
  return Boolean(key) && (key.startsWith('ey') || key.startsWith('sb_publishable_'))
}

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
  isValidSupabaseUrl(supabaseUrl) &&
  isValidSupabaseKey(supabaseAnonKey)

if (supabaseUrl && !isValidSupabaseUrl(supabaseUrl)) {
  console.warn('⚠️ VITE_SUPABASE_URL inválida. Deve ser no formato: https://<project-ref>.supabase.co')
}

if (supabaseAnonKey && !isValidSupabaseKey(supabaseAnonKey)) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY inválida. A chave deve ser um JWT (começa com "ey...")')
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseEnabled = () => !!supabase

