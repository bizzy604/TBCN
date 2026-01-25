# **DATABASE ARCHITECTURE DOCUMENT**

## **The Brand Coach Network Web Application**

**Document Version:** 1.0  
**Prepared By:** Database Architect & Data Platform Engineer  
**Date:** December 13, 2025  
**Status:** Production-Ready Database Design  
**Target Database:** PostgreSQL 15+ (Primary), Redis (Caching), S3 (Object Storage)

---

## **1\. EXECUTIVE SUMMARY**

The Brand Coach Network requires a robust, scalable database architecture to support a multi-sided platform serving individuals, coaches, partners, and administrators. The system must handle:

* **User scale:** 5K users (MVP) → 100K+ users (Year 2\)  
* **Content volume:** 500GB (initial) → 10TB+ (growth)  
* **Transaction throughput:** 1,000/month → 25,000+/month  
* **Geographic reach:** Pan-African with global expansion

### **Key Design Decisions**

1. **PostgreSQL as Primary Database**

   * ACID compliance for financial transactions  
   * Rich relational model for complex entity relationships  
   * Excellent JSON support for flexible attributes  
   * Strong ecosystem and tooling  
2. **Redis for Caching & Sessions**

   * Sub-millisecond response times  
   * Session management  
   * Rate limiting and temporary data  
3. **AWS S3 for Object Storage**

   * Media files (videos, images, documents)  
   * Backups and archives  
   * Cost-effective at scale  
4. **Multi-Tenant Single-Database Architecture**

   * Simplified operations for MVP/growth stage  
   * Clear data isolation through foreign keys  
   * Migration to multi-database possible if needed

### **Critical Success Factors**

* ✅ **Write integrity:** Financial transactions must be ACID-compliant  
* ✅ **Read performance:** Course content and community feeds must load in \<500ms  
* ✅ **Data compliance:** GDPR and Kenya Data Protection Act adherence  
* ✅ **Operational simplicity:** Small team must be able to manage reliably

---

## **2\. DATA DOMAIN OVERVIEW**

### **Core Business Domains**

**1\. Identity & Access Management**

* User accounts, authentication, authorization  
* Profile management and brand portfolios  
* Role-based permissions

**2\. Learning & Development**

* Programs, courses, modules, lessons  
* Assessments, quizzes, assignments  
* Progress tracking and certifications

**3\. Coaching & Mentorship**

* Coach profiles and availability  
* Session scheduling and management  
* Feedback and ratings

**4\. Community & Collaboration**

* Discussion forums and posts  
* Direct messaging  
* Project submissions and collaborations

**5\. Commerce & Monetization**

* Membership subscriptions  
* Course enrollments and purchases  
* Event ticketing  
* Merchandise sales  
* Payment processing

**6\. Events & Experiences**

* Event creation and management  
* Registration and attendance tracking  
* Virtual and physical event logistics

**7\. Partnerships & Institutions**

* Partner profiles and management  
* Bulk enrollments and cohorts  
* Impact reporting and analytics

**8\. Content Management**

* Content creation and approval workflows  
* Media asset management  
* SEO and metadata

**9\. Analytics & Reporting**

* User behavior tracking  
* Business metrics  
* Impact measurement

---

## **3\. KEY ENTITIES & RELATIONSHIPS**

### **3.1 Entity Relationship Diagram (Conceptual)**

┌─────────────────────────────────────────────────────────────────┐  
│                        IDENTITY DOMAIN                          │  
│                                                                 │  
│  ┌──────┐     ┌────────────┐     ┌──────────┐                │  
│  │ User ├────→│ UserRole   │     │ Session  │                │  
│  └──┬───┘     └────────────┘     └──────────┘                │  
│     │                                                          │  
└─────┼──────────────────────────────────────────────────────────┘  
      │  
      ├─────────────────────────────────────────────────────────┐  
      │                                                         │  
┌─────▼─────────────────────────────┐   ┌────────────────────▼──┐  
│      LEARNING DOMAIN              │   │   COMMERCE DOMAIN      │  
│                                   │   │                        │  
│  ┌─────────┐    ┌──────────┐    │   │  ┌──────────────┐     │  
│  │ Program ├───→│ Module   │    │   │  │ Subscription │     │  
│  └────┬────┘    └────┬─────┘    │   │  └──────────────┘     │  
│       │              │           │   │                        │  
│       │         ┌────▼─────┐    │   │  ┌──────────────┐     │  
│       │         │ Lesson   │    │   │  │ Transaction  │     │  
│       │         └──────────┘    │   │  └──────────────┘     │  
│       │                         │   │                        │  
│  ┌────▼────────┐                │   │  ┌──────────────┐     │  
│  │ Enrollment  │                │   │  │ Payment      │     │  
│  └─────────────┘                │   │  └──────────────┘     │  
│                                   │   │                        │  
└───────────────────────────────────┘   └────────────────────────┘  
      │  
      │  
┌─────▼─────────────────────────────┐   ┌────────────────────────┐  
│     COMMUNITY DOMAIN              │   │    COACHING DOMAIN     │  
│                                   │   │                        │  
│  ┌──────┐    ┌─────────┐         │   │  ┌─────────────────┐  │  
│  │ Post ├───→│ Comment │         │   │  │ CoachingSession │  │  
│  └──────┘    └─────────┘         │   │  └─────────────────┘  │  
│                                   │   │                        │  
│  ┌─────────┐                     │   │  ┌─────────────────┐  │  
│  │ Message │                     │   │  │ Availability    │  │  
│  └─────────┘                     │   │  └─────────────────┘  │  
│                                   │   │                        │  
│  ┌─────────┐                     │   │  ┌─────────────────┐  │  
│  │ Project │                     │   │  │ SessionFeedback │  │  
│  └─────────┘                     │   │  └─────────────────┘  │  
│                                   │   │                        │  
└───────────────────────────────────┘   └────────────────────────┘

### **3.2 Entity Descriptions**

**Core Entities (15 Primary Tables):**

1. **users** \- All platform users (members, coaches, partners, admins)  
2. **user\_roles** \- Role assignments with temporal validity  
3. **user\_profiles** \- Extended profile information and branding  
4. **programs** \- Learning programs and courses  
5. **modules** \- Course modules/sections  
6. **lessons** \- Individual learning units  
7. **enrollments** \- User-program relationships with progress  
8. **assessments** \- Quizzes, assignments, evaluations  
9. **certificates** \- Issued certifications  
10. **coaching\_sessions** \- Scheduled mentorship sessions  
11. **posts** \- Community content (discussions, stories)  
12. **messages** \- Direct user-to-user communication  
13. **events** \- Masterclasses, webinars, conferences  
14. **transactions** \- All financial records  
15. **subscriptions** \- Recurring membership records

**Supporting Entities (15 Secondary Tables):**

16. **user\_skills** \- Skills tagged to users  
17. **user\_connections** \- Follower/following relationships  
18. **lesson\_progress** \- Granular progress tracking  
19. **assessment\_submissions** \- User assessment attempts  
20. **comments** \- Replies to posts  
21. **reactions** \- Likes, bookmarks, endorsements  
22. **projects** \- Innovation Hub submissions  
23. **event\_registrations** \- Event attendance tracking  
24. **partners** \- Organizational partner profiles  
25. **partner\_cohorts** \- Bulk enrollment groups  
26. **coupons** \- Discount codes and promotions  
27. **notifications** \- User notification queue  
28. **audit\_logs** \- System activity tracking  
29. **content\_approvals** \- Workflow state management  
30. **media\_assets** \- File metadata and references

---

## **4\. ACCESS PATTERNS**

### **4.1 Critical Read Patterns (Ordered by Frequency)**

**P1: User Profile & Dashboard Load** (Every session)

\-- Frequency: 10,000+ times/day  
\-- Latency requirement: \<200ms  
SELECT u.\*, up.\*, ur.role\_name, m.tier, m.status  
FROM users u  
JOIN user\_profiles up ON u.user\_id \= up.user\_id  
LEFT JOIN user\_roles ur ON u.user\_id \= ur.user\_id  
LEFT JOIN subscriptions m ON u.user\_id \= m.user\_id AND m.status \= 'active'  
WHERE u.user\_id \= $1 AND u.status \= 'active';

**P2: Course Content Delivery** (Learning sessions)

\-- Frequency: 5,000+ times/day  
\-- Latency requirement: \<300ms  
SELECT l.\*, lp.progress\_percent, lp.completed\_at  
FROM lessons l  
JOIN modules m ON l.module\_id \= m.module\_id  
JOIN programs p ON m.program\_id \= p.program\_id  
JOIN enrollments e ON p.program\_id \= e.program\_id  
LEFT JOIN lesson\_progress lp ON l.lesson\_id \= lp.lesson\_id AND lp.user\_id \= e.user\_id  
WHERE e.user\_id \= $1 AND m.module\_id \= $2  
ORDER BY l.sequence\_order;

**P3: Community Feed** (Active engagement)

\-- Frequency: 3,000+ times/day  
\-- Latency requirement: \<500ms  
SELECT p.\*, u.full\_name, u.profile\_photo\_url,  
       COUNT(DISTINCT c.comment\_id) as comment\_count,  
       COUNT(DISTINCT r.reaction\_id) as reaction\_count  
FROM posts p  
JOIN users u ON p.author\_id \= u.user\_id  
LEFT JOIN comments c ON p.post\_id \= c.post\_id  
LEFT JOIN reactions r ON p.post\_id \= r.entity\_id AND r.entity\_type \= 'post'  
WHERE p.status \= 'published' AND p.category \= $1  
GROUP BY p.post\_id, u.user\_id  
ORDER BY p.created\_at DESC  
LIMIT 20 OFFSET $2;

**P4: Coach Directory Search** (Discovery)

\-- Frequency: 500+ times/day  
\-- Latency requirement: \<400ms  
SELECT u.user\_id, u.full\_name, up.bio, up.tagline, up.hourly\_rate,  
       AVG(sf.rating) as avg\_rating,  
       COUNT(DISTINCT cs.session\_id) as session\_count  
FROM users u  
JOIN user\_profiles up ON u.user\_id \= up.user\_id  
JOIN user\_roles ur ON u.user\_id \= ur.user\_id AND ur.role\_name \= 'coach'  
LEFT JOIN coaching\_sessions cs ON u.user\_id \= cs.coach\_id AND cs.status \= 'completed'  
LEFT JOIN session\_feedback sf ON cs.session\_id \= sf.session\_id  
WHERE up.skills @\> $1 \-- JSON array containment  
  AND up.location-\>\>'country' \= $2  
  AND u.status \= 'active'  
GROUP BY u.user\_id, up.profile\_id  
HAVING AVG(sf.rating) \>= $3  
ORDER BY avg\_rating DESC, session\_count DESC;

**P5: Event Registration Flow** (Conversion critical)

\-- Frequency: 200+ times/day  
\-- Latency requirement: \<300ms  
SELECT e.\*,   
       COUNT(er.registration\_id) as registration\_count,  
       e.capacity\_limit \- COUNT(er.registration\_id) as spots\_remaining  
FROM events e  
LEFT JOIN event\_registrations er ON e.event\_id \= er.event\_id  
WHERE e.event\_id \= $1  
GROUP BY e.event\_id;

### **4.2 Critical Write Patterns**

**W1: Transaction Recording** (Revenue critical)

\-- Frequency: 100+ times/day  
\-- Consistency: ACID required, serializable isolation  
BEGIN;  
  INSERT INTO transactions (user\_id, amount, type, reference\_id, ...)  
  VALUES ($1, $2, $3, $4, ...);  
    
  UPDATE subscriptions SET status \= 'active', renewed\_at \= NOW()  
  WHERE subscription\_id \= $5;  
    
  INSERT INTO audit\_logs (action, user\_id, entity\_type, entity\_id, ...)  
  VALUES ('subscription\_renewed', $1, 'subscription', $5, ...);  
COMMIT;

**W2: Progress Tracking** (High volume)

\-- Frequency: 2,000+ times/day  
\-- Consistency: Eventual consistency acceptable  
INSERT INTO lesson\_progress (user\_id, lesson\_id, progress\_percent, time\_spent, ...)  
VALUES ($1, $2, $3, $4, ...)  
ON CONFLICT (user\_id, lesson\_id)   
DO UPDATE SET   
  progress\_percent \= GREATEST(lesson\_progress.progress\_percent, $3),  
  time\_spent \= lesson\_progress.time\_spent \+ $4,  
  updated\_at \= NOW();

**W3: Community Engagement** (Real-time feel)

\-- Frequency: 1,000+ times/day  
\-- Consistency: Eventual consistency acceptable  
INSERT INTO posts (author\_id, title, content, category, ...)  
VALUES ($1, $2, $3, $4, ...)  
RETURNING post\_id;

\-- Increment cached counter (denormalized)  
UPDATE users SET post\_count \= post\_count \+ 1 WHERE user\_id \= $1;

### **4.3 Analytical Queries (Lower priority, async acceptable)**

**A1: Admin Dashboard Metrics**

\-- Frequency: Hourly background job  
\-- Latency requirement: \<10 seconds acceptable  
SELECT   
  COUNT(DISTINCT user\_id) FILTER (WHERE created\_at \>= NOW() \- INTERVAL '30 days') as new\_users\_30d,  
  COUNT(DISTINCT user\_id) FILTER (WHERE last\_login \>= NOW() \- INTERVAL '7 days') as active\_users\_7d,  
  SUM(amount) FILTER (WHERE created\_at \>= NOW() \- INTERVAL '1 month') as revenue\_monthly  
FROM users u  
LEFT JOIN transactions t ON u.user\_id \= t.user\_id;

**A2: Program Performance Report**

\-- Frequency: Daily background job  
\-- Latency requirement: \<30 seconds acceptable  
SELECT p.program\_id, p.title,  
       COUNT(DISTINCT e.user\_id) as enrollment\_count,  
       AVG(CASE WHEN e.status \= 'completed' THEN 1 ELSE 0 END) as completion\_rate,  
       AVG(c.rating) as avg\_rating  
FROM programs p  
LEFT JOIN enrollments e ON p.program\_id \= e.program\_id  
LEFT JOIN certificates c ON e.enrollment\_id \= c.enrollment\_id  
GROUP BY p.program\_id;

### **4.4 Access Pattern Summary**

| Pattern Type | Daily Volume | Latency Target | Consistency |
| ----- | ----- | ----- | ----- |
| User Dashboard Load | 10,000+ | \<200ms | Eventual |
| Course Content | 5,000+ | \<300ms | Eventual |
| Community Feed | 3,000+ | \<500ms | Eventual |
| Search Queries | 1,000+ | \<400ms | Eventual |
| Progress Updates | 2,000+ | \<1s | Eventual |
| Financial Transactions | 100+ | \<500ms | ACID |
| Analytics Queries | 50 | \<30s | Eventual |

**Read:Write Ratio:** Approximately 80:20 (read-heavy workload)

---

## **5\. DATABASE TECHNOLOGY CHOICES**

### **5.1 Primary Database: PostgreSQL 15+**

**Rationale:**

✅ **ACID Compliance**

* Financial transactions require strong consistency  
* Subscription management needs reliable state transitions  
* Payment reconciliation demands transactional integrity

✅ **Rich Relational Model**

* Complex entity relationships (users, programs, enrollments, sessions)  
* Foreign key constraints ensure referential integrity  
* JOIN operations naturally express domain relationships

✅ **JSON/JSONB Support**

* Flexible user profiles (skills, preferences, custom fields)  
* Dynamic event metadata  
* Evolving schema without migrations for optional attributes

✅ **Full-Text Search**

* Course catalog search  
* Community post search  
* Coach directory filtering  
* Alternative to Elasticsearch for MVP (simpler operations)

✅ **Mature Ecosystem**

* Excellent tooling (pgAdmin, DBeaver, Postico)  
* Strong backup solutions (pg\_dump, Barman, WAL-E)  
* Rich monitoring (pg\_stat\_statements, explain analyze)  
* Battle-tested replication and failover

✅ **Performance Characteristics**

* Handles complex queries efficiently  
* Excellent optimizer for JOIN-heavy workloads  
* Materialized views for pre-computed analytics  
* Partitioning support for large tables

**Trade-offs Accepted:**

* Vertical scaling limits (addressed with read replicas)  
* Slower writes than NoSQL (acceptable for transaction volumes)  
* Schema migrations required (managed with versioned migrations)

---

### **5.2 Caching Layer: Redis 7+**

**Rationale:**

✅ **Session Management**

* Sub-millisecond session lookup  
* TTL-based automatic expiration  
* Distributed sessions across app servers

✅ **Hot Data Caching**

* User profile cache (reduce DB load)  
* Course metadata cache  
* Coach availability cache  
* Community feed cache (reduce complex query load)

✅ **Rate Limiting**

* API request throttling  
* Login attempt tracking  
* Payment fraud prevention

✅ **Real-Time Features**

* Message queue for notifications  
* Pub/sub for live updates  
* Presence tracking (online users)

**Usage Patterns:**

\# Session storage  
SET session:{uuid} {json\_data} EX 86400

\# User profile cache  
SETEX user:profile:{user\_id} 3600 {json\_data}

\# Rate limiting  
INCR ratelimit:{user\_id}:{endpoint}  
EXPIRE ratelimit:{user\_id}:{endpoint} 3600

\# Course catalog cache  
ZADD courses:popular {score} {course\_id}

**Cache Invalidation Strategy:**

* Write-through for critical data (user profiles)  
* TTL-based for semi-static data (course catalogs)  
* Explicit invalidation on updates (sessions, carts)

---

### **5.3 Object Storage: AWS S3**

**Rationale:**

✅ **Media Storage**

* Video lessons (potentially hundreds of GB per course)  
* User profile photos and brand assets  
* Assignment submissions and portfolios  
* Event recordings and replays

✅ **Cost Efficiency**

* $0.023/GB/month vs. database storage costs  
* Glacier for archival (old course content)  
* Lifecycle policies automate transitions

✅ **Scalability**

* Unlimited storage capacity  
* Global CDN integration (CloudFront)  
* Multi-region replication available

✅ **Security**

* Server-side encryption  
* Signed URLs for time-limited access  
* Bucket policies for access control

**Storage Organization:**

s3://brand-coach-network/  
  /users/{user\_id}/  
    profile-photo.jpg  
    portfolio/  
      project1.pdf  
      project2.mp4  
  /courses/{program\_id}/  
    /modules/{module\_id}/  
      /lessons/{lesson\_id}/  
        video.mp4  
        resources.zip  
  /events/{event\_id}/  
    banner.jpg  
    recordings/  
      session-{date}.mp4  
  /certificates/  
    {certificate\_id}.pdf  
  /backups/  
    db-backup-{date}.dump

---

### **5.4 Search (Future): Elasticsearch (Phase 2\)**

**Deferred to Phase 2 because:**

* PostgreSQL full-text search sufficient for MVP  
* Additional infrastructure complexity  
* Operational overhead for small team  
* Sync consistency challenges

**When to introduce:**

* Search volume \>10,000 queries/day  
* Need for advanced relevance tuning  
* Multi-language search requirements  
* Real-time typeahead/autocomplete critical

---

### **5.5 Technology Stack Summary**

| Component | Technology | Purpose | When |
| ----- | ----- | ----- | ----- |
| Primary DB | PostgreSQL 15+ | Transactional data | MVP |
| Cache | Redis 7+ | Sessions, hot data | MVP |
| Object Storage | AWS S3 | Media files | MVP |
| CDN | CloudFront | Static asset delivery | MVP |
| Search | PostgreSQL FTS | Course/content search | MVP |
| Search | Elasticsearch | Advanced search | Phase 2 |
| Analytics DB | PostgreSQL (same) | Business intelligence | MVP |
| Analytics DB | Snowflake/BigQuery | Data warehouse | Phase 3 |
| Time-Series | TimescaleDB extension | Metrics tracking | Phase 2 |

---

## **6\. SCHEMA DESIGN (LOGICAL & PHYSICAL)**

### **6.1 Core Schema: Identity & Access Management**

\============================================================================  
USERS: Core identity table  
\============================================================================  
CREATE TABLE users (  
  user\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  email VARCHAR(255) UNIQUE NOT NULL,  
  username VARCHAR(100) UNIQUE,  
  email\_verified BOOLEAN DEFAULT FALSE,  
  password\_hash VARCHAR(255), \-- NULL for social login only  
  full\_name VARCHAR(255) NOT NULL,  
  phone\_number VARCHAR(50),  
  phone\_verified BOOLEAN DEFAULT FALSE,  
  status VARCHAR(20) NOT NULL DEFAULT 'active',   
    \-- active, suspended, deleted, pending\_verification  
    
  \-- Authentication  
  last\_login TIMESTAMPTZ,  
  failed\_login\_attempts INT DEFAULT 0,  
  locked\_until TIMESTAMPTZ,  
  two\_factor\_enabled BOOLEAN DEFAULT FALSE,  
  two\_factor\_secret VARCHAR(255),  
    
  \-- Metadata  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
  deleted\_at TIMESTAMPTZ, \-- Soft delete  
    
  \-- Constraints  
  CONSTRAINT valid\_email CHECK (email \~\* '^\[A-Za-z0-9.\_%+-\]+@\[A-Za-z0-9.-\]+\\.\[A-Z|a-z\]{2,}$'),  
  CONSTRAINT valid\_status CHECK (status IN ('active', 'suspended', 'deleted', 'pending\_verification'))  
);

CREATE INDEX idx\_users\_email ON users(email) WHERE status \!= 'deleted';  
CREATE INDEX idx\_users\_username ON users(username) WHERE username IS NOT NULL;  
CREATE INDEX idx\_users\_status ON users(status);  
CREATE INDEX idx\_users\_created\_at ON users(created\_at);

\============================================================================  
USER\_ROLES: Role-based access control with temporal validity  
\============================================================================  
CREATE TABLE user\_roles (  
  user\_role\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  role\_name VARCHAR(50) NOT NULL, \-- member, coach, partner, admin, super\_admin  
  granted\_by UUID REFERENCES users(user\_id),  
  granted\_at TIMESTAMPTZ DEFAULT NOW(),  
  expires\_at TIMESTAMPTZ, \-- NULL \= permanent  
  revoked\_at TIMESTAMPTZ,  
    
  CONSTRAINT valid\_role CHECK (role\_name IN ('member', 'coach', 'partner', 'admin', 'super\_admin')),  
  CONSTRAINT active\_role CHECK (revoked\_at IS NULL OR revoked\_at \> granted\_at)  
);

CREATE INDEX idx\_user\_roles\_user ON user\_roles(user\_id);  
CREATE INDEX idx\_user\_roles\_active ON user\_roles(user\_id, role\_name)   
  WHERE revoked\_at IS NULL AND (expires\_at IS NULL OR expires\_at \> NOW());

\-- \============================================================================  
\-- USER\_PROFILES: Extended profile and brand information  
\-- \============================================================================  
CREATE TABLE user\_profiles (  
  profile\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID UNIQUE NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  \-- Brand Identity  
  brand\_name VARCHAR(255),  
  tagline VARCHAR(500),  
  bio TEXT,  
  mission\_statement TEXT,  
    
  \-- Professional Details  
  occupation VARCHAR(255),  
  industry VARCHAR(100),  
  years\_experience INT,  
    
  \-- Location  
  location JSONB, \-- {country, city, timezone}  
    
  \-- Contact Visibility  
  show\_email BOOLEAN DEFAULT FALSE,  
  show\_phone BOOLEAN DEFAULT FALSE,  
    
  \-- Social Links  
  social\_links JSONB, \-- {linkedin, twitter, instagram, youtube, website}  
    
  \-- Skills & Expertise (for coaches/professionals)  
  skills JSONB, \-- \["Personal Branding", "SME Development", ...\]  
  certifications JSONB, \-- \[{name, issuer, date, credential\_id}, ...\]  
    
  \-- Coach-Specific  
  hourly\_rate DECIMAL(10,2),  
  currency VARCHAR(3) DEFAULT 'USD',  
  availability\_status VARCHAR(20), \-- available, busy, away  
  coaching\_specialties JSONB,  
    
  \-- Media  
  profile\_photo\_url VARCHAR(500),  
  cover\_photo\_url VARCHAR(500),  
  portfolio\_urls JSONB, \-- \[{title, url, type}, ...\]  
    
  \-- Profile Completion & Engagement  
  profile\_completion\_percent INT DEFAULT 0,  
  post\_count INT DEFAULT 0,  
  follower\_count INT DEFAULT 0,  
  following\_count INT DEFAULT 0,  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_profiles\_user ON user\_profiles(user\_id);  
CREATE INDEX idx\_profiles\_skills ON user\_profiles USING GIN (skills);  
CREATE INDEX idx\_profiles\_location ON user\_profiles USING GIN (location);  
CREATE INDEX idx\_profiles\_coach\_status ON user\_profiles(availability\_status)   
  WHERE hourly\_rate IS NOT NULL;

\-- \============================================================================  
\-- USER\_CONNECTIONS: Follower/following relationships  
\-- \============================================================================  
CREATE TABLE user\_connections (  
  connection\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  follower\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  following\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT no\_self\_follow CHECK (follower\_id \!= following\_id),  
  UNIQUE(follower\_id, following\_id)  
);

CREATE INDEX idx\_connections\_follower ON user\_connections(follower\_id);  
CREATE INDEX idx\_connections\_following ON user\_connections(following\_id);

\-- \============================================================================  
\-- SESSIONS: Authentication sessions  
\-- \============================================================================  
\-- NOTE: This is primarily managed in Redis for performance  
\-- PostgreSQL backup for persistence and debugging  
CREATE TABLE sessions (  
  session\_id UUID PRIMARY KEY,  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  token\_hash VARCHAR(255) NOT NULL,  
  ip\_address INET,  
  user\_agent TEXT,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  expires\_at TIMESTAMPTZ NOT NULL,  
  last\_activity TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_sessions\_user ON sessions(user\_id);  
CREATE INDEX idx\_sessions\_expires ON sessions(expires\_at);

### **6.2 Core Schema: Learning & Development**

\-- \============================================================================  
\-- PROGRAMS: Top-level learning programs/courses  
\-- \============================================================================  
CREATE TABLE programs (  
  program\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  title VARCHAR(500) NOT NULL,  
  slug VARCHAR(500) UNIQUE NOT NULL,  
  description TEXT,  
  long\_description TEXT,  
    
  \-- Categorization  
  category VARCHAR(100), \-- Personal Branding, SME, Leadership, etc.  
  tags JSONB, \-- \["entrepreneurship", "digital skills", ...\]  
  difficulty\_level VARCHAR(20), \-- beginner, intermediate, advanced  
    
  \-- Instructor  
  instructor\_id UUID NOT NULL REFERENCES users(user\_id),  
  co\_instructors JSONB, \-- Array of user\_ids  
    
  \-- Pricing  
  pricing\_type VARCHAR(20) NOT NULL, \-- free, one\_time, subscription  
  price\_amount DECIMAL(10,2),  
  currency VARCHAR(3) DEFAULT 'USD',  
  tier\_access JSONB, \-- \["discover", "build", "thrive"\]  
    
  \-- Structure  
  duration\_weeks INT,  
  estimated\_hours DECIMAL(5,2),  
  module\_count INT DEFAULT 0,  
  lesson\_count INT DEFAULT 0,  
    
  \-- Engagement Metrics (denormalized for performance)  
  enrollment\_count INT DEFAULT 0,  
  completion\_count INT DEFAULT 0,  
  average\_rating DECIMAL(3,2),  
  review\_count INT DEFAULT 0,  
    
  \-- Media  
  thumbnail\_url VARCHAR(500),  
  preview\_video\_url VARCHAR(500),  
    
  \-- Status & Lifecycle  
  status VARCHAR(20) DEFAULT 'draft', \-- draft, published, archived  
  published\_at TIMESTAMPTZ,  
  archived\_at TIMESTAMPTZ,  
    
  \-- SEO  
  meta\_description TEXT,  
  meta\_keywords JSONB,  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_status CHECK (status IN ('draft', 'published', 'archived')),  
  CONSTRAINT valid\_pricing\_type CHECK (pricing\_type IN ('free', 'one\_time', 'subscription'))  
);

CREATE INDEX idx\_programs\_slug ON programs(slug);  
CREATE INDEX idx\_programs\_category ON programs(category);  
CREATE INDEX idx\_programs\_instructor ON programs(instructor\_id);  
CREATE INDEX idx\_programs\_status ON programs(status) WHERE status \= 'published';  
CREATE INDEX idx\_programs\_tags ON programs USING GIN (tags);  
CREATE INDEX idx\_programs\_tier ON programs USING GIN (tier\_access);

\-- Full-text search  
CREATE INDEX idx\_programs\_fts ON programs USING GIN (  
  to\_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))  
);

\-- \============================================================================  
\-- MODULES: Course sections/chapters  
\-- \============================================================================  
CREATE TABLE modules (  
  module\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  program\_id UUID NOT NULL REFERENCES programs(program\_id) ON DELETE CASCADE,  
  title VARCHAR(500) NOT NULL,  
  description TEXT,  
  sequence\_order INT NOT NULL,  
    
  \-- Unlock Logic  
  unlock\_after\_module\_id UUID REFERENCES modules(module\_id), \-- Sequential unlocking  
  unlock\_date TIMESTAMPTZ, \-- Date-based release  
    
  \-- Metadata  
  estimated\_duration\_minutes INT,  
  lesson\_count INT DEFAULT 0,  
    
  \-- Status  
  is\_published BOOLEAN DEFAULT TRUE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(program\_id, sequence\_order)  
);

CREATE INDEX idx\_modules\_program ON modules(program\_id, sequence\_order);

\-- \============================================================================  
\-- LESSONS: Individual learning units  
\-- \============================================================================  
CREATE TABLE lessons (  
  lesson\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  module\_id UUID NOT NULL REFERENCES modules(module\_id) ON DELETE CASCADE,  
  title VARCHAR(500) NOT NULL,  
  description TEXT,  
  sequence\_order INT NOT NULL,  
    
  \-- Content  
  content\_type VARCHAR(20) NOT NULL, \-- video, text, quiz, assignment, resource  
  video\_url VARCHAR(500),  
  video\_duration\_seconds INT,  
  text\_content TEXT,  
  resource\_urls JSONB, \-- \[{title, url, type, size}, ...\]  
    
  \-- Engagement  
  is\_preview BOOLEAN DEFAULT FALSE, \-- Free preview lesson  
  estimated\_minutes INT,  
    
  \-- Status  
  is\_published BOOLEAN DEFAULT TRUE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(module\_id, sequence\_order),  
  CONSTRAINT valid\_content\_type CHECK (content\_type IN ('video', 'text', 'quiz', 'assignment', 'resource'))  
);

CREATE INDEX idx\_lessons\_module ON lessons(module\_id, sequence\_order);  
CREATE INDEX idx\_lessons\_preview ON lessons(is\_preview) WHERE is\_preview \= TRUE;

\-- \============================================================================  
\-- ENROLLMENTS: User-program relationships  
\-- \============================================================================  
CREATE TABLE enrollments (  
  enrollment\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  program\_id UUID NOT NULL REFERENCES programs(program\_id) ON DELETE CASCADE,  
    
  \-- Progress  
  enrollment\_date TIMESTAMPTZ DEFAULT NOW(),  
  last\_accessed\_at TIMESTAMPTZ,  
  progress\_percent INT DEFAULT 0,  
  current\_module\_id UUID REFERENCES modules(module\_id),  
  current\_lesson\_id UUID REFERENCES lessons(lesson\_id),  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'active', \-- active, completed, dropped, suspended  
  completion\_date TIMESTAMPTZ,  
    
  \-- Payment  
  payment\_type VARCHAR(20), \-- subscription, one\_time, scholarship, free  
  transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Certificate  
  certificate\_issued BOOLEAN DEFAULT FALSE,  
  certificate\_issued\_at TIMESTAMPTZ,  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(user\_id, program\_id),  
  CONSTRAINT valid\_status CHECK (status IN ('active', 'completed', 'dropped', 'suspended')),  
  CONSTRAINT valid\_progress CHECK (progress\_percent \>= 0 AND progress\_percent \<= 100\)  
);

CREATE INDEX idx\_enrollments\_user ON enrollments(user\_id, status);  
CREATE INDEX idx\_enrollments\_program ON enrollments(program\_id, status);  
CREATE INDEX idx\_enrollments\_active ON enrollments(user\_id) WHERE status \= 'active';

\-- \============================================================================  
\-- LESSON\_PROGRESS: Granular progress tracking  
\-- \============================================================================  
CREATE TABLE lesson\_progress (  
  progress\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  lesson\_id UUID NOT NULL REFERENCES lessons(lesson\_id) ON DELETE CASCADE,  
  enrollment\_id UUID NOT NULL REFERENCES enrollments(enrollment\_id) ON DELETE CASCADE,  
    
  \-- Progress  
  progress\_percent INT DEFAULT 0,  
  time\_spent\_seconds INT DEFAULT 0,  
  last\_position\_seconds INT, \-- For video lessons  
  completed\_at TIMESTAMPTZ,  
    
  \-- Timestamps  
  first\_accessed\_at TIMESTAMPTZ DEFAULT NOW(),  
  last\_accessed\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(user\_id, lesson\_id),  
  CONSTRAINT valid\_progress CHECK (progress\_percent \>= 0 AND progress\_percent \<= 100\)  
);

CREATE INDEX idx\_lesson\_progress\_user ON lesson\_progress(user\_id);  
CREATE INDEX idx\_lesson\_progress\_enrollment ON lesson\_progress(enrollment\_id);  
CREATE INDEX idx\_lesson\_progress\_lesson ON lesson\_progress(lesson\_id);

\-- \============================================================================  
\-- ASSESSMENTS: Quizzes, assignments, evaluations  
\-- \============================================================================  
CREATE TABLE assessments (  
  assessment\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  lesson\_id UUID REFERENCES lessons(lesson\_id) ON DELETE CASCADE,  
  program\_id UUID REFERENCES programs(program\_id) ON DELETE CASCADE, \-- For program-level assessments  
  title VARCHAR(500) NOT NULL,  
  description TEXT,  
    
  \-- Type & Configuration  
  assessment\_type VARCHAR(20) NOT NULL, \-- quiz, assignment, project, peer\_review  
  passing\_score INT, \-- Percentage required to pass  
  max\_attempts INT DEFAULT 3,  
  time\_limit\_minutes INT,  
    
  \-- Content  
  questions JSONB, \-- Quiz questions with answers  
  instructions TEXT, \-- Assignment instructions  
  rubric JSONB, \-- Grading rubric  
    
  \-- Auto-grading  
  is\_auto\_graded BOOLEAN DEFAULT TRUE,  
    
  \-- Status  
  is\_published BOOLEAN DEFAULT TRUE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_type CHECK (assessment\_type IN ('quiz', 'assignment', 'project', 'peer\_review')),  
  CONSTRAINT has\_parent CHECK (lesson\_id IS NOT NULL OR program\_id IS NOT NULL)  
);

CREATE INDEX idx\_assessments\_lesson ON assessments(lesson\_id);  
CREATE INDEX idx\_assessments\_program ON assessments(program\_id);

\-- \============================================================================  
\-- ASSESSMENT\_SUBMISSIONS: User assessment attempts  
\-- \============================================================================  
CREATE TABLE assessment\_submissions (  
  submission\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  assessment\_id UUID NOT NULL REFERENCES assessments(assessment\_id) ON DELETE CASCADE,  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  enrollment\_id UUID NOT NULL REFERENCES enrollments(enrollment\_id) ON DELETE CASCADE,  
    
  \-- Attempt  
  attempt\_number INT NOT NULL,  
  started\_at TIMESTAMPTZ DEFAULT NOW(),  
  submitted\_at TIMESTAMPTZ,  
  time\_taken\_seconds INT,  
    
  \-- Content  
  answers JSONB, \-- User's answers  
  submission\_files JSONB, \-- \[{filename, url, size}, ...\]  
    
  \-- Grading  
  score DECIMAL(5,2),  
  passed BOOLEAN,  
  graded\_by UUID REFERENCES users(user\_id), \-- Coach/instructor  
  graded\_at TIMESTAMPTZ,  
  feedback TEXT,  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'in\_progress', \-- in\_progress, submitted, graded, returned  
    
  CONSTRAINT valid\_status CHECK (status IN ('in\_progress', 'submitted', 'graded', 'returned')),  
  UNIQUE(assessment\_id, user\_id, attempt\_number)  
);

CREATE INDEX idx\_submissions\_assessment ON assessment\_submissions(assessment\_id);  
CREATE INDEX idx\_submissions\_user ON assessment\_submissions(user\_id, status);  
CREATE INDEX idx\_submissions\_grading ON assessment\_submissions(status) WHERE status \= 'submitted';

\-- \============================================================================  
\-- CERTIFICATES: Issued program certificates  
\-- \============================================================================  
CREATE TABLE certificates (  
  certificate\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  enrollment\_id UUID UNIQUE NOT NULL REFERENCES enrollments(enrollment\_id) ON DELETE CASCADE,  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  program\_id UUID NOT NULL REFERENCES programs(program\_id) ON DELETE CASCADE,  
    
  \-- Certificate Details  
  certificate\_number VARCHAR(50) UNIQUE NOT NULL,  
  issued\_at TIMESTAMPTZ DEFAULT NOW(),  
  issued\_by UUID REFERENCES users(user\_id), \-- Admin or instructor  
    
  \-- Content  
  title VARCHAR(500) NOT NULL,  
  description TEXT,  
  certificate\_url VARCHAR(500), \-- PDF URL in S3  
    
  \-- Verification  
  verification\_code VARCHAR(100) UNIQUE NOT NULL,  
  is\_revoked BOOLEAN DEFAULT FALSE,  
  revoked\_at TIMESTAMPTZ,  
  revocation\_reason TEXT,  
    
  \-- Metadata  
  completion\_score DECIMAL(5,2),  
  completion\_date TIMESTAMPTZ NOT NULL,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_certificates\_user ON certificates(user\_id);  
CREATE INDEX idx\_certificates\_program ON certificates(program\_id);  
CREATE INDEX idx\_certificates\_verification ON certificates(verification\_code) WHERE is\_revoked \= FALSE;

### **6.3 Core Schema: Coaching & Mentorship**

\-- \============================================================================  
\-- COACHING\_SESSIONS: Scheduled mentorship sessions  
\-- \============================================================================  
CREATE TABLE coaching\_sessions (  
  session\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Participants  
  coach\_id UUID NOT NULL REFERENCES users(user\_id),  
  mentee\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Scheduling  
  scheduled\_at TIMESTAMPTZ NOT NULL,  
  duration\_minutes INT NOT NULL DEFAULT 60,  
  timezone VARCHAR(50) NOT NULL,  
    
  \-- Type  
  session\_type VARCHAR(20) NOT NULL, \-- one\_on\_one, group, discovery\_call  
  topic VARCHAR(500),  
  notes TEXT, \-- Pre-session notes from mentee  
    
  \-- Virtual Meeting  
  meeting\_platform VARCHAR(20) DEFAULT 'zoom', \-- zoom, google\_meet, teams  
  meeting\_link VARCHAR(500),  
  meeting\_id VARCHAR(100),  
  meeting\_password VARCHAR(100),  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'scheduled',   
    \-- scheduled, confirmed, in\_progress, completed, cancelled, no\_show  
    
  \-- Cancellation  
  cancelled\_at TIMESTAMPTZ,  
  cancelled\_by UUID REFERENCES users(user\_id),  
  cancellation\_reason TEXT,  
    
  \-- Completion  
  completed\_at TIMESTAMPTZ,  
  coach\_notes TEXT, \-- Post-session notes  
  action\_items JSONB, \-- \[{item, due\_date, status}, ...\]  
    
  \-- Payment  
  payment\_amount DECIMAL(10,2),  
  currency VARCHAR(3) DEFAULT 'USD',  
  payment\_status VARCHAR(20) DEFAULT 'pending',   
    \-- pending, paid, refunded, cancelled  
  transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_session\_type CHECK (session\_type IN ('one\_on\_one', 'group', 'discovery\_call')),  
  CONSTRAINT valid\_status CHECK (status IN ('scheduled', 'confirmed', 'in\_progress', 'completed', 'cancelled', 'no\_show')),  
  CONSTRAINT valid\_payment\_status CHECK (payment\_status IN ('pending', 'paid', 'refunded', 'cancelled')),  
  CONSTRAINT no\_self\_coaching CHECK (coach\_id \!= mentee\_id)  
);

CREATE INDEX idx\_sessions\_coach ON coaching\_sessions(coach\_id, scheduled\_at);  
CREATE INDEX idx\_sessions\_mentee ON coaching\_sessions(mentee\_id, scheduled\_at);  
CREATE INDEX idx\_sessions\_status ON coaching\_sessions(status);  
CREATE INDEX idx\_sessions\_upcoming ON coaching\_sessions(scheduled\_at)   
  WHERE status IN ('scheduled', 'confirmed') AND scheduled\_at \> NOW();

\-- \============================================================================  
\-- SESSION\_FEEDBACK: Post-session ratings and reviews  
\-- \============================================================================  
CREATE TABLE session\_feedback (  
  feedback\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  session\_id UUID UNIQUE NOT NULL REFERENCES coaching\_sessions(session\_id) ON DELETE CASCADE,  
  submitted\_by UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Rating  
  rating INT NOT NULL, \-- 1-5 stars  
  would\_recommend BOOLEAN,  
    
  \-- Feedback  
  feedback\_text TEXT,  
  highlights JSONB, \-- \["Great insights", "Actionable advice", ...\]  
  improvements JSONB, \-- \["More structure", "Better time management", ...\]  
    
  \-- Privacy  
  is\_public BOOLEAN DEFAULT FALSE, \-- Can be shown as testimonial  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_rating CHECK (rating BETWEEN 1 AND 5\)  
);

CREATE INDEX idx\_feedback\_session ON session\_feedback(session\_id);  
CREATE INDEX idx\_feedback\_coach ON session\_feedback(submitted\_by);  
CREATE INDEX idx\_feedback\_public ON session\_feedback(is\_public) WHERE is\_public \= TRUE;

\-- \============================================================================  
\-- COACH\_AVAILABILITY: Coach scheduling preferences  
\-- \============================================================================  
CREATE TABLE coach\_availability (  
  availability\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  coach\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  \-- Time Slot  
  day\_of\_week INT NOT NULL, \-- 0-6 (Sunday-Saturday)  
  start\_time TIME NOT NULL,  
  end\_time TIME NOT NULL,  
  timezone VARCHAR(50) NOT NULL,  
    
  \-- Recurrence  
  effective\_from DATE NOT NULL,  
  effective\_until DATE, \-- NULL \= ongoing  
    
  \-- Capacity  
  max\_sessions\_per\_slot INT DEFAULT 1,  
    
  \-- Status  
  is\_active BOOLEAN DEFAULT TRUE,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_day CHECK (day\_of\_week BETWEEN 0 AND 6),  
  CONSTRAINT valid\_time CHECK (start\_time \< end\_time)  
);

CREATE INDEX idx\_availability\_coach ON coach\_availability(coach\_id, day\_of\_week);  
CREATE INDEX idx\_availability\_active ON coach\_availability(coach\_id, is\_active)   
  WHERE is\_active \= TRUE;

\-- \============================================================================  
\-- COACH\_BLOCKED\_TIMES: One-off unavailable periods  
\-- \============================================================================  
CREATE TABLE coach\_blocked\_times (  
  blocked\_time\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  coach\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  blocked\_from TIMESTAMPTZ NOT NULL,  
  blocked\_until TIMESTAMPTZ NOT NULL,  
  reason VARCHAR(500),  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_block CHECK (blocked\_from \< blocked\_until)  
);

CREATE INDEX idx\_blocked\_times\_coach ON coach\_blocked\_times(coach\_id);  
CREATE INDEX idx\_blocked\_times\_period ON coach\_blocked\_times(coach\_id, blocked\_from, blocked\_until);

### **6.4 Core Schema: Community & Collaboration**

\-- \============================================================================  
\-- POSTS: Community discussions, stories, questions  
\-- \============================================================================  
CREATE TABLE posts (  
  post\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  author\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Content  
  title VARCHAR(500),  
  content TEXT NOT NULL,  
  category VARCHAR(50) NOT NULL, \-- discussion, story, question, project, announcement  
  tags JSONB, \-- \["entrepreneurship", "branding", ...\]  
    
  \-- Media  
  media\_urls JSONB, \-- \[{url, type, thumbnail}, ...\]  
    
  \-- Engagement Metrics (denormalized)  
  view\_count INT DEFAULT 0,  
  like\_count INT DEFAULT 0,  
  comment\_count INT DEFAULT 0,  
  bookmark\_count INT DEFAULT 0,  
  share\_count INT DEFAULT 0,  
    
  \-- Moderation  
  status VARCHAR(20) DEFAULT 'published', \-- draft, pending, published, flagged, removed  
  moderated\_by UUID REFERENCES users(user\_id),  
  moderation\_note TEXT,  
    
  \-- Pinning & Featuring  
  is\_pinned BOOLEAN DEFAULT FALSE,  
  is\_featured BOOLEAN DEFAULT FALSE,  
  featured\_until TIMESTAMPTZ,  
    
  \-- SEO  
  slug VARCHAR(500) UNIQUE,  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
  published\_at TIMESTAMPTZ,  
    
  CONSTRAINT valid\_category CHECK (category IN ('discussion', 'story', 'question', 'project', 'announcement')),  
  CONSTRAINT valid\_status CHECK (status IN ('draft', 'pending', 'published', 'flagged', 'removed'))  
);

CREATE INDEX idx\_posts\_author ON posts(author\_id);  
CREATE INDEX idx\_posts\_category ON posts(category, published\_at DESC);  
CREATE INDEX idx\_posts\_status ON posts(status);  
CREATE INDEX idx\_posts\_published ON posts(published\_at DESC) WHERE status \= 'published';  
CREATE INDEX idx\_posts\_tags ON posts USING GIN (tags);  
CREATE INDEX idx\_posts\_featured ON posts(is\_featured, published\_at DESC) WHERE is\_featured \= TRUE;

\-- Full-text search  
CREATE INDEX idx\_posts\_fts ON posts USING GIN (  
  to\_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))  
);

\-- \============================================================================  
\-- COMMENTS: Replies to posts  
\-- \============================================================================  
CREATE TABLE comments (  
  comment\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  post\_id UUID NOT NULL REFERENCES posts(post\_id) ON DELETE CASCADE,  
  author\_id UUID NOT NULL REFERENCES users(user\_id),  
  parent\_comment\_id UUID REFERENCES comments(comment\_id) ON DELETE CASCADE, \-- For nested replies  
    
  \-- Content  
  content TEXT NOT NULL,  
    
  \-- Engagement  
  like\_count INT DEFAULT 0,  
    
  \-- Moderation  
  status VARCHAR(20) DEFAULT 'published', \-- published, flagged, removed  
  moderated\_by UUID REFERENCES users(user\_id),  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_status CHECK (status IN ('published', 'flagged', 'removed'))  
);

CREATE INDEX idx\_comments\_post ON comments(post\_id, created\_at);  
CREATE INDEX idx\_comments\_author ON comments(author\_id);  
CREATE INDEX idx\_comments\_parent ON comments(parent\_comment\_id) WHERE parent\_comment\_id IS NOT NULL;

**\========================================================================**  
**\-- REACTIONS: Likes, bookmarks, endorsements \-- \========================================================================**  
CREATE TABLE reactions (  
  reaction\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  \-- Target (polymorphic)  
  entity\_type VARCHAR(20) NOT NULL, \-- post, comment, project, profile  
  entity\_id UUID NOT NULL,  
    
  \-- Reaction Type  
  reaction\_type VARCHAR(20) NOT NULL, \-- like, love, bookmark, endorse  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(user\_id, entity\_type, entity\_id, reaction\_type),  
  CONSTRAINT valid\_entity\_type CHECK (entity\_type IN ('post', 'comment', 'project', 'profile')),  
  CONSTRAINT valid\_reaction\_type CHECK (reaction\_type IN ('like', 'love', 'bookmark', 'endorse'))  
);

CREATE INDEX idx\_reactions\_user ON reactions(user\_id, reaction\_type);  
CREATE INDEX idx\_reactions\_entity ON reactions(entity\_type, entity\_id);

\-- **\========================================================================**  
**\-- MESSAGES: Direct user-to-user messaging \-- \========================================================================**  
CREATE TABLE messages (  
  message\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  conversation\_id UUID NOT NULL, \-- Group messages by conversation  
  sender\_id UUID NOT NULL REFERENCES users(user\_id),  
  recipient\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Content  
  content TEXT NOT NULL,  
  attachments JSONB, \-- \[{filename, url, type, size}, ...\]  
    
  \-- Status  
  is\_read BOOLEAN DEFAULT FALSE,  
  read\_at TIMESTAMPTZ,  
  is\_deleted\_by\_sender BOOLEAN DEFAULT FALSE,  
  is\_deleted\_by\_recipient BOOLEAN DEFAULT FALSE,  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT no\_self\_message CHECK (sender\_id \!= recipient\_id)  
);

CREATE INDEX idx\_messages\_conversation ON messages(conversation\_id, created\_at DESC);  
CREATE INDEX idx\_messages\_sender ON messages(sender\_id);  
CREATE INDEX idx\_messages\_recipient ON messages(recipient\_id, is\_read);  
CREATE INDEX idx\_messages\_unread ON messages(recipient\_id, is\_read) WHERE is\_read \= FALSE;

\-- \============================================================================ \-- PROJECTS: Innovation Hub project submissions \-- \============================================================================ CREATE TABLE projects ( project\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), submitted\_by UUID NOT NULL REFERENCES users(user\_id),

\-- Content title VARCHAR(500) NOT NULL, slug VARCHAR(500) UNIQUE, problem\_statement TEXT NOT NULL, solution\_description TEXT NOT NULL, target\_market TEXT,

\-- Stage & Support stage VARCHAR(20) NOT NULL, \-- idea, prototype, active, scaling support\_needed JSONB, \-- \["mentorship", "funding", "visibility", "partnership"\]

\-- Media pitch\_deck\_url VARCHAR(500), demo\_url VARCHAR(500), media\_urls JSONB,

\-- Engagement view\_count INT DEFAULT 0, endorsement\_count INT DEFAULT 0, collaboration\_request\_count INT DEFAULT 0,

\-- Status status VARCHAR(20) DEFAULT 'pending', \-- pending, approved, rejected, archived reviewed\_by UUID REFERENCES users(user\_id), review\_notes TEXT,

\-- Visibility is\_featured BOOLEAN DEFAULT FALSE, featured\_until TIMESTAMPTZ,

\-- Timestamps created\_at TIMESTAMPTZ DEFAULT NOW(), updated\_at TIMESTAMPTZ DEFAULT NOW(), published\_at TIMESTAMPTZ,

CONSTRAINT valid\_stage CHECK (stage IN ('idea', 'prototype', 'active', 'scaling')), CONSTRAINT valid\_status CHECK (status IN ('pending', 'approved', 'rejected', 'archived')) );

CREATE INDEX idx\_projects\_submitted\_by ON projects(submitted\_by); CREATE INDEX idx\_projects\_status ON projects(status, created\_at DESC); CREATE INDEX idx\_projects\_published ON projects(published\_at DESC) WHERE status \= 'approved'; CREATE INDEX idx\_projects\_stage ON projects(stage) WHERE status \= 'approved'; CREATE INDEX idx\_projects\_support ON projects USING GIN (support\_needed);

\-- Full-text search CREATE INDEX idx\_projects\_fts ON projects USING GIN ( to\_tsvector('english', coalesce(title, '') || ' ' || coalesce(problem\_statement, '') || ' ' || coalesce(solution\_description, '')) );

\-- \============================================================================ \-- PROJECT\_COLLABORATORS: Team members on projects \-- \============================================================================ CREATE TABLE project\_collaborators ( collaborator\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(), project\_id UUID NOT NULL REFERENCES projects(project\_id) ON DELETE CASCADE, user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE, role VARCHAR(100), \-- Co-founder, Developer, Designer, Advisor, etc. joined\_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(project\_id, user\_id) );

CREATE INDEX idx\_project\_collaborators\_project ON project\_collaborators(project\_id); CREATE INDEX idx\_project\_collaborators\_user ON project\_collaborators(user\_id);

\#\#\# 6.5 Core Schema: Commerce & Monetization

\`\`\`sql  
\-- \============================================================================  
\-- TRANSACTIONS: All financial records  
\-- \============================================================================  
CREATE TABLE transactions (  
  transaction\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Amount  
  amount DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',  
    
  \-- Type & Reference  
  transaction\_type VARCHAR(30) NOT NULL,   
    \-- subscription, course, event, merchandise, coaching, donation, refund  
  reference\_type VARCHAR(30), \-- program, event, coaching\_session, product  
  reference\_id UUID,  
    
  \-- Payment Gateway  
  payment\_method VARCHAR(30) NOT NULL, \-- mpesa, stripe\_card, paypal, bank\_transfer  
  gateway\_name VARCHAR(50), \-- stripe, flutterwave, paystack  
  gateway\_transaction\_id VARCHAR(255),  
  gateway\_reference VARCHAR(255),  
    
  \-- Status  
  status VARCHAR(20) NOT NULL DEFAULT 'pending',   
    \-- pending, processing, success, failed, refunded, cancelled  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  processed\_at TIMESTAMPTZ,  
  failed\_at TIMESTAMPTZ,  
  refunded\_at TIMESTAMPTZ,  
    
  \-- Metadata  
  metadata JSONB, \-- Gateway-specific data, invoice info  
  failure\_reason TEXT,  
  refund\_reason TEXT,  
    
  \-- Commission (for marketplace transactions)  
  platform\_fee\_percent DECIMAL(5,2),  
  platform\_fee\_amount DECIMAL(10,2),  
  seller\_payout\_amount DECIMAL(10,2),  
    
  CONSTRAINT valid\_transaction\_type CHECK (transaction\_type IN   
    ('subscription', 'course', 'event', 'merchandise', 'coaching', 'donation', 'refund')),  
  CONSTRAINT valid\_status CHECK (status IN   
    ('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled')),  
  CONSTRAINT valid\_amount CHECK (amount \>= 0\)  
);

CREATE INDEX idx\_transactions\_user ON transactions(user\_id, created\_at DESC);  
CREATE INDEX idx\_transactions\_status ON transactions(status);  
CREATE INDEX idx\_transactions\_type ON transactions(transaction\_type);  
CREATE INDEX idx\_transactions\_gateway ON transactions(gateway\_transaction\_id);  
CREATE INDEX idx\_transactions\_reference ON transactions(reference\_type, reference\_id);  
CREATE INDEX idx\_transactions\_success ON transactions(created\_at DESC) WHERE status \= 'success';

\-- \============================================================================  
\-- SUBSCRIPTIONS: Recurring membership records  
\-- \============================================================================  
CREATE TABLE subscriptions (  
  subscription\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Tier  
  tier VARCHAR(20) NOT NULL, \-- discover, build, thrive, impact  
    
  \-- Billing  
  billing\_cycle VARCHAR(20) NOT NULL, \-- monthly, annual  
  amount DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',  
    
  \-- Status  
  status VARCHAR(20) NOT NULL DEFAULT 'active',   
    \-- active, cancelled, expired, suspended, past\_due  
    
  \-- Dates  
  started\_at TIMESTAMPTZ DEFAULT NOW(),  
  current\_period\_start TIMESTAMPTZ NOT NULL,  
  current\_period\_end TIMESTAMPTZ NOT NULL,  
  cancelled\_at TIMESTAMPTZ,  
  ended\_at TIMESTAMPTZ,  
    
  \-- Payment  
  payment\_method VARCHAR(30),  
  gateway\_subscription\_id VARCHAR(255), \-- Stripe subscription ID  
    
  \-- Renewal  
  auto\_renew BOOLEAN DEFAULT TRUE,  
  next\_billing\_date TIMESTAMPTZ,  
  last\_payment\_transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Trial  
  trial\_start TIMESTAMPTZ,  
  trial\_end TIMESTAMPTZ,  
    
  \-- Cancellation  
  cancellation\_reason VARCHAR(20), \-- user\_requested, payment\_failed, upgrade, downgrade  
  cancellation\_note TEXT,  
    
  \-- Metadata  
  metadata JSONB,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_tier CHECK (tier IN ('discover', 'build', 'thrive', 'impact')),  
  CONSTRAINT valid\_cycle CHECK (billing\_cycle IN ('monthly', 'annual')),  
  CONSTRAINT valid\_status CHECK (status IN ('active', 'cancelled', 'expired', 'suspended', 'past\_due'))  
);

CREATE INDEX idx\_subscriptions\_user ON subscriptions(user\_id);  
CREATE INDEX idx\_subscriptions\_status ON subscriptions(status);  
CREATE INDEX idx\_subscriptions\_active ON subscriptions(user\_id) WHERE status \= 'active';  
CREATE INDEX idx\_subscriptions\_renewal ON subscriptions(next\_billing\_date)   
  WHERE status \= 'active' AND auto\_renew \= TRUE;

\-- \============================================================================  
\-- COUPONS: Discount codes and promotions  
\-- \============================================================================  
CREATE TABLE coupons (  
  coupon\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  code VARCHAR(50) UNIQUE NOT NULL,  
    
  \-- Discount  
  discount\_type VARCHAR(20) NOT NULL, \-- percentage, fixed\_amount  
  discount\_value DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3), \-- Required for fixed\_amount  
    
  \-- Applicability  
  applies\_to VARCHAR(30) NOT NULL, \-- all, subscription, course, event, merchandise  
  applicable\_tiers JSONB, \-- \["build", "thrive"\] or null for all  
  applicable\_items JSONB, \-- Array of program\_ids, event\_ids, etc.  
    
  \-- Usage Limits  
  max\_uses INT, \-- NULL \= unlimited  
  max\_uses\_per\_user INT DEFAULT 1,  
  current\_uses INT DEFAULT 0,  
    
  \-- Validity  
  valid\_from TIMESTAMPTZ DEFAULT NOW(),  
  valid\_until TIMESTAMPTZ,  
  is\_active BOOLEAN DEFAULT TRUE,  
    
  \-- Creator  
  created\_by UUID REFERENCES users(user\_id),  
    
  \-- Metadata  
  description TEXT,  
  internal\_notes TEXT,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_discount\_type CHECK (discount\_type IN ('percentage', 'fixed\_amount')),  
  CONSTRAINT valid\_percentage CHECK (  
    discount\_type \!= 'percentage' OR (discount\_value \>= 0 AND discount\_value \<= 100\)  
  ),  
  CONSTRAINT valid\_fixed\_amount CHECK (  
    discount\_type \!= 'fixed\_amount' OR (discount\_value \>= 0 AND currency IS NOT NULL)  
  )  
);

CREATE INDEX idx\_coupons\_code ON coupons(code) WHERE is\_active \= TRUE;  
CREATE INDEX idx\_coupons\_validity ON coupons(valid\_from, valid\_until) WHERE is\_active \= TRUE;

\-- \============================================================================  
\-- COUPON\_REDEMPTIONS: Track coupon usage  
\-- \============================================================================  
CREATE TABLE coupon\_redemptions (  
  redemption\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  coupon\_id UUID NOT NULL REFERENCES coupons(coupon\_id),  
  user\_id UUID NOT NULL REFERENCES users(user\_id),  
  transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Discount Applied  
  discount\_amount DECIMAL(10,2) NOT NULL,  
  original\_amount DECIMAL(10,2) NOT NULL,  
  final\_amount DECIMAL(10,2) NOT NULL,  
    
  redeemed\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_redemptions\_coupon ON coupon\_redemptions(coupon\_id);  
CREATE INDEX idx\_redemptions\_user ON coupon\_redemptions(user\_id);

\-- \============================================================================  
\-- PRODUCTS: Merchandise and digital products  
\-- \============================================================================  
CREATE TABLE products (  
  product\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Basic Info  
  name VARCHAR(500) NOT NULL,  
  slug VARCHAR(500) UNIQUE NOT NULL,  
  description TEXT,  
    
  \-- Type  
  product\_type VARCHAR(20) NOT NULL, \-- physical, digital, bundle  
  category VARCHAR(100), \-- books, apparel, toolkits, etc.  
    
  \-- Pricing  
  price DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3) DEFAULT 'USD',  
  compare\_at\_price DECIMAL(10,2), \-- Original price for sale display  
    
  \-- Inventory (for physical products)  
  sku VARCHAR(100) UNIQUE,  
  track\_inventory BOOLEAN DEFAULT FALSE,  
  inventory\_quantity INT,  
  low\_stock\_threshold INT,  
    
  \-- Digital Product  
  digital\_file\_url VARCHAR(500), \-- For digital downloads  
  download\_limit INT, \-- Max downloads per purchase  
    
  \-- Shipping (for physical products)  
  requires\_shipping BOOLEAN DEFAULT FALSE,  
  weight\_grams INT,  
    
  \-- Media  
  images JSONB, \-- \[{url, alt\_text, sequence}, ...\]  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'draft', \-- draft, active, archived  
  is\_featured BOOLEAN DEFAULT FALSE,  
    
  \-- SEO  
  meta\_description TEXT,  
  meta\_keywords JSONB,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_product\_type CHECK (product\_type IN ('physical', 'digital', 'bundle')),  
  CONSTRAINT valid\_status CHECK (status IN ('draft', 'active', 'archived'))  
);

CREATE INDEX idx\_products\_slug ON products(slug);  
CREATE INDEX idx\_products\_category ON products(category);  
CREATE INDEX idx\_products\_status ON products(status) WHERE status \= 'active';  
CREATE INDEX idx\_products\_sku ON products(sku) WHERE sku IS NOT NULL;

\-- \============================================================================  
\-- ORDERS: Product purchase orders  
\-- \============================================================================  
CREATE TABLE orders (  
  order\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id),  
  order\_number VARCHAR(50) UNIQUE NOT NULL,  
    
  \-- Amounts  
  subtotal DECIMAL(10,2) NOT NULL,  
  discount\_amount DECIMAL(10,2) DEFAULT 0,  
  tax\_amount DECIMAL(10,2) DEFAULT 0,  
  shipping\_amount DECIMAL(10,2) DEFAULT 0,  
  total\_amount DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3) DEFAULT 'USD',  
    
  \-- Payment  
  payment\_status VARCHAR(20) DEFAULT 'pending', \-- pending, paid, refunded  
  transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Shipping  
  shipping\_address JSONB, \-- {name, street, city, country, postal\_code, phone}  
  shipping\_method VARCHAR(50),  
  tracking\_number VARCHAR(100),  
  tracking\_url VARCHAR(500),  
    
  \-- Status  
  fulfillment\_status VARCHAR(20) DEFAULT 'pending',   
    \-- pending, processing, shipped, delivered, cancelled  
    
  \-- Timestamps  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  paid\_at TIMESTAMPTZ,  
  shipped\_at TIMESTAMPTZ,  
  delivered\_at TIMESTAMPTZ,  
  cancelled\_at TIMESTAMPTZ,  
    
  \-- Metadata  
  notes TEXT,  
  metadata JSONB,  
    
  CONSTRAINT valid\_payment\_status CHECK (payment\_status IN ('pending', 'paid', 'refunded')),  
  CONSTRAINT valid\_fulfillment\_status CHECK (fulfillment\_status IN   
    ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))  
);

CREATE INDEX idx\_orders\_user ON orders(user\_id, created\_at DESC);  
CREATE INDEX idx\_orders\_number ON orders(order\_number);  
CREATE INDEX idx\_orders\_fulfillment ON orders(fulfillment\_status) WHERE fulfillment\_status IN ('pending', 'processing');

\-- \============================================================================  
\-- ORDER\_ITEMS: Items within an order  
\-- \============================================================================  
CREATE TABLE order\_items (  
  order\_item\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  order\_id UUID NOT NULL REFERENCES orders(order\_id) ON DELETE CASCADE,  
  product\_id UUID REFERENCES products(product\_id),  
    
  \-- Product snapshot (in case product changes/deleted)  
  product\_name VARCHAR(500) NOT NULL,  
  product\_sku VARCHAR(100),  
    
  \-- Pricing  
  unit\_price DECIMAL(10,2) NOT NULL,  
  quantity INT NOT NULL DEFAULT 1,  
  subtotal DECIMAL(10,2) NOT NULL,  
  discount\_amount DECIMAL(10,2) DEFAULT 0,  
  total DECIMAL(10,2) NOT NULL,  
    
  \-- Digital Download  
  download\_url VARCHAR(500),  
  download\_expires\_at TIMESTAMPTZ,  
  download\_count INT DEFAULT 0,  
    
  CONSTRAINT valid\_quantity CHECK (quantity \> 0\)  
);

CREATE INDEX idx\_order\_items\_order ON order\_items(order\_id);  
CREATE INDEX idx\_order\_items\_product ON order\_items(product\_id);

### **6.6 Core Schema: Events & Experiences**

\-- \============================================================================  
\-- EVENTS: Masterclasses, webinars, conferences  
\-- \============================================================================  
CREATE TABLE events (  
  event\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Basic Info  
  title VARCHAR(500) NOT NULL,  
  slug VARCHAR(500) UNIQUE NOT NULL,  
  description TEXT,  
  agenda TEXT,  
    
  \-- Date & Time  
  event\_date TIMESTAMPTZ NOT NULL,  
  end\_date TIMESTAMPTZ,  
  timezone VARCHAR(50) NOT NULL,  
  duration\_minutes INT,  
    
  \-- Location  
  location\_type VARCHAR(20) NOT NULL, \-- virtual, physical, hybrid  
  physical\_address TEXT,  
  virtual\_platform VARCHAR(50), \-- zoom, youtube\_live, google\_meet  
  virtual\_link VARCHAR(500),  
  meeting\_id VARCHAR(100),  
  meeting\_password VARCHAR(100),  
    
  \-- Organizer  
  organizer\_id UUID NOT NULL REFERENCES users(user\_id),  
  co\_organizers JSONB, \-- Array of user\_ids  
  speakers JSONB, \-- \[{user\_id, name, bio, photo\_url}, ...\]  
    
  \-- Capacity  
  capacity\_limit INT,  
  registration\_count INT DEFAULT 0,  
  attendance\_count INT DEFAULT 0,  
    
  \-- Media  
  banner\_image\_url VARCHAR(500),  
  recording\_url VARCHAR(500),  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'draft', \-- draft, published, in\_progress, completed, cancelled  
  is\_featured BOOLEAN DEFAULT FALSE,  
    
  \-- Registration  
  registration\_opens\_at TIMESTAMPTZ,  
  registration\_closes\_at TIMESTAMPTZ,  
  requires\_approval BOOLEAN DEFAULT FALSE,  
    
  \-- SEO  
  meta\_description TEXT,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
  published\_at TIMESTAMPTZ,  
    
  CONSTRAINT valid\_location\_type CHECK (location\_type IN ('virtual', 'physical', 'hybrid')),  
  CONSTRAINT valid\_status CHECK (status IN ('draft', 'published', 'in\_progress', 'completed', 'cancelled'))  
);

CREATE INDEX idx\_events\_slug ON events(slug);  
CREATE INDEX idx\_events\_organizer ON events(organizer\_id);  
CREATE INDEX idx\_events\_date ON events(event\_date) WHERE status \= 'published';  
CREATE INDEX idx\_events\_upcoming ON events(event\_date)   
  WHERE status \= 'published' AND event\_date \> NOW();  
CREATE INDEX idx\_events\_status ON events(status);

\-- \============================================================================  
\-- EVENT\_TICKETS: Ticket tiers for events  
\-- \============================================================================  
CREATE TABLE event\_tickets (  
  ticket\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  event\_id UUID NOT NULL REFERENCES events(event\_id) ON DELETE CASCADE,  
    
  \-- Ticket Type  
  name VARCHAR(100) NOT NULL, \-- Early Bird, General, VIP, etc.  
  description TEXT,  
    
  \-- Pricing  
  price DECIMAL(10,2) NOT NULL,  
  currency VARCHAR(3) DEFAULT 'USD',  
    
  \-- Availability  
  quantity\_available INT,  
  quantity\_sold INT DEFAULT 0,  
    
  \-- Sale Period  
  sale\_starts\_at TIMESTAMPTZ,  
  sale\_ends\_at TIMESTAMPTZ,  
    
  \-- Access Level  
  perks JSONB, \-- \["Certificate", "Recordings", "VIP Seating"\]  
    
  \-- Status  
  is\_active BOOLEAN DEFAULT TRUE,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_price CHECK (price \>= 0),  
  CONSTRAINT valid\_quantity CHECK (quantity\_sold \<= quantity\_available)  
);

CREATE INDEX idx\_event\_tickets\_event ON event\_tickets(event\_id);  
CREATE INDEX idx\_event\_tickets\_active ON event\_tickets(event\_id, is\_active) WHERE is\_active \= TRUE;

\-- \============================================================================  
\-- EVENT\_REGISTRATIONS: Attendee registration records  
\-- \============================================================================  
CREATE TABLE event\_registrations (  
  registration\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  event\_id UUID NOT NULL REFERENCES events(event\_id),  
  ticket\_id UUID REFERENCES event\_tickets(ticket\_id),  
  user\_id UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Registration  
  registration\_date TIMESTAMPTZ DEFAULT NOW(),  
  status VARCHAR(20) DEFAULT 'registered',   
    \-- registered, waitlisted, cancelled, attended, no\_show  
    
  \-- Payment  
  amount\_paid DECIMAL(10,2),  
  transaction\_id UUID REFERENCES transactions(transaction\_id),  
    
  \-- Ticket  
  ticket\_code VARCHAR(100) UNIQUE,  
  qr\_code\_url VARCHAR(500),  
    
  \-- Check-in  
  checked\_in BOOLEAN DEFAULT FALSE,  
  checked\_in\_at TIMESTAMPTZ,  
  checked\_in\_by UUID REFERENCES users(user\_id),  
    
  \-- Cancellation  
  cancelled\_at TIMESTAMPTZ,  
  cancellation\_reason TEXT,  
  refund\_issued BOOLEAN DEFAULT FALSE,  
    
  \-- Metadata  
  metadata JSONB, \-- Custom registration fields  
    
  UNIQUE(event\_id, user\_id),  
  CONSTRAINT valid\_status CHECK (status IN   
    ('registered', 'waitlisted', 'cancelled', 'attended', 'no\_show'))  
);

CREATE INDEX idx\_registrations\_event ON event\_registrations(event\_id);  
CREATE INDEX idx\_registrations\_user ON event\_registrations(user\_id);  
CREATE INDEX idx\_registrations\_ticket ON event\_registrations(ticket\_code);  
CREATE INDEX idx\_registrations\_status ON event\_registrations(event\_id, status);

### **6.7 Core Schema: Partners & Institutions**

\-- \============================================================================  
\-- PARTNERS: Organizational partner profiles  
\-- \============================================================================  
CREATE TABLE partners (  
  partner\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Organization  
  organization\_name VARCHAR(500) NOT NULL,  
  slug VARCHAR(500) UNIQUE NOT NULL,  
  description TEXT,  
    
  \-- Type  
  partner\_type VARCHAR(30) NOT NULL,   
    \-- corporate, academic, ngo, government, cec\_franchise, sponsor  
    
  \-- Contact  
  primary\_contact\_user\_id UUID REFERENCES users(user\_id),  
  contact\_email VARCHAR(255),  
  contact\_phone VARCHAR(50),  
  website\_url VARCHAR(500),  
    
  \-- Location  
  headquarters\_location JSONB, \-- {country, city}  
  operating\_regions JSONB, \-- Array of countries/regions  
    
  \-- Branding  
  logo\_url VARCHAR(500),  
  brand\_colors JSONB, \-- {primary, secondary, accent}  
    
  \-- Partnership Details  
  partnership\_tier VARCHAR(20), \-- bronze, silver, gold, platinum  
  partnership\_start\_date DATE,  
  partnership\_end\_date DATE,  
    
  \-- Programs  
  programs\_enrolled JSONB, \-- Array of program\_ids  
  custom\_programs JSONB, \-- Co-branded program details  
    
  \-- Engagement Metrics  
  total\_participants INT DEFAULT 0,  
  active\_participants INT DEFAULT 0,  
  certifications\_issued INT DEFAULT 0,  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'active', \-- active, inactive, suspended  
  is\_featured BOOLEAN DEFAULT FALSE,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_partner\_type CHECK (partner\_type IN   
    ('corporate', 'academic', 'ngo', 'government', 'cec\_franchise', 'sponsor')),  
  CONSTRAINT valid\_status CHECK (status IN ('active', 'inactive', 'suspended'))  
);

CREATE INDEX idx\_partners\_slug ON partners(slug);  
CREATE INDEX idx\_partners\_type ON partners(partner\_type);  
CREATE INDEX idx\_partners\_status ON partners(status) WHERE status \= 'active';

\-- \============================================================================  
\-- PARTNER\_COHORTS: Bulk enrollment groups  
\-- \============================================================================  
CREATE TABLE partner\_cohorts (  
  cohort\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  partner\_id UUID NOT NULL REFERENCES partners(partner\_id) ON DELETE CASCADE,  
  program\_id UUID NOT NULL REFERENCES programs(program\_id),  
    
  \-- Cohort Info  
  cohort\_name VARCHAR(255) NOT NULL,  
  description TEXT,  
    
  \-- Schedule  
  start\_date DATE NOT NULL,  
  end\_date DATE,  
    
  \-- Capacity  
  max\_participants INT,  
  enrolled\_count INT DEFAULT 0,  
    
  \-- Customization  
  is\_white\_labeled BOOLEAN DEFAULT FALSE,  
  custom\_branding JSONB,  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'active', \-- active, completed, cancelled  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_status CHECK (status IN ('active', 'completed', 'cancelled'))  
);

CREATE INDEX idx\_cohorts\_partner ON partner\_cohorts(partner\_id);  
CREATE INDEX idx\_cohorts\_program ON partner\_cohorts(program\_id);  
CREATE INDEX idx\_cohorts\_dates ON partner\_cohorts(start\_date, end\_date);

\-- \============================================================================  
\-- COHORT\_MEMBERS: Users in partner cohorts  
\-- \============================================================================  
CREATE TABLE cohort\_members (  
  cohort\_member\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  cohort\_id UUID NOT NULL REFERENCES partner\_cohorts(cohort\_id) ON DELETE CASCADE,  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
  enrollment\_id UUID REFERENCES enrollments(enrollment\_id),  
    
  \-- Employee/Participant Info  
  employee\_id VARCHAR(100), \-- Partner's internal ID  
  department VARCHAR(100),  
  role VARCHAR(100),  
    
  \-- Status  
  status VARCHAR(20) DEFAULT 'active', \-- active, completed, dropped  
    
  joined\_at TIMESTAMPTZ DEFAULT NOW(),  
  completed\_at TIMESTAMPTZ,  
    
  UNIQUE(cohort\_id, user\_id),  
  CONSTRAINT valid\_status CHECK (status IN ('active', 'completed', 'dropped'))  
);

CREATE INDEX idx\_cohort\_members\_cohort ON cohort\_members(cohort\_id);  
CREATE INDEX idx\_cohort\_members\_user ON cohort\_members(user\_id);

### **6.8 Supporting Schema: Content & System Management**

\-- \============================================================================  
\-- CONTENT\_APPROVALS: Workflow state management  
\-- \============================================================================  
CREATE TABLE content\_approvals (  
  approval\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Content Reference (polymorphic)  
  content\_type VARCHAR(30) NOT NULL, \-- post, program, project, event  
  content\_id UUID NOT NULL,  
    
  \-- Workflow  
  current\_stage VARCHAR(30) NOT NULL,   
    \-- draft, editorial\_review, brand\_review, legal\_review, approved, rejected  
  submitted\_by UUID NOT NULL REFERENCES users(user\_id),  
  submitted\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  \-- Reviews  
  editorial\_reviewer\_id UUID REFERENCES users(user\_id),  
  editorial\_reviewed\_at TIMESTAMPTZ,  
  editorial\_notes TEXT,  
    
  brand\_reviewer\_id UUID REFERENCES users(user\_id),  
  brand\_reviewed\_at TIMESTAMPTZ,  
  brand\_notes TEXT,  
    
  final\_approver\_id UUID REFERENCES users(user\_id),  
  final\_approved\_at TIMESTAMPTZ,  
    
  \-- Rejection  
  rejected\_by UUID REFERENCES users(user\_id),  
  rejected\_at TIMESTAMPTZ,  
  rejection\_reason TEXT,  
    
  \-- Version Control  
  version INT DEFAULT 1,  
  previous\_approval\_id UUID REFERENCES content\_approvals(approval\_id),  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  UNIQUE(content\_type, content\_id, version),  
  CONSTRAINT valid\_content\_type CHECK (content\_type IN ('post', 'program', 'project', 'event')),  
  CONSTRAINT valid\_stage CHECK (current\_stage IN   
    ('draft', 'editorial\_review', 'brand\_review', 'legal\_review', 'approved', 'rejected'))  
);

CREATE INDEX idx\_approvals\_content ON content\_approvals(content\_type, content\_id);  
CREATE INDEX idx\_approvals\_stage ON content\_approvals(current\_stage);  
CREATE INDEX idx\_approvals\_pending ON content\_approvals(current\_stage, submitted\_at)   
  WHERE current\_stage IN ('editorial\_review', 'brand\_review', 'legal\_review');

\-- \============================================================================  
\-- MEDIA\_ASSETS: File metadata and references  
\-- \============================================================================  
CREATE TABLE media\_assets (  
  asset\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- File Info  
  filename VARCHAR(500) NOT NULL,  
  file\_type VARCHAR(50) NOT NULL, \-- image/jpeg, video/mp4, application/pdf  
  file\_size\_bytes BIGINT NOT NULL,  
    
  \-- Storage  
  storage\_provider VARCHAR(30) DEFAULT 's3', \-- s3, cloudinary, local  
  storage\_bucket VARCHAR(255),  
  storage\_key VARCHAR(500) NOT NULL,  
  public\_url VARCHAR(1000),  
  cdn\_url VARCHAR(1000),  
    
  \-- Ownership  
  uploaded\_by UUID NOT NULL REFERENCES users(user\_id),  
    
  \-- Usage  
  usage\_type VARCHAR(30), \-- profile\_photo, course\_video, certificate, etc.  
  usage\_count INT DEFAULT 0,  
    
  \-- Media Metadata  
  width\_px INT,  
  height\_px INT,  
  duration\_seconds INT, \-- For video/audio  
  thumbnail\_url VARCHAR(500),  
    
  \-- Status  
  processing\_status VARCHAR(20) DEFAULT 'uploaded',   
    \-- uploaded, processing, ready, failed  
    
  uploaded\_at TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_file\_size CHECK (file\_size\_bytes \> 0),  
  CONSTRAINT valid\_processing\_status CHECK (processing\_status IN   
    ('uploaded', 'processing', 'ready', 'failed'))  
);

CREATE INDEX idx\_media\_uploaded\_by ON media\_assets(uploaded\_by);  
CREATE INDEX idx\_media\_usage ON media\_assets(usage\_type);  
CREATE INDEX idx\_media\_status ON media\_assets(processing\_status);

\-- \============================================================================  
\-- NOTIFICATIONS: User notification queue  
\-- \============================================================================  
CREATE TABLE notifications (  
  notification\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  \-- Content  
  notification\_type VARCHAR(50) NOT NULL,   
    \-- message, comment, mention, enrollment, certificate, session\_reminder, etc.  
  title VARCHAR(255) NOT NULL,  
  message TEXT NOT NULL,  
  action\_url VARCHAR(500),  
    
  \-- Reference (optional)  
  reference\_type VARCHAR(30),  
  reference\_id UUID,  
    
  \-- Actor (who triggered the notification)  
  actor\_id UUID REFERENCES users(user\_id),  
    
  \-- Status  
  is\_read BOOLEAN DEFAULT FALSE,  
  read\_at TIMESTAMPTZ,  
    
  \-- Delivery  
  delivery\_method VARCHAR(20) DEFAULT 'in\_app', \-- in\_app, email, sms, push  
  delivered BOOLEAN DEFAULT FALSE,  
  delivered\_at TIMESTAMPTZ,  
    
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  expires\_at TIMESTAMPTZ  
);

CREATE INDEX idx\_notifications\_user ON notifications(user\_id, is\_read, created\_at DESC);  
CREATE INDEX idx\_notifications\_unread ON notifications(user\_id, created\_at DESC)   
  WHERE is\_read \= FALSE;  
CREATE INDEX idx\_notifications\_delivery ON notifications(delivery\_method, delivered)   
  WHERE delivered \= FALSE;

\-- \============================================================================  
\-- AUDIT\_LOGS: System activity tracking  
\-- \============================================================================  
CREATE TABLE audit\_logs (  
  log\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    
  \-- Actor  
  user\_id UUID REFERENCES users(user\_id), \-- NULL for system actions  
  impersonating\_user\_id UUID REFERENCES users(user\_id), \-- For admin impersonation  
    
  \-- Action  
  action VARCHAR(100) NOT NULL,   
    \-- user\_login, user\_created, payment\_processed, content\_published, etc.  
  entity\_type VARCHAR(50), \-- user, program, transaction, etc.  
  entity\_id UUID,  
    
  \-- Details  
  description TEXT,  
  changes JSONB, \-- Before/after values for updates  
  metadata JSONB, \-- Additional context  
    
  \-- Request Context  
  ip\_address INET,  
  user\_agent TEXT,  
  request\_id UUID,  
    
  \-- Severity  
  severity VARCHAR(20) DEFAULT 'info', \-- debug, info, warning, error, critical  
    
  timestamp TIMESTAMPTZ DEFAULT NOW(),  
    
  CONSTRAINT valid\_severity CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))  
);

CREATE INDEX idx\_audit\_user ON audit\_logs(user\_id, timestamp DESC);  
CREATE INDEX idx\_audit\_entity ON audit\_logs(entity\_type, entity\_id);  
CREATE INDEX idx\_audit\_action ON audit\_logs(action, timestamp DESC);  
CREATE INDEX idx\_audit\_severity ON audit\_logs(severity, timestamp DESC)   
  WHERE severity IN ('error', 'critical');

\-- Partition by month for performance  
CREATE INDEX idx\_audit\_timestamp ON audit\_logs(timestamp DESC);

### **6.9 Helper Tables & Lookups**

\-- \============================================================================  
\-- USER\_SETTINGS: User preferences and configurations  
\-- \============================================================================  
CREATE TABLE user\_settings (  
  setting\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID UNIQUE NOT NULL REFERENCES users(user\_id) ON DELETE CASCADE,  
    
  \-- Preferences  
  language VARCHAR(10) DEFAULT 'en', \-- en, sw, fr  
  timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',  
  currency VARCHAR(3) DEFAULT 'KES',  
    
  \-- Notifications  
  email\_notifications JSONB DEFAULT '{"all": true}'::jsonb,  
  sms\_notifications JSONB DEFAULT '{"all": false}'::jsonb,  
  push\_notifications JSONB DEFAULT '{"all": true}'::jsonb,  
    
  \-- Privacy  
  profile\_visibility VARCHAR(20) DEFAULT 'public', \-- public, members\_only, private  
  show\_activity BOOLEAN DEFAULT TRUE,  
  allow\_messages VARCHAR(20) DEFAULT 'all', \-- all, connections\_only, off  
    
  \-- UI Preferences  
  theme VARCHAR(10) DEFAULT 'light', \-- light, dark, auto  
  dashboard\_layout JSONB,  
    
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_settings\_user ON user\_settings(user\_id);

\-- \============================================================================  
\-- TAGS: Global tag taxonomy  
\-- \============================================================================  
CREATE TABLE tags (  
  tag\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  name VARCHAR(100) UNIQUE NOT NULL,  
  slug VARCHAR(100) UNIQUE NOT NULL,  
  category VARCHAR(50), \-- skill, industry, topic, etc.  
  usage\_count INT DEFAULT 0,  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_tags\_category ON tags(category);  
CREATE INDEX idx\_tags\_usage ON tags(usage\_count DESC);

\-- \============================================================================  
\-- FAQ: Frequently asked questions  
\-- \============================================================================  
CREATE TABLE faqs (  
  faq\_id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  category VARCHAR(100) NOT NULL,  
  question TEXT NOT NULL,  
  answer TEXT NOT NULL,  
  sequence\_order INT,  
  view\_count INT DEFAULT 0,  
  helpful\_count INT DEFAULT 0,  
  is\_published BOOLEAN DEFAULT TRUE,  
  created\_at TIMESTAMPTZ DEFAULT NOW(),  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

CREATE INDEX idx\_faqs\_category ON faqs(category, sequence\_order);  
CREATE INDEX idx\_faqs\_published ON faqs(is\_published) WHERE is\_published \= TRUE;

\-- \============================================================================  
\-- SYSTEM\_SETTINGS: Platform-wide configuration  
\-- \============================================================================  
CREATE TABLE system\_settings (  
  setting\_key VARCHAR(100) PRIMARY KEY,  
  setting\_value JSONB NOT NULL,  
  description TEXT,  
  is\_public BOOLEAN DEFAULT FALSE,  
  updated\_by UUID REFERENCES users(user\_id),  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- Examples:  
\-- INSERT INTO system\_settings VALUES ('platform.maintenance\_mode', 'false', 'Enable maintenance mode', true);  
\-- INSERT INTO system\_settings VALUES ('billing.default\_currency', '"USD"', 'Default platform currency', false);

---

## **7\. INDEXING STRATEGY**

### **7.1 Index Design Principles**

**Primary Goals:**

1. Optimize critical read patterns (dashboard, content delivery, search)  
2. Support referential integrity (foreign keys)  
3. Enable efficient JOINs  
4. Accelerate WHERE clause filtering  
5. Support ORDER BY operations

**Trade-offs Accepted:**

* Slower writes due to index maintenance (acceptable for read-heavy workload)  
* Additional storage overhead (\~30% of table size)  
* Index maintenance during backfill operations

---

### **7.2 Index Types Used**

**B-Tree Indexes (Default):**

* Single column lookups: user\_id, email, program\_id  
* Range queries: created\_at, scheduled\_at  
* Sorting operations: ORDER BY created\_at DESC  
* Most foreign key relationships

**GIN (Generalized Inverted Indexes):**

* JSONB columns: skills, tags, metadata  
* Array containment: tier\_access @\> '\["build"\]'  
* Full-text search: to\_tsvector('english', title || ' ' || description)

**Partial Indexes:**

* Filter frequently queried subsets  
* Example: WHERE status \= 'active' or WHERE is\_published \= TRUE  
* Reduces index size and improves query speed

**Unique Indexes:**

* Enforce data integrity: email, username, slug  
* Composite uniqueness: (user\_id, program\_id) in enrollments

---

### **7.3 Critical Indexes by Access Pattern**

**User Dashboard Load (P1):**

\-- Primary lookup  
CREATE INDEX idx\_users\_email ON users(email) WHERE status \!= 'deleted';

\-- Profile join  
CREATE INDEX idx\_profiles\_user ON user\_profiles(user\_id);

\-- Active subscription  
CREATE INDEX idx\_subscriptions\_active ON subscriptions(user\_id)   
  WHERE status \= 'active';

\-- User roles  
CREATE INDEX idx\_user\_roles\_active ON user\_roles(user\_id, role\_name)   
  WHERE revoked\_at IS NULL;

**Course Content Delivery (P2):**

\-- Enrollment lookup  
CREATE INDEX idx\_enrollments\_user ON enrollments(user\_id, status);

\-- Module hierarchy  
CREATE INDEX idx\_modules\_program ON modules(program\_id, sequence\_order);

\-- Lesson hierarchy  
CREATE INDEX idx\_lessons\_module ON lessons(module\_id, sequence\_order);

\-- Progress tracking  
CREATE INDEX idx\_lesson\_progress\_enrollment ON lesson\_progress(enrollment\_id);

**Community Feed (P3):**

\-- Published posts by category  
CREATE INDEX idx\_posts\_published ON posts(published\_at DESC)   
  WHERE status \= 'published';

\-- Category filtering  
CREATE INDEX idx\_posts\_category ON posts(category, published\_at DESC);

\-- Full-text search  
CREATE INDEX idx\_posts\_fts ON posts USING GIN (  
  to\_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))  
);

**Coach Directory (P4):**

\-- Skills search  
CREATE INDEX idx\_profiles\_skills ON user\_profiles USING GIN (skills);

\-- Location filtering  
CREATE INDEX idx\_profiles\_location ON user\_profiles USING GIN (location);

\-- Coach availability  
CREATE INDEX idx\_profiles\_coach\_status ON user\_profiles(availability\_status)   
  WHERE hourly\_rate IS NOT NULL;

\-- Session history for ratings  
CREATE INDEX idx\_sessions\_coach ON coaching\_sessions(coach\_id, status);

**Transaction Processing (W1):**

\-- User transaction history  
CREATE INDEX idx\_transactions\_user ON transactions(user\_id, created\_at DESC);

\-- Gateway reconciliation  
CREATE INDEX idx\_transactions\_gateway ON transactions(gateway\_transaction\_id);

\-- Success tracking  
CREATE INDEX idx\_transactions\_success ON transactions(created\_at DESC)   
  WHERE status \= 'success';

---

### **7.4 Index Maintenance Strategy**

**Regular Maintenance:**

\-- Reindex critical tables monthly  
REINDEX TABLE CONCURRENTLY users;  
REINDEX TABLE CONCURRENTLY enrollments;  
REINDEX TABLE CONCURRENTLY transactions;

\-- Analyze statistics weekly  
ANALYZE users;  
ANALYZE programs;  
ANALYZE posts;

**Monitoring:**

* Track index usage via pg\_stat\_user\_indexes  
* Identify unused indexes quarterly  
* Monitor index bloat via pgstattuple

**Optimization:**

* Remove unused indexes after 3 months of zero usage  
* Consider covering indexes for hot queries  
* Evaluate partial indexes for large tables with common filters

---

## **8\. CONSISTENCY & TRANSACTIONS**

### **8.1 Consistency Model**

**ACID Transactions (PostgreSQL Default):**

* All financial operations must be ACID-compliant  
* Enrollment changes require transactional consistency  
* User authentication state changes must be atomic

**Eventual Consistency (Acceptable):**

* Engagement metrics (like counts, view counts)  
* Community feed rankings  
* Analytics aggregations  
* Cache invalidation

---

### **8.2 Transaction Boundaries**

**Critical Transactions:**

**T1: Payment Processing with Enrollment**

BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

\-- Record transaction  
INSERT INTO transactions (user\_id, amount, type, status, ...)  
VALUES (...) RETURNING transaction\_id;

\-- Create/update enrollment  
INSERT INTO enrollments (user\_id, program\_id, status, transaction\_id, ...)  
VALUES (...)  
ON CONFLICT (user\_id, program\_id) DO UPDATE  
SET status \= 'active', updated\_at \= NOW();

\-- Update program enrollment count  
UPDATE programs SET enrollment\_count \= enrollment\_count \+ 1  
WHERE program\_id \= $program\_id;

\-- Audit log  
INSERT INTO audit\_logs (action, user\_id, entity\_type, ...)  
VALUES ('enrollment\_created', ...);

COMMIT;

**T2: Session Booking with Payment**

BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

\-- Check coach availability (lock row)  
SELECT \* FROM coach\_availability  
WHERE coach\_id \= $coach\_id AND ...  
FOR UPDATE;

\-- Create session  
INSERT INTO coaching\_sessions (coach\_id, mentee\_id, scheduled\_at, ...)  
VALUES (...) RETURNING session\_id;

\-- Process payment  
INSERT INTO transactions (user\_id, amount, reference\_type, reference\_id, ...)  
VALUES (...);

\-- Update coach session count (denormalized)  
UPDATE user\_profiles SET session\_count \= session\_count \+ 1  
WHERE user\_id \= $coach\_id;

COMMIT;

**T3: Certificate Issuance**

BEGIN;

\-- Verify completion  
SELECT \* FROM enrollments  
WHERE enrollment\_id \= $enrollment\_id AND progress\_percent \= 100  
FOR UPDATE;

\-- Generate certificate  
INSERT INTO certificates (enrollment\_id, user\_id, program\_id, ...)  
VALUES (...) RETURNING certificate\_id;

\-- Update enrollment  
UPDATE enrollments  
SET certificate\_issued \= TRUE, certificate\_issued\_at \= NOW()  
WHERE enrollment\_id \= $enrollment\_id;

\-- Notification  
INSERT INTO notifications (user\_id, notification\_type, title, message, ...)  
VALUES (...);

COMMIT;

---

### **8.3 Isolation Levels**

| Transaction Type | Isolation Level | Rationale |
| ----- | ----- | ----- |
| Payment Processing | SERIALIZABLE | Prevent double-charging, race conditions |
| Enrollment Creation | READ COMMITTED | Balance consistency vs. performance |
| Progress Updates | READ COMMITTED | Acceptable lost updates (last-write-wins) |
| Content Publishing | READ COMMITTED | Workflow state consistency |
| Analytics Queries | READ UNCOMMITTED\* | Speed over strict consistency |

\*Note: PostgreSQL doesn't support READ UNCOMMITTED; behaves as READ COMMITTED

---

### **8.4 Referential Integrity**

**Foreign Key Enforcement:**

* All foreign keys defined with appropriate CASCADE/RESTRICT actions  
* ON DELETE CASCADE: When parent deletion should cascade (e.g., modules → lessons)  
* ON DELETE RESTRICT: When parent deletion should be prevented (e.g., user referenced in transactions)  
* ON DELETE SET NULL: When orphaning is acceptable (e.g., deleted user's public content)

**Constraint Examples:**

\-- CASCADE: Delete lessons when module deleted  
ALTER TABLE lessons  
ADD CONSTRAINT fk\_lessons\_module  
FOREIGN KEY (module\_id) REFERENCES modules(module\_id)  
ON DELETE CASCADE;

\-- RESTRICT: Prevent user deletion if transactions exist  
ALTER TABLE transactions  
ADD CONSTRAINT fk\_transactions\_user  
FOREIGN KEY (user\_id) REFERENCES users(user\_id)  
ON DELETE RESTRICT;

\-- SET NULL: Preserve posts when author account deleted  
ALTER TABLE posts  
ADD CONSTRAINT fk\_posts\_author  
FOREIGN KEY (author\_id) REFERENCES users(user\_id)  
ON DELETE SET NULL;

---

### **8.5 Idempotency Strategy**

**Idempotent Operations:**

* Payment processing uses gateway\_transaction\_id as deduplication key  
* Enrollment creation uses UPSERT pattern: ON CONFLICT ... DO UPDATE  
* Progress updates use GREATEST() to prevent regression  
* Notification delivery tracked with unique constraints

**Example: Idempotent Progress Update**

INSERT INTO lesson\_progress (user\_id, lesson\_id, progress\_percent, ...)  
VALUES ($1, $2, $3, ...)  
ON CONFLICT (user\_id, lesson\_id)  
DO UPDATE SET  
  progress\_percent \= GREATEST(lesson\_progress.progress\_percent, EXCLUDED.progress\_percent),  
  time\_spent\_seconds \= lesson\_progress.time\_spent\_seconds \+ EXCLUDED.time\_spent\_seconds,  
  last\_accessed\_at \= NOW();

---

## **9\. SCALING & PARTITIONING STRATEGY**

### **9.1 Vertical Scaling (Phase 1: MVP → 10K users)**

**Initial Instance:**

* PostgreSQL on AWS RDS db.t3.medium  
* 2 vCPU, 4GB RAM  
* 100GB SSD storage (gp3)  
* Sufficient for MVP load

**Growth Path:**

* db.t3.large (4GB → 8GB RAM)  
* db.m5.large (8GB → 16GB RAM)  
* Upgrade storage as needed (auto-scaling enabled)

---

### **9.2 Read Replicas (Phase 2: 10K → 50K users)**

**Architecture:**

┌──────────────┐  
│  Write DB    │ ← All writes (transactions, enrollments, posts)  
│  (Primary)   │  
└──────┬───────┘  
       │ Async replication  
       ├─────────────────┬────────────────┐  
       ▼                 ▼                ▼  
 ┌────────────┐    ┌────────────┐  ┌────────────┐  
 │ Read Rep 1 │    │ Read Rep 2 │  │ Read Rep 3 │  
 │ (Courses)  │    │ (Community)│  │ (Analytics)│  
 └────────────┘    └────────────┘  └────────────┘

**Routing Strategy:**

* **Primary (writes):** All INSERT, UPDATE, DELETE  
* **Replica 1:** Course content queries, lesson delivery  
* **Replica 2:** Community feed, post queries  
* **Replica 3:** Analytics, reporting queries

**Application-Level Routing:**

// Write operations  
await primaryDB.query('INSERT INTO transactions ...');

// Read operations  
await replicaDB.query('SELECT \* FROM programs WHERE ...');

**Replication Lag Monitoring:**

* Alert if lag \> 5 seconds  
* Fallback to primary if replica unavailable

---

### **9.3 Connection Pooling**

**PgBouncer Configuration:**

\[databases\]  
brandcoach \= host=primary-db.rds.amazonaws.com port=5432 dbname=brandcoach

\[pgbouncer\]  
pool\_mode \= transaction  
max\_client\_conn \= 1000  
default\_pool\_size \= 25  
reserve\_pool\_size \= 5

**Benefits:**

* Reduces connection overhead  
* Handles connection spikes  
* Supports multiple app servers

---

### **9.4 Table Partitioning (Phase 2+)**

**Time-Based Partitioning for High-Volume Tables:**

**Audit Logs (1M+ rows/month):**

CREATE TABLE audit\_logs (  
  log\_id UUID,  
  user\_id UUID,  
  action VARCHAR(100),  
  timestamp TIMESTAMPTZ NOT NULL,  
  ...  
) PARTITION BY RANGE (timestamp);

\-- Monthly partitions  
CREATE TABLE audit\_logs\_2025\_01 PARTITION OF audit\_logs  
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit\_logs\_2025\_02 PARTITION OF audit\_logs  
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

\-- Auto-create future partitions via cron job

**Notifications (retention-based):**

CREATE TABLE notifications (  
  notification\_id UUID,  
  user\_id UUID,  
  created\_at TIMESTAMPTZ NOT NULL,  
  expires\_at TIMESTAMPTZ,  
  ...  
) PARTITION BY RANGE (created\_at);

\-- Drop old partitions to manage storage  
DROP TABLE notifications\_2024\_06; \-- After 6 months

**Benefits:**

* Faster queries (partition pruning)  
* Efficient data archival (drop old partitions)  
* Parallel query execution across partitions

---

### **9.5 Sharding Strategy (Phase 3: 50K+ users)**

**User-Based Sharding:**

┌─────────────────────────────────────────┐  
│            Application Layer            │  
└────┬────────────────────┬───────────────┘  
     │                    │  
     ▼                    ▼  
┌─────────┐          ┌─────────┐  
│ Shard 1 │          │ Shard 2 │  
│ (A-M)   │          │ (N-Z)    │  
│ Users   │          │ Users   │  
└─────────┘          └─────────┘

**Sharding Key:** user\_id (UUID hash or username range)

**Co-Located Data:**

* User's enrollments on same shard  
* User's posts on same shard  
* User's transactions on same shard

**Cross-Shard Queries:**

* Aggregations handled by application layer  
* Analytics moved to separate data warehouse

**Not Recommended Until:**

* 100K+ active users  
* Single-database performance degraded despite optimization  
* Operational complexity justified by scale

---

### **9.6 Caching Strategy**

**Redis Cache Layers:**

**L1: Session Cache (TTL: 24 hours)**

SET session:{session\_id} {user\_data} EX 86400

**L2: Hot Data Cache (TTL: 1 hour)**

\# User profile  
SETEX user:profile:{user\_id} 3600 {json\_data}

\# Course metadata  
SETEX program:{program\_id} 3600 {json\_data}

\# Coach directory  
ZADD coaches:top\_rated {rating} {coach\_id}

**L3: Computed Results (TTL: 15 minutes)**

\# Community feed  
SETEX feed:community:{category} 900 {posts\_array}

\# Dashboard stats  
SETEX stats:user:{user\_id} 900 {metrics\_json}

**Cache Invalidation:**

* Write-through for user profiles (update DB \+ cache)  
* TTL-based for semi-static data (courses)  
* Event-based for critical changes (subscriptions)

---

## **10\. DATA LIFECYCLE MANAGEMENT**

### **10.1 Retention Policies**

| Data Type | Active Retention | Archive Retention | Deletion Policy | |-----------|------------------|-------------------|----------------| | 

User Accounts (Active) | Indefinite | N/A | Soft delete → 30 days → Hard delete | | User Accounts (Inactive \>24mo) | 24 months | Move to archive DB | After 36 months total | | Transactions | 7 years | Cold storage after 2 years | Never (legal requirement) | | Audit Logs | 12 months hot | 3 years cold storage | After 3 years | | Course Content | Indefinite | N/A | Only when program archived | | Community Posts | Indefinite | N/A | Only when user-deleted | | Messages | 12 months | N/A | Auto-delete after 12 months | | Notifications | 90 days | N/A | Auto-delete after 90 days | | Session Data | 24 hours | N/A | Auto-expire | | Media Assets (unused) | 6 months | Move to Glacier | After 12 months |

---

### **10.2 Soft Delete Strategy**

**Implementation:**

\-- Users table soft delete

UPDATE users 

SET status \= 'deleted', deleted\_at \= NOW()

WHERE user\_id \= $1;

\-- Exclude from queries

SELECT \* FROM users WHERE status \!= 'deleted';

\-- Hard delete after grace period (cron job)

DELETE FROM users 

WHERE status \= 'deleted' 

AND deleted\_at \< NOW() \- INTERVAL '30 days';

**Cascade Handling:**

* Posts/content remain (author\_id SET NULL)  
* Enrollments preserved for audit  
* Transactions never deleted  
* Personal data (profiles) purged immediately

---

### **10.3 Schema Evolution & Migrations**

**Migration Strategy:**

**Tools:**

* Flyway or Liquibase for version control  
* Sequelize/TypeORM migrations (if using ORM)  
* Manual SQL scripts for complex changes

**Migration File Naming:**

migrations/

  V001\_\_initial\_schema.sql

  V002\_\_add\_coaching\_sessions.sql

  V003\_\_add\_partner\_tables.sql

  V004\_\_add\_notification\_system.sql

**Non-Blocking Migrations:**

\-- Add column with default (safe, no table lock)

ALTER TABLE users ADD COLUMN two\_factor\_enabled BOOLEAN DEFAULT FALSE;

\-- Add index concurrently (no lock)

CREATE INDEX CONCURRENTLY idx\_users\_email ON users(email);

\-- Backfill in batches

UPDATE users SET two\_factor\_enabled \= FALSE 

WHERE user\_id IN (SELECT user\_id FROM users LIMIT 1000);

**Breaking Changes Protocol:**

1. Add new column/table alongside old  
2. Dual-write to both (application layer)  
3. Backfill historical data  
4. Switch reads to new structure  
5. Remove old column/table after validation

---

### **10.4 Data Archival**

**Hot → Warm → Cold Storage:**

┌───────────────┐

│   PostgreSQL  │  Hot (0-12 months)

│   Primary DB  │  Fast queries, full features

└───────┬───────┘

        │

        ▼ (Partition drop \+ export)

┌───────────────┐

│   PostgreSQL  │  Warm (12-36 months)

│   Archive DB  │  Read-only, slower queries

└───────┬───────┘

        │

        ▼ (Export to Parquet)

┌───────────────┐

│   S3 Glacier  │  Cold (36+ months)

│   Deep Archive│  Compliance retention only

└───────────────┘

**Archival Process:**

\# Monthly cron job

\# Export old audit logs

pg\_dump \--table=audit\_logs\_2023\_01 \> /tmp/audit\_2023\_01.sql

gzip /tmp/audit\_2023\_01.sql

aws s3 cp /tmp/audit\_2023\_01.sql.gz s3://brand-coach-archives/audit/2023/

\# Drop partition

psql \-c "DROP TABLE audit\_logs\_2023\_01;"

---

## **11\. SECURITY & COMPLIANCE**

### **11.1 Encryption**

**At Rest:**

* PostgreSQL: Transparent Data Encryption (TDE) via AWS RDS encryption  
* S3: Server-side encryption (SSE-S3 or SSE-KMS)  
* Backups: Encrypted via AWS Backup

**In Transit:**

* PostgreSQL: SSL/TLS enforced (sslmode=require)  
* Application ↔ DB: TLS 1.3  
* CDN ↔ Users: HTTPS only

**Application-Level Encryption:**

\-- Sensitive fields encrypted before storage

CREATE EXTENSION IF NOT EXISTS pgcrypto;

\-- Example: Encrypt 2FA secrets

INSERT INTO users (user\_id, two\_factor\_secret)

VALUES ($1, pgp\_sym\_encrypt($2, $encryption\_key));

\-- Decrypt on read

SELECT pgp\_sym\_decrypt(two\_factor\_secret::bytea, $encryption\_key) 

FROM users WHERE user\_id \= $1;

---

### **11.2 Access Control**

**Database User Roles:**

\-- Application user (read/write to tables)

CREATE ROLE app\_user WITH LOGIN PASSWORD 'secure\_password';

GRANT CONNECT ON DATABASE brandcoach TO app\_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app\_user;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app\_user;

\-- Read-only analytics user

CREATE ROLE analytics\_user WITH LOGIN PASSWORD 'secure\_password';

GRANT CONNECT ON DATABASE brandcoach TO analytics\_user;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics\_user;

\-- Admin user (schema changes)

CREATE ROLE admin\_user WITH LOGIN PASSWORD 'secure\_password' SUPERUSER;

**Row-Level Security (Future):**

\-- Enable RLS on sensitive tables

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

\-- Policy: Users can only see their own transactions

CREATE POLICY user\_transactions ON transactions

FOR SELECT

USING (user\_id \= current\_setting('app.current\_user\_id')::uuid);

---

### **11.3 PII Handling**

**PII Fields Identified:**

* users.email  
* users.phone\_number  
* users.full\_name  
* user\_profiles.bio (may contain PII)  
* orders.shipping\_address  
* messages.content (may contain PII)

**Protection Measures:**

1. **Encryption:** Sensitive fields encrypted at rest  
2. **Access Logging:** All PII access logged in audit\_logs  
3. **Anonymization:** Analytics queries use hashed user\_ids  
4. **Data Export:** GDPR-compliant export functionality  
5. **Right to Deletion:** Full PII purge on account deletion

**Anonymization for Analytics:**

\-- Create anonymized view

CREATE VIEW analytics\_users AS

SELECT 

  md5(user\_id::text) as hashed\_user\_id,

  DATE\_TRUNC('month', created\_at) as signup\_month,

  location-\>\>'country' as country,

  \-- NO email, phone, or name

FROM users;

---

### **11.4 Compliance Requirements**

**GDPR (EU Users):**

* ✅ Right to access: User can export all personal data  
* ✅ Right to deletion: Full PII purge within 30 days  
* ✅ Right to rectification: Users can update their data  
* ✅ Data portability: JSON export of all user data  
* ✅ Consent tracking: Marketing preferences in user\_settings  
* ✅ Breach notification: Audit logs enable forensics

**Kenya Data Protection Act (2021):**

* ✅ Data localization: Primary DB in AWS Africa (Cape Town) region  
* ✅ Consent for processing: Terms of service acceptance tracked  
* ✅ Security safeguards: Encryption, access control, audit logs  
* ✅ Data transfer restrictions: GDPR-equivalent protections

**PCI DSS (Payment Card Data):**

* ✅ Never store card numbers: Delegated to Stripe/Flutterwave  
* ✅ Only store gateway tokens: Masked card info only  
* ✅ Secure transmission: TLS for all payment data  
* ✅ Access restrictions: Payment data isolated from general DB queries

---

### **11.5 Audit & Logging**

**What to Log:**

\-- All financial transactions

INSERT INTO audit\_logs (action, user\_id, entity\_type, entity\_id, metadata)

VALUES ('payment\_processed', $user\_id, 'transaction', $transaction\_id, 

  json\_build\_object('amount', $amount, 'gateway', $gateway));

\-- Authentication events

INSERT INTO audit\_logs (action, user\_id, ip\_address, user\_agent)

VALUES ('user\_login', $user\_id, $ip, $user\_agent);

\-- Admin actions

INSERT INTO audit\_logs (action, user\_id, entity\_type, entity\_id, changes)

VALUES ('user\_role\_changed', $admin\_id, 'user', $target\_user\_id,

  json\_build\_object('old', 'member', 'new', 'coach'));

\-- Data access (sensitive)

INSERT INTO audit\_logs (action, user\_id, entity\_type, entity\_id)

VALUES ('pii\_accessed', $user\_id, 'user\_profile', $accessed\_user\_id);

**Log Retention:**

* Security logs: 3 years  
* Financial logs: 7 years  
* General activity: 12 months

**Monitoring & Alerts:**

* Failed login attempts \> 5: Alert security team  
* Unusual transaction patterns: Flag for review  
* Bulk data exports: Notify admin  
* Schema changes: Slack notification to dev team

---

## **12\. RELIABILITY & OPERATIONS**

### **12.1 Backup Strategy**

**Automated Backups:**

**PostgreSQL (AWS RDS):**

* **Daily snapshots:** 7-day retention  
* **Point-in-time recovery:** 35-day window  
* **Backup window:** 2:00-4:00 AM EAT (low traffic)  
* **Cross-region replication:** Backup to second region (disaster recovery)

**Manual Backups (Pre-Deployment):**

\# Before major migrations

pg\_dump \-h $DB\_HOST \-U $DB\_USER \-F c \-b \-v \-f backup\_$(date \+%Y%m%d\_%H%M%S).dump brandcoach

\# Upload to S3

aws s3 cp backup\_\*.dump s3://brand-coach-backups/manual/

**Redis (Persistence):**

* **RDB snapshots:** Every 6 hours  
* **AOF (Append-Only File):** Enabled for durability  
* **Replication:** Multi-AZ deployment

**S3 (Media Assets):**

* **Versioning:** Enabled (recover deleted/overwritten files)  
* **Cross-region replication:** Critical assets replicated  
* **Lifecycle policies:** Transition to Glacier after 90 days (non-critical)

---

### **12.2 Disaster Recovery**

**Recovery Objectives:**

* **RPO (Recovery Point Objective):** \< 1 hour (max data loss acceptable)  
* **RTO (Recovery Time Objective):** \< 4 hours (max downtime acceptable)

**Disaster Scenarios:**

**Scenario 1: Database Corruption**

* **Detection:** Automated integrity checks, query failures  
* **Recovery:** Restore from latest snapshot (\~30 min) \+ apply WAL logs  
* **Testing:** Quarterly DR drills

**Scenario 2: Region Failure (AWS Africa)**

* **Detection:** Multi-region health checks  
* **Recovery:** Failover to replicated database in EU region  
* **Impact:** \~1 hour downtime for DNS propagation  
* **Mitigation:** Multi-region architecture (Phase 3\)

**Scenario 3: Ransomware/Malicious Deletion**

* **Detection:** Audit log anomaly detection  
* **Recovery:** Point-in-time restore to pre-attack state  
* **Prevention:** Immutable backups, least-privilege access

**DR Runbook:**

\# Database Restore Procedure

1\. Stop application servers (prevent writes)

2\. Restore RDS from snapshot:

aws rds restore-db-instance-from-db-snapshot  
 \--db-instance-identifier brandcoach-restored  
 \--db-snapshot-identifier snapshot-2025-01-15

3\. Update application DB connection string

4\. Verify data integrity (row counts, key records)

5\. Restart application servers

6\. Monitor error logs for 24 hours

7\. Update runbook with lessons learned

---

### **12.3 Monitoring & Alerting**

**Database Health Metrics:**

**Performance:**

* Connection count (alert \> 80% of max)  
* CPU utilization (alert \> 80%)  
* Disk IOPS (alert when throttled)  
* Query duration (alert p95 \> 1s)  
* Replication lag (alert \> 5s)

**Data Integrity:**

* Failed transactions (alert \> 1% failure rate)  
* Deadlock occurrences (alert \> 5/hour)  
* Constraint violations (alert on any)

**Storage:**

* Disk usage (alert \> 85% full)  
* Table bloat (alert \> 30%)  
* Index bloat (alert \> 40%)

**Monitoring Stack:**

┌─────────────────┐

│   PostgreSQL    │

│   pg\_stat\_\*     │

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│   Prometheus    │

│   (Metrics)     │

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│    Grafana      │

│   (Dashboards)  │

└─────────────────┘

┌─────────────────┐

│   CloudWatch    │

│   (AWS RDS)     │

└────────┬────────┘

         │

         ▼

┌─────────────────┐

│   PagerDuty     │

│   (Alerts)      │

└─────────────────┘

**Alert Routing:**

* **P1 (Critical):** Page on-call engineer immediately

  * Database down  
  * Payment processing failures  
  * Data corruption detected  
* **P2 (High):** Slack alert, email notification

  * High error rate  
  * Performance degradation  
  * Replication lag  
* **P3 (Medium):** Email notification

  * Disk usage warning  
  * Slow query detected  
  * Backup failure

---

### **12.4 Performance Monitoring**

**Query Performance:**

\-- Enable pg\_stat\_statements

CREATE EXTENSION IF NOT EXISTS pg\_stat\_statements;

\-- Find slow queries

SELECT 

  query,

  calls,

  mean\_exec\_time,

  total\_exec\_time

FROM pg\_stat\_statements

ORDER BY mean\_exec\_time DESC

LIMIT 20;

\-- Find queries causing most load

SELECT 

  query,

  calls,

  total\_exec\_time,

  (total\_exec\_time / SUM(total\_exec\_time) OVER()) \* 100 AS pct\_total\_time

FROM pg\_stat\_statements

ORDER BY total\_exec\_time DESC

LIMIT 10;

**Index Usage:**

\-- Find unused indexes

SELECT 

  schemaname,

  tablename,

  indexname,

  idx\_scan

FROM pg\_stat\_user\_indexes

WHERE idx\_scan \= 0

AND indexname NOT LIKE '%\_pkey';

\-- Find missing indexes

SELECT 

  schemaname,

  tablename,

  seq\_scan,

  seq\_tup\_read,

  idx\_scan,

  seq\_tup\_read / seq\_scan AS avg\_seq\_tup\_read

FROM pg\_stat\_user\_tables

WHERE seq\_scan \> 0

ORDER BY seq\_tup\_read DESC

LIMIT 20;

**Table Bloat:**

SELECT 

  schemaname,

  tablename,

  pg\_size\_pretty(pg\_total\_relation\_size(schemaname||'.'||tablename)) AS size,

  pg\_size\_pretty(pg\_total\_relation\_size(schemaname||'.'||tablename) \- pg\_relation\_size(schemaname||'.'||tablename)) AS bloat

FROM pg\_tables

WHERE schemaname \= 'public'

ORDER BY pg\_total\_relation\_size(schemaname||'.'||tablename) DESC;

---

### **12.5 Operational Procedures**

**Daily:**

* Review CloudWatch dashboards for anomalies  
* Check backup completion status  
* Monitor disk usage trends

**Weekly:**

* Review slow query log  
* Analyze new query patterns  
* Update statistics (ANALYZE)  
* Review audit logs for security issues

**Monthly:**

* Full database performance review  
* Index usage analysis (remove unused)  
* Table bloat check and remediation  
* Review and update monitoring thresholds  
* Security patch review and application

**Quarterly:**

* Disaster recovery drill  
* Capacity planning review  
* Schema optimization opportunities  
* Archive old data per retention policy  
* Update runbooks and documentation

---

## **13\. TRADE-OFFS & ASSUMPTIONS**

### **13.1 Key Design Trade-Offs**

**1\. PostgreSQL vs. Multi-Database Approach**

**Decision:** Single PostgreSQL database for MVP/growth

✅ **Advantages:**

* Simplified operations (one system to manage)  
* ACID transactions across all entities  
* Strong relational integrity  
* Mature tooling and ecosystem  
* Cost-effective for scale up to 100K users

❌ **Trade-offs:**

* Single point of failure (mitigated by replication)  
* Vertical scaling limits (eventual sharding needed)  
* Mixed workload types (OLTP \+ analytics)

**When to Reconsider:**

* User base \> 100K active users  
* Database size \> 1TB  
* Query performance degraded despite optimization  
* Need for specialized databases (graph, time-series)

---

**2\. Denormalization for Performance**

**Decision:** Selectively denormalize high-read metrics

✅ **Advantages:**

* Faster queries (no JOIN or aggregation needed)  
* Reduced database load  
* Improved user experience (faster page loads)

❌ **Trade-offs:**

* Data synchronization complexity  
* Potential inconsistency (eventual consistency model)  
* Increased storage  
* More complex write logic

**Examples:**

* programs.enrollment\_count (aggregated from enrollments)  
* user\_profiles.post\_count (aggregated from posts)  
* posts.like\_count (aggregated from reactions)

**Synchronization:**

\-- Update counters via triggers

CREATE OR REPLACE FUNCTION update\_program\_enrollment\_count()

RETURNS TRIGGER AS $$

BEGIN

  UPDATE programs SET enrollment\_count \= (

    SELECT COUNT(\*) FROM enrollments WHERE program\_id \= NEW.program\_id

  ) WHERE program\_id \= NEW.program\_id;

  RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trg\_enrollment\_count

AFTER INSERT ON enrollments

FOR EACH ROW EXECUTE FUNCTION update\_program\_enrollment\_count();

---

**3\. JSONB for Flexible Attributes**

**Decision:** Use JSONB for dynamic/optional fields

✅ **Advantages:**

* Schema flexibility (add fields without migrations)  
* Reduces table sprawl (avoid EAV anti-pattern)  
* Native indexing support (GIN indexes)  
* Query-able with JSON operators

❌ **Trade-offs:**

* Less type safety than dedicated columns  
* More complex queries  
* Harder to enforce constraints  
* Can become "junk drawer" if not disciplined

**Guidelines:**

* Use JSONB for truly dynamic data (user preferences, metadata)  
* Avoid for critical business logic fields  
* Document expected JSON schema  
* Validate at application layer

**Examples:**

* user\_profiles.skills \- Array of skill strings  
* programs.tags \- Array of category tags  
* events.speakers \- Array of speaker objects  
* orders.shipping\_address \- Address object

---

**4\. Soft Delete vs. Hard Delete**

**Decision:** Soft delete for user accounts, hard delete for transient data

✅ **Advantages (Soft Delete):**

* Recoverability (accidental deletions)  
* Audit trail preservation  
* Referential integrity maintained  
* Regulatory compliance (transaction history)

❌ **Trade-offs:**

* Increased storage  
* Query complexity (always filter deleted)  
* Index bloat  
* GDPR "right to deletion" requires eventual hard delete

**Strategy:**

* Soft delete: users, programs, partners (30-day grace period)  
* Hard delete: notifications, sessions, cache data  
* Hybrid: Soft delete → purge PII → hard delete after retention

---

### **13.2 Key Assumptions**

**Technical Assumptions:**

1. **PostgreSQL performance is sufficient for 100K users**

   * Based on similar platforms at scale  
   * Assumes proper indexing and query optimization  
   * Risk: May need sharding sooner if unexpected growth  
2. **AWS infrastructure remains cost-effective**

   * Current pricing models assumed stable  
   * Risk: Cloud cost increases could force migration  
3. **Read:Write ratio remains 80:20**

   * Informs caching and replication strategy  
   * Risk: Higher write volume requires architecture adjustment

**Business Assumptions:**

1. **User growth follows projected timeline**

   * MVP: 1K users (Month 3\)  
   * Growth: 5K users (Month 6\)  
   * Scale: 10K users (Month 12\)  
   * Risk: Viral growth could overwhelm infrastructure  
2. **African market primarily mobile users**

   * Informs data usage optimization  
   * Mobile-first query optimization  
   * Risk: Desktop usage higher than expected  
3. **M-PESA remains dominant payment method in Kenya**

   * Payment integration prioritization  
   * Risk: New payment methods emerge

**Operational Assumptions:**

1. **Small team can manage single database**

   * 1-2 engineers for database operations  
   * Risk: Complexity grows faster than team capacity  
2. **Backup/restore procedures work as designed**

   * Quarterly DR drills validate  
   * Risk: Untested edge cases in disaster scenarios  
3. **Compliance requirements won't change significantly**

   * GDPR and Kenya DPA assumed stable  
   * Risk: New regulations require schema changes

---

## **14\. RISKS & OPEN QUESTIONS**

### **14.1 Technical Risks**

**R1: Database Performance Degradation at Scale**

* **Likelihood:** Medium  
* **Impact:** High (user experience degradation)  
* **Mitigation:**  
  * Proactive performance monitoring  
  * Query optimization before issues arise  
  * Read replicas ready to deploy  
  * Connection pooling from day one  
* **Contingency:** Emergency scaling plan documented

**R2: Data Migration Complexity (from existing site)**

* **Likelihood:** High  
* **Impact:** Medium (could delay launch)  
* **Mitigation:**  
  * Early data audit with Nightingale Mukasa  
  * Test migration on staging environment  
  * Plan for data quality issues  
  * Allocate 2-week buffer in timeline  
* **Contingency:** Manual data entry for critical records

**R3: Payment Gateway Integration Issues**

* **Likelihood:** Medium  
* **Impact:** Critical (blocks revenue)  
* **Mitigation:**  
  * Start integration early (Week 6\)  
  * Thorough sandbox testing  
  * Have backup gateway ready (PayPal)  
  * Transaction retry logic  
* **Contingency:** Manual payment processing as interim

**R4: Replication Lag Impacting User Experience**

* **Likelihood:** Medium  
* **Impact:** Medium (stale data visible)  
* **Mitigation:**  
  * Monitor replication lag continuously  
  * Alert if lag \> 5 seconds  
  * Implement read-after-write consistency for critical operations  
  * Fallback to primary for critical reads  
* **Contingency:** Disable read replicas temporarily

**R5: Backup/Restore Failures**

* **Likelihood:** Low  
* **Impact:** Critical (data loss)  
* **Mitigation:**  
  * Automated backup verification  
  * Quarterly restore drills  
  * Multi-region backup storage  
  * Immutable backup storage  
* **Contingency:** Manual snapshot restoration

---

### **14.2 Security Risks**

**R6: SQL Injection Attacks**

* **Likelihood:** Medium (if ORM misused)  
* **Impact:** Critical (data breach)  
* **Mitigation:**  
  * Use parameterized queries exclusively  
  * Code review for dynamic SQL  
  * WAF rules in place  
  * Regular security audits  
* **Contingency:** Incident response plan

**R7: Unauthorized Data Access**

* **Likelihood:** Low  
* **Impact:** Critical (privacy violation)  
* **Mitigation:**  
  * Strong access control (RBAC)  
  * All PII access logged  
  * Regular access reviews  
  * Least-privilege principle  
* **Contingency:** Audit log forensics

**R8: Data Breach via Third-Party Service**

* **Likelihood:** Low  
* **Impact:** High  
* **Mitigation:**  
  * Vet all third-party integrations  
  * Minimize data shared externally  
  * Encrypt data in transit  
  * Monitor third-party security advisories  
* **Contingency:** Breach notification procedures

---

### **14.3 Operational Risks**

**R9: Database Expertise Gap**

* **Likelihood:** Medium  
* **Impact:** Medium (slower incident response)  
* **Mitigation:**  
  * Comprehensive documentation  
  * Runbook for common procedures  
  * AWS support plan (Business tier)  
  * External DBA on retainer  
* **Contingency:** Emergency consultant engagement

**R10: Cost Overruns**

* **Likelihood:** Medium  
* **Impact:** Medium (budget constraints)  
* **Mitigation:**  
  * Cost monitoring and alerts  
  * Right-sizing instances  
  * Reserved instance pricing (when appropriate)  
  * Regular cost optimization reviews  
* **Contingency:** Downgrade non-critical services

---

### **14.4 Open Questions Requiring Decision**

**Q1: Multi-Region Deployment Timeline**

* **Question:** When should we deploy to multiple AWS regions (Africa \+ Europe)?  
* **Considerations:**  
  * Cost: 2x infrastructure  
  * Complexity: Cross-region replication, data residency  
  * Benefit: Lower latency for European users, disaster recovery  
* **Decision Needed By:** Month 6 (based on user distribution data)  
* **Decision Maker:** CTO \+ Winston Eboyi

**Q2: Analytics Database Separation**

* **Question:** When should we separate analytical workloads to dedicated database?  
* **Considerations:**  
  * Phase 1: Same database (simpler)  
  * Phase 2: Read replica for analytics  
  * Phase 3: Data warehouse (Snowflake/BigQuery)  
* **Decision Needed By:** Month 9 (when analytics load impacts performance)  
* **Decision Maker:** Technical team based on metrics

**Q3: Real-Time Features Architecture**

* **Question:** How to implement real-time features (chat, notifications, live updates)?  
* **Options:**  
  * WebSockets via Socket.io  
  * Server-Sent Events (SSE)  
  * Polling with Redis pub/sub  
* **Decision Needed By:** Month 3 (MVP feature prioritization)  
* **Decision Maker:** Engineering lead

**Q4: Search Technology**

* **Question:** When to introduce Elasticsearch vs. PostgreSQL full-text search?  
* **Considerations:**  
  * PostgreSQL FTS: Sufficient for MVP, simpler operations  
  * Elasticsearch: Better relevance, more features, operational overhead  
* **Trigger:** Search volume \> 10K queries/day OR advanced features needed  
* **Decision Needed By:** Month 6-12 (based on usage)  
* **Decision Maker:** Product \+ Engineering

**Q5: Data Residency Requirements**

* **Question:** Are there Kenya-specific data residency requirements we must comply with?  
* **Considerations:**  
  * Kenya Data Protection Act interpretation  
  * Cross-border data transfer restrictions  
  * AWS Africa (Cape Town) region availability  
* **Decision Needed By:** Week 2 (legal review)  
* **Decision Maker:** Legal counsel \+ compliance team

**Q6: GraphQL vs. REST API**

* **Question:** Should we offer GraphQL API in addition to REST?  
* **Considerations:**  
  * GraphQL: Better for complex data fetching, mobile optimization  
  * REST: Simpler, more familiar, easier caching  
  * Hybrid: REST for MVP, GraphQL for mobile apps (Phase 2\)  
* **Decision Needed By:** Month 4 (mobile app planning)  
* **Decision Maker:** API architecture team

---

## **15\. CONCLUSION & NEXT STEPS**

### **15.1 Architecture Summary**

The Brand Coach Network database architecture is designed to:

✅ **Scale gracefully** from 1K to 100K+ users with clear growth paths   
✅ **Ensure data integrity** through ACID transactions and referential constraints   
✅ **Optimize performance** via strategic indexing, caching, and read replicas   
✅ **Maintain security** through encryption, access control, and audit logging   
✅ **Enable compliance** with GDPR, Kenya Data Protection Act, and PCI DSS   
✅ **Support operations** with comprehensive backup, monitoring, and disaster recovery

**Technology Stack:**

* **Primary Database:** PostgreSQL 15+ on AWS RDS  
* **Caching:** Redis 7+ for sessions and hot data  
* **Object Storage:** AWS S3 for media assets  
* **CDN:** CloudFront for global content delivery

**Key Design Principles:**

* **Relational model** for complex entity relationships  
* **Selective denormalization** for performance-critical queries  
* **JSONB flexibility** for dynamic attributes  
* **Event-driven updates** for real-time features  
* **Comprehensive audit logging** for security and compliance

---

### **15.2 Implementation Roadmap**

**Phase 1: MVP (Weeks 1-16)**

* ✅ Implement core schema (users, programs, enrollments, transactions)  
* ✅ Deploy PostgreSQL on AWS RDS  
* ✅ Implement critical indexes  
* ✅ Set up Redis caching layer  
* ✅ Configure backups and monitoring  
* ✅ Load test with 1K simulated users

**Phase 2: Growth (Months 6-12)**

* 🔄 Deploy read replicas  
* 🔄 Implement table partitioning (audit\_logs, notifications)  
* 🔄 Add full-text search optimization  
* 🔄 Scale caching strategy  
* 🔄 Optimize slow queries  
* 🔄 Load test with 10K simulated users

**Phase 3: Scale (Months 12-24)**

* 📋 Evaluate multi-region deployment  
* 📋 Consider sharding strategy (if needed)  
* 📋 Separate analytics workload  
* 📋 Implement advanced monitoring  
* 📋 Optimize for 100K+ users

---

### **15.3 Success Criteria**

**Performance:**

* ✅ \< 200ms average query response time  
* ✅ \< 500ms p95 query response time  
* ✅ 99.9% database uptime  
* ✅ Zero data loss incidents

**Scalability:**

* ✅ Support 10,000 concurrent users (Phase 1\)  
* ✅ Support 100,000 total users (Phase 2\)  
* ✅ Handle 10,000 transactions/month (Phase 1\)  
* ✅ Handle 100,000 transactions/month (Phase 2\)

**Security:**

* ✅ Zero security breaches  
* ✅ 100% audit log coverage for critical operations  
* ✅ GDPR and Kenya DPA compliant  
* ✅ PCI DSS compliant (via payment gateways)

**Operations:**

* ✅ \< 4-hour recovery time (RTO)  
* ✅ \< 1-hour data loss (RPO)  
* ✅ Successful quarterly DR drills  
* ✅ \< 5% database maintenance downtime

---

### **15.4 Immediate Next Steps**

**Week 1-2: Schema Implementation**

1. Review and approve this database architecture document  
2. Set up AWS RDS PostgreSQL instance (staging)  
3. Create initial schema migration scripts  
4. Implement seed data for development  
5. Set up local development databases

**Week 3-4: Integration & Testing** 

6\. Integrate ORM/query builder with application   
7\. Implement data access layer   
8\. Write database integration tests   
9\. Performance baseline testing   
10\. Security configuration hardening

**Week 5-6: Migration Planning**   
11\. Audit existing website data with Nightingale Mukasa   
12\. Design data migration scripts   
13\. Test migration on staging environment   
14\. Document migration rollback procedures   
15\. Schedule production migration window

**Ongoing:**

* Weekly schema review meetings  
* Daily monitoring of query performance  
* Monthly optimization sessions  
* Quarterly architecture reviews

---

### **15.5 Documentation Deliverables**

**Completed:**

* ✅ Database Architecture Document (this document)  
* ✅ Entity Relationship Diagrams (conceptual)  
* ✅ Schema Design (SQL scripts)  
* ✅ Indexing Strategy  
* ✅ Security and Compliance Framework

**To Be Created:**

* 📋 **Data Access Layer API Documentation**  
* 📋 **Query Optimization Playbook**  
* 📋 **Database Operations Runbook**  
* 📋 **Disaster Recovery Procedures**  
* 📋 **Migration Guide (old site → new database)**  
* 📋 **Performance Benchmarking Report**  
* 📋 **Quarterly Architecture Review Template**

---

### **15.6 Final Recommendations**

**For MVP Success:**

1. **Start simple, scale smartly** \- PostgreSQL handles 100K users easily with proper optimization  
2. **Index strategically** \- Focus on critical read patterns, avoid over-indexing  
3. **Monitor from day one** \- Early visibility prevents late-stage firefighting  
4. **Plan for migrations** \- Schema evolution is inevitable, make it painless  
5. **Document everything** \- Future team members will thank you

**For Long-Term Success:**

1. **Invest in observability** \- Know your database inside and out  
2. **Automate operations** \- Reduce manual toil and human error  
3. **Test disaster recovery** \- Hope for the best, prepare for the worst  
4. **Optimize continuously** \- Performance is a journey, not a destination  
5. **Scale proactively** \- Don't wait for fires to add capacity

---

**This database architecture is production-ready and aligns with The Brand Coach Network's mission to empower \#ABillionLivesGlobally through a robust, scalable, and secure digital platform.**

---

**Document Status:** ✅ Complete \- Ready for Implementation  
 **Prepared By:** Database Architect & Data Platform Engineer  
 **Prepared For:** The Brand Coach Network Development Team  
 **Date:** December 13, 2025  
 **Version:** 1.0 Final

---

**END OF DATABASE ARCHITECTURE DOCUMENT**

