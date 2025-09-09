import { createClient } from '@supabase/supabase-js'

// ATENÇÃO: Substitua os valores abaixo pelos seus!
const supabaseUrl = 'https://symhidyfzvefhrnsloay.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bWhpZHlmenZlZmhybnNsb2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzM3MjgsImV4cCI6MjA3MjQwOTcyOH0.v1fdNe4AqMZ9Pxc2Bi2_1E0534bqt_rOKIYBTF19EHQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
