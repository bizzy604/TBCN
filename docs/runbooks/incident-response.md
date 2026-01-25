# Incident Response Runbook

Extracted from **System Design Document - Section 7: Reliability & Fault Tolerance**

## 1. Single Points of Failure (SPOF) Mitigation

| Component | SPOF Risk | Mitigation |
| ----- | ----- | ----- |
| **API Gateway** | High | 3+ instances across AZs, ALB health checks |
| **Database Primary** | Critical | Multi-AZ RDS, auto-failover (30s), daily backups |
| **Redis Cache** | Medium | Multi-AZ replication, app continues if cache fails |
| **Load Balancer** | Medium | AWS ALB (managed, multi-AZ) |
| **S3 Storage** | Low | AWS SLA 99.99%, multi-AZ replication |
| **Payment Gateway** | Low | Multiple providers (Stripe, Flutterwave, PayPal) |

## 2. Failure Scenarios & Responses

### Scenario 1: Database Primary Failure

**Detection:** Health check fails (30s)

**Response:**
1. RDS auto-failover to standby (30-60s downtime)
2. DNS update to new primary
3. Read replicas reconnect to new primary
4. Applications reconnect (connection pool refresh)

**Recovery Time:** 1-2 minutes
**Data Loss:** None (synchronous replication to standby)

### Scenario 2: Redis Cache Failure

**Detection:** Connection timeout (2s)

**Response:**
1. Application falls back to database queries
2. Performance degrades (higher DB load)
3. Auto-scaling triggers for DB connections
4. Redis replacement provisioned (5 minutes)

**Recovery Time:** 5-10 minutes
**Impact:** Slower responses, no data loss

### Scenario 3: Payment Gateway Outage

**Detection:** Gateway API returns 5xx errors

**Response:**
1. Switch to secondary payment provider if available
2. If total outage: Queue transactions locally
3. Display "Payment Service Degraded" banner to users
4. Retry queued transactions when service restores

**Recovery Time:** Dependent on provider
**Impact:** Delayed revenue, poor UX

### Scenario 4: Region-Wide Outage (DR)

**Detection:** AWS Health Dashboard / Multiple AZ failures

**Response:**
1. Activate DR plan (Cross-region failover)
2. Spin up critical services in secondary region (South Africa -> Europe)
3. Update DNS routing (Route53) to secondary region
4. Restore database from cross-region replica

**Recovery Objective (RTO):** < 4 hours
**Recovery Point (RPO):** < 1 hour
