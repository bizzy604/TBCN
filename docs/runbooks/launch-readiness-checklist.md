# Launch Readiness Checklist

## Sprint 4 Week 16 Go-Live Checklist

## Environment and Infrastructure

- [ ] Production DNS records verified and propagated.
- [ ] SSL certificate active and auto-renew configured.
- [ ] API and web production environment variables validated.
- [ ] SMTP, payment keys, and webhook secrets set to production values.
- [ ] Monitoring dashboards and alerts enabled (API, DB, Redis, error tracking).

## Data and Backup

- [ ] Automated PostgreSQL backup schedule enabled.
- [ ] Backup restore drill completed and documented.
- [ ] Redis persistence/backup policy verified.
- [ ] Pre-launch backup snapshot captured.

## Commerce and Admin Validation

- [ ] Checkout flow validated for card, M-PESA, Flutterwave, PayPal, and Paystack.
- [ ] Payment callback and webhook idempotency validated.
- [ ] Subscription upgrade/cancel flow validated.
- [ ] Admin analytics dashboards show live aggregate data.
- [ ] Moderation tools operational for post lock/unlock workflow.

## Performance and Security

- [ ] k6 smoke test executed and thresholds passed.
- [ ] Security hardening checklist reviewed and signed off.
- [ ] Rate limits validated on auth and payment endpoints.
- [ ] Incident response contacts and escalation matrix confirmed.

## Release Execution

- [ ] Go-live runbook reviewed with engineering and operations.
- [ ] Rollback plan validated (application + database rollback strategy).
- [ ] Stakeholder sign-off captured.
- [ ] Post-launch hypercare owners assigned (first 7 days).
