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
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
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
