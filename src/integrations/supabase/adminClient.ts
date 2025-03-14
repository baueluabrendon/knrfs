
// This file contains a Supabase client with admin privileges
// IMPORTANT: This client should only be used in edge functions or server-side code
// NEVER expose this client to the client side as it has admin privileges

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mhndkefbyvxasvayigvx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obmRrZWZieXZ4YXN2YXlpZ3Z4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTA1Njc5OSwiZXhwIjoyMDU2NjMyNzk5fQ.lOfXOoJ5v91AuK9R6tXMV50Ncx--gnk-BPeLw3k3iok";

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
