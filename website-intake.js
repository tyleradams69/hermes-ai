import { scoreLead } from "./lead-intelligence.js";

export function buildWebsiteLead({
  company,
  email,
  phone,
  website,
  message,
  business_id = "liminull",
}) {

  const lead = {
    company,
    email,
    phone,
    website,

    business_id,

    source:
      "website_inquiry",

    status:
      "new",

    pipeline_stage:
      "new_lead",

    latest_reply:
      message || "",

    reply_status:
      "website_inquiry",

    followup_count:
      0,
  };

  const intelligence =
    scoreLead(lead);

  return {
    ...lead,
    ...intelligence,
  };
}
