import { supabase } from "./supabase-client.js";

export async function loadRelevantStrategies({
  lead,
  classification,
}) {

  const { data, error } = await supabase
    .from("strategy_memory")
    .select("*")
    .order("adaptive_confidence", {
      ascending: false,
    })
    .limit(8);

  if (error) {
    console.error(error);
    return [];
  }

  const relevant = [];

  for (const item of data || []) {

    const category =
      (item.category || "").toLowerCase();

    const effectiveConfidence =
      item.adaptive_confidence || item.confidence || 50;

    if (effectiveConfidence < 45) {
      continue;
    }

    const objections =
      (lead?.memory?.objections || "").toLowerCase();

    const intent =
      (classification?.intent || "").toLowerCase();

    // onboarding relevance

    if (
      category.includes("onboarding") &&
      (
        objections.includes("onboarding") ||
        objections.includes("implementation")
      )
    ) {
      relevant.push(item);
      continue;
    }

    // meeting relevance

    if (
      category.includes("meeting") &&
      intent.includes("meeting")
    ) {
      relevant.push(item);
      continue;
    }

    // pricing relevance

    if (
      category.includes("pricing") &&
      intent.includes("pricing")
    ) {
      relevant.push(item);
      continue;
    }
  }

  return relevant;
}
