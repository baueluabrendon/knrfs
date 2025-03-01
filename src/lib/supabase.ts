
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase connection
const supabaseUrl = "https://mhndkefbyvxasvayigvx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1obmRrZWZieXZ4YXN2YXlpZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMDExODUsImV4cCI6MjA1Mjc3NzE4NX0.4J7F6LmEtTFPSrAae6sjIt2g96HeS8KKfiV7eH20vjM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
