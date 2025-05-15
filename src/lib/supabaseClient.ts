import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables or use defaults for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export this singleton instance to be used throughout the application
// This prevents multiple GoTrueClient instances warning
