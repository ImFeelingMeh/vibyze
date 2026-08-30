import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for detached background work (e.g. the scan
 * runner), which executes after the triggering request has already returned
 * and can no longer rely on `next/headers` cookies(). Bypasses RLS — only use
 * for server-only jobs operating on rows already scoped to a known owner.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
