"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client, used only to run the Google OAuth handshake.
 *
 * Identity still lives in the Worker: what Supabase hands back is exchanged for
 * the maison's own session, so orders, roles and the admin panel keep reading
 * one users table. detectSessionInUrl is off because the callback page performs
 * the code exchange itself — leaving both to race produces an "invalid code"
 * error that is impossible to reproduce reliably.
 */
let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  client ??= createClient(url, anonKey, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: false
    }
  });

  return client;
}

export const isGoogleSignInConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
