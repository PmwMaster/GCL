import { createClient } from '@supabase/supabase-js'

function sanitize(value: string | undefined): string {
  if (!value) return ''
  // Remove BOM, zero-width spaces, and any non-ASCII invisible characters
  return value.replace(/[^\x20-\x7E]/g, '').trim()
}

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase env vars missing!', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
