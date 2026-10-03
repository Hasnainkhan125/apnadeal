// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emlwucoqzgvpelontklt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHd1Y29xemd2cGVsb250a2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMzAyNjIsImV4cCI6MjEwMzgwNjI2Mn0.qhfCvvG0WAObBJbWJzA36u6CmsnZDtotQVVpboWSph4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    experimental: {
      passkey: true,
    },
  },
});