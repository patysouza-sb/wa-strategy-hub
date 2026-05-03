import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://nwxsuinlfyryojzrbhfm.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53eHN1aW5sZnlyeW9qenJiaGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjAzNzEsImV4cCI6MjA5MTY5NjM3MX0.bxK2ABi8Ytb_6uj0sJcBZddKCC8O4HS1BChMqF-qDSo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
