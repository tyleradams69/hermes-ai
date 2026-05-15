export function applyChainPriority({
  predictiveInsights,
  chains = [],
}) {
  const updated = {
    ...predictiveInsights,
  };

  if (!chains.length) {
    return updated;
  }

  const topChain =
    [...chains].sort((a, b) => {
      const aScore =
        Number(a.confidence || 0) +
        Number(a.cumulative_probability_delta || 0) +
        Number(a.cumulative_risk_reduction || 0) +
        Number(a.adaptive_strength || 0);

      const bScore =
        Number(b.confidence || 0) +
        Number(b.cumulative_probability_delta || 0) +
        Number(b.cumulative_risk_reduction || 0) +
        Number(b.adaptive_strength || 0);

      return bScore - aScore;
    })[0];

  if (!topChain) {
    return updated;
  }

  updated.recommended_intervention =
    topChain.chain_name.replaceAll("_", " ");

  updated.reasoning +=
    ` Chain priority engine selected ${topChain.chain_name} as highest-confidence multi-step intervention plan.`;

  return updated;
}
