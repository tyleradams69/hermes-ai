export function applySimulationPriority({
  predictiveInsights,
  simulations = [],
}) {

  const updated = {
    ...predictiveInsights,
  };

  if (!simulations.length) {
    return updated;
  }

  const topSimulation =
    [...simulations]
      .sort((a, b) => {
        const aScore =
          Number(a.confidence || 0) +
          Number(a.probability_delta || 0);

        const bScore =
          Number(b.confidence || 0) +
          Number(b.probability_delta || 0);

        return bScore - aScore;
      })[0];

  if (!topSimulation) {
    return updated;
  }

  updated.recommended_intervention =
    topSimulation.simulation_type
      .replaceAll("_", " ");

  updated.reasoning +=
    ` Simulation priority engine selected ${topSimulation.simulation_type} as highest-confidence intervention path.`;

  return updated;
}
