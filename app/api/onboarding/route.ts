import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "@/app/actions/onboarding";

/**
 * POST /api/onboarding
 *
 * Called by the onboarding form. Creates the org, links the user,
 * and sets up a 14-day trial subscription.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    const result = await completeOnboarding({
      businessName: body.businessName,
      phone: body.phone,
      monthlyAdBudget: body.monthlyAdBudget ?? 0,
      primaryObjective: body.primaryObjective ?? "conversions"
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
