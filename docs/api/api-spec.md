# **API SPECIFICATION DOCUMENT**

## **The Brand Coach Network Web Application**

**Document Version:** 1.0  
 **Prepared By:** API Architect & Backend Interface Specialist  
 **Date:** December 13, 2025  
 **API Version:** v1  
 **Base URL:** https://api.brandcoachnetwork.com/v1  
 **Status:** Production-Ready Specification

---

## **1\. EXECUTIVE SUMMARY**

The Brand Coach Network API provides a comprehensive RESTful interface for a multi-sided platform serving individuals, coaches, partners, and administrators. The API enables:

* **User management** and authentication  
* **Learning platform** functionality (courses, enrollments, progress tracking)  
* **Coaching marketplace** (session booking, mentor discovery)  
* **Community features** (discussions, messaging, projects)  
* **E-commerce** (subscriptions, payments, merchandise)  
* **Event management** (registration, ticketing, attendance)  
* **Partner integrations** (bulk enrollments, impact reporting)

### **Key Design Principles**

1. **REST-First Architecture** \- Resource-oriented design with predictable URL structures  
2. **Mobile-Optimized** \- Payload efficiency for African mobile networks (3G/4G)  
3. **Developer-Friendly** \- Consistent patterns, clear error messages, comprehensive documentation  
4. **Secure by Default** \- OAuth 2.0 \+ JWT, role-based access control, input validation  
5. **Scalable** \- Pagination, caching, rate limiting from day one  
6. **Versioned** \- URL-based versioning with backward compatibility guarantees

### **API Consumers**

| Consumer | Primary Use Cases | Traffic Pattern |
| ----- | ----- | ----- |
| **Web App** | Full platform access | Read-heavy (80:20) |
| **Mobile Apps** | On-the-go learning, community | Bandwidth-sensitive |
| **Partner Systems** | Bulk enrollments, reporting | Periodic batch operations |
| **Admin Dashboard** | Content management, analytics | Low volume, complex queries |
| **Third-Party Integrations** | Payment gateways, video hosting | Event-driven webhooks |

---

## **2\. API STYLE & RATIONALE**

### **Primary Style: RESTful HTTP/JSON**

**Rationale:**

✅ **Widely Understood** \- Familiar to most developers, reduces onboarding friction  
✅ **HTTP Standard** \- Leverages existing infrastructure (CDNs, load balancers, caching)  
✅ **Tooling Ecosystem** \- Excellent support for testing, documentation, monitoring  
✅ **Mobile Friendly** \- Works well over unreliable networks with retry logic  
✅ **Cacheable** \- GET requests naturally cacheable at CDN/browser level

**Trade-offs Accepted:**

* More verbose than GraphQL for complex nested data (mitigated with strategic endpoint design)  
* Over-fetching/under-fetching possible (mitigated with field selection and expansion parameters)  
* Multiple round-trips for related resources (mitigated with batch endpoints)

### **Complementary Technologies**

**WebSockets (Phase 2):**

* Real-time notifications  
* Live chat/messaging  
* Event streaming for admin dashboard

**Webhooks:**

* Payment gateway callbacks  
* Partner integration events  
* Async job completion notifications

**GraphQL (Future Consideration):**

* Mobile app optimization (Phase 3\)  
* Complex data fetching scenarios  
* Evaluated if REST becomes limiting

---

## **3\. CORE RESOURCES**

### **Resource Modeling**

The API is organized around these core domain resources:

/users                  \- User accounts and profiles  
/auth                   \- Authentication and sessions  
/programs               \- Learning programs and courses  
/enrollments            \- User-program relationships  
/lessons                \- Individual learning units  
/assessments            \- Quizzes and assignments  
/certificates           \- Earned certifications  
/coaches                \- Coach profiles and availability  
/sessions               \- Coaching session bookings  
/posts                  \- Community discussions  
/messages               \- Direct messaging  
/projects               \- Innovation Hub submissions  
/events                 \- Masterclasses and conferences  
/transactions           \- Payment records  
/subscriptions          \- Recurring memberships  
/orders                 \- Product purchases  
/partners               \- Institutional partners

### **Resource Relationships**

User  
├── Enrollments  
│   ├── Program  
│   │   └── Modules  
│   │       └── Lessons  
│   └── Progress  
├── CoachingSessions (as coach or mentee)  
├── Posts  
├── Messages (sent/received)  
├── Transactions  
└── Subscription

Partner  
├── Cohorts  
│   └── CohortMembers  
└── Programs (enrolled)

---

## **4\. AUTHENTICATION & AUTHORIZATION**

### **4.1 Authentication Methods**

**Primary: JWT (JSON Web Tokens)**

**Flow:**

1\. Client → POST /auth/login (email \+ password)  
2\. Server → Returns access\_token \+ refresh\_token  
3\. Client → Includes "Authorization: Bearer {access\_token}" in subsequent requests  
4\. Access token expires → Client → POST /auth/refresh (refresh\_token)  
5\. Server → Returns new access\_token

**Social Login (OAuth 2.0):**

1\. Client → GET /auth/{provider}/authorize (provider \= google|linkedin|facebook)  
2\. Server → Redirects to OAuth provider  
3\. Provider → Redirects back with authorization code  
4\. Server → Exchanges code for tokens, creates/links user account  
5\. Server → Returns JWT tokens to client

**Token Structure:**

{  
  "access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
  "refresh\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
  "token\_type": "Bearer",  
  "expires\_in": 3600,  
  "user": {  
    "user\_id": "uuid",  
    "email": "user@example.com",  
    "roles": \["member", "coach"\]  
  }  
}

**JWT Payload:**

{  
  "sub": "user\_id",  
  "email": "user@example.com",  
  "roles": \["member"\],  
  "tier": "build",  
  "iat": 1670000000,  
  "exp": 1670003600  
}

---

### **4.2 Authorization Model**

**Role-Based Access Control (RBAC):**

| Role | Permissions | Typical Use Case |
| ----- | ----- | ----- |
| **guest** | Read public content only | Unauthenticated visitor |
| **member** | Enroll in courses, post in community, message users | Registered user |
| **coach** | Create coaching sessions, manage mentees, earn revenue | Certified coach |
| **partner** | Manage cohorts, view reports, bulk operations | Institutional partner |
| **admin** | Content moderation, user management, analytics | Platform administrator |
| **super\_admin** | All permissions including system config | Platform owner |

**Permission Checks:**

Endpoint: GET /programs/{program\_id}/lessons/{lesson\_id}  
Required:   
  \- Authentication: Yes  
  \- Role: member (minimum)  
  \- Condition: User enrolled in program OR program is free preview

**Scope-Based Permissions (OAuth 2.0 for partner APIs):**

Scopes:  
  \- read:users        \- View user data  
  \- write:users       \- Create/update users  
  \- read:enrollments  \- View enrollment data  
  \- write:enrollments \- Create enrollments  
  \- read:analytics    \- Access reporting data

---

### **4.3 Security Headers**

**Required in All Requests:**

Authorization: Bearer {access\_token}  
X-API-Key: {partner\_api\_key}  // For partner integrations  
X-Request-ID: {uuid}           // For request tracing

**Optional:**

X-Idempotency-Key: {uuid}      // For POST/PUT operations  
X-Device-ID: {uuid}            // For device tracking

---

## **5\. ENDPOINT SPECIFICATIONS**

### **5.1 Authentication Endpoints**

#### **POST /auth/register**

**Purpose:** Create new user account

**Request:**

{  
  "email": "user@example.com",  
  "password": "SecurePass123\!",  
  "full\_name": "John Doe",  
  "phone\_number": "+254700123456",  
  "location": {  
    "country": "Kenya",  
    "city": "Nairobi"  
  },  
  "marketing\_consent": true  
}

**Response: 201 Created**

{  
  "user": {  
    "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
    "email": "user@example.com",  
    "full\_name": "John Doe",  
    "email\_verified": false,  
    "status": "pending\_verification",  
    "created\_at": "2025-01-15T10:30:00Z"  
  },  
  "message": "Registration successful. Please verify your email."  
}

**Validation Rules:**

* Email: Valid format, unique, max 255 chars  
* Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number  
* Full name: Required, max 255 chars  
* Phone: E.164 format (optional)

**Error Responses:**

// 400 Bad Request \- Validation error  
{  
  "error": {  
    "code": "VALIDATION\_ERROR",  
    "message": "Invalid request data",  
    "details": \[  
      {  
        "field": "email",  
        "message": "Email already exists"  
      },  
      {  
        "field": "password",  
        "message": "Password must contain at least one uppercase letter"  
      }  
    \]  
  }  
}

// 429 Too Many Requests \- Rate limit exceeded  
{  
  "error": {  
    "code": "RATE\_LIMIT\_EXCEEDED",  
    "message": "Too many registration attempts. Please try again in 1 hour.",  
    "retry\_after": 3600  
  }  
}

---

#### **POST /auth/login**

**Purpose:** Authenticate user and receive tokens

**Request:**

{  
  "email": "user@example.com",  
  "password": "SecurePass123\!",  
  "device\_info": {  
    "device\_id": "uuid",  
    "device\_type": "mobile",  
    "platform": "android",  
    "app\_version": "1.0.0"  
  }  
}

**Response: 200 OK**

{  
  "access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
  "refresh\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
  "token\_type": "Bearer",  
  "expires\_in": 3600,  
  "user": {  
    "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
    "email": "user@example.com",  
    "full\_name": "John Doe",  
    "profile\_photo\_url": "https://cdn.brandcoach.com/users/550e8400.jpg",  
    "roles": \["member", "coach"\],  
    "membership\_tier": "build",  
    "profile\_completion\_percent": 75  
  }  
}

**Error Responses:**

// 401 Unauthorized \- Invalid credentials  
{  
  "error": {  
    "code": "INVALID\_CREDENTIALS",  
    "message": "Invalid email or password",  
    "remaining\_attempts": 3  
  }  
}

// 403 Forbidden \- Account locked  
{  
  "error": {  
    "code": "ACCOUNT\_LOCKED",  
    "message": "Account locked due to multiple failed login attempts",  
    "locked\_until": "2025-01-15T12:00:00Z"  
  }  
}

// 403 Forbidden \- Email not verified  
{  
  "error": {  
    "code": "EMAIL\_NOT\_VERIFIED",  
    "message": "Please verify your email address before logging in",  
    "resend\_verification\_url": "/auth/resend-verification"  
  }  
}

---

#### **POST /auth/refresh**

**Purpose:** Obtain new access token using refresh token

**Request:**

{  
  "refresh\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

**Response: 200 OK**

{  
  "access\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  
  "token\_type": "Bearer",  
  "expires\_in": 3600  
}

**Error Responses:**

// 401 Unauthorized \- Invalid or expired refresh token  
{  
  "error": {  
    "code": "INVALID\_REFRESH\_TOKEN",  
    "message": "Refresh token is invalid or expired. Please login again."  
  }  
}

---

#### **POST /auth/logout**

**Purpose:** Invalidate current session

**Headers:**

Authorization: Bearer {access\_token}

**Request:**

{  
  "refresh\_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

**Response: 204 No Content**

---

#### **GET /auth/{provider}/authorize**

**Purpose:** Initiate OAuth social login

**Providers:** google, linkedin, facebook

**Query Parameters:**

* redirect\_uri (required): Where to redirect after authentication  
* state (optional): CSRF protection token

**Response: 302 Found**

* Redirects to OAuth provider's authorization page

---

#### **GET /auth/{provider}/callback**

**Purpose:** Handle OAuth provider callback

**Query Parameters:**

* code: Authorization code from provider  
* state: CSRF token verification

**Response: 302 Found**

* Redirects to redirect\_uri with tokens in query params or  
* Redirects to login page with error

---

### **5.2 User Management Endpoints**

#### **GET /users/me**

**Purpose:** Get current authenticated user's profile

**Headers:**

Authorization: Bearer {access\_token}

**Response: 200 OK**

{  
  "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "email": "user@example.com",  
  "username": "johndoe",  
  "full\_name": "John Doe",  
  "phone\_number": "+254700123456",  
  "profile": {  
    "brand\_name": "The Brand Coach",  
    "tagline": "Empowering Brands Globally",  
    "bio": "Personal branding expert with 10 years experience...",  
    "occupation": "Brand Coach",  
    "industry": "Professional Services",  
    "location": {  
      "country": "Kenya",  
      "city": "Nairobi",  
      "timezone": "Africa/Nairobi"  
    },  
    "profile\_photo\_url": "https://cdn.brandcoach.com/users/550e8400.jpg",  
    "cover\_photo\_url": "https://cdn.brandcoach.com/covers/550e8400.jpg",  
    "skills": \["Personal Branding", "SME Development", "Public Speaking"\],  
    "social\_links": {  
      "linkedin": "https://linkedin.com/in/johndoe",  
      "twitter": "https://twitter.com/johndoe",  
      "website": "https://johndoe.com"  
    },  
    "profile\_completion\_percent": 85  
  },  
  "roles": \["member", "coach"\],  
  "membership": {  
    "tier": "build",  
    "status": "active",  
    "started\_at": "2025-01-01T00:00:00Z",  
    "next\_billing\_date": "2025-02-01T00:00:00Z"  
  },  
  "stats": {  
    "enrollments\_count": 5,  
    "certifications\_count": 2,  
    "posts\_count": 12,  
    "followers\_count": 48,  
    "following\_count": 23  
  },  
  "created\_at": "2024-06-15T10:00:00Z",  
  "last\_login": "2025-01-15T08:30:00Z"  
}

---

#### **PATCH /users/me**

**Purpose:** Update current user's profile

**Headers:**

Authorization: Bearer {access\_token}  
Content-Type: application/json

**Request:**

{  
  "full\_name": "John Doe Updated",  
  "profile": {  
    "tagline": "New tagline here",  
    "bio": "Updated bio...",  
    "occupation": "Senior Brand Coach",  
    "skills": \["Personal Branding", "Leadership", "Communication"\],  
    "social\_links": {  
      "linkedin": "https://linkedin.com/in/johndoe-updated"  
    }  
  }  
}

**Response: 200 OK**

{  
  "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "full\_name": "John Doe Updated",  
  "profile": {  
    "tagline": "New tagline here",  
    "bio": "Updated bio...",  
    // ... full updated profile  
  },  
  "updated\_at": "2025-01-15T10:35:00Z"  
}

**Validation Rules:**

* Full name: Max 255 chars  
* Bio: Max 5000 chars  
* Skills: Max 20 items, each max 100 chars  
* Social links: Valid URLs

---

#### **GET /users/{user\_id}**

**Purpose:** Get public user profile

**Path Parameters:**

* user\_id (uuid): User identifier

**Query Parameters:**

* include (optional): Comma-separated list of relations to include  
  * stats: Include engagement statistics  
  * recent\_posts: Include 5 most recent posts  
  * certifications: Include earned certifications

**Response: 200 OK**

{  
  "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "username": "johndoe",  
  "full\_name": "John Doe",  
  "profile": {  
    "brand\_name": "The Brand Coach",  
    "tagline": "Empowering Brands Globally",  
    "bio": "Personal branding expert...",  
    "profile\_photo\_url": "https://cdn.brandcoach.com/users/550e8400.jpg",  
    "skills": \["Personal Branding", "SME Development"\],  
    "social\_links": {  
      "linkedin": "https://linkedin.com/in/johndoe"  
    }  
    // Note: Only public fields included  
  },  
  "roles": \["member", "coach"\],  
  "stats": {  
    "posts\_count": 12,  
    "followers\_count": 48  
    // Conditional on privacy settings  
  },  
  "is\_following": false,  // If authenticated user is viewing  
  "joined\_at": "2024-06-15T10:00:00Z"  
}

**Privacy Note:** Response varies based on user's privacy settings and viewer's relationship

---

#### **POST /users/me/avatar**

**Purpose:** Upload profile photo

**Headers:**

Authorization: Bearer {access\_token}  
Content-Type: multipart/form-data

**Request:**

file: (binary)

**Response: 200 OK**

{  
  "profile\_photo\_url": "https://cdn.brandcoach.com/users/550e8400.jpg",  
  "thumbnail\_url": "https://cdn.brandcoach.com/users/thumbs/550e8400.jpg",  
  "uploaded\_at": "2025-01-15T10:40:00Z"  
}

**Validation:**

* Max file size: 5MB  
* Allowed formats: JPEG, PNG, WebP  
* Minimum dimensions: 200x200px  
* Maximum dimensions: 2000x2000px

---

#### **POST /users/me/follow/{user\_id}**

**Purpose:** Follow another user

**Response: 201 Created**

{  
  "following": true,  
  "followed\_at": "2025-01-15T10:45:00Z"  
}

---

#### **DELETE /users/me/follow/{user\_id}**

**Purpose:** Unfollow a user

**Response: 204 No Content**

---

### **5.3 Program & Learning Endpoints**

#### **GET /programs**

**Purpose:** List available programs

**Query Parameters:**

* page (integer, default: 1): Page number  
* limit (integer, default: 20, max: 100): Items per page  
* category (string): Filter by category  
* tier (string): Filter by membership tier access  
* search (string): Full-text search query  
* sort (string): Sort order  
  * popular (default): By enrollment count  
  * recent: By publish date  
  * rating: By average rating  
* instructor\_id (uuid): Filter by instructor  
* status (string, default: published): published, archived

**Response: 200 OK**

{  
  "data": \[  
    {  
      "program\_id": "650e8400-e29b-41d4-a716-446655440001",  
      "title": "Finding Your Brand \- Master Your Brand Bootcamp",  
      "slug": "finding-your-brand-mbp",  
      "description": "Transform your personal brand...",  
      "category": "Personal Branding",  
      "difficulty\_level": "intermediate",  
      "instructor": {  
        "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
        "full\_name": "Winston Eboyi",  
        "profile\_photo\_url": "https://cdn.brandcoach.com/users/winston.jpg"  
      },  
      "pricing": {  
        "type": "one\_time",  
        "amount": 4999.00,  
        "currency": "KES",  
        "tier\_access": \["build", "thrive", "impact"\]  
      },  
      "duration\_weeks": 8,  
      "estimated\_hours": 24,  
      "module\_count": 6,  
      "lesson\_count": 48,  
      "enrollment\_count": 1247,  
      "average\_rating": 4.8,  
      "review\_count": 342,  
      "thumbnail\_url": "https://cdn.brandcoach.com/programs/mbp-thumb.jpg",  
      "preview\_video\_url": "https://cdn.brandcoach.com/programs/mbp-preview.mp4",  
      "is\_enrolled": false,  // If authenticated  
      "published\_at": "2024-03-15T00:00:00Z"  
    }  
    // ... more programs  
  \],  
  "pagination": {  
    "current\_page": 1,  
    "per\_page": 20,  
    "total": 47,  
    "total\_pages": 3,  
    "has\_next": true,  
    "has\_prev": false  
  }  
}

---

#### **GET /programs/{program\_id}**

**Purpose:** Get program details

**Path Parameters:**

* program\_id (uuid): Program identifier

**Query Parameters:**

* include (optional): Comma-separated relations  
  * modules: Include module structure  
  * instructor: Full instructor details  
  * reviews: Include recent reviews

**Response: 200 OK**

{  
  "program\_id": "650e8400-e29b-41d4-a716-446655440001",  
  "title": "Finding Your Brand \- Master Your Brand Bootcamp",  
  "slug": "finding-your-brand-mbp",  
  "description": "Short description...",  
  "long\_description": "Full HTML description...",  
  "category": "Personal Branding",  
  "tags": \["entrepreneurship", "visibility", "storytelling"\],  
  "difficulty\_level": "intermediate",  
  "instructor": {  
    "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
    "full\_name": "Winston Eboyi",  
    "bio": "Founder of The Brand Coach Network...",  
    "profile\_photo\_url": "https://cdn.brandcoach.com/users/winston.jpg"  
  },  
  "pricing": {  
    "type": "one\_time",  
    "amount": 4999.00,  
    "currency": "KES",  
    "tier\_access": \["build", "thrive", "impact"\]  
  },  
  "structure": {  
    "duration\_weeks": 8,  
    "estimated\_hours": 24,  
    "module\_count": 6,  
    "lesson\_count": 48  
  },  
  "modules": \[  
    {  
      "module\_id": "750e8400-e29b-41d4-a716-446655440002",  
      "title": "Module 1: Brand Discovery",  
      "description": "Discover your unique brand identity...",  
      "sequence\_order": 1,  
      "lesson\_count": 8,  
      "estimated\_duration\_minutes": 240,  
      "is\_published": true  
    }  
    // ... more modules  
  \],  
  "engagement": {  
    "enrollment\_count": 1247,  
    "completion\_count": 834,  
    "completion\_rate": 0.67,  
    "average\_rating": 4.8,  
    "review\_count": 342  
  },  
  "media": {  
    "thumbnail\_url": "https://cdn.brandcoach.com/programs/mbp-thumb.jpg",  
    "preview\_video\_url": "https://cdn.brandcoach.com/programs/mbp-preview.mp4"  
  },  
  "enrollment\_status": {  
    "is\_enrolled": false,  
    "can\_enroll": true,  
    "enrollment\_message": null  
  },  
  "published\_at": "2024-03-15T00:00:00Z",  
  "updated\_at": "2025-01-10T15:30:00Z"  
}

---

#### **POST /programs/{program\_id}/enroll**

**Purpose:** Enroll in a program

**Headers:**

Authorization: Bearer {access\_token}  
X-Idempotency-Key: {uuid}

**Request:**

{  
  "payment\_method": "mpesa",  
  "coupon\_code": "EARLYBIRD2025"  // Optional  
}

**Response: 201 Created**

{  
  "enrollment\_id": "850e8400-e29b-41d4-a716-446655440003",  
  "program\_id": "650e8400-e29b-41d4-a716-446655440001",  
  "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "status": "active",  
  "enrollment\_date": "2025-01-15T11:00:00Z",  
  "payment": {  
    "transaction\_id": "950e8400-e29b-41d4-a716-446655440004",  
    "amount": 4999.00,  
    "currency": "KES",  
    "status": "pending",  
    "payment\_url": "https://pay.brandcoach.com/tx/950e8400"  // For M-PESA redirect  
  },  
  "access\_granted": false,  // True once payment confirmed  
  "message": "Complete payment to access course content"  
}

**Error Responses:**

// 400 Bad Request \- Already enrolled  
{  
  "error": {  
    "code": "ALREADY\_ENROLLED",  
    "message": "You are already enrolled in this program",  
    "enrollment\_id": "850e8400-e29b-41d4-a716-446655440003"  
  }  
}

// 402 Payment Required \- Insufficient tier  
{  
  "error": {  
    "code": "TIER\_UPGRADE\_REQUIRED",  
    "message": "This program requires Build tier or higher",  
    "current\_tier": "discover",  
    "required\_tier": "build",  
    "upgrade\_url": "/subscriptions/upgrade"  
  }  
}

// 409 Conflict \- Coupon invalid  
{  
  "error": {  
    "code": "INVALID\_COUPON",  
    "message": "Coupon code is invalid or expired"  
  }  
}

---

#### **GET /enrollments**

**Purpose:** List user's enrollments

**Headers:**

Authorization: Bearer {access\_token}

**Query Parameters:**

* status (string): Filter by status (active, completed, dropped)  
* page, limit: Pagination

**Response: 200 OK**

{  
  "data": \[  
    {  
      "enrollment\_id": "850e8400-e29b-41d4-a716-446655440003",  
      "program": {  
        "program\_id": "650e8400-e29b-41d4-a716-446655440001",  
        "title": "Finding Your Brand \- MBP",  
        "thumbnail\_url": "https://cdn.brandcoach.com/programs/mbp-thumb.jpg"  
      },  
      "progress": {  
        "progress\_percent": 45,  
        "current\_module\_id": "750e8400-e29b-41d4-a716-446655440002",  
        "current\_lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
        "lessons\_completed": 22,  
        "lessons\_total": 48,  
        "time\_spent\_hours": 10.5  
      },  
      "status": "active",  
      "enrollment\_date": "2025-01-01T10:00:00Z",  
      "last\_accessed\_at": "2025-01-15T09:30:00Z",  
      "certificate\_issued": false,  
      "estimated\_completion\_date": "2025-03-01T00:00:00Z"  
    }  
    // ... more enrollments  
  \],  
  "pagination": {  
    "current\_page": 1,  
    "per\_page": 20,  
    "total": 5,  
    "total\_pages": 1  
  }  
}

---

#### **GET /enrollments/{enrollment\_id}**

**Purpose:** Get detailed enrollment with progress

**Response: 200 OK**

{  
  "enrollment\_id": "850e8400-e29b-41d4-a716-446655440003",  
  "program": {  
    "program\_id": "650e8400-e29b-41d4-a716-446655440001",  
    "title": "Finding Your Brand \- MBP",  
    "thumbnail\_url": "https://cdn.brandcoach.com/programs/mbp-thumb.jpg",  
    "instructor": {  
      "full\_name": "Winston Eboyi",  
      "profile\_photo\_url": "..."  
    }  
  },  
  "progress": {  
    "progress\_percent": 45,  
    "current\_module": {  
      "module\_id": "750e8400-e29b-41d4-a716-446655440002",  
      "title": "Module 3: Brand Positioning",  
      "progress\_percent": 60  
    },  
    "current\_lesson": {  
      "lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
      "title": "Defining Your Unique Value Proposition",  
      "progress\_percent": 30  
    },  
    "modules\_completed": 2,  
    "modules\_total": 6,  
    "lessons\_completed": 22,  
    "lessons\_total": 48,  
    "assessments\_completed": 5,  
    "assessments\_total": 8,  
    "time\_spent\_hours": 10.5  
  },  
  "status": "active",  
  "enrollment\_date": "2025-01-01T10:00:00Z",  
  "last\_accessed\_at": "2025-01-15T09:30:00Z",  
  "completion\_date": null,  
  "certificate\_issued": false,  
  "next\_lesson": {  
    "lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
    "title": "Defining Your Unique Value Proposition",  
    "module\_title": "Module 3: Brand Positioning",  
    "duration\_minutes": 25  
  }  
}

---

#### **GET /programs/{program\_id}/modules/{module\_id}/lessons**

**Purpose:** List lessons in a module

**Authorization:** User must be enrolled in program

**Response: 200 OK**

{  
  "module": {  
    "module\_id": "750e8400-e29b-41d4-a716-446655440002",  
    "title": "Module 1: Brand Discovery",  
    "description": "Discover your unique brand identity...",  
    "sequence\_order": 1  
  },  
  "lessons": \[  
    {  
      "lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
      "title": "What is Personal Branding?",  
      "description": "Introduction to personal branding concepts...",  
      "sequence\_order": 1,  
      "content\_type": "video",  
      "video\_duration\_seconds": 1200,  
      "estimated\_minutes": 20,  
      "is\_preview": true,  
      "progress": {  
        "progress\_percent": 100,  
        "completed\_at": "2025-01-05T14:30:00Z",  
        "time\_spent\_seconds": 1250  
      },  
      "is\_locked": false  
    },  
    {  
      "lesson\_id": "850e8400-e29b-41d4-a716-446655440006",  
      "title": "Your Brand Audit Worksheet",  
      "description": "Download and complete the brand audit...",  
      "sequence\_order": 2,  
      "content\_type": "resource",  
      "estimated\_minutes": 30,  
      "is\_preview": false,  
      "progress": {  
        "progress\_percent": 0,  
        "completed\_at": null  
      },  
      "is\_locked": false  
    },  
    {  
      "lesson\_id": "850e8400-e29b-41d4-a716-446655440007",  
      "title": "Module 1 Quiz",  
      "sequence\_order": 8,  
      "content\_type": "quiz",  
      "estimated\_minutes": 15,  
      "progress": {  
        "progress\_percent": 0  
      },  
      "is\_locked": true,  // Locked until previous lessons completed  
      "lock\_reason": "Complete lessons 1-7 to unlock"  
    }  
  \]  
}

---

#### **GET /lessons/{lesson\_id}**

**Purpose:** Get lesson content

**Authorization:** User must be enrolled OR lesson is preview

**Response: 200 OK**

{  
  "lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
  "title": "What is Personal Branding?",  
  "description": "Introduction to personal branding concepts...",  
  "content\_type": "video",  
  "content": {  
    "video\_url": "https://cdn.brandcoach.com/lessons/850e8400.mp4",  
    "video\_duration\_seconds": 1200,  
    "captions\_url": "https://cdn.brandcoach.com/lessons/850e8400.vtt",  
    "transcript": "Full text transcript...",  
    "resources": \[  
      {  
        "title": "Lesson Slides",  
        "url": "https://cdn.brandcoach.com/resources/850e8400-slides.pdf",  
        "type": "pdf",  
        "size\_bytes": 2048000  
      }  
    \]  
  },  
  "module": {  
    "module\_id": "750e8400-e29b-41d4-a716-446655440002",  
    "title": "Module 1: Brand Discovery"  
  },  
  "sequence\_order": 1,  
  "estimated\_minutes": 20,  
  "navigation": {  
    "previous\_lesson\_id": null,  
    "next\_lesson\_id": "850e8400-e29b-41d4-a716-446655440006"  
  },  
  "progress": {  
    "progress\_percent": 45,  
    "last\_position\_seconds": 540,  
    "time\_spent\_seconds": 600,  
    "completed\_at": null,  
    "first\_accessed\_at": "2025-01-15T09:00:00Z",  
    "last\_accessed\_at": "2025-01-15T09:15:00Z"  
  }  
}

---

#### **POST /lessons/{lesson\_id}/progress**

**Purpose:** Update lesson progress

**Request:**

{  
  "progress\_percent": 75,  
  "last\_position\_seconds": 900,  
  "time\_spent\_seconds": 300,  // Increment since last update  
  "completed": false  
}

**Response: 200 OK**

{  
  "lesson\_id": "850e8400-e29b-41d4-a716-446655440005",  
  "progress\_percent": 75,  
  "last\_position\_seconds": 900,  
  "time\_spent\_seconds": 900,  // Cumulative  
  "completed\_at": null,  
  "updated\_at": "2025-01-15T09:20:00Z"  
}

**Idempotency:** Uses GREATEST() logic \- progress\_percent never decreases

---

#### **GET /assessments/{assessment\_id}**

**Purpose:** Get assessment (quiz/assignment) details

**Response: 200 OK**

{  
  "assessment\_id": "950e8400-e29b-41d4-a716-446655440008",  
  "title": "Module 1 Quiz: Brand Discovery",  
  "description": "Test your understanding of brand discovery concepts...",  
  "assessment\_type": "quiz",  
  "passing\_score": 70,  
  "max\_attempts": 3,  
  "time\_limit\_minutes": 30,  
  "questions": \[  
    {  
      "question\_id": "q1",  
      "question\_text": "What is the primary purpose of personal branding?",  
      "question\_type": "multiple\_choice",  
      "options": \[  
        {"id": "a", "text": "To become famous"},  
        {"id": "b", "text": "To differentiate yourself in the market"},  
        {"id": "c", "text": "To sell products"},  
        {"id": "d", "text": "To gain social media followers"}  
      \],  
      "points": 10  
    }  
    // ... more questions (correct answers NOT included in response)  
  \],  
  "attempts": {  
    "attempts\_used": 1,  
    "attempts\_remaining": 2,  
    "best\_score": 65,  
    "last\_attempt": {  
      "submission\_id": "a50e8400-e29b-41d4-a716-446655440009",  
      "score": 65,  
      "passed": false,  
      "submitted\_at": "2025-01-10T14:00:00Z"  
    }  
  }  
}

---

#### **POST /assessments/{assessment\_id}/submit**

**Purpose:** Submit assessment answers

**Request:**

{  
  "answers": \[  
    {"question\_id": "q1", "answer": "b"},  
    {"question\_id": "q2", "answer": "c"},  
    {"question\_id": "q3", "answer": \["a", "c"\]}  // Multi-select  
  \],  
  "time\_taken\_seconds": 1200  
}

**Response: 201 Created**

{  
  "submission\_id": "a50e8400-e29b-41d4-a716-446655440009",  
  "assessment\_id": "950e8400-e29b-41d4-a716-446655440008",  
  "score": 85,  
  "max\_score": 100,  
  "percentage": 85,  
  "passed": true,  
  "attempt\_number": 2,  
  "submitted\_at": "2025-01-15T10:30:00Z",  
  "graded\_at": "2025-01-15T10:30:01Z",  // Instant for auto-graded  
  "feedback": "Great job\! You've mastered the fundamentals...",  
  "results": \[  
    {  
      "question\_id": "q1",  
      "correct": true,  
      "points\_earned": 10,  
      "points\_possible": 10  
    },  
    {  
      "question\_id": "q2",  
      "correct": false,  
      "points\_earned": 0,  
      "points\_possible": 10,  
      "correct\_answer": "d",  
      "explanation": "The correct answer focuses on value differentiation..."  
    }  
  \]  
}

---

### **5.4 Coaching & Mentorship Endpoints**

#### **GET /coaches**

**Purpose:** Search and discover coaches

**Query Parameters:**

* skills (array): Filter by skills (e.g., ?skills\[\]=Personal Branding\&skills\[\]=SME Development)  
* industry (string): Filter by industry  
* location\_country (string): Filter by country  
* language (string): Filter by language  
* min\_rating (float): Minimum average rating (0-5)  
* availability (string): available, busy, away  
* max\_hourly\_rate (integer): Maximum rate in USD  
* sort (string): rating (default), session\_count, hourly\_rate  
* page, limit: Pagination

**Response: 200 OK**

{  
  "data": \[  
    {  
      "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
      "full\_name": "Winston Eboyi",  
      "brand\_name": "The Brand Coach",  
      "tagline": "Empowering Brands Globally",  
      "profile\_photo\_url": "https://cdn.brandcoach.com/users/winston.jpg",  
      "coach\_profile": {  
        "hourly\_rate": 50.00,  
        "currency": "USD",  
        "availability\_status": "available",  
        "specialties": \["Personal Branding", "SME Development", "Leadership"\],  
        "years\_experience": 12,  
        "certifications": \[  
          {  
            "name": "Certified Brand Strategist",  
            "issuer": "Brand Leadership Institute",  
            "year": 2018  
          }  
        \]  
      },  
      "stats": {  
        "total\_sessions": 247,  
        "average\_rating": 4.9,  
        "review\_count": 89,  
        "response\_time\_hours": 2  
      },  
      "location": {  
        "country": "Kenya",  
        "city": "Nairobi",  
        "timezone": "Africa/Nairobi"  
      },  
      "is\_favorited": false  // If authenticated  
    }  
    // ... more coaches  
  \],  
  "pagination": {  
    "current\_page": 1,  
    "per\_page": 20,  
    "total": 47,  
    "total\_pages": 3  
  }  
}

---

#### **GET /coaches/{coach\_id}**

**Purpose:** Get detailed coach profile

**Response: 200 OK**

{  
  "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "full\_name": "Winston Eboyi",  
  "brand\_name": "The Brand Coach",  
  "tagline": "Empowering Brands Globally",  
  "bio": "Founder of The Brand Coach Network with over 12 years...",  
  "profile\_photo\_url": "https://cdn.brandcoach.com/users/winston.jpg",  
  "cover\_photo\_url": "https://cdn.brandcoach.com/covers/winston.jpg",  
  "coach\_profile": {  
    "hourly\_rate": 50.00,  
    "currency": "USD",  
    "availability\_status": "available",  
    "specialties": \["Personal Branding", "SME Development", "Leadership"\],  
    "coaching\_approach": "I believe in transformational coaching...",  
    "years\_experience": 12,  
    "certifications": \[  
      {  
        "name": "Certified Brand Strategist",  
        "issuer": "Brand Leadership Institute",  
        "credential\_id": "CBS-2018-1234",  
        "year": 2018  
      }  
    \],  
    "languages": \["English", "Swahili"\]  
  },  
  "stats": {  
    "total\_sessions": 247,  
    "average\_rating": 4.9,  
    "review\_count": 89,  
    "response\_time\_hours": 2  
  },  
  "recent\_reviews": \[  
    {  
      "review\_id": "b50e8400-e29b-41d4-a716-446655440010",  
      "reviewer\_name": "Jane D.",  
      "rating": 5,  
      "review\_text": "Transformational session\! Winston helped me...",  
      "session\_date": "2025-01-10T00:00:00Z",  
      "created\_at": "2025-01-11T08:00:00Z"  
    }  
    // ... 5 most recent  
  \],  
  "location": {  
    "country": "Kenya",  
    "city": "Nairobi",  
    "timezone": "Africa/Nairobi"  
  },  
  "social\_links": {  
    "linkedin": "https://linkedin.com/in/winstoneboyi",  
    "website": "https://thebrandcoach.com"  
  }  
}

---

#### **GET /coaches/{coach\_id}/availability**

**Purpose:** Get coach's available time slots

**Query Parameters:**

* start\_date (date, required): Start of date range (YYYY-MM-DD)  
* end\_date (date, required): End of date range (max 30 days from start)  
* timezone (string, optional): Viewer's timezone (default: coach's timezone)

**Response: 200 OK**

{  
  "coach\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "timezone": "Africa/Nairobi",  
  "availability": \[  
    {  
      "date": "2025-01-20",  
      "slots": \[  
        {  
          "start\_time": "09:00",  
          "end\_time": "10:00",  
          "is\_available": true  
        },  
        {  
          "start\_time": "10:00",  
          "end\_time": "11:00",  
          "is\_available": true  
        },  
        {  
          "start\_time": "14:00",  
          "end\_time": "15:00",  
          "is\_available": false,  
          "reason": "Booked"  
        }  
      \]  
    },  
    {  
      "date": "2025-01-21",  
      "slots": \[  
        // ... time slots  
      \]  
    }  
  \]  
}

---

#### **POST /sessions**

**Purpose:** Book a coaching session

**Headers:**

Authorization: Bearer {access\_token}  
X-Idempotency-Key: {uuid}

**Request:**

{  
  "coach\_id": "550e8400-e29b-41d4-a716-446655440000",  
  "scheduled\_at": "2025-01-20T09:00:00Z",  
  "duration\_minutes": 60,  
  "session\_type": "one\_on\_one",  
  "topic": "Personal brand positioning strategy",  
  "notes": "I'm launching my consulting business and need help...",  
  "timezone": "Africa/Nairobi"  
}

**Response: 201 Created**

{  
  "session\_id": "c50e8400-e29b-41d4-a716-446655440011",  
  "coach": {  
    "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
    "full\_name": "Winston Eboyi",  
    "profile\_photo\_url": "..."  
  },  
  "mentee": {  
    "user\_id": "{current\_user\_id}",  
    "full\_name": "John Doe"  
  },  
  "scheduled\_at": "2025-01-20T09:00:00Z",  
  "duration\_minutes": 60,  
  "session\_type": "one\_on\_one",  
  "topic": "Personal brand positioning strategy",  
  "meeting": {  
    "platform": "zoom",  
    "meeting\_link": "https://zoom.us/j/123456789",  
    "meeting\_id": "123 456 789",  
    "meeting\_password": "brandcoach"  
  },  
  "payment": {  
    "amount": 50.00,  
    "currency": "USD",  
    "status": "pending",  
    "transaction\_id": "d50e8400-e29b-41d4-a716-446655440012",  
    "payment\_url": "https://pay.brandcoach.com/tx/d50e8400"  
  },  
  "status": "scheduled",  
  "created\_at": "2025-01-15T11:00:00Z",  
  "cancellation\_policy": "Free cancellation up to 24 hours before session"  
}

**Error Responses:**

// 409 Conflict \- Time slot no longer available  
{  
  "error": {  
    "code": "SLOT\_UNAVAILABLE",  
    "message": "This time slot is no longer available",  
    "alternative\_slots": \[  
      {"start\_time": "2025-01-20T10:00:00Z"},  
      {"start\_time": "2025-01-20T14:00:00Z"}  
    \]  
  }  
}

---

#### **GET /sessions**

**Purpose:** List user's coaching sessions

**Query Parameters:**

* role (string): coach, mentee (default: mentee)  
* status (string): scheduled, completed, cancelled, no\_show  
* upcoming (boolean): Filter upcoming sessions only  
* page, limit: Pagination

**Response: 200 OK**

{  
  "data": \[  
    {  
      "session\_id": "c50e8400-e29b-41d4-a716-446655440011",  
      "coach": {  
        "user\_id": "550e8400-e29b-41d4-a716-446655440000",  
        "full\_name": "Winston Eboyi",  
        "profile\_photo\_url": "..."  
      },  
      "mentee": {  
        "user\_id": "{current\_user\_id}",  
        "full\_name": "John Doe"  
      },  
      "scheduled\_at": "2025-01-20T09:00:00Z",  
      "duration\_minutes": 60,  
      "session\_type": "one\_on\_one",  
      "topic": "Personal brand positioning strategy",  
      "status": "scheduled",  
      "meeting\_link": "https://zoom.us/j/123456789",  
      "time\_until\_session": "4 days",  
      "can\_cancel": true,  
      "can\_reschedule": true  
    }  
    // ... more sessions  
  \],  
  "pagination": {...}  
}

---

#### **PATCH /sessions/{session\_id}**

**Purpose:** Update session (reschedule or cancel)

**Request:**

{  
  "action": "reschedule",  // or "cancel"  
  "scheduled\_at": "2025-01-21T10:00:00Z",  // For reschedule  
  "cancellation\_reason": "Emergency came up"  // For cancel  
}

\*\*Response

: 200 OK\*\*

{

  "session\_id": "c50e8400-e29b-41d4-a716-446655440011",

  "scheduled\_at": "2025-01-21T10:00:00Z",

  "status": "scheduled",

  "updated\_at": "2025-01-15T11:30:00Z",

  "message": "Session rescheduled successfully. Both parties have been notified."

}

**Validation Rules:**

* Rescheduling allowed up to 24 hours before session  
* Cancellation policy enforced (24-hour notice for refund)  
* Coach confirmation required for reschedule

---

#### **POST /sessions/{session\_id}/feedback**

**Purpose:** Submit post-session feedback

**Request:**

{

  "rating": 5,

  "would\_recommend": true,

  "feedback\_text": "Excellent session\! Winston provided clear...",

  "highlights": \["Actionable advice", "Great listener", "Deep expertise"\],

  "is\_public": true

}

**Response: 201 Created**

{

  "feedback\_id": "e50e8400-e29b-41d4-a716-446655440013",

  "session\_id": "c50e8400-e29b-41d4-a716-446655440011",

  "rating": 5,

  "created\_at": "2025-01-20T10:30:00Z",

  "message": "Thank you for your feedback\!"

}

---

### **5.5 Community & Social Endpoints**

#### **GET /posts**

**Purpose:** Get community feed

**Query Parameters:**

* `category` (string): discussion, story, question, project, announcement  
* `user_id` (uuid): Filter by author  
* `following` (boolean): Show posts from followed users only  
* `trending` (boolean): Show trending posts  
* `search` (string): Full-text search  
* `page`, `limit`: Pagination

**Response: 200 OK**

{

  "data": \[

    {

      "post\_id": "f50e8400-e29b-41d4-a716-446655440014",

      "author": {

        "user\_id": "550e8400-e29b-41d4-a716-446655440000",

        "full\_name": "Winston Eboyi",

        "username": "winstoneboyi",

        "profile\_photo\_url": "...",

        "brand\_name": "The Brand Coach"

      },

      "title": "5 Strategies to Amplify Your Personal Brand",

      "content": "In today's digital age, personal branding is more important...",

      "category": "discussion",

      "tags": \["branding", "strategy", "visibility"\],

      "media": \[

        {

          "url": "https://cdn.brandcoach.com/posts/f50e8400-img1.jpg",

          "type": "image",

          "thumbnail\_url": "..."

        }

      \],

      "engagement": {

        "view\_count": 1247,

        "like\_count": 89,

        "comment\_count": 23,

        "bookmark\_count": 34,

        "share\_count": 12

      },

      "user\_interaction": {

        "has\_liked": false,

        "has\_bookmarked": false

      },

      "is\_pinned": false,

      "is\_featured": true,

      "published\_at": "2025-01-14T08:00:00Z"

    }

    // ... more posts

  \],

  "pagination": {...}

}

---

#### **POST /posts**

**Purpose:** Create a new post

**Headers:**

Authorization: Bearer {access\_token}

**Request:**

{

  "title": "My Journey to Building a 6-Figure Personal Brand",

  "content": "Two years ago, I started from scratch...",

  "category": "story",

  "tags": \["success", "entrepreneurship", "journey"\],

  "media\_urls": \[

    "https://cdn.brandcoach.com/uploads/temp/img1.jpg"

  \],

  "status": "published"  // or "draft"

}

**Response: 201 Created**

{

  "post\_id": "f50e8400-e29b-41d4-a716-446655440015",

  "author": {

    "user\_id": "{current\_user\_id}",

    "full\_name": "John Doe",

    "username": "johndoe"

  },

  "title": "My Journey to Building a 6-Figure Personal Brand",

  "content": "Two years ago, I started from scratch...",

  "category": "story",

  "tags": \["success", "entrepreneurship", "journey"\],

  "status": "pending",  // Goes to moderation for new users

  "created\_at": "2025-01-15T12:00:00Z",

  "message": "Your post is under review and will be published shortly."

}

**Validation Rules:**

* Title: Max 500 chars, required  
* Content: Max 50,000 chars, required  
* Tags: Max 10 tags, each max 50 chars  
* Media: Max 10 images/videos

---

#### **GET /posts/{post\_id}**

**Purpose:** Get single post with comments

**Query Parameters:**

* `include_comments` (boolean, default: true)  
* `comment_limit` (integer, default: 20\)

**Response: 200 OK**

{

  "post\_id": "f50e8400-e29b-41d4-a716-446655440014",

  "author": {...},

  "title": "5 Strategies to Amplify Your Personal Brand",

  "content": "Full post content...",

  "category": "discussion",

  "tags": \["branding", "strategy"\],

  "media": \[...\],

  "engagement": {...},

  "user\_interaction": {...},

  "comments": \[

    {

      "comment\_id": "g50e8400-e29b-41d4-a716-446655440016",

      "author": {

        "user\_id": "650e8400-e29b-41d4-a716-446655440017",

        "full\_name": "Jane Smith",

        "profile\_photo\_url": "..."

      },

      "content": "Great insights\! I especially loved point \#3 about...",

      "like\_count": 12,

      "has\_liked": false,

      "parent\_comment\_id": null,  // Top-level comment

      "replies\_count": 2,

      "created\_at": "2025-01-14T09:30:00Z",

      "updated\_at": null

    }

    // ... more comments

  \],

  "published\_at": "2025-01-14T08:00:00Z"

}

---

#### **POST /posts/{post\_id}/like**

**Purpose:** Like/unlike a post

**Response: 200 OK**

{

  "liked": true,

  "like\_count": 90

}

**Idempotency:** Toggling behavior \- same request unlikes if already liked

---

#### **POST /posts/{post\_id}/comments**

**Purpose:** Add comment to post

**Request:**

{

  "content": "Great post\! Could you elaborate on strategy \#3?",

  "parent\_comment\_id": null  // Optional, for nested replies

}

**Response: 201 Created**

{

  "comment\_id": "g50e8400-e29b-41d4-a716-446655440018",

  "post\_id": "f50e8400-e29b-41d4-a716-446655440014",

  "author": {

    "user\_id": "{current\_user\_id}",

    "full\_name": "John Doe",

    "profile\_photo\_url": "..."

  },

  "content": "Great post\! Could you elaborate on strategy \#3?",

  "like\_count": 0,

  "created\_at": "2025-01-15T12:15:00Z"

}

---

#### **GET /messages**

**Purpose:** Get user's message conversations

**Query Parameters:**

* `page`, `limit`: Pagination

**Response: 200 OK**

{

  "conversations": \[

    {

      "conversation\_id": "h50e8400-e29b-41d4-a716-446655440019",

      "participant": {

        "user\_id": "550e8400-e29b-41d4-a716-446655440000",

        "full\_name": "Winston Eboyi",

        "profile\_photo\_url": "...",

        "is\_online": true

      },

      "last\_message": {

        "message\_id": "i50e8400-e29b-41d4-a716-446655440020",

        "content": "Thanks for your question\! Let me explain...",

        "sent\_by": "550e8400-e29b-41d4-a716-446655440000",

        "created\_at": "2025-01-15T10:45:00Z",

        "is\_read": false

      },

      "unread\_count": 2,

      "updated\_at": "2025-01-15T10:45:00Z"

    }

    // ... more conversations

  \]

}

---

#### **GET /messages/{conversation\_id}**

**Purpose:** Get messages in conversation

**Query Parameters:**

* `before` (timestamp): Get messages before this time  
* `limit` (integer, default: 50\)

**Response: 200 OK**

{

  "conversation\_id": "h50e8400-e29b-41d4-a716-446655440019",

  "participant": {

    "user\_id": "550e8400-e29b-41d4-a716-446655440000",

    "full\_name": "Winston Eboyi",

    "profile\_photo\_url": "..."

  },

  "messages": \[

    {

      "message\_id": "i50e8400-e29b-41d4-a716-446655440020",

      "sender\_id": "550e8400-e29b-41d4-a716-446655440000",

      "content": "Thanks for your question\! Let me explain...",

      "attachments": \[\],

      "is\_read": false,

      "read\_at": null,

      "created\_at": "2025-01-15T10:45:00Z"

    },

    {

      "message\_id": "i50e8400-e29b-41d4-a716-446655440021",

      "sender\_id": "{current\_user\_id}",

      "content": "Hi Winston, I have a question about module 3...",

      "attachments": \[\],

      "is\_read": true,

      "read\_at": "2025-01-15T10:46:00Z",

      "created\_at": "2025-01-15T10:30:00Z"

    }

  \],

  "has\_more": false

}

---

#### **POST /messages**

**Purpose:** Send a message

**Request:**

{

  "recipient\_id": "550e8400-e29b-41d4-a716-446655440000",

  "content": "Hi, I'd love to connect and discuss...",

  "attachments": \[

    {

      "filename": "proposal.pdf",

      "url": "https://cdn.brandcoach.com/uploads/temp/proposal.pdf",

      "type": "pdf",

      "size\_bytes": 1024000

    }

  \]

}

**Response: 201 Created**

{

  "message\_id": "i50e8400-e29b-41d4-a716-446655440022",

  "conversation\_id": "h50e8400-e29b-41d4-a716-446655440019",

  "sender\_id": "{current\_user\_id}",

  "recipient\_id": "550e8400-e29b-41d4-a716-446655440000",

  "content": "Hi, I'd love to connect and discuss...",

  "attachments": \[...\],

  "created\_at": "2025-01-15T12:30:00Z",

  "delivery\_status": "sent"

}

**Validation:**

* Content: Max 10,000 chars  
* Attachments: Max 10MB total  
* Rate limit: 100 messages/hour per user

---

### **5.6 Event Endpoints**

#### **GET /events**

**Purpose:** List upcoming and past events

**Query Parameters:**

* `status` (string): upcoming, in\_progress, completed  
* `location_type` (string): virtual, physical, hybrid  
* `category` (string): Event category/type  
* `search` (string): Search by title  
* `start_date`, `end_date`: Date range filter  
* `page`, `limit`: Pagination

**Response: 200 OK**

{

  "data": \[

    {

      "event\_id": "j50e8400-e29b-41d4-a716-446655440023",

      "title": "The Brand Coach Storytelling Masterclass 2025",

      "slug": "storytelling-masterclass-2025",

      "description": "Join us for an immersive experience in brand storytelling...",

      "event\_date": "2025-02-15T09:00:00Z",

      "end\_date": "2025-02-15T17:00:00Z",

      "timezone": "Africa/Nairobi",

      "location\_type": "hybrid",

      "location": {

        "physical\_address": "KICC, Nairobi, Kenya",

        "virtual\_platform": "zoom",

        "virtual\_link": null  // Only visible after registration

      },

      "organizer": {

        "user\_id": "550e8400-e29b-41d4-a716-446655440000",

        "full\_name": "Winston Eboyi",

        "profile\_photo\_url": "..."

      },

      "speakers": \[

        {

          "name": "Winston Eboyi",

          "bio": "Founder, The Brand Coach Network",

          "photo\_url": "..."

        }

      \],

      "capacity": {

        "limit": 500,

        "registered": 342,

        "available": 158

      },

      "tickets": \[

        {

          "ticket\_id": "k50e8400-e29b-41d4-a716-446655440024",

          "name": "Early Bird",

          "price": 2500.00,

          "currency": "KES",

          "available": 0,

          "sold\_out": true

        },

        {

          "ticket\_id": "k50e8400-e29b-41d4-a716-446655440025",

          "name": "General Admission",

          "price": 3500.00,

          "currency": "KES",

          "available": 158,

          "sold\_out": false

        }

      \],

      "banner\_image\_url": "https://cdn.brandcoach.com/events/masterclass-2025.jpg",

      "is\_registered": false,

      "status": "published"

    }

    // ... more events

  \],

  "pagination": {...}

}

---

#### **GET /events/{event\_id}**

**Purpose:** Get detailed event information

**Response: 200 OK**

{

  "event\_id": "j50e8400-e29b-41d4-a716-446655440023",

  "title": "The Brand Coach Storytelling Masterclass 2025",

  "slug": "storytelling-masterclass-2025",

  "description": "Short description...",

  "agenda": "\#\# Day Schedule\\n09:00 \- Registration\\n10:00 \- Keynote...",

  "event\_date": "2025-02-15T09:00:00Z",

  "end\_date": "2025-02-15T17:00:00Z",

  "duration\_minutes": 480,

  "timezone": "Africa/Nairobi",

  "location\_type": "hybrid",

  "location": {

    "physical\_address": "KICC, Nairobi, Kenya",

    "virtual\_platform": "zoom"

  },

  "organizer": {...},

  "speakers": \[...\],

  "capacity": {...},

  "tickets": \[...\],

  "registration": {

    "opens\_at": "2025-01-01T00:00:00Z",

    "closes\_at": "2025-02-14T23:59:59Z",

    "requires\_approval": false

  },

  "media": {

    "banner\_image\_url": "...",

    "gallery\_images": \[...\]

  },

  "registration\_status": {

    "is\_registered": false,

    "can\_register": true,

    "message": null

  },

  "status": "published",

  "published\_at": "2024-12-01T00:00:00Z"

}

---

#### **POST /events/{event\_id}/register**

**Purpose:** Register for an event

**Headers:**

Authorization: Bearer {access\_token}

X-Idempotency-Key: {uuid}

**Request:**

{

  "ticket\_id": "k50e8400-e29b-41d4-a716-446655440025",

  "quantity": 1,

  "attendee\_info": {

    "dietary\_requirements": "Vegetarian",

    "t\_shirt\_size": "L"

  }

}

**Response: 201 Created**

{

  "registration\_id": "l50e8400-e29b-41d4-a716-446655440026",

  "event\_id": "j50e8400-e29b-41d4-a716-446655440023",

  "ticket": {

    "ticket\_id": "k50e8400-e29b-41d4-a716-446655440025",

    "name": "General Admission",

    "price": 3500.00,

    "currency": "KES"

  },

  "payment": {

    "transaction\_id": "m50e8400-e29b-41d4-a716-446655440027",

    "amount": 3500.00,

    "status": "pending",

    "payment\_url": "https://pay.brandcoach.com/tx/m50e8400"

  },

  "ticket\_code": "TBCM2025-342-A1B2C3",

  "qr\_code\_url": "https://cdn.brandcoach.com/tickets/qr/l50e8400.png",

  "status": "registered",

  "registered\_at": "2025-01-15T13:00:00Z",

  "message": "Registration successful\! Complete payment to confirm your spot."

}

---

#### **GET /events/{event\_id}/registrations**

**Purpose:** Get user's registrations for event (or all if organizer)

**Authorization:** User or event organizer

**Response: 200 OK**

{

  "registrations": \[

    {

      "registration\_id": "l50e8400-e29b-41d4-a716-446655440026",

      "user": {

        "user\_id": "{current\_user\_id}",

        "full\_name": "John Doe",

        "email": "john@example.com"

      },

      "ticket": {...},

      "ticket\_code": "TBCM2025-342-A1B2C3",

      "qr\_code\_url": "...",

      "payment\_status": "paid",

      "checked\_in": false,

      "status": "registered",

      "registered\_at": "2025-01-15T13:00:00Z"

    }

  \]

}

---

### **5.7 Payment & Commerce Endpoints**

#### **POST /payments/initiate**

**Purpose:** Initiate payment for any transaction

**Headers:**

Authorization: Bearer {access\_token}

X-Idempotency-Key: {uuid}

**Request:**

{

  "amount": 4999.00,

  "currency": "KES",

  "payment\_method": "mpesa",  // mpesa, stripe\_card, paypal

  "transaction\_type": "course",

  "reference\_id": "650e8400-e29b-41d4-a716-446655440001",

  "metadata": {

    "program\_title": "Finding Your Brand",

    "coupon\_code": "EARLYBIRD2025"

  },

  "mpesa\_phone": "+254700123456",  // Required for M-PESA

  "return\_url": "https://app.brandcoach.com/payment/callback"

}

**Response: 201 Created**

{

  "transaction\_id": "n50e8400-e29b-41d4-a716-446655440028",

  "amount": 4999.00,

  "currency": "KES",

  "status": "pending",

  "payment\_method": "mpesa",

  "payment\_url": null,  // For card payments

  "mpesa\_checkout\_request\_id": "ws\_CO\_15012025130045",  // For M-PESA

  "instructions": "Please enter your M-PESA PIN to complete payment",

  "expires\_at": "2025-01-15T13:15:00Z",

  "created\_at": "2025-01-15T13:00:00Z"

}

**M-PESA STK Push Flow:**

1. API initiates STK push to user's phone  
2. User enters PIN on phone  
3. M-PESA callback confirms payment  
4. Webhook notifies application  
5. Transaction status updated to "success"

---

#### **GET /payments/{transaction\_id}**

**Purpose:** Get payment status

**Response: 200 OK**

{

  "transaction\_id": "n50e8400-e29b-41d4-a716-446655440028",

  "user\_id": "{current\_user\_id}",

  "amount": 4999.00,

  "currency": "KES",

  "status": "success",  // pending, processing, success, failed

  "payment\_method": "mpesa",

  "gateway\_transaction\_id": "OHK2D3M4P5",

  "gateway\_reference": "M-PESA Receipt: OHK2D3M4P5",

  "transaction\_type": "course",

  "reference\_id": "650e8400-e29b-41d4-a716-446655440001",

  "created\_at": "2025-01-15T13:00:00Z",

  "processed\_at": "2025-01-15T13:02:34Z",

  "receipt\_url": "https://cdn.brandcoach.com/receipts/n50e8400.pdf"

}

---

#### **GET /transactions**

**Purpose:** List user's transaction history

**Query Parameters:**

* `status`: Filter by status  
* `type`: Filter by transaction type  
* `start_date`, `end_date`: Date range  
* `page`, `limit`: Pagination

**Response: 200 OK**

{

  "data": \[

    {

      "transaction\_id": "n50e8400-e29b-41d4-a716-446655440028",

      "amount": 4999.00,

      "currency": "KES",

      "status": "success",

      "transaction\_type": "course",

      "description": "Enrollment: Finding Your Brand \- MBP",

      "payment\_method": "mpesa",

      "created\_at": "2025-01-15T13:00:00Z",

      "receipt\_url": "..."

    }

    // ... more transactions

  \],

  "summary": {

    "total\_spent": 12497.00,

    "currency": "KES",

    "transaction\_count": 5

  },

  "pagination": {...}

}

---

#### **GET /subscriptions/me**

**Purpose:** Get current user's subscription

**Response: 200 OK**

{

  "subscription\_id": "o50e8400-e29b-41d4-a716-446655440029",

  "tier": "build",

  "status": "active",

  "billing": {

    "billing\_cycle": "monthly",

    "amount": 1999.00,

    "currency": "KES",

    "next\_billing\_date": "2025-02-15T00:00:00Z",

    "payment\_method": "mpesa",

    "auto\_renew": true

  },

  "period": {

    "current\_period\_start": "2025-01-15T00:00:00Z",

    "current\_period\_end": "2025-02-15T00:00:00Z"

  },

  "features": \[

    "Full program access",

    "Mentorship circles",

    "Certificates",

    "Community forums"

  \],

  "started\_at": "2024-06-15T00:00:00Z",

  "cancel\_at\_period\_end": false

}

---

#### **POST /subscriptions/upgrade**

**Purpose:** Upgrade subscription tier

**Request:**

{

  "new\_tier": "thrive",

  "billing\_cycle": "annual",  // monthly or annual

  "payment\_method": "mpesa",

  "prorate": true  // Apply credit from current period

}

**Response: 200 OK**

{

  "subscription\_id": "o50e8400-e29b-41d4-a716-446655440029",

  "tier": "thrive",

  "status": "active",

  "billing": {

    "billing\_cycle": "annual",

    "amount": 49999.00,

    "currency": "KES",

    "next\_billing\_date": "2026-01-15T00:00:00Z"

  },

  "payment\_due": {

    "amount": 42580.00,  // Prorated amount

    "transaction\_id": "p50e8400-e29b-41d4-a716-446655440030",

    "payment\_url": "https://pay.brandcoach.com/tx/p50e8400"

  },

  "upgraded\_at": "2025-01-15T14:00:00Z",

  "message": "Complete payment to activate Thrive tier features"

}

---

#### **DELETE /subscriptions/me**

**Purpose:** Cancel subscription

**Request:**

{

  "cancel\_immediately": false,  // If false, active until period end

  "cancellation\_reason": "too\_expensive",

  "feedback": "Great platform but beyond my budget right now"

}

**Response: 200 OK**

{

  "subscription\_id": "o50e8400-e29b-41d4-a716-446655440029",

  "status": "cancelled",

  "cancel\_at\_period\_end": true,

  "access\_until": "2025-02-15T00:00:00Z",

  "cancelled\_at": "2025-01-15T14:30:00Z",

  "message": "Your subscription will remain active until February 15, 2025"

}

---

### **5.8 Partner & Admin Endpoints**

#### **POST /partners/cohorts**

**Purpose:** Create a partner cohort for bulk enrollment

**Authorization:** Partner role required

**Headers:**

Authorization: Bearer {access\_token}

X-API-Key: {partner\_api\_key}

**Request:**

{

  "program\_id": "650e8400-e29b-41d4-a716-446655440001",

  "cohort\_name": "Safaricom Staff Q1 2025",

  "description": "Leadership development program for managers",

  "start\_date": "2025-02-01",

  "end\_date": "2025-04-30",

  "max\_participants": 100,

  "is\_white\_labeled": true,

  "custom\_branding": {

    "logo\_url": "https://partner.com/logo.png",

    "primary\_color": "\#00A65A"

  }

}

**Response: 201 Created**

{

  "cohort\_id": "q50e8400-e29b-41d4-a716-446655440031",

  "partner\_id": "{partner\_id}",

  "program\_id": "650e8400-e29b-41d4-a716-446655440001",

  "cohort\_name": "Safaricom Staff Q1 2025",

  "start\_date": "2025-02-01",

  "end\_date": "2025-04-30",

  "status": "active",

  "enrollment\_link": "https://app.brandcoach.com/cohorts/q50e8400/join",

  "created\_at": "2025-01-15T15:00:00Z"

}

---

#### **POST /partners/cohorts/{cohort\_id}/enrollments**

**Purpose:** Bulk enroll users in cohort

**Request:**

{

  "users": \[

    {

      "email": "employee1@company.com",

      "full\_name": "John Doe",

      "employee\_id": "EMP001",

      "department": "Marketing"

    },

    {

      "email": "employee2@company.com",

      "full\_name": "Jane Smith",

      "employee\_id": "EMP002",

      "department": "Sales"

    }

  \],

  "send\_invitations": true,

  "auto\_create\_accounts": true

}

**Response: 200 OK**

{

  "cohort\_id": "q50e8400-e29b-41d4-a716-446655440031",

  "enrollments\_created": 2,

  "enrollments\_failed": 0,

  "results": \[

    {

      "email": "employee1@company.com",

      "status": "success",

      "user\_id": "r50e8400-e29b-41d4-a716-446655440032",

      "enrollment\_id": "s50e8400-e29b-41d4-a716-446655440033"

    },

    {

      "email": "employee2@company.com",

      "status": "success",

      "user\_id": "r50e8400-e29b-41d4-a716-446655440034",

      "enrollment\_id": "s50e8400-e29b-41d4-a716-446655440035"

    }

  \]

}

---

#### **GET /partners/cohorts/{cohort\_id}/analytics**

**Purpose:** Get cohort performance analytics

**Authorization:** Partner role required

**Response: 200 OK**

{

  "cohort\_id": "q50e8400-e29b-41d4-a716-446655440031",

  "cohort\_name": "Safaricom Staff Q1 2025",

  "program": {

    "program\_id": "650e8400-e29b-41d4-a716-446655440001",

    "title": "Finding Your Brand \- MBP"

  },

  "enrollment": {

    "total\_enrolled": 87,

    "max\_participants": 100,

    "utilization\_rate": 0.87

  },

  "engagement": {

    "active\_users": 72,

    "inactive\_users": 15,

    "avg\_progress\_percent": 34,

    "avg\_time\_spent\_hours": 8.5

  },

  "completion": {

    "completed\_count": 12,

    "completion\_rate": 0.14,

    "avg\_completion\_time\_days": 45,

    "certifications\_issued": 12

  },

  "satisfaction": {

    "avg\_rating": 4.7,

    "nps\_score": 68,

    "would\_recommend\_percent": 92

  },

  "period": {

    "start\_date": "2025-02-01",

    "end\_date": "2025-04-30",

    "days\_remaining": 75

  },

  "generated\_at": "2025-01-15T15:30:00Z"

}

---

## **6\. REQUEST & RESPONSE SCHEMAS**

### **6.1 Common Data Types**

**UUID:**

Format: RFC 4122 UUID v4

Example: "550e8400-e29b-41d4-a716-446655440000"

**Timestamps:**

Format: ISO 8601 with timezone

Example: "2025-01-15T10:30:00Z"

**Money:**

{

  "amount": 4999.00,

  "currency": "KES"

}

**Pagination Request:**

Query Parameters:

\- page (integer, default: 1\)

\- limit (integer, default: 20, max: 100\)

**Pagination Response:**

{

  "pagination": {

    "current\_page": 1,

    "per\_page": 20,

    "total": 147,

    "total\_pages": 8,

    "has\_next": true,

    "has\_prev": false,

    "next\_page\_url": "/api/v1/resource?page=2",

    "prev\_page\_url": null

  }

}

---

### **6.2 Field Selection & Expansion**

**Sparse Fieldsets:**

GET /programs?fields=program\_id,title,instructor

Returns only specified fields to reduce payload size.

**Resource Expansion:**

GET /enrollments?include=program,progress,user

Includes related resources to reduce round-trips.

---

## **7\. ERROR HANDLING MODEL**

### **7.1 Error Response Structure**

**Standard Error Format:**

{

  "error": {

    "code": "ERROR\_CODE",

    "message": "Human-readable error message",

    "details": \[...\],  // Optional: validation errors

    "request\_id": "uuid",

    "timestamp": "2025-01-15T10:30:00Z"

  }

}

---

### **7.2 HTTP Status Codes**

| Status Code | Meaning | Use Case |
| ----- | ----- | ----- |
| **200** | OK | Successful GET, PATCH, DELETE |
| **201** | Created | Successful POST creating resource |
| **204** | No Content | Successful DELETE with no body |
| **400** | Bad Request | Validation errors, malformed request |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Authenticated but not authorized |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource state conflict (duplicate, race condition) |
| **422** | Unprocessable Entity | Semantic errors (business rule violations) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server error |
| **503** | Service Unavailable | Maintenance mode or overloaded |

---

### **7.3 Error Codes**

**Authentication Errors (AUTH\_\*):**

* `AUTH_MISSING_TOKEN` \- Authorization header missing  
* `AUTH_INVALID_TOKEN` \- Token malformed or expired  
* `AUTH_EXPIRED_TOKEN` \- Token expired, refresh required  
* `INVALID_CREDENTIALS` \- Invalid email/password  
* `EMAIL_NOT_VERIFIED` \- Email verification required  
* `ACCOUNT_LOCKED` \- Too many failed login attempts

**Authorization Errors (AUTHZ\_\*):**

* `AUTHZ_INSUFFICIENT_PERMISSIONS` \- User lacks required role/permission  
* `AUTHZ_TIER_UPGRADE_REQUIRED` \- Higher membership tier needed  
* `AUTHZ_RESOURCE_FORBIDDEN` \- Cannot access this specific resource

**Validation Errors (VAL\_\*):**

* `VALIDATION_ERROR` \- General validation failure (details array populated)  
* `INVALID_FORMAT` \- Field format incorrect (email, phone, etc.)  
* `FIELD_REQUIRED` \- Required field missing  
* `FIELD_TOO_LONG` \- Exceeds max length  
* `INVALID_ENUM_VALUE` \- Not in allowed values list

**Resource Errors (RES\_\*):**

* `RESOURCE_NOT_FOUND` \- Requested resource doesn't exist  
* `RESOURCE_ALREADY_EXISTS` \- Duplicate resource (unique constraint)  
* `RESOURCE_DELETED` \- Resource soft-deleted  
* `RESOURCE_LOCKED` \- Resource temporarily locked

**Business Logic Errors (BIZ\_\*):**

* `ALREADY_ENROLLED` \- User already enrolled in program  
* `INSUFFICIENT_BALANCE` \- Not enough credits/balance  
* `SLOT_UNAVAILABLE` \- Booking slot no longer available  
* `CAPACITY_FULL` \- Event or cohort at capacity  
* `INVALID_COUPON` \- Coupon invalid or expired

**Payment Errors (PAY\_\*):**

* `PAYMENT_FAILED` \- Payment processing failed  
* `PAYMENT_DECLINED` \- Payment declined by gateway  
* `PAYMENT_PENDING` \- Payment still processing  
* `INSUFFICIENT_FUNDS` \- Insufficient funds (M-PESA)

**Rate Limiting (RATE\_\*):**

* `RATE_LIMIT_EXCEEDED` \- Too many requests

---

### **7.4 Validation Error Details**

**Example: Multiple Validation Errors**

{

  "error": {

    "code": "VALIDATION\_ERROR",

    "message": "Request validation failed",

    "details": \[

      {

        "field": "email",

        "code": "INVALID\_FORMAT",

        "message": "Email format is invalid"

      },

      {

        "field": "password",

        "code": "FIELD\_TOO\_SHORT",

        "message": "Password must be at least 8 characters"

      },

      {

        "field": "phone\_number",

        "code": "INVALID\_FORMAT",

        "message": "Phone number must be in E.164 format (+254...)"

      }

    \],

    "request\_id": "t50e8400-e29b-41d4-a716-446655440036",

    "timestamp": "2025-01-15T16:00:00Z"

  }

}

---

## **8\. VERSIONING & DEPRECATION STRATEGY**

### **8.1 Versioning Approach**

**URL-Based Versioning:**

https://api.brandcoachnetwork.com/v1/programs

https://api.brandcoachnetwork.com/v2/programs  // Future

**Rationale:**

* Clear and explicit  
* Easy to route and cache  
* Simple for clients to understand  
* No ambiguity

---

### **8.2 Backward Compatibility**

**Breaking Changes:**

* Removing or renaming fields  
* Changing field types  
* Adding required fields  
* Changing HTTP methods  
* Changing URL structure  
* Changing authentication requirements

**Non-Breaking Changes (Allowed):**

* Adding optional fields  
* Adding new endpoints  
* Adding new query parameters (with defaults)  
* Adding new HTTP headers (optional)  
* Adding new error codes

---

### **8.3 Deprecation Policy**

**Timeline:**

1. **Announcement:** 6 months before deprecation

   * Add `Deprecation` header to responses  
   * Update API documentation  
   * Email notification to registered clients  
2. **Sunset:** 3 months before removal

   * Add `Sunset` header with removal date  
   * Increase warning frequency  
   * Provide migration guide  
3. **Removal:** After 9 months total

   * Endpoint returns `410 Gone`  
   * Redirect to migration documentation

**Example Headers:**

Deprecation: true

Sunset: Sat, 31 Dec 2025 23:59:59 GMT

Link: \<https://docs.brandcoach.com/api/migration\>; rel="deprecation"

---

### **8.4 API Changelog**

Maintained at: `https://api.brandcoachnetwork.com/changelog`

Format:

\#\# v1.2.0 \- 2025-03-15

\#\#\# Added

\- New endpoint: GET /programs/{id}/reviews

\- Field expansion support for user profiles

\#\#\# Changed

\- Increased rate limit to 1000 req/hour

\#\#\# Deprecated

\- Field: \`user.phone\` (use \`user.phone\_number\` instead)

\#\#\# Fixed

\- Pagination bug in enrollments endpoint

---

## **9\. PERFORMANCE & RATE LIMITING**

### **9.1 Rate Limits**

**Tier-Based Limits:**

| User Tier | Requests/Hour | Burst Limit |
| ----- | ----- | ----- |
| **Guest (Unauthenticated)** | 100 | 20/minute |
| **Member** | 1,000 | 100/minute |
| **Coach/Partner** | 5,000 | 500/minute |
| **Admin** | 10,000 | 1,000/minute |

**Special Endpoints:**

* `/auth/login`: 10 attempts/hour per IP  
* `/auth/register`: 5 attempts/hour per IP  
* `/payments/*`: 100/hour per user

---

### **9.2 Rate Limit Headers**

**Included in All Responses:**

X-RateLimit-Limit: 1000

X-RateLimit-Remaining: 847

X-RateLimit-Reset: 1642345678

Retry-After: 3600  // Only when rate limited (429)

**429 Response:**

{

  "error": {

    "code": "RATE\_LIMIT\_EXCEEDED",

    "message": "Rate limit exceeded. Please retry after 3600 seconds.",

    "retry\_after": 3600,

    "limit": 1000,

    "reset\_at": "2025-01-15T17:00:00Z"

  }

}

---

### **9.3 Caching Strategy**

**Cache-Control Headers:**

**Static Resources (Programs, Course Content):**

Cache-Control: public, max-age=3600

ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

**User-Specific Data:**

Cache-Control: private, max-age=300

**Real-Time Data:**

Cache-Control: no-store

**Conditional Requests:**

Request:

  If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"


Response (304 Not Modified):

  (No body, use cached version)

---

### **9.4 Pagination Performance**

**Cursor-Based Pagination (Recommended for large datasets):**

GET /posts?cursor=eyJpZCI6MTIzNDU2fQ\&limit=20

Response:

{

  "data": \[...\],

  "pagination": {

    "next\_cursor": "eyJpZCI6MTIzNDc2fQ",

    "has\_more": true

  }

}

**Benefits:**

* Consistent performance regardless of page depth  
* No missing/duplicate items during pagination  
* Handles real-time data changes

---

### **9.5 Batch Operations**

**Batch Requests (Future Feature):**

POST /batch

Request:

{

  "requests": \[

    {"method": "GET", "url": "/users/me"},

    {"method": "GET", "url": "/enrollments"},

    {"method": "GET", "url": "/events?upcoming=true"}

  \]

}

Response:

{

  "responses": \[

    {"status": 200, "body": {...}},

    {"status": 200, "body": {...}},

    {"status": 200, "body": {...}}

  \]

}

---

## **10\. SECURITY CONSIDERATIONS**

### **10.1 Input Validation**

**Server-Side Validation (Always):**

* Type checking  
* Length limits  
* Format validation (email, phone, UUID)  
* Enum value validation  
* SQL injection prevention (parameterized queries)  
* XSS prevention (HTML sanitization)

**Example Validation Rules:**

{

  email: {

    type: 'string',

    format: 'email',

    maxLength: 255,

    required: true

  },

  password: {

    type: 'string',

    minLength: 8,

    maxLength: 128,

    pattern: '^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\\\d)',

    required: true

  },

  phone\_number: {

    type: 'string',

    format: 'phone',

    pattern: '^\\\\+\[1-9\]\\\\d{1,14}$'  // E.164

  }

}

---

### **10.2 Sensitive Data Protection**

**Never Return in Responses:**

* Password hashes  
* Full credit card numbers  
* API keys/secrets  
* Internal system identifiers  
* Soft-deleted records (unless explicitly requested)

**PII Handling:**

* Email: Returned only to owner or with explicit permission  
* Phone: Returned based on privacy settings  
* Location: Country/city okay, precise coordinates require permission

---

### **10.3 CORS Configuration**

**Allowed Origins:**

https://app.brandcoachnetwork.com

https://admin.brandcoachnetwork.com

http://localhost:3000  // Development only

**Allowed Methods:**

GET, POST, PUT, PATCH, DELETE, OPTIONS

**Allowed Headers:**

Authorization, Content-Type, X-Idempotency-Key, X-Request-ID

**Credentials:**

Access-Control-Allow-Credentials: true

---

### **10.4 Idempotency**

**Idempotent Operations:**

* GET (naturally idempotent)  
* PUT (replace resource, same result)  
* DELETE (delete resource, same result)

**Non-Idempotent Operations:**

* POST (creates new resource each time)

**Idempotency Keys (for POST):**

Headers:

  X-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

**Server Behavior:**

* Store idempotency key with result for 24 hours  
* Subsequent requests with same key return cached result  
* Prevents duplicate payments, enrollments, etc.

---

### **10.5 HTTPS Enforcement**

**Requirements:**

* All API requests MUST use HTTPS  
* HTTP requests redirect to HTTPS (301)  
* HSTS header enforced

Strict-Transport-Security: max-age=31536000; includeSubDomains

---

## **11\. TRADE-OFFS & ASSUMPTIONS**

### **11.1 Key Design Trade-Offs**

**1\. REST vs GraphQL**

**Decision:** REST-first with optional GraphQL (Phase 2\)

✅ **Advantages:**

* Simpler for most clients  
* Better HTTP caching  
* Lower learning curve  
* Mature tooling ecosystem

❌ **Trade-offs:**

* Over-fetching (mitigated with field selection)  
* Under-fetching (mitigated with expansion parameters)  
* Multiple round-trips (mitigated with batch endpoints)

**When to Reconsider:**

* Mobile app data usage becomes critical bottleneck  
* Client feedback indicates GraphQL preference  
* Complex nested data fetching dominates use cases

---

**2\. Granular vs Coarse Endpoints**

**Decision:** Moderate granularity with resource-oriented design

✅ **Advantages:**

* Clear resource boundaries  
* Easy to understand and document  
* Standard CRUD patterns

❌ **Trade-offs:**

* Some operations require multiple requests  
* Complex workflows need orchestration

**Mitigation:**

* Provide action endpoints for complex operations (e.g., `/sessions/{id}/reschedule`)  
* Offer expansion parameters to reduce round-trips  
* Consider workflow endpoints for multi-step processes

---

**3\. Synchronous vs Asynchronous Operations**

**Decision:** Synchronous for Phase 1, async for long-running operations (Phase 2\)

**Synchronous:**

* Enrollments  
* Payments (with webhook callbacks)  
* Session bookings  
* Post creation

**Asynchronous (Future):**

* Bulk enrollments (100+ users)  
* Report generation  
* Video processing  
* Large data exports

**Pattern for Async:**

POST /exports/users

Response: 202 Accepted

{

  "job\_id": "uuid",

  "status": "processing",

  "status\_url": "/jobs/uuid"

}

GET /jobs/{job\_id}

Response: 200 OK

{

  "status": "completed",

  "result\_url": "https://cdn.brandcoach.com/exports/users.csv"

}

---

### **11.2 Key Assumptions**

**Technical Assumptions:**

1. **Mobile networks are improving**

   * 3G/4G becoming standard in target markets  
   * Risk: Slower networks may struggle with payload sizes  
   * Mitigation: Implement payload compression, optimize responses  
2. **Clients will handle token refresh**

   * Frontend/mobile apps responsible for refresh logic  
   * Risk: Poor UX if clients don't implement correctly  
   * Mitigation: Provide client SDKs with built-in refresh handling  
3. **Rate limits are sufficient**

   * Based on projected usage patterns  
   * Risk: Viral growth or bot attacks could overwhelm  
   * Mitigation: Dynamic rate limiting, CAPTCHA for critical endpoints

**Business Assumptions:**

1. **MVP feature set covers 80% of use cases**

   * Advanced features deferred to Phase 2  
   * Risk: Critical features missing for some user segments  
   * Mitigation: Rapid iteration based on user feedback  
2. **API-first approach enables partnerships**

   * Partners will integrate via API  
   * Risk: Partners may need more hand-holding than anticipated  
   * Mitigation: Comprehensive documentation, sandbox environment, support  
3. **Most users access via official apps**

   * Web app and mobile apps are primary consumers  
   * Risk: Third-party integrations may surprise us  
   * Mitigation: Monitor API usage patterns, provide webhooks for notifications

---

## **12\. OPEN QUESTIONS & RISKS**

### **12.1 Technical Risks**

**R1: API Performance Under Scale**

* **Likelihood:** Medium  
* **Impact:** High  
* **Mitigation:**  
  * Load testing before launch  
  * CDN for static responses  
  * Database query optimization  
  * Implement caching aggressively  
* **Contingency:** Rate limiting, horizontal scaling

**R2: Breaking Changes Required Mid-Flight**

* **Likelihood:** Medium (especially in MVP phase)  
* **Impact:** High (client disruption)  
* **Mitigation:**  
  * Thorough design review upfront  
  * Beta API program with select partners  
  * Rapid iteration in v1.x before v2  
* **Contingency:** Maintain parallel versions temporarily

**R3: Mobile Network Latency**

* **Likelihood:** High (African context)  
* **Impact:** Medium (user experience)  
* **Mitigation:**  
  * Optimize payload sizes  
  * Implement smart caching  
  * Progressive data loading  
* **Contingency:** Offline-first mobile apps

---

### **12.2 Security Risks**

**R4: API Key Leakage**

* **Likelihood:** Medium  
* **Impact:** Critical  
* **Mitigation:**  
  * Short-lived tokens  
  * Scope-based permissions  
  * IP whitelisting for partners  
  * Anomaly detection  
* **Contingency:** Immediate key rotation, audit logs

**R5: DDoS Attacks**

* **Likelihood:** Low-Medium  
* **Impact:** High  
* **Mitigation:**  
  * Cloudflare or AWS Shield  
  * Rate limiting  
  * CAPTCHA for sensitive endpoints  
* **Contingency:** Emergency rate limit reduction

---

### **12.3 Open Questions**

**Q1: GraphQL Timeline**

* **Question:** When should we introduce GraphQL alongside REST?  
* **Considerations:**  
  * Mobile app data efficiency  
  * Developer preferences  
  * Maintenance overhead  
* **Decision Needed By:** Month 6 (after mobile app v1 data patterns analyzed)  
* **Decision Maker:** API team based on client feedback and usage metrics

**Q2: Webhook vs Polling for Real-Time Updates**

* **Question:** Should we provide webhooks for partner integrations or require polling?  
* **Options:**  
  * Webhooks: Push notifications to partners  
  * Polling: Partners check for updates periodically  
  * Both: Hybrid approach  
* **Decision Needed By:** Month 3 (first partner integration)  
* **Decision Maker:** Product \+ Engineering

**Q3: API Gateway Selection**

* **Question:** Should we use managed API gateway (AWS API Gateway, Kong) or custom solution?  
* **Considerations:**  
  * Cost at scale  
  * Feature requirements (rate limiting, analytics, etc.)  
  * Operational complexity  
* **Decision Needed By:** Week 4 (architecture planning)  
* **Decision Maker:** Infrastructure team

**Q4: Bulk Operations Design**

* **Question:** What's the maximum bulk operation size and pattern?  
* **Considerations:**  
  * Partner needs for bulk enrollments  
  * System capacity constraints  
  * User experience (progress tracking)  
* **Decision Needed By:** Month 4 (partner API design)  
* **Decision Maker:** API architect \+ Partner success team

**Q5: API Documentation Approach**

* **Question:** OpenAPI-generated docs vs custom developer portal?  
* **Options:**  
  * Swagger UI (auto-generated from OpenAPI spec)  
  * Custom docs site (Docusaurus, GitBook)  
  * Hybrid (generated reference \+ custom guides)  
* **Decision Needed By:** Week 8 (before external launch)  
* **Decision Maker:** Developer experience team  
  ---

  ## **13\. IMPLEMENTATION ROADMAP**

  ### **13.1 Phase 1: MVP (Weeks 1-16)**

**Priority 1 Endpoints (Must-Have):**

* ✅ Authentication (login, register, refresh)  
* ✅ User management (profile, settings)  
* ✅ Program catalog (list, detail)  
* ✅ Enrollments (create, progress tracking)  
* ✅ Lessons (content delivery)  
* ✅ Payments (initiate, status)  
* ✅ Basic community (posts, comments)

**Priority 2 Endpoints (Should-Have):**

* 🔄 Coach directory  
* 🔄 Session booking  
* 🔄 Events (list, register)  
* 🔄 Subscriptions (view, upgrade)  
* 🔄 Assessments (take quiz/assignment)

**Priority 3 Endpoints (Nice-to-Have):**

* 📋 Direct messaging  
* 📋 Projects submission  
* 📋 Notifications  
* 📋 Analytics

**Deferred to Phase 2:**

* Partner bulk operations  
* Advanced search  
* Webhooks  
* Batch operations  
  ---

  ### **13.2 Phase 2: Growth (Months 6-12)**

**Added Capabilities:**

* ✅ Partner APIs (cohorts, bulk enrollment, analytics)  
* ✅ Webhook system for integrations  
* ✅ Advanced search and filtering  
* ✅ Batch request endpoint  
* ✅ Export functionality  
* ✅ Enhanced analytics endpoints  
* ✅ Mobile-optimized responses (field selection)  
  ---

  ### **13.3 Phase 3: Scale (Months 12-24)**

**Advanced Features:**

* 🔄 GraphQL endpoint (optional)  
* 🔄 WebSocket connections (real-time)  
* 🔄 API marketplace for third-party developers  
* 🔄 White-label API for partners  
* 🔄 Advanced rate limiting (per-user quotas)  
* 🔄 API analytics and insights dashboard  
  ---

  ## **14\. DOCUMENTATION DELIVERABLES**

  ### **14.1 API Reference Documentation**

**Format:** OpenAPI 3.0 Specification

**Location:** `https://api.brandcoachnetwork.com/openapi.yaml`

**Interactive Docs:** `https://docs.brandcoachnetwork.com`

**Includes:**

* All endpoints with examples  
* Request/response schemas  
* Authentication guide  
* Error codes reference  
* Rate limiting details  
  ---

  ### **14.2 Developer Guides**

**Getting Started:**

* Authentication setup  
* Making your first API call  
* Handling errors  
* Best practices

**Integration Guides:**

* Web application integration  
* Mobile app integration  
* Partner integration (bulk operations)  
* Payment integration

**Advanced Topics:**

* Pagination strategies  
* Caching and performance  
* Webhooks setup  
* Testing and sandboxes  
  ---

  ### **14.3 SDKs & Client Libraries**

**Planned SDKs:**

* JavaScript/TypeScript (Node.js \+ Browser)  
* React Native (Mobile)  
* Python (for data analysis partners)  
* PHP (for WordPress integrations)

**SDK Features:**

* Automatic token refresh  
* Built-in retry logic  
* Type safety (TypeScript)  
* Request/response interceptors  
* Error handling  
  ---

  ### **14.4 Postman Collection**

**Included:**

* All endpoints organized by resource  
* Pre-configured environment variables  
* Example requests with realistic data  
* Test scripts for common scenarios

**Environments:**

* Production: `https://api.brandcoachnetwork.com/v1`  
* Staging: `https://api-staging.brandcoachnetwork.com/v1`  
* Sandbox: `https://api-sandbox.brandcoachnetwork.com/v1`  
  ---

  ## **15\. TESTING & QUALITY ASSURANCE**

  ### **15.1 API Testing Strategy**

**Unit Tests:**

* Request validation logic  
* Business logic functions  
* Error handling  
* Authentication/authorization logic

**Integration Tests:**

* Database interactions  
* Third-party service integrations (payment gateways)  
* Cache behavior  
* Queue processing

**End-to-End Tests:**

* Critical user flows (registration → enrollment → completion)  
* Payment flows (initiate → complete)  
* Session booking flows

**Contract Tests:**

* OpenAPI spec validation  
* Request/response schema compliance  
* Breaking change detection  
  ---

  ### **15.2 Performance Testing**

**Load Testing:**

* Baseline: 100 concurrent users  
* Target: 1,000 concurrent users  
* Peak: 5,000 concurrent users

**Stress Testing:**

* Identify breaking point  
* Measure degradation gracefully  
* Test recovery procedures

**Endurance Testing:**

* 24-hour sustained load  
* Memory leak detection  
* Connection pool exhaustion

**Tools:**

* JMeter, k6, or Artillery  
* New Relic or DataDog for monitoring  
  ---

  ### **15.3 Security Testing**

**OWASP Top 10:**

* SQL Injection testing  
* XSS prevention validation  
* Authentication bypass attempts  
* Authorization escalation tests  
* CSRF protection verification

**Penetration Testing:**

* Annual third-party audit  
* Bug bounty program (Phase 2\)

**Compliance:**

* GDPR data access/deletion tests  
* PCI DSS compliance (via payment gateways)  
* API security best practices (OWASP API Security Top 10\)  
  ---

  ## **16\. MONITORING & OBSERVABILITY**

  ### **16.1 Metrics to Track**

**Performance Metrics:**

* Request latency (p50, p95, p99)  
* Requests per second  
* Error rate by endpoint  
* Response time by endpoint

**Business Metrics:**

* API calls by client/application  
* Feature usage (which endpoints most used)  
* Conversion rates (API calls → transactions)  
* Partner API usage

**Health Metrics:**

* Uptime/availability  
* Database query performance  
* Cache hit rate  
* Third-party service latency  
  ---

  ### **16.2 Logging Strategy**

**Structured Logging:**

* {  
*   "timestamp": "2025-01-15T10:30:00Z",  
*   "level": "info",  
*   "request\_id": "uuid",  
*   "method": "POST",  
*   "path": "/v1/enrollments",  
*   "status": 201,  
*   "duration\_ms": 234,  
*   "user\_id": "uuid",  
*   "user\_agent": "BrandCoach-Mobile/1.0",  
*   "ip": "41.90.64.123"  
* }


**Log Levels:**

* **DEBUG:** Detailed flow information (disabled in production)  
* **INFO:** Normal operations, successful transactions  
* **WARN:** Potentially harmful situations (deprecated API usage)  
* **ERROR:** Error events that allow application to continue  
* **FATAL:** Severe errors that cause termination

**Retention:**

* INFO logs: 30 days  
* ERROR logs: 90 days  
* Security logs: 1 year  
  ---

  ### **16.3 Alerting**

**Critical Alerts (Page On-Call):**

* API error rate \> 5%  
* API latency p95 \> 2s  
* Payment processing failures  
* Authentication service down

**Warning Alerts (Slack/Email):**

* Error rate \> 1%  
* Rate limit frequently hit  
* Third-party service degraded  
* Cache miss rate \> 50%

**Informational:**

* New API version deployed  
* Rate limit policy updated  
* Large spike in traffic  
  ---

  ## **17\. MIGRATION & BACKWARD COMPATIBILITY**

  ### **17.1 API Evolution Guidelines**

**Adding New Features (Non-Breaking):**

* ✅ Add optional fields to request  
* ✅ Add fields to response  
* ✅ Add new endpoints  
* ✅ Add new query parameters with defaults  
* ✅ Add new error codes

**Making Breaking Changes (Requires New Version):**

* ❌ Remove or rename fields  
* ❌ Change field types  
* ❌ Make optional field required  
* ❌ Change URL structure  
* ❌ Change authentication method  
  ---

  ### **17.2 Client Migration Path**

**When v2 Launches:**

1. **Parallel Operation (6 months)**

   * v1 and v2 both operational  
   * v1 marked as deprecated  
   * Migration guide published  
2. **Deprecation Warnings (3 months)**

   * v1 responses include deprecation headers  
   * Email notifications to registered clients  
   * Sunset date announced  
3. **v1 Sunset**

   * v1 endpoints return 410 Gone  
   * Redirect to v2 migration docs

   ---

   ## **18\. CONCLUSION & NEXT STEPS**

   ### **18.1 API Design Summary**

The Brand Coach Network API provides a comprehensive, secure, and scalable interface for:

✅ **User management** with social login and role-based access  
✅ **Learning platform** with progress tracking and certifications  
✅ **Coaching marketplace** with booking and payment integration  
✅ **Community features** for engagement and collaboration  
✅ **E-commerce** supporting multiple payment methods  
✅ **Partner integrations** for institutional clients

**Design Principles:**

* RESTful, resource-oriented architecture  
* Mobile-optimized for African markets  
* Security-first with OAuth 2.0 \+ JWT  
* Developer-friendly with clear documentation  
* Scalable with caching and rate limiting  
* Versioned for backward compatibility  
  ---

  ### **18.2 Implementation Checklist**

**Week 1-2: Planning & Design**

* \[ \] Review and approve API specification  
* \[ \] Create OpenAPI 3.0 specification file  
* \[ \] Design database schema (completed separately)  
* \[ \] Set up development environment

**Week 3-4: Core Infrastructure**

* \[ \] Implement authentication system (JWT)  
* \[ \] Set up API gateway and routing  
* \[ \] Implement rate limiting middleware  
* \[ \] Configure CORS and security headers

**Week 5-8: Priority 1 Endpoints**

* \[ \] Authentication endpoints  
* \[ \] User management endpoints  
* \[ \] Program catalog endpoints  
* \[ \] Enrollment endpoints  
* \[ \] Payment integration

**Week 9-12: Priority 2 Endpoints**

* \[ \] Coaching endpoints  
* \[ \] Event endpoints  
* \[ \] Community endpoints  
* \[ \] Subscription management

**Week 13-14: Testing & Documentation**

* \[ \] Write automated tests (unit \+ integration)  
* \[ \] Generate API documentation  
* \[ \] Create Postman collection  
* \[ \] Performance testing

**Week 15-16: Launch Preparation**

* \[ \] Security audit  
* \[ \] Load testing  
* \[ \] Monitoring setup  
* \[ \] Soft launch with beta users  
  ---

  ### **18.3 Success Criteria**

**Technical Metrics:**

* ✅ API response time p95 \< 500ms  
* ✅ 99.9% uptime  
* ✅ Zero critical security vulnerabilities  
* ✅ 100% endpoint test coverage

**Developer Experience:**

* ✅ Complete API documentation  
* ✅ Interactive API explorer  
* ✅ Client SDKs (JavaScript, React Native)  
* ✅ \< 30 minutes to first successful API call

**Business Metrics:**

* ✅ Support 10,000 active users  
* ✅ Process 10,000 transactions/month  
* ✅ Enable 5+ partner integrations  
* ✅ \< 1% error rate  
  ---

  ### **18.4 Recommended Next Steps**

**Immediate (Week 1):**

1. Stakeholder review and approval of API spec  
2. Create detailed OpenAPI specification  
3. Set up API development environment  
4. Begin authentication system implementation

**Short-term (Month 1):**

1. Implement core authentication and user endpoints  
2. Set up CI/CD pipeline for API  
3. Begin integration with payment gateways  
4. Create developer documentation portal

**Medium-term (Months 2-3):**

1. Complete all Priority 1 and 2 endpoints  
2. Comprehensive testing and security audit  
3. Beta program with select developers  
4. Performance optimization

**Long-term (Months 4-6):**

1. Partner API program launch  
2. Mobile SDK development  
3. Advanced features (webhooks, analytics)  
4. Scale testing and optimization  
   ---

**This API specification is production-ready and provides a comprehensive blueprint for building a scalable, secure, and developer-friendly API that powers The Brand Coach Network's mission to empower \#ABillionLivesGlobally.**

---

**Document Status:** ✅ Complete \- Ready for Implementation  
**Prepared By:** API Architect & Backend Interface Specialist  
**Prepared For:** The Brand Coach Network Development Team  
**Date:** December 13, 2025  
**Version:** 1.0 Final

---

**END OF API SPECIFICATION DOCUMENT**