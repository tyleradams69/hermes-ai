-- Supabase RLS hardening baseline for Liminull AI Hermes.
-- Review before running in production.
-- This baseline assumes the current architecture: browser -> hermes-dashboard -> hermes-ai -> Supabase service role.
-- The service_role key bypasses RLS, so anon/authenticated users should not need direct table access.

begin;

-- Enable RLS on all application tables.
alter table if exists public.activities enable row level security;
alter table if exists public.assistant_conversations enable row level security;
alter table if exists public.audit_logs enable row level security;
alter table if exists public.brain_timeline_events enable row level security;
alter table if exists public.business_settings enable row level security;
alter table if exists public.businesses enable row level security;
alter table if exists public.dead_letter_jobs enable row level security;
alter table if exists public.executive_briefings enable row level security;
alter table if exists public.followup_approvals enable row level security;
alter table if exists public.global_strategy_patterns enable row level security;
alter table if exists public.inbound_replies enable row level security;
alter table if exists public.industry_profiles enable row level security;
alter table if exists public.intervention_chains enable row level security;
alter table if exists public.intervention_simulations enable row level security;
alter table if exists public.job_queue enable row level security;
alter table if exists public.lead_memory enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.memory_associations enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.operational_health_metrics enable row level security;
alter table if exists public.operator_actions enable row level security;
alter table if exists public.operator_outcome_correlations enable row level security;
alter table if exists public.prediction_outcomes enable row level security;
alter table if exists public.predictive_acknowledgments enable row level security;
alter table if exists public.predictive_insights enable row level security;
alter table if exists public.proactive_recommendations enable row level security;
alter table if exists public.rollback_snapshots enable row level security;
alter table if exists public.runtime_optimization_weights enable row level security;
alter table if exists public.strategy_memory enable row level security;
alter table if exists public.system_failures enable row level security;
alter table if exists public.system_modes enable row level security;
alter table if exists public.temporal_behavior_patterns enable row level security;
alter table if exists public.temporal_response_windows enable row level security;
alter table if exists public.worker_heartbeats enable row level security;
alter table if exists public.workflow_outcomes enable row level security;

-- Revoke direct table access from browser/client roles.
revoke all on table
  public.activities,
  public.assistant_conversations,
  public.audit_logs,
  public.brain_timeline_events,
  public.business_settings,
  public.businesses,
  public.dead_letter_jobs,
  public.executive_briefings,
  public.followup_approvals,
  public.global_strategy_patterns,
  public.inbound_replies,
  public.industry_profiles,
  public.intervention_chains,
  public.intervention_simulations,
  public.job_queue,
  public.lead_memory,
  public.leads,
  public.memory_associations,
  public.notifications,
  public.operational_health_metrics,
  public.operator_actions,
  public.operator_outcome_correlations,
  public.prediction_outcomes,
  public.predictive_acknowledgments,
  public.predictive_insights,
  public.proactive_recommendations,
  public.rollback_snapshots,
  public.runtime_optimization_weights,
  public.strategy_memory,
  public.system_failures,
  public.system_modes,
  public.temporal_behavior_patterns,
  public.temporal_response_windows,
  public.worker_heartbeats,
  public.workflow_outcomes
from anon, authenticated;

-- Revoke sequence access from browser/client roles.
revoke all on all sequences in schema public from anon, authenticated;

commit;

-- After running, execute supabase/rls_audit.sql and save the output.
