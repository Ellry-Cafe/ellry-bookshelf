import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://myvpezgmpricrxjnqtml.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15dnBlemdtcHJpY3J4am5xdG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTUzNzEsImV4cCI6MjA2MTY5MTM3MX0.g_MVcw3DsOfYZ5mmLH3Gc5dkcorXYhfVLu6VcPEKXZU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
