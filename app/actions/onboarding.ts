"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface OnboardingPayload {
  businessName: string;
  phone?: string;
  monthlyAdBudget: number;
  primaryObjective: string;
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Use service client to bypass RLS for org creation
  const serviceClient = createServiceClient();

  // Create organization
  const { data: org, error: orgError } = await serviceClient
    .from("organizations")
    .insert({
      name: payload.businessName,
      monthly_ad_budget: payload.monthlyAdBudget,
      primary_objective: payload.primaryObjective
    })
    .select("id")
    .single();

  if (orgError) {
    throw new Error(`Failed to create organization: ${orgError.message}`);
  }

  // Link user to organization + update profile
  const { error: userError } = await serviceClient
    .from("users")
    .update({
      organization_id: org.id,
      phone: payload.phone ?? null,
      full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"
    })
    .eq("id", user.id);

  if (userError) {
    throw new Error(`Failed to update user: ${userError.message}`);
  }

  // Create a 14-day trial subscription
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  const { error: subError } = await serviceClient
    .from("subscriptions")
    .insert({
      organization_id: org.id,
      plan_code: "pro",
      status: "trialing",
      current_period_end: trialEnd.toISOString()
    });

  if (subError) {
    // Non-fatal: subscription can be created later
    console.error("Failed to create trial subscription:", subError);
  }

  revalidatePath("/dashboard");
  return { success: true, organizationId: org.id };
}
