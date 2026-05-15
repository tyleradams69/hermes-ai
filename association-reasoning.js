export function applyAssociationReasoning({
  predictiveInsights,
  associations = [],
}) {
  const updated = {
    ...predictiveInsights,
  };

  const strongestAssociations =
    Object.values(
      associations.reduce((acc, association) => {
        const key =
          `${association.source_memory}:${association.target_memory}`;

        if (
          !acc[key] ||
          Number(association.association_strength || 0) >
            Number(acc[key].association_strength || 0)
        ) {
          acc[key] = association;
        }

        return acc;
      }, {})
    );

  const appliedTypes =
    new Set();

  for (const association of strongestAssociations) {
    const source =
      (association.source_memory || "").toLowerCase();

    const target =
      (association.target_memory || "").toLowerCase();

    const strength =
      Number(association.association_strength || 50);

    if (
      source.includes("onboarding") &&
      target.includes("onboarding") &&
      !appliedTypes.has("onboarding")
    ) {
      appliedTypes.add("onboarding");

      updated.recovery_probability =
        Math.min(
          100,
          updated.recovery_probability +
            Math.round(strength / 20)
        );

      updated.reasoning +=
        ` Associative reasoning strengthened onboarding recovery confidence from memory association strength ${strength}.`;
    }

    if (
      source.includes("urgency") &&
      target.includes("urgency") &&
      !appliedTypes.has("urgency")
    ) {
      appliedTypes.add("urgency");

      updated.close_probability =
        Math.min(
          100,
          updated.close_probability +
            Math.round(strength / 28)
        );

      updated.reasoning +=
        ` Associative reasoning strengthened urgency conversion confidence from association strength ${strength}.`;
    }
  }

  return updated;
}
