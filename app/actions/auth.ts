"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function getCurrentUser() {
  // Bail safely when Supabase env vars aren't set — treat as unauthenticated.
  // This is critical for server components that run before the project
  // has a real Supabase project provisioned.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return null;
  }

  let user;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    return null;
  }
  if (!user) return null;

  // Fetch the user's extended profile from the users table
  const { data: userRecord } = await supabase
    .from("users")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .maybeSingle();

  return {
    ...user,
    profile: userRecord ?? null
  };
}

export async function getOrganizationId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.profile?.organization_id ?? null;
}
