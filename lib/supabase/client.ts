import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv, formatEnvError } from "./env";

export function createClient() {
  const env = readSupabaseEnv();
  if (!env.ok) {
    throw new Error(formatEnvError(env));
  }
  return createBrowserClient(env.url, env.anonKey);
}
