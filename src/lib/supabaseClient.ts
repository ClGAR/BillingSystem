import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function throwSupabaseConfigError(message: string): never {
  console.error(`[Supabase Config Error] ${message}`);
  throw new Error(message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throwSupabaseConfigError(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

let parsedSupabaseUrl: URL;
try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  throwSupabaseConfigError(
    "Invalid VITE_SUPABASE_URL. Use your project URL format: https://<project-ref>.supabase.co"
  );
}

if (parsedSupabaseUrl.hostname.includes("api.supabase.com")) {
  throwSupabaseConfigError(
    "Invalid VITE_SUPABASE_URL. Use your project REST URL (https://<project-ref>.supabase.co), not api.supabase.com."
  );
}

export const supabase = createClient(parsedSupabaseUrl.origin, supabaseAnonKey);
