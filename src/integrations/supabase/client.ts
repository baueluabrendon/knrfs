
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables to configure the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mhndkefbyvxasvayigvx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obmRrZWZieXZ4YXN2YXlpZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMDExODUsImV4cCI6MjA1Mjc3NzE4NX0.4J7F6LmEtTFPSrAae6sjIt2g96HeS8KKfiV7eH20vjM";

// Create and export the supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
