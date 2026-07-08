"use server";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CurrentUserProfile } from "@/lib/auth/user-profile";

export interface CurrentUser {
  id: string;
  email?: string;
  profile: CurrentUserProfile | null;
}

/**
 * Inner implementation of getCurrentUser. Kept separate so cache() can
 * wrap it without TypeScript widening the return type.
 */
async function fetchCurrentUser(): Promise<CurrentUser | null> {
  // Bail safely when Supabase env vars aren't set — treat as unauthenticated.
  // This is critical for server components that run before the project
  // has a real Supabase project provisioned.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return null;
  }

  let authedUser;
  try {
    const result = await supabase.auth.getUser();
    authedUser = result.data.user;
  } catch {
    return null;
  }
  if (!authedUser) return null;

  // Fetch the user's extended profile from the public.users table (joined
  // with the parent organization for the sidebar business-switcher label).
  const { data: userRecord } = await supabase
    .from("users")
    .select("*, organizations(*)")
    .eq("id", authedUser.id)
    .maybeSingle();

  return {
    ...authedUser,
    profile: (userRecord as CurrentUserProfile | null) ?? null
  };
}

/**
 * Deduplicated within a single request so /layout and /page can both
 * fetch user metadata without hitting Supabase twice. cache() is safe
 * in "use server" files because each RSC render is a fresh request
 * lifecycle.
 *
 * Use the unwrapped `fetchCurrentUser` for tests / non-request contexts.
 */
export const getCurrentUser = cache(fetchCurrentUser);

/**
 * Sign out and redirect to /login so the user understands they need
 * to authenticate again. Used by the sidebar <form action={signOut}>.
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login");
}
