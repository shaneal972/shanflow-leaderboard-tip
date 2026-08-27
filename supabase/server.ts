import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.shandev.cloud';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createServerClient = () => {
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      db: { schema: 'tip' },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

export const supabaseServer = createServerClient();
