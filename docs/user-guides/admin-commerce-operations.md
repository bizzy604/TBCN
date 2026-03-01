# Admin Commerce Operations Guide

## Revenue and Transaction Monitoring

1. Open `/admin/payments`.
2. Review transaction status distribution.
3. Filter transactions by status for failed-payment triage.
4. Verify references and provider IDs for reconciliation.

## Analytics Monitoring

1. Open `/admin` for overview KPIs.
2. Open `/admin/analytics` for deeper trend and activity checks.
3. Monitor daily active users, bookings, enrollments, and revenue totals.

## Coupon Operations

1. Manage coupons through `/api/v1/coupons` admin endpoints (create/update/activate/deactivate).
2. Track redemption performance through `/api/v1/coupons/admin/analytics`.
3. Use usage caps (`maxTotalUses`, `maxUsesPerUser`) and expiry windows to control campaigns.
4. Use `allowedPlans` and `applicableUserIds` for tier-specific or user-specific promotions.

## Moderation Workflow

1. Open `/admin/moderation`.
2. Review flagged/recent community posts.
3. Lock inappropriate posts to prevent new interactions.
4. Unlock posts after review if no violation remains.

## Operational Notes

- Use webhook event idempotency records to detect replayed payment events.
- Keep weekly export snapshots of payment transactions for accounting.
- Escalate suspicious payment or moderation patterns through incident response.
