# E-Commerce PRD Gap Checklist

## Scope Reference
- PRD: `4.2 Membership Tiers & Monetization` (FR-2.1, FR-2.2, FR-2.3)
- PRD: `4.6 E-Commerce & Marketplace` (FR-6.1, FR-6.2, FR-6.3)
- MVP guardrail: PRD `12.1` includes direct sales and payments; PRD `12.1` excludes marketplace transactions.

## Status Matrix

| PRD Item | Current Status | Evidence |
|----------|----------------|----------|
| FR-2.1 Tiered subscriptions and renewals | Implemented baseline | `apps/api/src/modules/payments/`, `apps/web/src/app/(dashboard)/settings/subscription/page.tsx` |
| FR-2.2 Multi-method payments (M-PESA, card, PayPal baseline) | Implemented baseline | `apps/api/src/modules/payments/processors/` |
| FR-2.2 Receipts/basic invoicing | Implemented baseline invoice payload for orders and transactions history | `apps/api/src/modules/products/orders.service.ts`, `apps/api/src/modules/payments/payments.controller.ts` |
| FR-2.3 Coupons and discount rules | Implemented baseline | `apps/api/src/modules/coupons/`, coupon-aware checkout in `payments.service.ts` + `orders.service.ts` |
| FR-6.1 Digital product sales | Implemented baseline | `apps/api/src/modules/products/` |
| FR-6.1 Secure digital delivery (expiry/download limits) | Implemented baseline | `apps/api/src/modules/products/orders.service.ts` |
| FR-6.1 Purchase history | Implemented | `GET /orders/me` |
| FR-6.2 Physical merchandise shipping integrations | Pending (Phase 2) | Sendy/DHL/Aramex flows not yet integrated |
| FR-6.2 Advanced inventory workflow (alerts/fulfillment ops) | Pending (Phase 2) | baseline stock field exists only |
| FR-6.3 Brand services marketplace transactions | Out of MVP scope by PRD 12.1 | planned for Phase 2 |

## Implementation Backlog (Prioritized)

1. Receipt/invoice hardening
- PDF invoice rendering, branded receipt email templates, tax line handling by region.

2. Physical merchandise flow (FR-6.2)
- Shipping rate provider abstraction, checkout shipping calculation, fulfillment/tracking updates.

3. Marketplace expansion (Phase 2)
- Paid featured listings, inquiry-to-order lifecycle, marketplace analytics conversion funnel.
