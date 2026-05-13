import { supabase } from "./supabase-client.js";

async function getAllLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to read leads:", error);
    return {};
  }

  const state = {};

  for (const lead of data || []) {
    state[lead.company] = {
      id: lead.id,
      status: lead.status,
      pipelineStage: lead.pipeline_stage,
      website: lead.website,
      phone: lead.phone,
      toEmail: lead.email,
      source: lead.source,
      replyStatus: lead.reply_status,
      latestReply: lead.latest_reply,
      followupCount: lead.followup_count,
      nextFollowupAt: lead.next_followup_at,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at
    };
  }

  return state;
}

async function getLeadByCompany(company) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("company", company)
    .maybeSingle();

  if (error) {
    console.error("Failed to read lead:", error);
    return null;
  }

  return data;
}

async function upsertLead(lead) {
  const { data, error } = await supabase
    .from("leads")
    .upsert(
      {
        company: lead.company,
        website: lead.website || null,
        phone: lead.phone || null,
        email: lead.email || null,
        source: lead.source || null,
        status: lead.status || "new",
        pipeline_stage: lead.pipelineStage || "new_lead",
        reply_status: lead.replyStatus || null,
        latest_reply: lead.latestReply || null,
        followup_count: lead.followupCount || 0,
        next_followup_at: lead.nextFollowupAt || null,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "company"
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to upsert lead:", error);
    return null;
  }

  return data;
}

export {
  getAllLeads,
  getLeadByCompany,
  upsertLead
};
