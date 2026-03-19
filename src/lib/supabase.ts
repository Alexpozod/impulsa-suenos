import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sifnwcguzultacptmagp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZm53Y2d1enVsdGFjcHRtYWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTU4NjAsImV4cCI6MjA4OTA5MTg2MH0.zXmfsG3bDeQ0HR7QmGsP4EA3C2fFnsrEVrKdEiMklNA'

export const supabase = createClient(supabaseUrl, supabaseKey)