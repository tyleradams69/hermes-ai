# Security Policy

## Reporting vulnerabilities
Report suspected vulnerabilities to the Liminull AI owner/admin channel. Include:
- affected repo and route/component
- reproduction steps
- impact
- suggested fix, if known

Do not post secrets, customer data, or exploit details in public channels.

## Secret handling
- Never commit `.env`, `.env.local`, service-role keys, API tokens, passwords, or private keys.
- Generate long random production secrets with `openssl rand -hex 32`.
- Rotate any secret that was exposed in logs, screenshots, browser bundles, or git history.

## Release security checks
Before production deploy:
1. Run `npm run security:audit`.
2. Review auth/role/audit-log changes.
3. Confirm production env vars are set through the deployment secret manager.
4. Confirm CORS origins match only approved dashboard domains.
5. Verify no raw tokens/passwords appear in logs.

## SOC 2 readiness
See `docs/compliance/SOC2_READINESS.md`.
