# **SYSTEM DESIGN DOCUMENT**

## **The Brand Coach Network Web Application**

**Document Version:** 1.0  
**Prepared By:** Principal Software Engineer & System Architect  
**Date:** December 13, 2025  
**Status:** Production-Ready System Design  
**Target Scale:** 5K users (MVP) → 100K users (Year 2\)

---

## **1\. REQUIREMENTS SUMMARY**

### **1.1 Functional Requirements**

**Core Features (Must-Have):**

1. **User Management:** Registration, authentication, profile management, role-based access  
2. **Learning Platform:** Course catalog, enrollment, video streaming, progress tracking, assessments, certifications  
3. **Coaching Marketplace:** Coach discovery, session booking, calendar management, video conferencing integration  
4. **Community:** Discussion forums, direct messaging, project submissions, social interactions  
5. **E-Commerce:** Subscriptions, course purchases, event ticketing, merchandise sales, multiple payment methods  
6. **Events:** Event creation, registration, ticketing, attendance tracking, virtual/physical/hybrid support  
7. **Partner Platform:** Bulk enrollments, cohort management, white-labeling, impact analytics

**Out of Scope (Phase 1):**

* Native mobile apps (PWA acceptable)  
* Live video streaming (pre-recorded content only)  
* Advanced AI recommendations  
* Multi-language content (English only MVP)  
* White-label infrastructure

---

### **1.2 Non-Functional Requirements**

**Performance:**

* **API Latency:** p95 \< 500ms, p99 \< 1s  
* **Page Load:** \< 2.5s on 4G networks  
* **Video Streaming:** Buffer to playable in \< 3s

**Scalability:**

* **MVP (Month 6):** 5,000 users, 500 concurrent  
* **Growth (Month 12):** 10,000 users, 1,000 concurrent  
* **Target (Month 24):** 100,000 users, 10,000 concurrent  
* **Peak Load:** 3x average (events, launches)

**Availability:**

* **SLA Target:** 99.9% uptime (43.8 minutes downtime/month)  
* **Recovery Time Objective (RTO):** \< 4 hours  
* **Recovery Point Objective (RPO):** \< 1 hour

**Consistency:**

* **Financial Transactions:** Strong consistency (ACID)  
* **User Progress:** Eventual consistency acceptable  
* **Community Content:** Eventual consistency acceptable  
* **Analytics:** Eventual consistency acceptable

**Security:**

* GDPR and Kenya Data Protection Act compliance  
* PCI DSS Level 1 (via payment processors)  
* End-to-end encryption for sensitive data  
* OAuth 2.0 \+ JWT authentication

**Geographic Distribution:**

* **Primary:** Africa (Kenya \- primary market)  
* **Secondary:** Global (diaspora, international coaches)  
* **Data Residency:** AWS Africa (Cape Town) region

---

## 

## **2\. CAPACITY ESTIMATION & CONSTRAINTS**

### **2.1 User Growth Projections**

MVP (Month 6):  
\- Total Users: 5,000  
\- Daily Active Users (DAU): 1,500 (30% engagement)  
\- Peak Concurrent: 500 users  
\- Coaches: 50 active

Growth (Month 12):  
\- Total Users: 10,000  
\- DAU: 3,000  
\- Peak Concurrent: 1,000  
\- Coaches: 100

Target (Month 24):  
\- Total Users: 100,000  
\- DAU: 30,000  
\- Peak Concurrent: 10,000  
\- Coaches: 500

---

### **2.2 Traffic Estimates**

**Read:Write Ratio:** 80:20 (read-heavy workload)

**API Request Volume:**

MVP (Month 6):  
\- Average QPS: 15 requests/second  
\- Peak QPS: 45 requests/second (3x multiplier)  
\- Daily Requests: \~1.3 million

Growth (Month 12):  
\- Average QPS: 30 requests/second  
\- Peak QPS: 90 requests/second  
\- Daily Requests: \~2.6 million

Target (Month 24):  
\- Average QPS: 300 requests/second  
\- Peak QPS: 900 requests/second  
\- Daily Requests: \~26 million

**Calculation:**

1,500 DAU × 50 requests/user/day ÷ 86,400 seconds \= 0.87 requests/second (baseline)  
Add 20x multiplier for active hours (8am-10pm): \~15 QPS average  
Peak \= 3x average \= 45 QPS

---

### **2.3 Storage Estimates**

**Database Storage:**

User Accounts: 100K users × 5 KB/user \= 500 MB  
User Profiles: 100K × 10 KB \= 1 GB  
Programs: 100 programs × 50 KB \= 5 MB  
Lessons: 5,000 lessons × 20 KB \= 100 MB  
Enrollments: 200K enrollments × 2 KB \= 400 MB  
Progress Records: 1M records × 1 KB \= 1 GB  
Posts: 50K posts × 5 KB \= 250 MB  
Messages: 500K messages × 2 KB \= 1 GB  
Transactions: 100K × 2 KB \= 200 MB  
Total Structured Data: \~5 GB (first year)  
Growth Rate: \~500 MB/month

3-Year Projection: \~20 GB structured data

**Object Storage (S3):**

Profile Photos: 100K × 500 KB \= 50 GB  
Course Videos: 500 videos × 200 MB \= 100 GB  
Lesson Resources: 5,000 × 5 MB \= 25 GB  
Certificates: 50K × 500 KB \= 25 GB  
Event Media: 100 events × 1 GB \= 100 GB  
Backups: 50 GB (compressed)  
Total Object Storage: \~350 GB (first year)  
Growth Rate: \~30 GB/month

3-Year Projection: \~1.4 TB

---

### **2.4 Bandwidth Estimates**

**Ingress:**

User uploads (profiles, assignments): 1 GB/day  
Content uploads (videos, resources): 5 GB/day  
Total Ingress: \~6 GB/day \= 180 GB/month

**Egress:**

API Responses: 1.3M requests × 20 KB avg \= 26 GB/day  
Video Streaming: 1,000 video views/day × 100 MB \= 100 GB/day  
Image Delivery: 50K images/day × 200 KB \= 10 GB/day  
Total Egress: \~136 GB/day \= 4 TB/month  
Peak (events): 12 TB/month

**CDN Savings:**

* 80% cache hit rate on static content  
* Effective egress from origin: \~1 TB/month

---

### **2.5 Cost Estimates (AWS)**

Compute (EC2):  
\- Web Servers: 3 × t3.medium \= $100/month  
\- API Servers: 3 × t3.medium \= $100/month  
\- Workers: 2 × t3.small \= $50/month  
Total Compute: $250/month

Database (RDS PostgreSQL):  
\- db.t3.large (8GB RAM) \= $150/month  
\- Backup storage: $20/month  
Total Database: $170/month

Cache (ElastiCache Redis):  
\- cache.t3.medium \= $80/month

Storage (S3):  
\- Standard: 350 GB × $0.023 \= $8/month  
\- Glacier (backups): 100 GB × $0.004 \= $0.40/month  
Total Storage: $10/month

CDN (CloudFront):  
\- 4 TB egress × $0.085 \= $340/month  
\- Requests: 40M × $0.01/10K \= $40/month  
Total CDN: $380/month

Total Infrastructure (MVP): \~$900/month  
Projected (Year 2 @ 100K users): \~$3,500/month

---

## **3\. HIGH-LEVEL ARCHITECTURE**

### **3.1 System Architecture Diagram**

![][image1]  
---

### **3.2 Architecture Principles**

**1\. Modular Monolith (Phase 1\)**

* **Rationale:** Faster development, simpler operations, easier debugging  
* **Trade-off:** Accepted coupling for operational simplicity  
* **Evolution Path:** Extract high-traffic services (video streaming, analytics) when needed

**2\. Stateless Application Servers**

* **Rationale:** Horizontal scaling, easy deployment, fault tolerance  
* **Session Management:** Redis for centralized session storage  
* **Trade-off:** Extra network hop for session data vs. operational simplicity

**3\. Read Replicas for Scale**

* **Rationale:** 80:20 read:write ratio justifies read scaling  
* **Consistency:** Eventual consistency acceptable for non-critical reads  
* **Trade-off:** Replication lag (target \< 5s) vs. reduced load on primary

**4\. CDN-First for Static Content**

* **Rationale:** Reduces origin load, improves global latency, reduces bandwidth costs  
* **Coverage:** Video content, images, static assets, API responses (where cacheable)  
* **Trade-off:** Cache invalidation complexity vs. performance gains

**5\. Async Processing for Non-Critical Paths**

* **Rationale:** Improves API response times, isolates failures, enables retries  
* **Use Cases:** Email delivery, analytics aggregation, notification dispatch  
* **Trade-off:** Eventual delivery vs. immediate user feedback

---

## **4\. DATA MODEL & ARCHITECTURE**

### **4.1 Database Selection**

**Primary: PostgreSQL 15+**

**Justification:**

* ✅ ACID transactions for payments and enrollments  
* ✅ Rich relational model for complex entity relationships  
* ✅ JSONB support for flexible attributes (user preferences, metadata)  
* ✅ Full-text search (sufficient for MVP)  
* ✅ Mature tooling and operational experience  
* ✅ Strong community support

**Alternatives Considered:**

* **MongoDB:** Rejected due to lack of ACID transactions across collections  
* **MySQL:** Rejected due to weaker JSON support and full-text search  
* **DynamoDB:** Rejected due to query limitations and complex data model

---

### **4.2 Cache Architecture**

**Redis 7+ (ElastiCache)**

**Use Cases:**

1. **Session Storage (TTL: 24h)**

   * JWT refresh tokens  
   * User session data  
   * Shopping cart state  
2. **Hot Data Cache (TTL: 1h)**

   * User profiles  
   * Program catalog  
   * Coach availability  
3. **Rate Limiting**

   * Per-user, per-endpoint counters  
   * IP-based throttling  
4. **Real-Time Features (Phase 2\)**

   * Pub/sub for notifications  
   * Presence tracking  
   * Message queues

**Cache Invalidation Strategy:**

* **Write-through:** Critical data (user profiles, sessions)  
* **TTL-based:** Semi-static data (course catalogs)  
* **Event-driven:** Explicit invalidation on updates (subscriptions, enrollments)

**Cache Hit Rate Target:** \> 80% for cacheable requests

---

### **4.3 Object Storage**

**AWS S3**

**Bucket Structure:**

brandcoach-media-prod/  
├── users/{user\_id}/  
│   ├── profile-photos/  
│   └── portfolio/  
├── programs/{program\_id}/  
│   └── videos/  
├── events/{event\_id}/  
│   └── recordings/  
└── certificates/

brandcoach-backups-prod/  
└── db-backups/

brandcoach-logs-prod/  
└── application-logs/

**Lifecycle Policies:**

* **Standard → Intelligent-Tiering:** After 30 days  
* **Intelligent-Tiering → Glacier:** After 90 days (non-critical media)  
* **Glacier → Deep Archive:** After 1 year (compliance retention)

**Access Patterns:**

* **Upload:** Presigned URLs (direct client upload, 15-minute expiry)  
* **Download:** CloudFront CDN (cached at edge)  
* **Security:** Bucket policies, IAM roles, server-side encryption

---

### **4.4 Data Partitioning Strategy**

**Vertical Partitioning (Phase 1):**

* Separate read-heavy tables onto read replicas  
* Archive old data (audit logs, old notifications)

**Horizontal Sharding (Phase 3, if needed):**

* **Shard Key:** user\_id (co-locate user's data)  
* **Trigger:** Database size \> 1TB or query performance degrades  
* **Approach:** Application-level sharding with routing layer

**Hot Key Mitigation:**

* Denormalized counters (program enrollment count, post like count)  
* Cached aggregations for popular content  
* Load testing to identify hot spots

---

## **5\. COMPONENT BREAKDOWN**

### **5.1 API Gateway**

**Responsibility:**

* Request routing to appropriate services  
* Authentication verification (JWT validation)  
* Rate limiting enforcement  
* Request/response logging  
* API versioning (URL-based: /v1, /v2)

**Technology:** Node.js \+ Express.js (or NestJS for structure)

**Scaling:**

* Stateless (horizontal scaling)  
* Auto-scaling based on CPU (target: 70%)  
* Load balanced via AWS ALB

**Failure Handling:**

* Health checks (every 30s)  
* Circuit breaker for downstream services  
* Graceful degradation (return cached data if backend fails)

---

### **5.2 Authentication Service**

**Responsibility:**

* User registration and login  
* JWT token issuance and refresh  
* OAuth 2.0 social login (Google, LinkedIn, Facebook)  
* Session management  
* Password reset flows

**APIs:**

POST /auth/register  
POST /auth/login  
POST /auth/refresh  
POST /auth/logout  
GET  /auth/{provider}/authorize  
POST /auth/password-reset

**Security:**

* bcrypt password hashing (cost factor 12\)  
* JWT signing with RS256 (asymmetric keys)  
* Refresh token rotation  
* Account lockout after 5 failed attempts (15-minute lockout)  
* 2FA support (Phase 2\)

**Scaling:**

* Stateless service  
* Redis for session state  
* Read replica for user lookups

**Failure Handling:**

* Redis unavailable → fallback to database sessions (degraded perf)  
* Social OAuth provider down → disable that provider temporarily

---

### **5.3 Learning Service**

**Responsibility:**

* Program catalog management  
* Enrollment processing  
* Lesson content delivery  
* Progress tracking  
* Assessment grading (auto-graded quizzes)  
* Certificate generation

**APIs:**

GET  /programs  
POST /programs/{id}/enroll  
GET  /enrollments  
GET  /lessons/{id}  
POST /lessons/{id}/progress  
POST /assessments/{id}/submit

**Data Flow (Video Streaming):**

1\. User requests lesson → API returns presigned CloudFront URL  
2\. CloudFront serves video from S3 (edge caching)  
3\. Progress tracked via periodic API calls (every 30s)  
4\. Completion triggers certificate generation (async job)

**Scaling:**

* Read replicas for catalog queries  
* CDN for video delivery (offloads 95% of bandwidth)  
* Async workers for certificate generation

**Failure Handling:**

* Video unavailable → show "Processing, check back soon"  
* Certificate generation fails → retry with exponential backoff  
* Database down → serve cached catalog (stale okay)

---

### **5.4 Payment Service**

**Responsibility:**

* Payment initiation (Stripe, Flutterwave, M-PESA)  
* Transaction recording  
* Webhook handling (payment confirmations)  
* Subscription management  
* Refund processing

**APIs:**

POST /payments/initiate  
GET  /payments/{id}  
POST /webhooks/stripe  
POST /webhooks/flutterwave  
POST /subscriptions/upgrade

**Payment Flow:**

1\. User initiates payment → Create transaction record (status: pending)  
2\. Redirect to payment gateway OR initiate M-PESA STK push  
3\. Gateway processes payment  
4\. Webhook callback → Update transaction (status: success)  
5\. Grant access to content/subscription  
6\. Send confirmation email (async)

**Idempotency:**

* Require X-Idempotency-Key header for payment initiation  
* Store key → transaction mapping in Redis (24h TTL)  
* Duplicate requests return cached transaction

**Failure Handling:**

* **Gateway timeout:** Mark transaction as "processing", retry status check  
* **Webhook missed:** Scheduled job polls gateway for pending transactions  
* **Double-charge prevention:** Idempotency keys \+ unique constraints

**Consistency:**

* **Strong consistency required** (ACID transactions)  
* Transaction \+ enrollment update in single DB transaction  
* No eventual consistency acceptable

---

### **5.5 Coaching Service**

**Responsibility:**

* Coach profile management  
* Availability calendar  
* Session booking  
* Video conferencing integration (Zoom API)  
* Payment processing for sessions

**APIs:**

GET  /coaches  
GET  /coaches/{id}/availability  
POST /sessions  
GET  /sessions  
PATCH /sessions/{id}  (reschedule/cancel)

**Booking Flow:**

1\. User selects time slot → Optimistic lock on coach\_availability  
2\. Create session record (status: pending)  
3\. Initiate payment  
4\. Payment success → Generate Zoom meeting link  
5\. Send confirmation emails to both parties  
6\. Add to both calendars (Google Calendar API)

**Concurrency Handling:**

* Optimistic locking on availability slots  
* Retry with alternative slots if conflict  
* 5-minute hold on slot during payment

**Failure Handling:**

* Zoom API down → Store meeting details, create link later  
* Calendar sync fails → Log error, don't block booking  
* Payment fails → Release slot, notify user

---

### **5.6 Community Service**

**Responsibility:**

* Posts and discussions  
* Comments and reactions  
* Direct messaging  
* Project submissions  
* Content moderation queue

**APIs:**

GET  /posts  
POST /posts  
POST /posts/{id}/like  
POST /posts/{id}/comments  
GET  /messages  
POST /messages

**Moderation Flow:**

1\. User submits post → Status: "pending" (for new users)  
2\. Auto-check for spam/profanity  
3\. If flagged → Moderation queue  
4\. If clean → Status: "published"  
5\. Moderator can approve/reject manually

**Scaling:**

* Read replicas for feed queries  
* Cursor-based pagination (not offset) for performance  
* Denormalized counters (like\_count, comment\_count)

**Failure Handling:**

* Moderation service down → Auto-publish for trusted users, queue for others  
* Message delivery fails → Store and retry (at-least-once semantics)

---

## **6\. SCALABILITY STRATEGY**

### **6.1 Horizontal Scaling**

**Application Servers:**

MVP:     3 instances (t3.medium)  
Growth:  5 instances (t3.large)  
Target:  10+ instances (auto-scaling group)

**Auto-Scaling Rules:**

Scale Out:  
\- CPU \> 70% for 5 minutes  
\- Request queue depth \> 100

Scale In:  
\- CPU \< 30% for 10 minutes  
\- Min instances: 3 (redundancy)

**Load Balancing:**

* AWS Application Load Balancer (ALB)  
* Health checks every 30s  
* Connection draining (30s timeout)  
* Sticky sessions NOT used (stateless design)

---

### **6.2 Database Scaling**

**Phase 1 (MVP \- 10K users):**

Primary: db.t3.large (2 vCPU, 8GB RAM)  
Read Replicas: None (sufficient capacity)

**Phase 2 (Growth \- 50K users):**

Primary: db.m5.xlarge (4 vCPU, 16GB RAM)  
Read Replicas: 2 × db.t3.large  
\- Replica 1: Course queries, lesson content  
\- Replica 2: Community queries, analytics

**Phase 3 (Scale \- 100K+ users):**

Primary: db.m5.2xlarge (8 vCPU, 32GB RAM)  
Read Replicas: 3-5 based on load  
Connection Pooling: PgBouncer (1000 client, 25 server connections)

**Read Routing Logic:**

// Application-level routing  
if (query.type \=== 'write' || requiresStrongConsistency) {  
  return primaryDB.query(sql);  
} else {  
  return readReplicaDB.query(sql);  // Load balanced across replicas  
}

**Replication Lag Monitoring:**

* Alert if lag \> 5 seconds  
* Fallback to primary if replica lag critical

---

### **6.3 Cache Scaling**

**Redis Cluster:**

MVP:     Single node (cache.t3.medium, 3.09GB)  
Growth:  Cluster mode (3 shards, 1 replica each)  
Target:  Cluster mode (5+ shards, 2 replicas each)

**Cache Eviction Policy:** LRU (Least Recently Used)

**Cache Warming Strategy:**

* Pre-warm popular program catalog on deployment  
* Background job refreshes coach directory every 10 minutes  
* User profiles cached on first access

---

### **6.4 CDN Strategy**

**CloudFront Configuration:**

Origin: S3 (media), ALB (API responses)  
Edge Locations: Global (all)  
Cache Behaviors:  
\- Videos: Cache 1 year, presigned URLs for access control  
\- Images: Cache 1 month  
\- API (GET): Cache 5 minutes (Cache-Control header driven)  
\- API (POST/PUT/DELETE): No cache

**Cache Invalidation:**

* S3 object version updates (immutable URLs)  
* API cache via Cache-Control: no-cache header when needed  
* Bulk invalidation via CloudFront API (rare)

**Bandwidth Savings:**

Without CDN: 4 TB/month × $0.09/GB \= $360  
With CDN (80% hit rate):   
  \- Origin: 800 GB × $0.09 \= $72  
  \- CloudFront: 4 TB × $0.085 \= $340  
  Total: $412 (but faster delivery, lower origin load)

---

### **6.5 Async Processing**

**Queue Architecture:**

AWS SQS (Standard Queues):  
\- email-queue: Transactional emails (welcome, confirmations)  
\- notification-queue: Push notifications, SMS  
\- analytics-queue: Event tracking, aggregations  
\- certificate-queue: PDF generation, S3 upload

**Worker Configuration:**

MVP:     2 workers (t3.small)  
Growth:  5 workers (t3.medium)  
Target:  10+ workers (auto-scaling based on queue depth)

**Processing Guarantees:**

* **At-least-once delivery** (SQS standard)  
* Idempotent handlers (safe to retry)  
* Dead-letter queue after 3 failed attempts  
* Retention: 14 days

**Backpressure Handling:**

* Queue depth alarm \> 1000 → Scale workers  
* Queue age alarm \> 5 minutes → Alert ops team  
* Worker failures → Exponential backoff retry

---

## **7\. RELIABILITY & FAULT TOLERANCE**

### **7.1 Single Points of Failure (SPOF) Mitigation**

| Component | SPOF Risk | Mitigation |
| ----- | ----- | ----- |
| **API Gateway** | High | 3+ instances across AZs, ALB health checks |
| **Database Primary** | Critical | Multi-AZ RDS, auto-failover (30s), daily backups |
| **Redis Cache** | Medium | Multi-AZ replication, app continues if cache fails |
| **Load Balancer** | Medium | AWS ALB (managed, multi-AZ) |
| **S3 Storage** | Low | AWS SLA 99.99%, multi-AZ replication |
| **Payment Gateway** | Low | Multiple providers (Stripe, Flutterwave, PayPal) |

---

### **7.2 Failure Scenarios & Responses**

**Scenario 1: Database Primary Failure**

Detection: Health check fails (30s)  
Response:   
  1\. RDS auto-failover to standby (30-60s downtime)  
  2\. DNS update to new primary  
  3\. Read replicas reconnect to new primary  
  4\. Applications reconnect (connection pool refresh)  
Recovery Time: 1-2 minutes  
Data Loss: None (synchronous replication to standby)

**Scenario 2: Redis Cache Failure**

Detection: Connection timeout (2s)  
Response:  
  1\. Application falls back to database queries  
  2\. Performance degrades (higher DB load)  
  3\. Auto-scaling triggers for DB connections  
  4\. Redis replacement provisioned (5 minutes)  
Recovery Time: 5-10 minutes  
Impact: Slower responses, no data loss

**Scenario 3: Payment Gateway Outage**

Detection: Gateway API returns 5xx errors  
Response:  
  1\. Circuit breaker opens (after 5 failures)  
  2\. Fail over to secondary gateway (Stripe → Flutterwave)  
  3\. Notify users of temporary payment method limitation  
  4\. Queue failed transactions for retry  
Recovery Time: Immediate (\< 1s) via circuit breaker  
Impact: Some payment methods unavailable temporarily

**Scenario 4: S3 / CDN Outage**

Detection: High error rate from CloudFront  
Response:  
  1\. Serve degraded experience (placeholders for images)  
  2\. Video playback fails gracefully with message  
  3\. Essential operations (payments, auth) continue  
Recovery Time: Dependent on AWS (typically minutes)  
Impact: Degraded UX, no data loss

**Scenario 5: Full Region Outage (AWS Africa)**

Detection: Multiple service failures  
Response:  
  1\. Manual failover to secondary region (EU, Phase 3\)  
  2\. DNS update (Route53 health check)  
  3\. Restore from latest backup  
  4\. Accept 1 hour data loss (RPO)  
Recovery Time: 2-4 hours (RTO)  
Impact: Service outage, potential data loss up to RPO

---

### **7.3 Circuit Breaker Pattern**

**Implementation:**

class CircuitBreaker {  
  states \= \['CLOSED', 'OPEN', 'HALF\_OPEN'\];  
    
  config \= {  
    failureThreshold: 5,        // Open after 5 failures  
    successThreshold: 2,        // Close after 2 successes  
    timeout: 30000,            // Try again after 30s  
  };  
    
  async call(fn) {  
    if (this.state \=== 'OPEN') {  
      if (Date.now() \> this.nextAttempt) {  
        this.state \= 'HALF\_OPEN';  
      } else {  
        throw new Error('Circuit breaker OPEN');  
      }  
    }  
      
    try {  
      const result \= await fn();  
      this.onSuccess();  
      return result;  
    } catch (error) {  
      this.onFailure();  
      throw error;  
    }  
  }  
}

**Applied To:**

* Payment gateway calls  
* External API integrations (Zoom, SendGrid)  
* Non-critical services (recommendations, analytics)

---

### **7.4 Rate Limiting & Throttling**

**Per-User Limits:**

Guest:   100 requests/hour  
Member:  1,000 requests/hour  
Coach:   5,000 requests/hour  
Admin:   10,000 requests/hour

**Per-Endpoint Limits:**

/auth/login:     10/hour per IP  
/auth/register:  5/hour per IP  
/payments/\*:     100/hour per user

**Implementation:**

\# Token bucket algorithm in Redis  
INCR ratelimit:{user\_id}:{endpoint}  
EXPIRE ratelimit:{user\_id}:{endpoint} 3600

\# Check limit  
count \= GET ratelimit:{user\_id}:{endpoint}  
if count \> limit:  
  return 429 Too Many Requests

**Response Headers:**

X-RateLimit-Limit: 1000  
X-RateLimit-Remaining: 847  
X-RateLimit-Reset: 1642345678  
Retry-After: 3600  \# When rate limited

---

### **7.5 Graceful Degradation**

**Degradation Tiers:**

**Tier 1 (Essential):** ALWAYS available

* Authentication  
* Payment processing  
* Core enrollment  
* Access to purchased content

**Tier 2 (Important):** Degrade gracefully

* Community features → Read-only mode  
* Messaging → Queue for later delivery  
* Search → Return cached results  
* Recommendations → Show popular items

**Tier 3 (Nice-to-Have):** Fail silently

* Analytics tracking → Log locally, sync later  
* Email notifications → Queue for batch processing  
* Thumbnail generation → Show placeholder

**Feature Flags:**

// Toggle features during incidents  
featureFlags \= {  
  communityPosts: true,  
  directMessaging: true,  
  videoUploads: false,  // Disabled during high load  
  advancedSearch: false,  
}

---

## **8\. CONSISTENCY & DATA INTEGRITY**

### **8.1 CAP Theorem Trade-offs**

**Consistency Model by Domain:**

| Domain | Model | Rationale |
| ----- | ----- | ----- |
| **Payments** | Strong (ACID) | Money movement requires correctness |
| **Enrollments** | Strong (ACID) | Access control must be immediate |
| **Progress Tracking** | Eventual | Stale progress acceptable (seconds) |
| **Community Posts** | Eventual | Feed consistency not critical |
| **Analytics** | Eventual | Historical data, minutes/hours okay |
| **Notifications** | Eventual | At-least-once delivery acceptable |

---

### **8.2 Idempotency Design**

**Idempotent Operations:**

* All POST operations require X-Idempotency-Key header  
* Key stored in Redis with 24-hour TTL  
* Duplicate requests return cached response

**Implementation:**

async function handlePayment(req) {  
  const idempotencyKey \= req.headers\['x-idempotency-key'\];  
    
  // Check cache  
  const cached \= await redis.get(\`idempotency:${idempotencyKey}\`);  
  if (cached) return JSON.parse(cached);  
    
  // Process payment  
  const result \= await processPayment(req.body);  
    
  // Cache result  
  await redis.setex(  
    \`idempotency:${idempotencyKey}\`,  
    86400,  // 24 hours  
    JSON.stringify(result)  
  );  
    
  return result;  
}

---

### **8.3 Distributed Transaction Handling**

**Two-Phase Commit Pattern (for payments):**

Phase 1 (Prepare):  
1\. Create transaction record (status: pending)  
2\. Reserve inventory (e.g., event seats)  
3\. Call payment gateway

Phase 2 (Commit/Rollback):  
If payment succeeds:  
  \- Update transaction (status: success)  
  \- Grant access to content  
  \- Send confirmation  
    
If payment fails:  
  \- Update transaction (status: failed)  
  \- Release reserved inventory  
  \- Notify user

**Saga Pattern (for complex flows):**

Enrollment Saga:  
1\. Create enrollment record  
2\. Process payment  
3\. Grant access  
4\. Send welcome email  
5\. Update analytics

Compensating Transactions:  
\- If step 4 fails → Reverse step 3, 2, 1  
\- Each step logs to audit trail  
\- Manual intervention for stuck sagas

---

## **9\. SECURITY ARCHITECTURE**

### **9.1 Defense in Depth**

Layer 1: Network Security  
├─ CloudFlare DDoS protection  
├─ WAF rules (OWASP Top 10\)  
└─ VPC with private subnets

Layer 2: Application Security  
├─ Rate limiting (per-user, per-IP)  
├─ Input validation (all endpoints)  
├─ SQL injection prevention (parameterized queries)  
└─ XSS prevention (HTML sanitization)

Layer 3: Authentication & Authorization  
├─ OAuth 2.0 \+ JWT tokens  
├─ Role-based access control (RBAC)  
├─ 2FA for admin accounts  
└─ Session management (Redis)

Layer 4: Data Security  
├─ Encryption at rest (AES-256)  
├─ Encryption in transit (TLS 1.3)  
├─ PII field-level encryption  
└─ Secrets management (AWS Secrets Manager)

Layer 5: Monitoring & Response  
├─ Intrusion detection (CloudWatch)  
├─ Audit logging (all sensitive operations)  
├─ Security alerts (PagerDuty)  
└─ Incident response runbooks

---

### **9.2 Authentication Security**

**Token Management:**

Access Token:  
\- Lifespan: 1 hour  
\- Algorithm: RS256 (asymmetric)  
\- Payload: {user\_id, roles, tier}  
\- Storage: Memory only (never localStorage)

Refresh Token:  
\- Lifespan: 7 days  
\- Rotation: New token on each refresh  
\- Storage: httpOnly cookie (secure, sameSite)  
\- Revocation: Stored in Redis with TTL

**Password Security:**

// Password hashing  
const hash \= await bcrypt.hash(password, 12); // Cost factor 12

// Password requirements  
const passwordPolicy \= {  
  minLength: 8,  
  requireUppercase: true,  
  requireLowercase: true,  
  requireNumber: true,  
  requireSpecial: false,  // Not required (UX trade-off)  
  maxLength: 128,  
};

**Breach Prevention:**

* Account lockout: 5 failed attempts → 15-minute lockout  
* Rate limiting: 10 login attempts/hour per IP  
* Password breach detection: Check against HaveIBeenPwned API  
* Force logout: Revoke all sessions on password change

---

### **9.3 Data Protection**

**PII Encryption:**

\-- Application-level encryption for sensitive fields  
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\-- Encrypt before insert  
INSERT INTO users (user\_id, email, phone\_encrypted)  
VALUES ($1, $2, pgp\_sym\_encrypt($3, 'encryption\_key'));

\-- Decrypt on read  
SELECT pgp\_sym\_decrypt(phone\_encrypted, 'encryption\_key')   
FROM users WHERE user\_id \= $1;

**Field Classification:**

| Field | Classification | Protection |
| ----- | ----- | ----- |
| Email | PII | Encrypted, access logged |
| Phone | PII | Encrypted, optional display |
| Name | PII | Plaintext, access controlled |
| Password | Sensitive | bcrypt hash, never returned |
| Payment Info | Sensitive | Never stored (gateway tokens only) |
| IP Address | PII | Logged, 90-day retention |

---

### **9.4 API Security**

**Request Signing (Partner APIs):**

Signature \= HMAC-SHA256(  
  method \+ path \+ timestamp \+ body,  
  partner\_secret  
)

Headers:  
  X-API-Key: {partner\_id}  
  X-Signature: {signature}  
  X-Timestamp: {unix\_timestamp}  
    
Validation:  
\- Timestamp within 5 minutes (replay attack prevention)  
\- Signature matches computed hash  
\- API key valid and not revoked

**CORS Policy:**

Allowed Origins:  
\- https://app.brandcoachnetwork.com  
\- https://admin.brandcoachnetwork.com  
\- http://localhost:3000 (dev only)

Allowed Methods: GET, POST, PUT, PATCH, DELETE  
Allowed Headers: Authorization, Content-Type, X-Idempotency-Key  
Credentials: true  
Max Age: 86400

---

## **10\. OBSERVABILITY & OPERATIONS**

### **10.1 Logging Strategy**

**Structured Logging:**

{  
  "timestamp": "2025-01-15T10:30:00.123Z",  
  "level": "info",  
  "service": "api-gateway",  
  "request\_id": "uuid",  
  "user\_id": "uuid",  
  "method": "POST",  
  "path": "/v1/enrollments",  
  "status": 201,  
  "duration\_ms": 234,  
  "ip": "41.90.64.123",  
  "user\_agent": "Mozilla/5.0...",  
  "error": null  
}

**Log Levels:**

* **DEBUG:** Development only (disabled in production)  
* **INFO:** Successful operations, key events  
* **WARN:** Degraded performance, deprecated API usage  
* **ERROR:** Handled errors, user-facing failures  
* **FATAL:** System failures requiring immediate attention

**Log Aggregation:**

Application Logs → CloudWatch Logs → S3 (long-term)  
                                   → Elasticsearch (search, Phase 2\)

**Retention:**

* DEBUG: Not logged in production  
* INFO: 30 days (CloudWatch), 1 year (S3)  
* WARN: 90 days  
* ERROR/FATAL: 1 year

---

### **10.2 Metrics & Monitoring**

**Golden Signals:**

**1\. Latency**

\- API response time (p50, p95, p99)  
\- Database query time  
\- Cache hit rate  
\- External API latency (Stripe, Zoom)

**2\. Traffic**

\- Requests per second (by endpoint)  
\- Active connections  
\- Bandwidth (ingress/egress)

**3\. Errors**

\- Error rate (by endpoint, status code)  
\- 5xx errors (system failures)  
\- 4xx errors (client errors)  
\- Payment failures

**4\. Saturation**

\- CPU utilization (target: 70%)  
\- Memory usage  
\- Database connections (pool saturation)  
\- Disk I/O  
\- Network bandwidth

**Monitoring Stack:**

CloudWatch (AWS native) → Grafana dashboards  
OR  
Prometheus → Grafana → PagerDuty alerts

---

### **10.3 SLIs, SLOs & SLAs**

**Service Level Indicators (SLIs):**

Availability: (successful\_requests / total\_requests) × 100  
Latency: p95 response time  
Error Rate: (5xx\_errors / total\_requests) × 100

**Service Level Objectives (SLOs):**

Availability: 99.9% (43.8 minutes downtime/month)  
Latency:   
  \- p95 \< 500ms (API endpoints)  
  \- p99 \< 1s  
Error Rate: \< 0.1% (99.9% success rate)

**Service Level Agreement (SLA):**

Customer-Facing SLA: 99.5% uptime  
\- Monthly uptime \< 99.5% → 10% service credit  
\- Monthly uptime \< 99.0% → 25% service credit

Excluded from SLA:  
\- Scheduled maintenance (with 48h notice)  
\- Third-party service failures  
\- DDoS attacks  
\- Force majeure events

**Error Budget:**

99.9% SLO \= 0.1% error budget \= 43.8 minutes/month

Error Budget Tracking:  
\- Incidents consume error budget  
\- Monthly reset  
\- Budget exhausted → Feature freeze, focus on reliability

---

### **10.4 Alerting Strategy**

**Alert Severity Levels:**

**P1 (Critical) \- Page On-Call**

* Service down (all health checks failing)  
* Payment processing stopped (\> 10 consecutive failures)  
* Database primary offline  
* Data breach suspected

**P2 (High) \- Slack \+ Email**

* Error rate \> 1%  
* Latency p95 \> 1s  
* Payment failure rate \> 5%  
* Cache failure

**P3 (Medium) \- Slack**

* Error rate \> 0.5%  
* Disk usage \> 85%  
* High replication lag (\> 10s)

**P4 (Low) \- Email**

* Deprecation warning usage  
* Certificate expiring (\< 30 days)

**Alert Routing:**

CloudWatch Alarms → SNS Topic → Lambda → PagerDuty/Slack

On-Call Rotation:  
\- Primary: Responds within 15 minutes  
\- Secondary: Escalates after 30 minutes  
\- Manager: Escalates after 1 hour

---

### **10.5 Incident Response**

**Incident Severity Definitions:**

**SEV1 (Critical):**

* Service completely down  
* Payment processing broken  
* Data breach or security incident  
* Response: Immediate all-hands

**SEV2 (High):**

* Major feature down (learning, coaching)  
* Performance severely degraded (\> 5s latency)  
* Affecting \> 20% of users  
* Response: 30-minute assembly

**SEV3 (Medium):**

* Minor feature down (community posts)  
* Affecting \< 20% of users  
* Workaround available  
* Response: Next business day

**Incident Response Playbook:**

1\. Detect (automated alerts or user report)  
2\. Acknowledge (\< 15 minutes for P1)  
3\. Triage (assess severity, gather context)  
4\. Mitigate (immediate fix or rollback)  
5\. Communicate (status page, user notifications)  
6\. Resolve (permanent fix)  
7\. Post-Mortem (within 48 hours, blameless)

**Post-Mortem Template:**

\#\# Incident Summary  
\- Date: 2025-01-15  
\- Duration: 45 minutes  
\- Impact: 5% of users unable to enroll in courses

\#\# Timeline  
\- 10:30 \- Alert triggered (payment gateway timeout)  
\- 10:35 \- On-call engineer acknowledged  
\- 10:45 \- Root cause identified (API key expired)  
\- 11:00 \- Fix deployed (new API key)  
\- 11:15 \- Service restored, monitoring

\#\# Root Cause  
\- Stripe API key rotated without updating environment variables  
\- No monitoring for API key expiration

\#\# Action Items  
\- \[ \] Add API key expiration monitoring  
\- \[ \] Document key rotation procedure  
\- \[ \] Implement canary deployments for config changes

---

## **11\. TRADE-OFF SUMMARY**

### **11.1 Architecture Trade-Offs**

**1\. Monolith vs Microservices**

**Decision:** Modular monolith for Phase 1

✅ **Advantages:**

* Faster development velocity  
* Simpler deployment and rollback  
* Easier debugging (single codebase)  
* Lower operational overhead  
* Shared database transactions

❌ **Trade-offs:**

* Tighter coupling between modules  
* Entire system scales together (less granular)  
* Deployment affects all features  
* Technology stack locked per language

**Evolution Path:**

* Extract high-traffic services when:  
  * Video streaming becomes bottleneck  
  * Analytics requires different scaling profile  
  * Partner API needs independent SLA  
* Estimated trigger: 50K+ users or performance bottleneck

---

**2\. Strong vs Eventual Consistency**

**Decision:** Mixed model based on domain criticality

✅ **Strong Consistency (ACID):**

* Payment transactions  
* Enrollment access control  
* Subscription state

✅ **Eventual Consistency:**

* User progress tracking (seconds delay okay)  
* Community feed (stale posts acceptable)  
* Analytics and dashboards

**Rationale:**

* Strong consistency: Correctness matters more than latency  
* Eventual consistency: Performance matters more than real-time accuracy

**Risk:** User confusion if progress appears lost due to replication lag   
**Mitigation:** Read-after-write consistency for critical operations (force primary read)

---

**3\. Caching Strategy**

**Decision:** Aggressive caching with 1-hour TTL for most data

✅ **Advantages:**

* Reduces database load by 60-80%  
* Improves API latency (10ms cache hit vs 50ms DB query)  
* Enables horizontal scaling

❌ **Trade-offs:**

* Stale data for up to 1 hour  
* Cache invalidation complexity  
* Additional infrastructure cost ($80/month)

**Mitigation:**

* Write-through cache for critical data  
* Event-driven invalidation for user state changes  
* Shorter TTL (5 minutes) for coach availability

---

**4\. Synchronous vs Asynchronous Processing**

**Decision:** Async for non-critical path operations

✅ **Async Processing:**

* Email delivery  
* Analytics aggregation  
* Certificate generation  
* Notification dispatch

✅ **Sync Processing:**

* Payment processing (with webhook callback)  
* Enrollment access grant  
* Authentication

**Rationale:**

* Async: Improves API response time, isolates failures, enables retries  
* Sync: User needs immediate feedback or subsequent action depends on result

**Trade-off:** Eventual delivery (typically \< 30s, worst case minutes if queue backlog)

---

**5\. Read Replicas vs Caching**

**Decision:** Both, optimized for different patterns

**Read Replicas:** Reduces primary database load, handles complex queries   
**Caching (Redis):** Handles hot key queries, simple lookups

**When to Use Each:**

Cache: User session, profile, program catalog

Replica: Complex joins, reporting, analytics queries

Both: Popular coach profiles (cached, but source from replica)

**Cost Comparison:**

**Cache only:** $80/month, limited to simple queries

**Replica only**: $150/month, can't reduce primary load enough

**Both:** $230/month, optimal performance and cost

ROI: Better UX justifies cost (2.5s → 0.5s response time)

---

**6\. Multi-Region vs Single Region**

**Decision:** Single region (AWS Africa \- Cape Town) for Phase 1-2

✅ **Advantages:**

* Simpler architecture and operations  
* Lower cost (no cross-region replication)  
* Data residency compliance (Kenya Data Protection Act)  
* Reduced complexity for development team

❌ **Trade-offs:**

* Higher latency for non-African users (200-300ms additional)  
* Regional failure \= full outage (no automatic failover)  
* Limited by single region capacity

**Mitigation:**

* CloudFront CDN for global edge caching (static content)  
* Phase 3: Add read replicas in EU for international users  
* Disaster recovery backup in secondary region (manual failover)

**Trigger for Multi-Region:**

* 30% users from outside Africa

* SLA requirements exceed single-region capability  
* Regulatory requirements mandate data residency

---

### **11.2 Database Trade-Offs**

**1\. PostgreSQL vs NoSQL**

**Decision:** PostgreSQL

✅ **Why PostgreSQL:**

* ACID transactions critical for payments  
* Complex relationships (users, programs, enrollments)  
* Strong consistency requirements  
* Rich querying (joins, aggregations)  
* Mature tooling and team expertise

❌ **When NoSQL Would Win:**

* If schema was highly variable  
* If we needed eventual consistency everywhere  
* If horizontal sharding was immediate requirement  
* If document storage was primary pattern

**Hybrid Approach (Future):**

* MongoDB for user-generated content (posts, stories) if schema becomes too flexible  
* DynamoDB for session storage if Redis costs escalate

---

**2\. Normalized vs Denormalized Schema**

**Decision:** Normalized with selective denormalization

**Normalized:**

* User accounts, programs, transactions (prevent anomalies)

**Denormalized:**

* Engagement counters (like\_count, enrollment\_count)  
* User profile stats (posts\_count, followers\_count)  
* Cached aggregations (program ratings)

**Rationale:**

* Normalization: Data integrity, reduced storage  
* Denormalization: Performance (avoid expensive aggregations)

**Consistency Model:**

* Denormalized counters updated via database triggers  
* Acceptable eventual consistency (seconds)  
* Periodic reconciliation job (daily at 2 AM)

---

### **11.3 Operational Trade-Offs**

**1\. Managed Services vs Self-Hosted**

**Decision:** Fully managed AWS services

✅ **Managed Services:**

* RDS (PostgreSQL)  
* ElastiCache (Redis)  
* S3 (Object storage)  
* ALB (Load balancing)  
* CloudFront (CDN)

**Rationale:**

* Reduces operational burden (small team)  
* Built-in high availability  
* Automated backups and patching  
* Better SLA than self-managed

**Trade-off:**

* Higher cost (2-3x vs self-hosted)  
* Less configuration control  
* Vendor lock-in

**Cost Analysis:**

Managed (AWS): $900/month (MVP)

Self-Hosted (EC2 \+ manual ops): $300/month \+ 40 hours ops/month

Break-even: When ops time costs \> $600/month

Verdict: Managed services worth it for small team

---

**2\. Blue-Green vs Rolling Deployments**

**Decision:** Rolling deployments for Phase 1

**Rolling Deployment:**

* Deploy to one instance at a time  
* Monitor health before proceeding  
* Rollback on error

**Advantages:**

* No extra infrastructure cost  
* Gradual traffic shift  
* Fast rollback (redeploy previous version)

**Disadvantages:**

* Mixed versions during deployment (10-15 minutes)  
* Database migrations require backward compatibility

**Evolution Path:**

* Blue-green deployments when:  
  * Zero-downtime critical (enterprise SLA)  
  * Budget allows duplicate infrastructure  
  * Deployment frequency increases (multiple/day)

---

## **12\. FUTURE IMPROVEMENTS & EVOLUTION**

### **12.1 Phase 2 Enhancements (Months 6-12)**

**1\. Mobile Native Applications**

Technology: React Native

Rationale: Code sharing with web app, faster development

Features:

\- Offline course downloads

\- Push notifications

\- Native video player

\- Biometric authentication

**2\. Advanced Search**

Technology: Elasticsearch or Algolia

Rationale: PostgreSQL full-text search limitations at scale

Features:

\- Fuzzy search

\- Faceted filtering

\- Real-time suggestions

\- Relevance tuning

**3\. Real-Time Features**

Technology: WebSockets (Socket.io)

Features:

\- Live chat during events

\- Real-time notifications

\- Online presence indicators

\- Collaborative features

**4\. Video Analytics**

Technology: Custom event tracking

Features:

\- Watch time analytics

\- Drop-off points

\- Engagement metrics

\- A/B testing for content

---

### **12.2 Phase 3 Scalability (Months 12-24)**

**1\. Service Extraction**

Candidates for Microservices:

\- Video Streaming Service (high bandwidth, different scaling)

\- Analytics Service (different consistency, batch processing)

\- Notification Service (high volume, async nature)

Remain Monolithic:

\- Core business logic (enrollment, payments)

\- Admin features (low traffic)

**2\. Database Sharding**

Trigger: Database \> 1TB or query performance degrades

Shard Key: user\_id (co-locate user data)

Approach: Application-level routing

Shard Distribution:

\- Shard 1: Users A-F (30%)

\- Shard 2: Users G-M (30%)

\- Shard 3: Users N-Z (40%)

Cross-Shard Queries: Application layer aggregation

**3\. Global Distribution**

Multi-Region Architecture:

\- Primary: AWS Africa (writes)

\- Read Replicas: AWS EU, AWS US (reads)

\- Route53 latency-based routing

Data Replication:

\- Database: Cross-region read replicas (async)

\- Media: S3 cross-region replication

\- Cache: Regional Redis clusters

**4\. AI/ML Features**

Personalized Recommendations:

\- Course recommendations based on interests

\- Coach matching based on goals

\- Content ranking in community feed

Technology: 

\- AWS SageMaker or custom ML models

\- Feature store for user behavior

\- Real-time inference via API

---

### **12.3 Advanced Reliability Features**

**1\. Chaos Engineering**

Practice: Intentionally inject failures to test resilience

Tools: AWS Fault Injection Simulator

Scenarios:

\- Random instance termination

\- Network latency injection

\- Database failover drills

\- Cache eviction

**2\. Automated Remediation**

Auto-Healing:

\- Failed health checks → Auto-replace instance

\- High error rate → Auto-scale \+ alert

\- Database connection saturation → Increase pool size

\- Queue backlog → Auto-scale workers

**3\. Advanced Monitoring**

Distributed Tracing: AWS X-Ray or Jaeger

\- End-to-end request tracking

\- Identify bottlenecks across services

\- Understand latency contributors

Synthetic Monitoring:

\- Automated user journey tests

\- Run every 5 minutes from multiple regions

\- Alert on failures before users affected

---

### **12.4 Cost Optimization**

**1\. Reserved Capacity**

After 6 months stable usage:

\- EC2 Reserved Instances (30% savings)

\- RDS Reserved Instances (40% savings)

\- S3 Intelligent-Tiering (automatic cost optimization)

Estimated Savings: $300/month (30% reduction)

**2\. Spot Instances**

Use Cases:

\- Batch processing workers (certificate generation)

\- Analytics jobs

\- Development/staging environments

Savings: 70-90% vs on-demand

Risk Mitigation: Fallback to on-demand if spot unavailable

**3\. Data Lifecycle Optimization**

Automated Policies:

\- S3: Standard → Glacier after 90 days

\- Logs: CloudWatch → S3 after 30 days

\- Database: Archive old data (\> 2 years) to cold storage

\- Compression: gzip all archived data

Estimated Savings: $150/month on storage

---

## **13\. CONCLUSION**

### **13.1 Design Summary**

The Brand Coach Network system architecture is designed to:

✅ **Scale gracefully** from 5K to 100K+ users with clear evolution paths  
✅ **Ensure reliability** through redundancy, failover, and graceful degradation  
✅ **Optimize costs** using managed services and efficient resource utilization  
✅ **Maintain security** with defense-in-depth and compliance-first approach  
✅ **Enable operations** with comprehensive observability and automation

**Key Architectural Decisions:**

1. **Modular Monolith** \- Simplicity for Phase 1, extract services as needed  
2. **PostgreSQL \+ Redis** \- ACID transactions with caching for performance  
3. **Multi-AZ, Single Region** \- High availability within cost constraints  
4. **CDN-First** \- Offload bandwidth and improve global latency  
5. **Async Processing** \- Improve response times and isolate failures  
6. **Managed Services** \- Reduce operational burden for small team

**System Characteristics:**

Availability:  99.9% (SLO)

Latency:       p95 \< 500ms

Throughput:    900 QPS peak (Phase 2\)

Data:          20 GB structured, 1.4 TB objects (3-year projection)

Cost:          $900/month (MVP) → $3,500/month (100K users)

---

### **13.2 Risk Assessment**

**Technical Risks:**

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Database bottleneck | Medium | High | Read replicas, caching, sharding plan |
| Regional AWS outage | Low | Critical | Backup region, DR procedures |
| Payment gateway issues | Medium | Critical | Multiple gateways, circuit breakers |
| Viral growth overwhelms | Low | High | Auto-scaling, rate limiting |
| Security breach | Low | Critical | Defense-in-depth, pen testing |

**Operational Risks:**

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Team capacity | High | Medium | Managed services, automation, documentation |
| Cost overruns | Medium | Medium | Monitoring, alerts, reserved capacity |
| Data loss | Low | Critical | Multi-AZ replication, daily backups |
| Performance regression | Medium | Medium | Load testing, monitoring, SLOs |

---

### **13.3 Success Criteria**

**Technical Metrics:**

* ✅ 99.9% uptime achieved consistently  
* ✅ p95 latency \< 500ms  
* ✅ Zero critical security incidents  
* ✅ Database queries \< 100ms p95

**Business Metrics:**

* ✅ Support 100K users without re-architecture  
* ✅ Process 100K transactions/month reliably  
* ✅ Enable 10+ partner integrations  
* ✅ Cost per user \< $3/month at scale

**Operational Metrics:**

* ✅ \< 4-hour incident recovery time (RTO)  
* ✅ \< 1-hour data loss in disaster (RPO)  
* ✅ Deploy without downtime (rolling deployment)  
* ✅ On-call engineer responds in \< 15 minutes

---

### **13.4 Recommended Next Steps**

**Week 1-2: Infrastructure Setup**

* \[ \] Provision AWS account and VPC  
* \[ \] Set up RDS PostgreSQL (Multi-AZ)  
* \[ \] Configure ElastiCache Redis cluster  
* \[ \] Create S3 buckets with lifecycle policies  
* \[ \] Set up CloudFront CDN

**Week 3-4: Core Services**

* \[ \] Implement API Gateway with rate limiting  
* \[ \] Build authentication service (JWT)  
* \[ \] Set up load balancer (ALB)  
* \[ \] Configure auto-scaling groups  
* \[ \] Implement health checks

**Week 5-8: Application Development**

* \[ \] Develop core services (user, learning, payment)  
* \[ \] Integrate payment gateways (Stripe, Flutterwave)  
* \[ \] Build async processing workers (SQS)  
* \[ \] Implement caching strategy

**Week 9-12: Reliability & Security**

* \[ \] Set up monitoring (CloudWatch, Grafana)  
* \[ \] Configure alerting (PagerDuty)  
* \[ \] Implement circuit breakers  
* \[ \] Security audit and penetration testing  
* \[ \] Disaster recovery testing

**Week 13-16: Testing & Launch**

* \[ \] Load testing (target: 3x expected peak)  
* \[ \] Chaos engineering experiments  
* \[ \] Beta launch with 100 users  
* \[ \] Performance optimization  
* \[ \] Public launch

---

**This system design provides a production-ready architecture that balances simplicity, scalability, reliability, and cost-effectiveness to support The Brand Coach Network's mission to empower \#ABillionLivesGlobally.**

---

**Document Status:** ✅ Complete \- Ready for Implementation  
**Prepared By:** Principal Software Engineer & System Architect  
**Prepared For:** The Brand Coach Network Technical Leadership  
**Date:** December 13, 2025  
**Version:** 1.0 Final

---

**END OF SYSTEM DESIGN DOCUMENT**

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnAAAAI/CAYAAAD3HeQaAACAAElEQVR4XuydibtVYx/333/kfUppIKRBpXmQoknRnNKA0KBSpiiZp4ieJCIaKAlRMlcyRYkQIiSVVFLm6X6vz91772ed++x9zl5r733OXnt9P9e1rrPPb+299rT2Wt/1G/+PEUIIIYQQseL/+AYhhBBCCFHcSMAJISz//vuv2bFjh5k0aZJp2bKl+c9//qNFi5Y8Lccee6zp2bOnWbx4sTl06JD/8xMiNBJwQiScF1980Zxwwglm2rRp5uuvv/ZXCyHyyJdffmmuueYac8wxx5gjR474q4XIGgk4IRLMZZddZmbOnOmbhRBVQP/+/c27777rm4XICgk4IRJK9+7dzbZt23yzEKIK2b17t+nTp49vFqJSJOCESCgTJ070TUKIaqBz586+SYhKkYATIoGcddZZvklUITfccIO55ZZb7O127drZv7///ru56qqr7Hfzzz//2IKSfv36mZ07d6Yeh+2PP/6wBScvv/yyTYifP39+aj34IfGHH37YbvvDDz+0/69evdocPHjQzJkzx4bwoFevXqZLly42P0tUPfv37zd16tTxzUJUiAScEAmEijhRPSCUEGDuhL1p06bUOhdK++GHH8qJqc2bN9ucxbvuusu8/fbbZuDAgWXWw759+8wvv/xSxubud+mll5revXunbjsQhGvXrjV//fWXhH01QqWqEGGQgBMigZx22mm+SVQRzZs3T90m/ynIqFGj7N/PPvvMLFy4MGV/9NFHzfnnn2+mTJmSsvXo0SN120GbiiCnnnqqufPOO60H7rvvvjMHDhywdgQcIhL+/PNPs27dOvPkk0+aX3/9NfhwUYXUrVvXNwlRIRJwQiSQGTNm+CZRRfz9999m8ODBtnUL/cBq165tatSoYQVbzZo1ze23327eeecda3v11VfN9u3bTf369c1DDz1kH+tw3rQgeNvwrjZq1Mg0btzY3n/v3r123WuvvZa6H96eqVOnpiog3bqLL744dR9RtfihbyEqQwJOiARCHpQQonj49ttvfZMQFSIBJ0QCWb9+vW8SQlQjW7Zs8U1CVIgEnBAJ5KOPPvJNQohqZM2aNb5JiAqRgBMigWhklhDFBS1hhAiDBJwQCSTYW0wIUf3ce++9vkmICpGAEyKB7Nq1yzcJIaqRq6++2jcJ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9vXuVTxIwIl8w7Ft9+7dtmH6hg0bzKpVq8wTTzxhFi9ebBYsWGAefPBB89///tfce++95s477zS33HKLmTFjhrnmmmvMFVdcYSu4r7rqKnPttdea1q1bm5tvvtl68m+//XbTuHFjW909b948u51HHnnELFq0yB5vaNuzYsUK8+yzz5oXXnjBrF271rzxxht2lB+to3bt2mUn4CSliboQpUIZAbd3797guiqDAxh07tw5EUm5Z5xxhvXEvfLKK+ann37yV5cs7rsdNGiQefLJJ+WBEyXBv//+a2688UZTo0YNm8c7e/ZsW6xT0bJ+/XqbToGIIwKxZMkSW6E9Z84cM2vWLCvgbrvtNrvd6667zkybNs1ceeWVVsRNmjTJjB8/3px22ml2P2UZPny4GTJkiDn33HPNiBEjzAUXXGAuvvhiM3bsWDNhwgQzefJk+3jEINu76aabrEC844477PPNnTvXPPTQQ2bp0qXm6aefNmvWrDGvvfZaudftL4jCAQMG2PfO7/vvv//2Px4hRIEoI+B++OGH4LoqgytTktvxyHAQK3V69Ohhr5yT1oTzgQceMJs2bTLdu3cv+vcuASey4eqrrzZ9+vSxXvWqhikM7Kcnn3yyv6paoI8ofelefPFFf5UQogCUEXDVmQhLqIAiBq5mS50tW7bYK9YLL7zQX1XyNG/e3HTo0MGGjIoZCThRGQio6kz5wBvHflrd3QN8Bg8e7JuEEAWgjIA7fPhwcF0kfv75Z9+UERLbf//9d/Prr7/anDBc8VzJko+BN/D77783e/bsyWn58ccf/afNC3gKEZwcrAhLsNxwww029EEYZP78+TYPZeHChTY8Qh4KYcOnnnrKrFy50n7ehCleeuklG0rlL/+TJ/bcc8/Z+3BfHkOezOOPP263w/bYLs/Pc5Azc9ddd9lwCyKYMEnPnj2tQOSxhWTnzp3m/ffftwuetbfeesvm1/BeeA/PPPOMfR8s/E+4qG3btjZ8zHtl4WqdUBKfwauvvmofT3jp9ddft3lCbPPtt982GzduNO+++659ns2bN6ee118Qx/moppaAExWB160YKNb9tF69er5JCJFnygi4KFeTCDaqRzkpIypoBszCyfjuu+82EydOtHkZXbp0sWEzl7PhL//3//7fcraKFrZFIu8555xj8z1I8iWPA9FAcq57HQxOP+uss+xj8hGe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6NGmZs2aZtOmTVawIY7cglhCyCGcGAXH+upYeG638FpYeF0svEa3MDmFxb1+RB4tSYKTVrAfPnzY1K1b13p7RDj43DJNqEkK7E86x4pcSSvg3n//fVOjRg3fLISFkxdXzRUteEHwkOA5+fjjj+3J/e233zZvvvmmzVVat26dee2112z45IUXXjDPP/+8XV566SU7/5X13I/2He+9954N63PVjselOhpuzpgxwzclHub5ItyS5EHxQfSph1j24GlVj76j8DncddddvlmIrMmrgCNk0blzZzvcfeLEiWbevHlllnvvvdfceuutNt9h0qRJdpRJrsuECRPsAOtbbrnF3H///WWej/UcXMmrIMSSb7iKWrFihbn55pttkvuiRYvMgw8+aN8nHhtO+tdee625+uqrbWf4yy67zL7ecePG2ZmNF154oRk5cqTNkRg0aFBqIddi1KhRdv0ll1xixo8fbz8vevOxLbZ5/fXXmzvvvNPmZi1btsx8+umn/svLK7xGTtZcNfL8NMB8/fXXK10QbAi3jRs3WiG2efNms2XLFivIclnY5uOPP26/3/PPP99/uXmHz12UhdwjcRR5U7KDvDPxP8jLEyIqaQUcJ9kwAo4wBKLtscce81cVDQhHElr9ofNRQKRxwKbnFCKiWFi1apXNrzjppJNsrlE+IITEvnDHHXf4q4oKBG6+3nM6uCAR/4M8tnz8lkoFcuyi5tQlibZt2/qmREOkAS+uEFHIKODwtmTDddddZ5588knfXJTgskZ45fKDQcwgBosdwpYIuVzgpBSnpqiEbakgKwQXXXSRb0o08jiVp0+fPr5JBDh48KCdOSrKoqb5Iio5C7iGDRv6pqKGJOaoJx9Co3PmzPHNRQvzbE8++WTfnDWU2McNQueEV/PNiBEjfFOiIRFdlEXNzyuGC8I33njDNyeeFi1a+CYhsiKjgMsmvwVPFuX8cSOb95aOqMKvOiFsTMVdWKjco/9R3CCsVwiv4bnnnuubEo0EXHnIuRWZIcWBPFhRllwuskWyySjgTjnlFN9cjt69e/umWEAJexQvTfv27X1T0UNhSZTvaevWrbE92NKUM9/079/fNyUa8j9FWW677TblBVYAPdA4roiyqJBBRCWtgKMK9bTTTvPN5YijR8px5ZVX+qYKwQNDo9E4EuV7inPj2kcffTTvJ1K6sov/kW2KRTpo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>