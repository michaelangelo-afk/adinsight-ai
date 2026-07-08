// app/actions/recommendations.ts
//
// Phase 3.1 recommendations update — Apply / Mark done / Dismiss buttons.
//
// updateRecommendationStatus returns Promise<void> because the React
// form-action signature is `(formData) => void | Promise<void>`. We
// surface every meaningful outcome via the meta_action_msg flash cookie
// that the dashboard's MetaActionToast reads on render.

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setMetaActionMsg } from "@/lib/action-msg";

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export type RecommendationStatusUpdate = "applied" | "dismissed";

/**
 * Bindable form action. Called via:
 *   <form action={updateRecommendationStatus.bind(null, r.id, "applied")}>
 *
 * Sets a meta_action_msg flash cookie on success/failure and revalidates
 * /dashboard so the auto-refresh tick picks up the new recommendation
 * status without a full re-navigation.
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  newStatus: RecommendationStatusUpdate,
  _formData: FormData
): Promise<void> {
  if (USE_MOCK) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success(
        newStatus === "applied" ? "Recommendation applied." : "Recommendation dismissed."
      ),
      { httpOnly: false, sameSite: "lax", maxAge: 30, path: "/" }
    );
    revalidatePath("/dashboard");
    return;
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error("Sign in to update recommendations."),
      { httpOnly: false, sameSite: "lax", maxAge: 30, path: "/" }
    );
    revalidatePath("/dashboard");
    return;
  }

  // RLS scopes the recommendation to the caller's org. count=exact
  // surfaces a 0-row update as an error so per-row tampering (e.g. an
  // attacker submitting another user's id) is rejected.
  const { error, count } = await supabase
    .from("recommendations")
    .update(
      {
        status: newStatus,
        updated_at: new Date().toISOString()
      },
      { count: "exact" }
    )
    .eq("id", recommendationId);

  if (error || count === 0) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error(
        error?.message ?? "Recommendation not found or you don't have permission."
      ),
      { httpOnly: false, sameSite: "lax", maxAge: 30, path: "/" }
    );
  } else {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success(
        newStatus === "applied" ? "Recommendation applied." : "Recommendation dismissed."
      ),
      { httpOnly: false, sameSite: "lax", maxAge: 30, path: "/" }
    );
  }
  revalidatePath("/dashboard");
}
