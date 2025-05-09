import { createClient } from '@supabase/supabase-js';

// These environment variables should be defined in your .env file
// For local development: .env.local
// For production: Set in your hosting platform (e.g., Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Features requiring database access will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for your database tables
export type EventRegistration = {
  id: string;
  user_id: string;
  event_id: string;
  registration_date: string;
  created_at?: string;
};

export type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  anti_coin_balance: number;
  created_at?: string;
};
