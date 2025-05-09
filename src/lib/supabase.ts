import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These environment variables should be defined in your .env file
// For local development: .env.local 
// For production: Set in your hosting platform (e.g., Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Using direct debug logging to help diagnose issues
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Create a mock client that won't crash the app if credentials are missing
const createMockClient = () => {
  console.warn('⚠️ Using mock Supabase client - database features will not work');
  return {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: null, error: new Error('Supabase not configured') }),
      maybeSingle: () => ({ data: null, error: new Error('Supabase not configured') })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: null, error: null, subscription: { unsubscribe: () => {} } }),
      signOut: () => Promise.resolve({ error: null })
    },
    rpc: () => ({})
  } as unknown as SupabaseClient;
};

// Export the appropriate client based on environment variables
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseAnonKey);

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
