# Liminull AI Company SOC 2 Controls Checklist

Status: readiness checklist, not an attestation.
Owner: Liminull AI.
Prepared: 2026-05-19.
Scope: Liminull AI operating controls supporting hermes-ai and hermes-dashboard.

## Important note

SOC 2 compliance requires a CPA/auditor to test operating controls over time. This checklist is the company-level evidence plan needed in addition to product hardening in the repositories.

Use this file as the master checklist for the evidence folder. For each item, save screenshots, exports, tickets, meeting notes, or policy documents in the evidence location listed below.

## Suggested evidence folder structure

Create a private folder in Google Drive, Notion, or your audit platform:

- SOC2/
  - 00_scope_and_system_description/
  - 01_policies/
  - 02_access_reviews/
  - 03_change_management/
  - 04_vendor_management/
  - 05_incident_response/
  - 06_risk_assessment/
  - 07_vulnerability_management/
  - 08_backup_and_disaster_recovery/
  - 09_monitoring_and_availability/
  - 10_security_awareness/
  - 11_product_security_evidence/

## Control checklist

### 1. Scope and system description

Purpose: define what the audit covers.

Required evidence:
- [ ] System description for Liminull AI, hermes-ai, hermes-dashboard, Supabase, hosting, email, AI providers, and monitoring.
- [ ] Data flow diagram showing browser -> hermes-dashboard -> hermes-ai -> Supabase / vendors.
- [ ] Production environment inventory.
- [ ] Trust services categories selected for audit, usually Security first, optionally Availability and Confidentiality.
- [ ] List of in-scope users/admins/operators.

Evidence location:
- `SOC2/00_scope_and_system_description/`

Owner:
- Founder / engineering owner.

Cadence:
- Update on architecture changes and before audit kickoff.

### 2. Written security policies

Purpose: auditors expect formal policies that match actual practice.

Required policies:
- [ ] Access Control Policy.
- [ ] Information Security Policy.
- [ ] Change Management Policy.
- [ ] Incident Response Policy.
- [ ] Vendor Management Policy.
- [ ] Risk Management Policy.
- [ ] Vulnerability Management Policy.
- [ ] Backup and Disaster Recovery Policy.
- [ ] Data Classification / Confidentiality Policy.
- [ ] Acceptable Use Policy.

Evidence location:
- `SOC2/01_policies/`

Owner:
- Founder / security owner.

Cadence:
- Review at least annually and after major process changes.

Minimum reviewer evidence:
- policy title
- version/date
- approver
- approval date
- next review date

### 3. Access control and access reviews

Purpose: prove least privilege and timely removal of access.

Systems to review:
- [ ] GitHub repositories and organization members.
- [ ] Supabase project users, API keys, database roles, RLS posture.
- [ ] Hosting provider / Vercel / Render / Railway / Fly / cloud provider.
- [ ] DNS / domain registrar.
- [ ] Email provider such as Resend / Gmail / Workspace.
- [ ] AI vendors such as OpenAI, Anthropic, Mem0, Qdrant, etc.
- [ ] Monitoring/logging providers.
- [ ] Password manager.
- [ ] Audit evidence storage location.

Required evidence:
- [ ] User access export or screenshots for every system above.
- [ ] Quarterly access review worksheet with keep/remove decisions.
- [ ] Record of admin/MFA status.
- [ ] Offboarding checklist for removed users.
- [ ] Secret rotation log for high-risk keys.

Evidence location:
- `SOC2/02_access_reviews/YYYY-Q#/`

Owner:
- Founder / engineering owner.

Cadence:
- Quarterly.

Acceptance criteria:
- No shared admin accounts unless documented with compensating controls.
- MFA enabled where supported.
- Production secrets stored only in a secret manager or deployment platform env vars, not in git or local docs.

### 4. Change management

Purpose: prove production changes are reviewed, tested, and traceable.

Required evidence:
- [ ] Git commits / PRs for production changes.
- [ ] Test output for each release: backend tests, dashboard tests, dependency audit.
- [ ] Deployment record from hosting provider.
- [ ] Change approval note, PR approval, or release checklist.
- [ ] Rollback plan for high-risk changes.

Evidence location:
- `SOC2/03_change_management/YYYY-MM/`

Owner:
- Engineering owner.

Cadence:
- Every production release.

Minimum release evidence template:
- release date
- change summary
- linked PR/commit
- tests run
- security audit output
- approver
- deploy URL/build ID
- rollback path

### 5. Vendor management

Purpose: prove third parties are reviewed before handling production/customer data.

Vendor inventory fields:
- vendor name
- service purpose
- data shared
- data sensitivity
- owner
- SOC 2 / ISO report available? yes/no
- DPA in place? yes/no/not needed
- risk rating: low/medium/high
- review date
- next review date

Initial vendor list to populate:
- [ ] Supabase.
- [ ] GitHub.
- [ ] Hosting provider.
- [ ] Domain/DNS provider.
- [ ] Email provider.
- [ ] OpenAI / Anthropic / AI model providers.
- [ ] Mem0 / vector or memory provider if used in production.
- [ ] Qdrant if used in production.
- [ ] Monitoring/logging/analytics providers.
- [ ] Google Workspace / document storage.

Required evidence:
- [ ] Vendor inventory spreadsheet.
- [ ] SOC 2 reports or security pages for critical vendors.
- [ ] Risk acceptance notes for vendors without SOC 2.
- [ ] DPA/privacy agreement status when customer personal data is processed.

Evidence location:
- `SOC2/04_vendor_management/`

Owner:
- Founder / operations owner.

Cadence:
- Before adding a critical vendor and annually thereafter.

### 6. Incident response

Purpose: prove security incidents can be detected, triaged, communicated, and learned from.

Required evidence:
- [ ] Incident Response Policy.
- [ ] Incident severity definitions.
- [ ] Contact list and escalation path.
- [ ] Incident ticket/postmortem template.
- [ ] At least one tabletop exercise record.
- [ ] Actual incident records, if any.

Evidence location:
- `SOC2/05_incident_response/`

Owner:
- Security owner.

Cadence:
- Tabletop at least annually; incidents documented as they occur.

Incident record minimum fields:
- detection time
- reporter
- severity
- affected systems/data
- containment steps
- eradication/recovery steps
- customer notification decision
- root cause
- corrective actions
- closure approver

### 7. Risk assessment

Purpose: prove the company periodically identifies and treats security risks.

Required evidence:
- [ ] Risk register.
- [ ] Risk scoring method.
- [ ] Top risks and mitigation owners.
- [ ] Risk acceptance records where not remediated.
- [ ] Follow-up review notes.

Evidence location:
- `SOC2/06_risk_assessment/`

Owner:
- Founder / security owner.

Cadence:
- Quarterly during early-stage buildout, then at least annually.

Initial risks to track:
- [ ] Supabase service-role key compromise.
- [ ] Browser-exposed secrets or accidental `NEXT_PUBLIC_*` token exposure.
- [ ] Missing production access review.
- [ ] Missing backup restore evidence.
- [ ] Vendor processing of customer/lead data.
- [ ] Lack of centralized production monitoring/alerting.
- [ ] Single-founder/admin dependency.

### 8. Vulnerability management

Purpose: prove vulnerabilities are detected and remediated on a schedule.

Required evidence:
- [ ] Dependency audit output for hermes-ai.
- [ ] Dependency audit output for hermes-dashboard.
- [ ] GitHub Dependabot or equivalent alerts screenshot/export.
- [ ] Remediation tickets/PRs for high/moderate findings.
- [ ] Exception/risk acceptance notes for vulnerabilities that cannot be immediately fixed.

Evidence location:
- `SOC2/07_vulnerability_management/YYYY-MM/`

Owner:
- Engineering owner.

Cadence:
- At least monthly and before each production release.

Severity targets:
- Critical: fix or mitigate immediately.
- High: fix within 7 days.
- Moderate: fix within 30 days.
- Low: fix in normal maintenance or document acceptance.

### 9. Backup and disaster recovery

Purpose: prove production data can be restored.

Required evidence:
- [ ] Backup policy.
- [ ] Supabase backup settings screenshot/export.
- [ ] Restore drill evidence using `docs/compliance/SUPABASE_BACKUP_RESTORE_EVIDENCE.md`.
- [ ] Recovery Time Objective (RTO) and Recovery Point Objective (RPO).
- [ ] Disaster recovery contact/decision path.

Evidence location:
- `SOC2/08_backup_and_disaster_recovery/`

Owner:
- Engineering owner.

Cadence:
- Restore test at least quarterly for SOC 2 readiness.

### 10. Monitoring and availability

Purpose: prove production issues are detected and handled.

Required evidence:
- [ ] Uptime monitor configuration.
- [ ] API health check endpoint evidence.
- [ ] Dashboard availability evidence.
- [ ] Alert routing configuration.
- [ ] Monthly uptime/incident review.
- [ ] Logs showing request IDs or correlation IDs.

Evidence location:
- `SOC2/09_monitoring_and_availability/YYYY-MM/`

Owner:
- Engineering owner.

Cadence:
- Continuous monitoring; monthly evidence snapshot.

### 11. Security awareness

Purpose: prove people with system access understand security responsibilities.

Required evidence:
- [ ] Security awareness training record for every in-scope user.
- [ ] Acknowledgment of security policies.
- [ ] Acceptable use acknowledgment.
- [ ] Phishing/credential-handling guidance if employees/contractors are added.

Evidence location:
- `SOC2/10_security_awareness/`

Owner:
- Founder / operations owner.

Cadence:
- Onboarding and annually.

### 12. Product security evidence

Purpose: connect repository hardening work to SOC 2 controls.

Required evidence from hermes-ai:
- [ ] `docs/compliance/SOC2_READINESS.md`.
- [ ] `docs/compliance/SUPABASE_SECURITY_REVIEW.md`.
- [ ] `supabase/rls_audit.sql` output.
- [ ] `supabase/rls_hardening.sql` output if run.
- [ ] `npm test` output.
- [ ] `npm run security:audit` output.

Required evidence from hermes-dashboard:
- [ ] `docs/compliance/SOC2_READINESS.md`.
- [ ] `npm test` output.
- [ ] `npm run security:audit` output.
- [ ] `npm run build` output.
- [ ] Production response security header screenshot/export.

Evidence location:
- `SOC2/11_product_security_evidence/`

Owner:
- Engineering owner.

Cadence:
- Every major release and before audit evidence collection.

## First 7-day action plan

Day 1:
- [ ] Create private SOC2 evidence folder using the structure above.
- [ ] Save this checklist into the evidence folder.
- [ ] Decide audit scope and trust service categories.

Day 2:
- [ ] Export/screenshot access lists for GitHub, Supabase, hosting, DNS, email, AI vendors, and monitoring.
- [ ] Remove stale users and require MFA where supported.

Day 3:
- [ ] Run the Supabase RLS audit SQL and save results.
- [ ] If needed, run reviewed hardening SQL and re-run the audit.

Day 4:
- [ ] Create vendor inventory.
- [ ] Collect SOC 2/security pages for critical vendors.

Day 5:
- [ ] Write/approve minimum policies listed in section 2.
- [ ] Save approval evidence.

Day 6:
- [ ] Create risk register and add initial risks from section 7.
- [ ] Assign owners and target dates.

Day 7:
- [ ] Run backup restore drill or schedule it.
- [ ] Configure uptime monitoring and alert routing if not already present.

## Auditor-facing language

Use:
- "Liminull AI has implemented a SOC 2 readiness baseline."
- "Controls are being prepared for auditor review."
- "Evidence is retained in the SOC2 evidence folder."

Do not use until an actual CPA report exists:
- "SOC 2 compliant"
- "SOC 2 certified"
- "SOC 2 audited"
