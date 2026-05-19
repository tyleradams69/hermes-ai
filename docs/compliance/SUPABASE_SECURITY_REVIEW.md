# Supabase Security Review

Status: code-level review and auditor evidence checklist. This is not proof that production RLS is enabled until the SQL checks below are run in the Supabase project.
Owner: Liminull AI
Scope: Hermes AI Supabase project, service-role access, RLS/table permissions, backup/restore evidence.

## Summary

The application uses Supabase only from the server-side `hermes-ai` backend through `supabase-client.js`.

Current code pattern:
- `SUPABASE_URL` is read server-side.
- `SUPABASE_SERVICE_ROLE_KEY` is read server-side.
- No `SUPABASE_ANON_KEY` usage was found in the code review.
- No Supabase client usage was found in `hermes-dashboard` browser code during the current SOC 2 readiness work.

SOC 2 interpretation:
- This is acceptable only if `SUPABASE_SERVICE_ROLE_KEY` remains server-side in Vercel/environment secrets and is never exposed to browser bundles, logs, screenshots, or client-side environment variables.
- Because the service-role key bypasses RLS, the API layer must enforce authorization, business scoping, validation, and audit logging.
- Supabase RLS should still be enabled on all application tables so accidental anon/authenticated direct access is denied.

## Tables referenced by the codebase

The following Supabase tables are referenced by `hermes-ai` source files:

- `activities`
- `assistant_conversations`
- `audit_logs`
- `brain_timeline_events`
- `business_settings`
- `businesses`
- `dead_letter_jobs`
- `executive_briefings`
- `followup_approvals`
- `global_strategy_patterns`
- `inbound_replies`
- `industry_profiles`
- `intervention_chains`
- `intervention_simulations`
- `job_queue`
- `lead_memory`
- `leads`
- `memory_associations`
- `notifications`
- `operational_health_metrics`
- `operator_actions`
- `operator_outcome_correlations`
- `prediction_outcomes`
- `predictive_acknowledgments`
- `predictive_insights`
- `proactive_recommendations`
- `rollback_snapshots`
- `runtime_optimization_weights`
- `strategy_memory`
- `system_failures`
- `system_modes`
- `temporal_behavior_patterns`
- `temporal_response_windows`
- `worker_heartbeats`
- `workflow_outcomes`

## Required production controls

### Secrets

- Store `SUPABASE_SERVICE_ROLE_KEY` only in the backend deployment secret manager for `hermes-ai`.
- Do not set `SUPABASE_SERVICE_ROLE_KEY` in `hermes-dashboard`.
- Do not create any `NEXT_PUBLIC_SUPABASE_*` variables unless the app intentionally adds browser-side Supabase access later.
- Rotate the service-role key if it was ever pasted into chat, committed to git, exposed in a browser bundle, or shared with an untrusted party.

### RLS / table permissions

Recommended baseline for the current architecture:
- Enable RLS on every application table.
- Do not create broad `anon` or `authenticated` policies.
- Revoke direct table permissions from `anon` and `authenticated`.
- Allow access only through the server-side API using the service-role key.

This means browser users cannot directly read/write Supabase even if they discover the Supabase project URL.

### API-layer enforcement

Because service-role bypasses RLS, the API layer remains the control point. For every sensitive endpoint:
- Require `requireApiAuth`.
- Require `requireRole` for operator/admin actions.
- Require `requireBusinessId` or otherwise scope by `business_id`.
- Create audit logs for mutating/high-risk actions.
- Avoid logging secrets, raw tokens, service keys, or full sensitive payloads.

Known gap from the current endpoint scan:
- Several API routes still appear to lack `requireApiAuth` and/or audit logging. This should be handled as the next backend hardening pass.

## Evidence to collect for SOC 2

Save these artifacts for each release or quarterly access review:

1. Supabase SQL output showing RLS enabled on all application tables.
2. Supabase SQL output showing no broad `anon`/`authenticated` policies on sensitive tables.
3. Supabase SQL output showing direct grants to `anon` and `authenticated` are revoked or intentionally limited.
4. Screenshot/export of Vercel env vars showing `SUPABASE_SERVICE_ROLE_KEY` exists only on `hermes-ai`, with the value hidden.
5. Evidence that `hermes-dashboard` does not define `NEXT_PUBLIC_SUPABASE_*` or `SUPABASE_SERVICE_ROLE_KEY`.
6. Backup configuration screenshot from Supabase.
7. Restore test evidence: date, backup selected, restore target, verifier, result, and any follow-up actions.
8. Access review evidence for Supabase users and API keys.

## SQL checks to run in Supabase SQL Editor

Use `supabase/rls_audit.sql` in this repo. Save the output as audit evidence.

## SQL hardening script

Use `supabase/rls_hardening.sql` in this repo as the recommended baseline. Review it before running in production.

## Backup / restore evidence template

Use `docs/compliance/SUPABASE_BACKUP_RESTORE_EVIDENCE.md` each time you perform a backup/restore drill.
