# Hermes AI SOC 2 Readiness

Status: readiness baseline, not an attestation.
Owner: Liminull AI.
Scope: hermes-ai API, workers, Supabase data stores, outbound email/AI integrations.

## Important note
SOC 2 compliance requires audited company controls, evidence, and a CPA report. Code changes can make the product audit-ready, but they do not by themselves make Liminull AI SOC 2 compliant.

## Controls implemented in this repository

### Security
- API requests require `HERMES_API_TOKEN` through `x-hermes-token` or `Authorization: Bearer`.
- Token comparison uses constant-time comparison to reduce timing leakage.
- CORS is restricted through `HERMES_ALLOWED_ORIGINS` instead of accepting every origin.
- JSON request bodies are limited to 1 MB.
- Security headers are emitted on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - production HSTS.
- API rate limiting is enabled globally and separately for automation paths.
- Secrets are excluded from git and documented in `.env.example`.

### Availability
- Worker health, recovery, degraded-mode, monitoring, and operational-health engines are in scope.
- Request IDs are attached to responses with `X-Request-Id` for incident triage.

### Processing integrity
- Existing audit and rollback engines are in scope for privileged state changes.
- Automation safety checks should be required before any autonomous destructive or external-send action.

### Confidentiality / privacy
- Supabase service credentials must stay server-side only.
- Supabase service-role usage and RLS evidence requirements are documented in `docs/compliance/SUPABASE_SECURITY_REVIEW.md`.
- Prompt/lead/customer data should be treated as confidential business data.
- Logs must not include raw API tokens, passwords, or service-role keys.

## Required environment variables
See `.env.example`.

Production minimum:
- `NODE_ENV=production`
- `HERMES_API_TOKEN` generated with `openssl rand -hex 32`
- `HERMES_ALLOWED_ORIGINS` set to the production dashboard URL(s)
- Supabase service keys stored only in the deployment secret manager

## Evidence to retain for an auditor
- Git history for security control changes.
- `npm run security:audit` results for each release.
- `npm test` results covering API token and role authorization guards.
- Deployment secret configuration screenshots/export.
- Supabase RLS/table permission review.
- SQL evidence from `supabase/rls_audit.sql` for RLS and table grants.
- Backup/restore drill evidence using `docs/compliance/SUPABASE_BACKUP_RESTORE_EVIDENCE.md`.
- Incident logs and response records.
- Change approval records for production deployments.
- Backups/restore test evidence.
- Access review evidence for Supabase, Vercel/hosting, GitHub, Resend, OpenAI, and Mem0.

## Company-level SOC 2 evidence
Company-level SOC 2 controls and evidence requirements are tracked in `docs/compliance/COMPANY_SOC2_CONTROLS_CHECKLIST.md`.

Supabase RLS verification SQL is available in:
- `supabase/rls_audit.sql` for detailed evidence output.
- `docs/compliance/SUPABASE_RLS_VERIFICATION_SQL.md` for a short pass/fail summary query.

## Known gaps / next work
1. Verify every mutating endpoint calls `requireApiAuth`, `requireRole`, and `createAuditLog` where appropriate.
2. Add endpoint-level integration tests for CORS rejection, rate limiting, and audit-log insertion.
3. Run `supabase/rls_audit.sql` or the summary SQL in `docs/compliance/SUPABASE_RLS_VERIFICATION_SQL.md` in Supabase and retain the output as production evidence; run `supabase/rls_hardening.sql` first if RLS/table grants are not already locked down.
4. Execute the company-level evidence collection plan in `docs/compliance/COMPANY_SOC2_CONTROLS_CHECKLIST.md`.

## Automated security tests
- `test/security.test.js` covers API token authentication failures/successes and role allowlist behavior.
- Run with `npm test`.

## Vulnerability management notes
- `npm run security:audit` currently reports 0 vulnerabilities.
- `mem0ai` currently pins or peers older transitive packages, so `package.json` uses npm `overrides` to force patched versions of `axios`, `@qdrant/js-client-rest`, `undici`, `protobufjs`, and `ws`.
