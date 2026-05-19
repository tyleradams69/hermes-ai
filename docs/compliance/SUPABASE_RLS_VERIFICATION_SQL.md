# Liminull AI Supabase SOC 2 RLS Verification Summary

Run this SQL in the Supabase SQL Editor after `supabase/rls_audit.sql` or instead of it when you want a short pass/fail summary.

Expected result for the current backend-only architecture:
- `missing_rls_count` should be `0`.
- `direct_anon_or_authenticated_table_grants_count` should be `0`.
- `direct_anon_or_authenticated_sequence_grants_count` should be `0`.
- `broad_policy_count` should ideally be `0`. If non-zero, review every row returned by the detailed policy query.

```sql
with app_tables(table_name) as (
  values
    ('activities'),
    ('assistant_conversations'),
    ('audit_logs'),
    ('brain_timeline_events'),
    ('business_settings'),
    ('businesses'),
    ('dead_letter_jobs'),
    ('executive_briefings'),
    ('followup_approvals'),
    ('global_strategy_patterns'),
    ('inbound_replies'),
    ('industry_profiles'),
    ('intervention_chains'),
    ('intervention_simulations'),
    ('job_queue'),
    ('lead_memory'),
    ('leads'),
    ('memory_associations'),
    ('notifications'),
    ('operational_health_metrics'),
    ('operator_actions'),
    ('operator_outcome_correlations'),
    ('prediction_outcomes'),
    ('predictive_acknowledgments'),
    ('predictive_insights'),
    ('proactive_recommendations'),
    ('rollback_snapshots'),
    ('runtime_optimization_weights'),
    ('strategy_memory'),
    ('system_failures'),
    ('system_modes'),
    ('temporal_behavior_patterns'),
    ('temporal_response_windows'),
    ('worker_heartbeats'),
    ('workflow_outcomes')
),
existing_app_tables as (
  select
    t.schemaname,
    t.tablename,
    t.rowsecurity,
    c.relforcerowsecurity
  from pg_tables t
  join app_tables a on a.table_name = t.tablename
  join pg_class c on c.relname = t.tablename
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
  where t.schemaname = 'public'
),
missing_rls as (
  select *
  from existing_app_tables
  where rowsecurity is not true
),
direct_table_grants as (
  select
    table_schema,
    table_name,
    grantee,
    privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee in ('anon', 'authenticated')
    and table_name in (select table_name from app_tables)
),
direct_sequence_grants as (
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
),
broad_policies as (
  select
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
  from pg_policies
  where schemaname = 'public'
    and tablename in (select table_name from app_tables)
    and (
      roles && array['anon'::name, 'authenticated'::name, 'public'::name]
      or qual in ('true', '(true)')
      or with_check in ('true', '(true)')
    )
)
select
  (select count(*) from app_tables) as expected_table_count,
  (select count(*) from existing_app_tables) as existing_table_count,
  (select count(*) from missing_rls) as missing_rls_count,
  (select count(*) from direct_table_grants) as direct_anon_or_authenticated_table_grants_count,
  (select count(*) from direct_sequence_grants) as direct_anon_or_authenticated_sequence_grants_count,
  (select count(*) from broad_policies) as broad_policy_count;

-- If any count above is non-zero, run these details queries and paste the results back for review.

with app_tables(table_name) as (
  values
    ('activities'), ('assistant_conversations'), ('audit_logs'), ('brain_timeline_events'),
    ('business_settings'), ('businesses'), ('dead_letter_jobs'), ('executive_briefings'),
    ('followup_approvals'), ('global_strategy_patterns'), ('inbound_replies'),
    ('industry_profiles'), ('intervention_chains'), ('intervention_simulations'), ('job_queue'),
    ('lead_memory'), ('leads'), ('memory_associations'), ('notifications'),
    ('operational_health_metrics'), ('operator_actions'), ('operator_outcome_correlations'),
    ('prediction_outcomes'), ('predictive_acknowledgments'), ('predictive_insights'),
    ('proactive_recommendations'), ('rollback_snapshots'), ('runtime_optimization_weights'),
    ('strategy_memory'), ('system_failures'), ('system_modes'), ('temporal_behavior_patterns'),
    ('temporal_response_windows'), ('worker_heartbeats'), ('workflow_outcomes')
)
select
  t.schemaname,
  t.tablename,
  t.rowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_tables t
join pg_class c on c.relname = t.tablename
join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
where t.schemaname = 'public'
  and t.tablename in (select table_name from app_tables)
order by t.tablename;

with app_tables(table_name) as (
  values
    ('activities'), ('assistant_conversations'), ('audit_logs'), ('brain_timeline_events'),
    ('business_settings'), ('businesses'), ('dead_letter_jobs'), ('executive_briefings'),
    ('followup_approvals'), ('global_strategy_patterns'), ('inbound_replies'),
    ('industry_profiles'), ('intervention_chains'), ('intervention_simulations'), ('job_queue'),
    ('lead_memory'), ('leads'), ('memory_associations'), ('notifications'),
    ('operational_health_metrics'), ('operator_actions'), ('operator_outcome_correlations'),
    ('prediction_outcomes'), ('predictive_acknowledgments'), ('predictive_insights'),
    ('proactive_recommendations'), ('rollback_snapshots'), ('runtime_optimization_weights'),
    ('strategy_memory'), ('system_failures'), ('system_modes'), ('temporal_behavior_patterns'),
    ('temporal_response_windows'), ('worker_heartbeats'), ('workflow_outcomes')
)
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and table_name in (select table_name from app_tables)
order by table_name, grantee, privilege_type;

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
```
