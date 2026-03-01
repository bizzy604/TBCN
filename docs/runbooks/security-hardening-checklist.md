# Security Hardening Checklist

## Scope

Sprint 4 Week 15 launch-hardening verification for the API and web app.

## API Controls

- [x] Helmet middleware enabled in `apps/api/src/main.ts`.
- [x] CORS origin allowlist enforced via `CORS_ORIGIN`.
- [x] Global validation pipe enabled (`whitelist`, `forbidNonWhitelisted`, `transform`).
- [x] JWT and RBAC global guards enabled.
- [x] Global throttling guard enabled (`RateLimitGuard` + `ThrottlerModule`).
- [x] Payment webhooks include idempotency handling (`payment_webhook_events` table).
- [x] Password hashing with bcrypt in authentication flow.

## Infrastructure and Operations

- [ ] WAF policy review and deployment in production.
- [ ] Secrets rotated and stored in a managed secret store.
- [ ] TLS certificate and HSTS verification in production.
- [ ] Production SMTP credentials verified (no placeholder hosts).
- [ ] Security log retention and alert routing validation.

## QA Security Tests

- [ ] OWASP ZAP baseline scan against staging API.
- [ ] Authn/authz negative tests (missing token, role escalation attempt).
- [ ] Rate-limit abuse tests for `/auth/login` and high-write endpoints.
- [ ] Webhook replay attempt to validate idempotency.
- [ ] Dependency vulnerability scan and remediation.

## Exit Criteria

- No Critical or High vulnerabilities open at launch.
- Medium findings accepted only with owner, mitigation, and target fix date.
