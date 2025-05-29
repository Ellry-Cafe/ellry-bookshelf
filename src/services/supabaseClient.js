import { createClient } from '@supabase/supabase-js'

console.log('Environment Variables:', {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY
})

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Environment variables are missing:
    REACT_APP_SUPABASE_URL: ${supabaseUrl ? 'present' : 'missing'}
    REACT_APP_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'present' : 'missing'}
  `)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
