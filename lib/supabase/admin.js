import { createClient } from "@supabase/supabase-js";

// Full-access client. SERVER ONLY: it uses the secret service role key.
// Every route that uses it must check who is asking first.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
