export function applyUrgencyDecay({
  lead,
  predictiveInsights,
}) {

  const updated = {
    ...predictiveInsights,
  };

  if (!lead?.updated_at) {
    return updated;
  }

  const updatedAt =
    new Date(lead.updated_at).getTime();

  const now =
    Date.now();

  const hoursInactive =
    predictiveInsights.test_hours_inactive ??
    (now - updatedAt) / (1000 * 60 * 60);

  // 2H DECAY

  if (hoursInactive >= 2) {

    updated.close_probability =
      Math.max(
        0,
        updated.close_probability - 4
      );

    updated.reasoning +=
      ` Urgency decay slightly reduced close probability after ${Math.round(hoursInactive)}h inactivity.`;
  }

  // 24H DECAY

  if (hoursInactive >= 24) {

    updated.stale_risk =
      Math.min(
        100,
        updated.stale_risk + 12
      );

    updated.reasoning +=
      ` Temporal inactivity significantly increased stale risk after 24h.`;
  }

  // 48H DECAY

  if (hoursInactive >= 48) {

    updated.stale_risk =
      Math.min(
        100,
        updated.stale_risk + 20
      );

    updated.close_probability =
      Math.max(
        0,
        updated.close_probability - 10
      );

    updated.reasoning +=
      ` Long inactivity window triggered major urgency decay after 48h.`;
  }

  return updated;
}
