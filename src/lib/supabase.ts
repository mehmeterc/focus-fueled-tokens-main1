import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These environment variables should be defined in your .env file
// For local development: .env or .env.local 
// For production: Set in your hosting platform (e.g., Vercel)

// Hard-code the values from your .env file
// This ensures they work even if env variables aren't loading properly
const supabaseUrl = "https://iltugsdldumdoszdxfmz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdHVnc2RsZHVtZG9zemR4Zm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjIwMTQsImV4cCI6MjA2MjA5ODAxNH0.FcMMxgCyPKS31JYXr5d7knkV6GRpJj_nw2JWUAeo7GI";

// Verify we have the necessary credentials
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// Create a more robust mock client that properly supports method chaining
const createMockClient = () => {
  console.warn('⚠️ Using mock Supabase client - database features will not work');
  
  // Create a mock query builder with chainable methods
  const createMockQueryBuilder = () => {
    const mockQueryBuilder: any = {
      select: () => mockQueryBuilder,
      insert: () => mockQueryBuilder,
      update: () => mockQueryBuilder,
      delete: () => mockQueryBuilder,
      upsert: () => mockQueryBuilder,
      match: () => mockQueryBuilder,
      eq: () => mockQueryBuilder,
      neq: () => mockQueryBuilder,
      gt: () => mockQueryBuilder,
      lt: () => mockQueryBuilder,
      gte: () => mockQueryBuilder,
      lte: () => mockQueryBuilder,
      like: () => mockQueryBuilder,
      ilike: () => mockQueryBuilder,
      is: () => mockQueryBuilder,
      in: () => mockQueryBuilder,
      contains: () => mockQueryBuilder,
      containedBy: () => mockQueryBuilder,
      rangeLt: () => mockQueryBuilder,
      rangeGt: () => mockQueryBuilder,
      rangeGte: () => mockQueryBuilder,
      rangeLte: () => mockQueryBuilder,
      overlaps: () => mockQueryBuilder,
      textSearch: () => mockQueryBuilder,
      filter: () => mockQueryBuilder,
      not: () => mockQueryBuilder,
      or: () => mockQueryBuilder,
      and: () => mockQueryBuilder,
      order: () => mockQueryBuilder,
      limit: () => mockQueryBuilder,
      range: () => mockQueryBuilder,
      single: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null }),
      then: (callback: any) => {
        callback({ data: [], error: null });
        return Promise.resolve({ data: [], error: null });
      }
    };
    return mockQueryBuilder;
  };
  
  return {
    from: () => createMockQueryBuilder(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        // Immediately trigger with a fake session to ensure UI works
        callback('SIGNED_IN', {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'mock@example.com',
            }
          }
        });
        return { data: null, error: null, subscription: { unsubscribe: () => {} } };
      },
      signOut: () => Promise.resolve({ error: null })
    },
    rpc: () => createMockQueryBuilder()
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
