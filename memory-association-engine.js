export function extractMemoryAssociations({
  memory,
  strategies = [],
}) {

  const associations = [];

  const summary =
    (memory?.summary || "").toLowerCase();

  const objections =
    (memory?.objections || "").toLowerCase();

  for (const strategy of strategies) {

    const category =
      (strategy.category || "").toLowerCase();

    // ONBOARDING ASSOCIATIONS

    if (
      (
        summary.includes("onboarding") ||
        objections.includes("onboarding")
      ) &&
      category.includes("onboarding")
    ) {

      associations.push({
        source_memory:
          "onboarding_concern",

        target_memory:
          category,

        association_strength:
          75,

        observation:
          "Onboarding concerns repeatedly associate with onboarding-related recovery strategies.",
      });
    }

    // URGENCY ASSOCIATIONS

    if (
      (
        summary.includes("quickly") ||
        summary.includes("urgent") ||
        summary.includes("responsive")
      ) &&
      category.includes("urgency")
    ) {

      associations.push({
        source_memory:
          "high_urgency_signal",

        target_memory:
          category,

        association_strength:
          82,

        observation:
          "Urgency-oriented language frequently associates with rapid-response conversion strategies.",
      });
    }
  }

  return associations;
}
