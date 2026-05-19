# Supabase Backup / Restore Evidence

Use this document for each backup/restore drill. Copy it, fill it out, and store it with SOC 2 evidence.

## Drill metadata

- Date:
- Owner:
- Supabase project:
- Environment: Production / Staging / Other
- Backup source:
- Restore target:
- Ticket/change record:

## Pre-checks

- [ ] Confirmed restore will not overwrite production accidentally.
- [ ] Confirmed authorized approver.
- [ ] Confirmed backup timestamp selected.
- [ ] Confirmed secrets are not pasted into this evidence file.

## Restore execution

- Backup timestamp used:
- Restore method:
- Restore started at:
- Restore completed at:
- Operator:
- Reviewer:

## Validation performed

Record non-sensitive checks only.

- [ ] Application tables exist.
- [ ] Row counts look reasonable for sampled tables.
- [ ] RLS remains enabled on application tables.
- [ ] No direct broad anon/authenticated table access exists unless intentionally documented.
- [ ] Application smoke test passed against restore target.
- [ ] Audit log table exists and is queryable by authorized operator.

## Evidence captured

- Screenshot/export of backup configuration:
- Screenshot/export of restore completion:
- SQL output from `supabase/rls_audit.sql`:
- Smoke test output:

## Issues found

- Issue:
- Severity:
- Owner:
- Due date:
- Resolution:

## Approval

- Prepared by:
- Reviewed by:
- Review date:
