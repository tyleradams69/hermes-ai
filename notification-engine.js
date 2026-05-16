export function generateNotifications({
  recommendations = [],
}) {

  const notifications = [];

  for (const recommendation of recommendations) {

    // HIGH PRIORITY

    if (
      recommendation.priority ===
      "high"
    ) {

      notifications.push({
        notification_type:
          "high_priority_operational_alert",

        priority:
          "high",

        title:
          recommendation.title,

        message:
          recommendation.recommendation,

        delivery_channel:
          "dashboard",
      });
    }

    // MEDIUM PRIORITY

    if (
      recommendation.priority ===
      "medium"
    ) {

      notifications.push({
        notification_type:
          "operational_recommendation",

        priority:
          "medium",

        title:
          recommendation.title,

        message:
          recommendation.recommendation,

        delivery_channel:
          "dashboard",
      });
    }
  }

  return notifications;
}
