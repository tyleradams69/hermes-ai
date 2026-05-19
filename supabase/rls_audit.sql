-- Supabase RLS / permission audit queries for Liminull AI Hermes.
-- Run this in the Supabase SQL Editor and save the results as SOC 2 evidence.

-- 1) Confirm row-level security is enabled on all application tables.
select
  t.schemaname,
  t.tablename,
  t.rowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_tables t
join pg_class c on c.relname = t.tablename
join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
where t.schemaname = 'public'
  and t.tablename in (
    'activities',
    'assistant_conversations',
    'audit_logs',
    'brain_timeline_events',
    'business_settings',
    'businesses',
    'dead_letter_jobs',
    'executive_briefings',
    'followup_approvals',
    'global_strategy_patterns',
    'inbound_replies',
    'industry_profiles',
    'intervention_chains',
    'intervention_simulations',
    'job_queue',
    'lead_memory',
    'leads',
    'memory_associations',
    'notifications',
    'operational_health_metrics',
    'operator_actions',
    'operator_outcome_correlations',
    'prediction_outcomes',
    'predictive_acknowledgments',
    'predictive_insights',
    'proactive_recommendations',
    'rollback_snapshots',
    'runtime_optimization_weights',
    'strategy_memory',
    'system_failures',
    'system_modes',
    'temporal_behavior_patterns',
    'temporal_response_windows',
    'worker_heartbeats',
    'workflow_outcomes'
  )
order by t.tablename;

-- 2) List policies on application tables. Review for overly broad anon/authenticated access.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'activities',
    'assistant_conversations',
    'audit_logs',
    'brain_timeline_events',
    'business_settings',
    'businesses',
    'dead_letter_jobs',
    'executive_briefings',
    'followup_approvals',
    'global_strategy_patterns',
    'inbound_replies',
    'industry_profiles',
    'intervention_chains',
    'intervention_simulations',
    'job_queue',
    'lead_memory',
    'leads',
    'memory_associations',
    'notifications',
    'operational_health_metrics',
    'operator_actions',
    'operator_outcome_correlations',
    'prediction_outcomes',
    'predictive_acknowledgments',
    'predictive_insights',
    'proactive_recommendations',
    'rollback_snapshots',
    'runtime_optimization_weights',
    'strategy_memory',
    'system_failures',
    'system_modes',
    'temporal_behavior_patterns',
    'temporal_response_windows',
    'worker_heartbeats',
    'workflow_outcomes'
  )
order by tablename, policyname;

-- 3) Check direct grants to anon/authenticated on application tables.
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (
    'activities',
    'assistant_conversations',
    'audit_logs',
    'brain_timeline_events',
    'business_settings',
    'businesses',
    'dead_letter_jobs',
    'executive_briefings',
    'followup_approvals',
    'global_strategy_patterns',
    'inbound_replies',
    'industry_profiles',
    'intervention_chains',
    'intervention_simulations',
    'job_queue',
    'lead_memory',
    'leads',
    'memory_associations',
    'notifications',
    'operational_health_metrics',
    'operator_actions',
    'operator_outcome_correlations',
    'prediction_outcomes',
    'predictive_acknowledgments',
    'predictive_insights',
    'proactive_recommendations',
    'rollback_snapshots',
    'runtime_optimization_weights',
    'strategy_memory',
    'system_failures',
    'system_modes',
    'temporal_behavior_patterns',
    'temporal_response_windows',
    'worker_heartbeats',
    'workflow_outcomes'
  )
order by table_name, grantee, privilege_type;

-- 4) Check sequence grants to anon/authenticated.
select
  n.nspname as sequence_schema,
  c.relname as sequence_name,
  r.rolname as grantee,
  p.privilege_type
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
cross join lateral aclexplode(coalesce(c.relacl, acldefault('S', c.relowner))) p
join pg_roles r on r.oid = p.grantee
where c.relkind = 'S'
  and n.nspname = 'public'
  and r.rolname in ('anon', 'authenticated')
order by sequence_name, grantee, privilege_type;
