import { supabase } from "./supabase-client.js";

async function readActivity() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) {
    console.error("Failed to read activity:", error);
    return [];
  }

  return data || [];
}

async function logActivity(event) {
  const entry = {
    type: event.type,
    company: event.company || null,
    message: event.message,
    payload: event.payload || null
  };

  const { data, error } = await supabase
    .from("activities")
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error("Failed to log activity:", error);
    return entry;
  }

  return data;
}

export {
  readActivity,
  logActivity
};
