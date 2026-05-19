# Supabase RLS Verification Evidence

Date: 2026-05-19
System: Liminull AI Hermes Supabase project
Scope: public application tables used by hermes-ai

## Verification result

The Supabase RLS hardening SQL was run successfully, then the verification SQL was re-run in Supabase SQL Editor.

Result row:

| Metric | Value |
| --- | ---: |
| expected_table_count | 35 |
| existing_table_count | 35 |
| missing_rls_count | 0 |
| direct_anon_or_authenticated_table_grants_count | 0 |
| direct_anon_or_authenticated_sequence_grants_count | 0 |
| broad_policy_count | 0 |

## Interpretation

- All 35 expected application tables exist.
- RLS is enabled on all 35 application tables.
- No direct table grants remain for `anon` or `authenticated` roles on the app tables.
- No direct sequence grants are present for `anon` or `authenticated` roles.
- No broad RLS policies were detected.

## SOC 2 evidence note

Save the Supabase SQL Editor result screenshot alongside this file in the SOC 2 evidence folder under:

`SOC2/11_product_security_evidence/supabase_rls/`

This is product security evidence supporting least privilege and confidentiality controls for the current backend-only data access architecture:

browser -> hermes-dashboard -> hermes-ai -> Supabase service role
