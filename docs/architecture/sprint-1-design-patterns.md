# Sprint 1 — Structural Design Patterns Reference

**Sprint:** 1 — Foundation & Identity (Weeks 1–4)
**Document Version:** 1.0
**Last Updated:** 2026-02-07

---

## Table of Contents

1. [Backend Patterns (NestJS API)](#1-backend-patterns-nestjs-api)
   - 1.1 Module Pattern
   - 1.2 Repository Pattern
   - 1.3 Service Layer Pattern
   - 1.4 DTO + Validation Pipeline
   - 1.5 Strategy Pattern (Authentication)
   - 1.6 Guard Pattern (Authorization)
   - 1.7 Interceptor Pattern (Cross-Cutting Concerns)
   - 1.8 Decorator Pattern (Custom Metadata)
   - 1.9 Filter Pattern (Exception Handling)
   - 1.10 Domain Events (Observer Pattern)
   - 1.11 Entity Inheritance (Template Method)
   - 1.12 Event-Driven Email Delivery
   - 1.13 Testing Patterns
2. [Frontend Patterns (Next.js Web)](#2-frontend-patterns-nextjs-web)
   - 2.1 Provider Composition Pattern
   - 2.2 Route Group Layout Pattern
   - 2.3 API Client Singleton
   - 2.4 Store Slice Pattern (Zustand)
   - 2.5 Custom Hook Abstraction
   - 2.6 Component Barrel Exports
   - 2.7 Protected Route HOC
   - 2.8 Reusable UI Component Library
3. [Cross-Cutting Patterns](#3-cross-cutting-patterns)
   - 3.1 Monorepo Workspace Pattern
   - 3.2 Barrel Export Convention
   - 3.3 Environment Configuration Pattern

---

## 1. Backend Patterns (NestJS API)

### 1.1 Module Pattern

**Category:** Structural
**Location:** `apps/api/src/modules/*/`

Each business domain is encapsulated in a self-contained NestJS module that owns its controllers, services, entities, and DTOs.

```
modules/
├── auth/
│   ├── auth.module.ts          # Module definition
│   ├── auth.controller.ts      # HTTP endpoints
│   ├── auth.service.ts         # Business logic
│   ├── dto/                    # Request validation
│   │   ├── auth.dto.ts
│   │   └── index.ts
│   ├── entities/               # TypeORM entities (if any)
│   ├── interfaces/             # TypeScript interfaces
│   └── strategies/             # Passport strategies
│       ├── jwt.strategy.ts
│       ├── google.strategy.ts
│       ├── facebook.strategy.ts
│       ├── linkedin.strategy.ts
│       └── index.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── dto/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── user-profile.entity.ts
│   └── enums/
```

**Dependency Management:**

```typescript
// auth.module.ts — uses forwardRef to handle circular dependency
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ ... }),
    forwardRef(() => UsersModule),   // ← Circular reference handling
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, FacebookStrategy, LinkedInStrategy],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
```

**Rules:**
- Each module exports only what other modules need via `exports: [...]`.
- Cross-module communication goes through service injection, not direct repository access.
- `forwardRef()` resolves circular dependencies (e.g., Auth ↔ Users).

---

### 1.2 Repository Pattern

**Category:** Structural
**Location:** `apps/api/src/modules/users/users.repository.ts`

Repositories abstract database queries from business logic. TypeORM repositories are injected via `@InjectRepository()`.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}
}
```

**Query Patterns Used:**
- `findOne({ where: { ... } })` — simple lookups
- `createQueryBuilder('user')` — complex joins, ILIKE search, pagination
- `addSelect('user.password')` — explicit opt-in for excluded fields (`{ select: false }`)

---

### 1.3 Service Layer Pattern

**Category:** Behavioral
**Location:** `apps/api/src/modules/*/[name].service.ts`

All business logic lives in service classes. Controllers are thin — they validate inputs (via DTOs), call services, and return responses.

```typescript
// Controller (thin) — delegates to service
@Post('register')
@Public()
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}

// Service (thick) — owns the logic
async register(dto: RegisterDto): Promise<{ message: string }> {
  if (!dto.acceptTerms) throw new BadRequestException(...);
  const existingUser = await this.usersService.findByEmail(dto.email);
  if (existingUser) throw new ConflictException(...);
  const hashedPassword = await this.hashPassword(dto.password);
  const user = await this.usersService.createWithPassword({ ... });
  this.eventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, { ... });
  return { message: 'Registration successful.' };
}
```

**Service Responsibilities:**
| Concern | Example |
|---------|---------|
| Validation beyond DTO | `if (!dto.acceptTerms)` |
| Business rule enforcement | Password hashing, account locking |
| Repository coordination | Find user → create user → create profile |
| Event emission | `this.eventEmitter.emit(...)` |
| Token generation | `this.jwtService.signAsync(...)` |

---

### 1.4 DTO + Validation Pipeline

**Category:** Structural
**Location:** `apps/api/src/modules/*/dto/`

DTOs (Data Transfer Objects) define and validate request payloads using `class-validator` decorators. The global `ValidationPipe` enforces them.

```typescript
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
```

**Global Pipe Configuration:**

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Throw on unknown properties
  transform: true,           // Auto-transform payloads to DTO instances
}));
```

**Pattern:** DTOs are exported via barrel files (`dto/index.ts`) for clean imports.

---

### 1.5 Strategy Pattern (Authentication)

**Category:** Behavioral
**Location:** `apps/api/src/modules/auth/strategies/`

Passport strategies implement the Strategy pattern — each strategy encapsulates a different authentication algorithm behind a common interface.

```typescript
// All strategies follow the same contract:
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({ clientID: ..., clientSecret: ..., callbackURL: ..., scope: [...] });
  }
  async validate(accessToken, refreshToken, profile, done): Promise<void> {
    const user = { providerId: profile.id, provider: 'google', email: ... };
    done(null, user);
  }
}
```

| Strategy | Authentication Method | Output |
|----------|----------------------|--------|
| `JwtStrategy` | Bearer token in header | `JwtPayload { sub, email, role }` |
| `GoogleStrategy` | OAuth2 redirect | `{ providerId, provider, email, firstName, lastName, avatarUrl }` |
| `FacebookStrategy` | OAuth redirect | Same social profile shape |
| `LinkedInStrategy` | OAuth2 redirect | Same social profile shape |

**All strategies produce a normalized user object** that feeds into `AuthService.socialLogin()` — the downstream code is provider-agnostic.

---

### 1.6 Guard Pattern (Authorization)

**Category:** Behavioral
**Location:** `apps/api/src/common/guards/`

Guards control access to endpoints. They implement `CanActivate` and run before the route handler.

```
Guards implemented:
├── jwt-auth.guard.ts       # Verifies JWT Bearer tokens
├── roles.guard.ts          # Checks user.role against @Roles() decorator
├── rate-limit.guard.ts     # Custom throttling logic
├── api-key.guard.ts        # API key validation for external integrations
└── oauth.guard.ts          # Google/Facebook/LinkedIn OAuth flow triggers
```

**Guard Composition:**

```typescript
// Multiple guards compose sequentially
@UseGuards(JwtAuthGuard)                    // 1st: Is user authenticated?
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN) // 2nd: Does user have role?
async adminEndpoint() { ... }

// Public routes bypass JWT guard via @Public() decorator
@Post('login')
@Public()
async login(@Body() dto: LoginDto) { ... }
```

---

### 1.7 Interceptor Pattern (Cross-Cutting Concerns)

**Category:** Behavioral
**Location:** `apps/api/src/common/interceptors/`

Interceptors wrap the request/response lifecycle for cross-cutting concerns.

| Interceptor | Purpose | Applied |
|-------------|---------|---------|
| `TransformInterceptor` | Wraps all responses in `{ data, timestamp }` envelope | Global |
| `LoggingInterceptor` | Logs request method, URL, and response time | Global |
| `TimeoutInterceptor` | Enforces request timeout limits | Global |

```typescript
// TransformInterceptor — wraps every response
intercept(context, next): Observable<ApiResponse<T>> {
  return next.handle().pipe(
    map((data) => ({
      data,
      timestamp: new Date().toISOString(),
    })),
  );
}
```

**Registration:**

```typescript
// main.ts — applied globally in order
app.useGlobalInterceptors(
  new LoggingInterceptor(),    // 1st: Log the request
  new TransformInterceptor(),  // 2nd: Wrap the response
  new TimeoutInterceptor(),    // 3rd: Enforce timeout
);
```

---

### 1.8 Decorator Pattern (Custom Metadata)

**Category:** Structural
**Location:** `apps/api/src/common/decorators/`

Custom decorators reduce boilerplate and attach metadata to route handlers.

| Decorator | Purpose | Example Usage |
|-----------|---------|--------------|
| `@Public()` | Marks route as public (bypasses JWT guard) | `@Public() @Post('login')` |
| `@CurrentUser()` | Extracts user payload from `request.user` | `@CurrentUser('sub') userId: string` |
| `@Roles(...)` | Declares required roles for endpoint | `@Roles(UserRole.ADMIN)` |
| `@ApiPaginatedResponse()` | Swagger documentation for paginated endpoints | `@ApiPaginatedResponse(UserDto)` |

```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
```

---

### 1.9 Filter Pattern (Exception Handling)

**Category:** Behavioral
**Location:** `apps/api/src/common/filters/`

Exception filters catch errors and transform them into standardized error responses.

| Filter | Catches | Purpose |
|--------|---------|---------|
| `HttpExceptionFilter` | All `HttpException` subclasses | Formats NestJS exceptions to API envelope |
| `AllExceptionsFilter` | Uncaught exceptions | Catches unexpected errors, returns 500 |
| `ValidationExceptionFilter` | Validation pipe errors | Formats class-validator errors |

---

### 1.10 Domain Events (Observer Pattern)

**Category:** Behavioral
**Location:** Events emitted from service classes; listeners in respective modules.

Event names follow the convention: `{domain}.{entity}.{action}`.

```typescript
// Emitting
this.eventEmitter.emit('auth.user.registered', { userId, email, firstName });

// Listening (in any module)
@OnEvent('auth.user.registered')
async handleUserRegistered(payload: { userId: string; email: string }) {
  // Send welcome email, create analytics entry, etc.
}
```

---

### 1.11 Entity Inheritance (Template Method)

**Category:** Structural
**Location:** `apps/api/src/common/entities/base.entity.ts`

All entities extend `BaseEntity` which provides `id`, `createdAt`, and `updatedAt`. Domain-specific entities add their own fields and lifecycle hooks.

```typescript
// Base (abstract) — provides common fields
abstract class BaseEntity {
  id: string;          // UUID
  createdAt: Date;     // auto-set
  updatedAt: Date;     // auto-set
}

// User (concrete) — extends with domain fields + hooks
class User extends BaseEntity {
  email: string;
  password: string | null;
  role: UserRole;
  // ...
  @BeforeInsert()
  async hashPasswordBeforeInsert() { ... }  // Template method hook
}
```

---

### 1.12 Event-Driven Email Delivery

**Category:** Behavioral (Observer + Strategy)
**Location:** `apps/api/src/modules/email/`

Email sending follows an event-driven architecture where auth events trigger email delivery through a dedicated listener, keeping business logic decoupled from email concerns.

**Module Structure:**

```
modules/email/
├── email.module.ts              # @Global() module — available everywhere
├── email.service.ts             # SMTP transport + console fallback
├── email-event.listener.ts      # @OnEvent() handlers
└── templates/
    └── index.ts                 # Branded HTML templates
```

**Event Flow:**

```typescript
// 1. AuthService emits domain event (no knowledge of email)
async register(dto: RegisterDto) {
  const user = await this.usersService.createWithPassword({ ... });
  const verificationToken = this.generateSecureToken();
  await this.usersService.setEmailVerificationToken(user.id, verificationToken);

  this.eventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: dto.email,
    firstName: dto.firstName,
    verificationToken,
  });
}

// 2. EmailEventListener picks up the event
@OnEvent(AUTH_EVENTS.USER_REGISTERED)
async handleUserRegistered(payload: { email, firstName, verificationToken }) {
  await this.emailService.sendVerificationEmail(
    payload.email,
    payload.firstName,
    payload.verificationToken,
  );
}

// 3. EmailService sends via SMTP or falls back to console
async sendVerificationEmail(to, firstName, token): Promise<boolean> {
  const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
  return this.sendEmail({
    to,
    subject: 'Verify your email — Brand Coach Network',
    html: getEmailVerificationTemplate({ firstName, verificationUrl, frontendUrl }),
  });
}
```

**Console Fallback Strategy:**

When `SMTP_HOST` is not configured, the service logs email details to console instead of sending. This enables development without external SMTP dependencies.

```typescript
async sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!this.transporter) {
    this.logger.log(`[EMAIL PREVIEW] To: ${options.to} | Subject: ${options.subject}`);
    return true; // Succeed silently in dev
  }
  // ... SMTP send
}
```

**Event → Email Mapping:**

| Auth Event | Listener Method | Email Template |
|------------|----------------|----------------|
| `auth.user.registered` | `handleUserRegistered()` | Email verification link |
| `auth.password.resetRequested` | `handlePasswordResetRequested()` | Password reset link |
| `auth.password.changed` | `handlePasswordChanged()` | Password changed confirmation |

**Key Design Rules:**
- `AuthService` never calls `EmailService` directly — all communication is via events.
- `EmailModule` is `@Global()` — no need to import it explicitly in other modules.
- SMTP connection is verified on startup via `OnModuleInit`; failures degrade gracefully.
- All templates are pure functions that return HTML strings — easily testable.

---

### 1.13 Testing Patterns

**Category:** Structural
**Location:** `apps/api/src/modules/*/[name].spec.ts` (unit), `apps/api/test/*.e2e-spec.ts` (E2E)

All modules follow consistent testing patterns using Jest with NestJS Testing Module.

**Unit Test Pattern — Service with DI Mocks:**

```typescript
const mockUsersService = {
  findByEmail: jest.fn(),
  createWithPassword: jest.fn(),
  findOrCreateFromSocial: jest.fn(),
  // ... all methods the service depends on
};

const module = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: UsersService, useValue: mockUsersService },
    { provide: JwtService, useValue: mockJwtService },
    { provide: EventEmitter2, useValue: mockEventEmitter },
  ],
}).compile();
```

**Unit Test Pattern — Passport Strategies (Direct Instantiation):**

Passport strategies cause circular-dependency errors in NestJS Testing Module due to the `PassportStrategy()` mixin. Strategies are instantiated directly instead:

```typescript
// Avoids PassportStrategy circular-dep in NestJS DI
beforeEach(() => {
  strategy = new GoogleStrategy(mockConfigService as unknown as ConfigService);
});
```

**Unit Test Pattern — Module-Level Mocks:**

```typescript
// Mock nodemailer at module level for EmailService tests
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: mockSendMail,
    verify: jest.fn(),
  })),
}));
```

**E2E Test Pattern — Full HTTP Flow:**

```typescript
const app = moduleFixture.createNestApplication();
app.setGlobalPrefix('api');
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, ... }));

// Test real HTTP requests
request(app.getHttpServer())
  .post('/api/v1/auth/register')
  .send(testUser)
  .expect(201);
```

**Test Suite Inventory:**

| Suite | Tests | Pattern |
|-------|-------|---------|
| `auth.service.spec.ts` | 30 | DI mock injection |
| `auth.controller.spec.ts` | 17 | DI mock injection + response assertions |
| `google.strategy.spec.ts` | 4 | Direct instantiation |
| `facebook.strategy.spec.ts` | 4 | Direct instantiation |
| `linkedin.strategy.spec.ts` | 4 | Direct instantiation |
| `email.service.spec.ts` | 16 | Module-level jest.mock |
| `email-event.listener.spec.ts` | 8 | DI mock injection |
| `users.service.spec.ts` | 15 | DI mock injection |
| `users.controller.spec.ts` | 11 | DI mock injection |
| **Total** | **109** | — |

---

## 2. Frontend Patterns (Next.js Web)

### 2.1 Provider Composition Pattern

**Category:** Structural
**Location:** `apps/web/src/components/providers/`

All client-side context providers are composed in a single `<Providers>` wrapper to avoid deep nesting in `layout.tsx`.

```typescript
// providers/index.tsx — composes all providers in correct order
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

// layout.tsx — clean
<body>
  <Providers>{children}</Providers>
</body>
```

**Provider Stack:**

| Layer | Provider | Purpose |
|-------|----------|---------|
| 1 (outermost) | `ThemeProvider` | Dark/light theme via `next-themes` |
| 2 | `QueryProvider` | React Query client + devtools |
| 3 (innermost) | `ToastProvider` | `react-hot-toast` container |

---

### 2.2 Route Group Layout Pattern

**Category:** Structural
**Location:** `apps/web/src/app/(marketing)/`, `(auth)/`, `(dashboard)/`, `(admin)/`

Each route group defines its own `layout.tsx` that wraps pages in section-specific chrome.

| Route Group | Layout Structure | URL Prefix |
|-------------|-----------------|------------|
| `(marketing)` | Header → content → Footer (full-width) | `/about`, `/partners`, `/contact` |
| `(auth)` | Split-screen: branding left, form right | `/login`, `/register` |
| `(dashboard)` | Sidebar + topbar + main content | `/dashboard/*` |
| `(admin)` | Admin sidebar + content area | `/admin/*` |
| `auth/` (real route) | No layout wrapper (minimal) | `/auth/callback` |

**Key insight:** The root `page.tsx` (landing page) sits outside all groups and imports `Header`/`Footer` directly to avoid route conflicts.

---

### 2.3 API Client Singleton

**Category:** Creational
**Location:** `apps/web/src/lib/api/client.ts`

A single Axios instance with request/response interceptors handles all API communication.

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor — auto-attach JWT
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor — auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh, then retry original request
    }
  }
);
```

**API modules wrap the client with domain-specific methods:**

```
lib/api/
├── client.ts          # Axios singleton + interceptors
├── auth.ts            # authApi.login(), .register(), .socialLogin(), etc.
├── users.ts           # usersApi.getProfile(), .updateProfile(), etc.
├── programs.ts        # programsApi.list(), .getById(), etc.
└── index.ts           # Barrel export
```

---

### 2.4 Store Slice Pattern (Zustand)

**Category:** Structural
**Location:** `apps/web/src/lib/store/`

Zustand stores are split by domain into focused slices, each with its own file.

```
lib/store/
├── auth-store.ts      # Authentication state + token management
├── ui-store.ts        # Theme, sidebar open/closed, preferences
├── cart-store.ts      # Enrollment shopping cart
├── user-store.ts      # User profile data
└── index.ts           # Barrel export
```

**Store pattern with persist:**

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

---

### 2.5 Custom Hook Abstraction

**Category:** Behavioral
**Location:** `apps/web/src/hooks/`

Custom hooks abstract React Query mutations and store interactions behind a simple API.

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const { setUser, setTokens, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await authApi.me();
      setUser(user);
    },
  });

  const useRequireAuth = () => { /* redirect if not authenticated */ };
  const useRequireRole = (role: UserRole) => { /* redirect if wrong role */ };

  return { loginMutation, registerMutation, logoutMutation, useRequireAuth, useRequireRole };
}
```

---

### 2.6 Component Barrel Exports

**Category:** Structural
**Location:** `apps/web/src/components/*/index.ts`

Every component directory exports via an `index.ts` barrel file for clean imports.

```typescript
// components/auth/index.ts
export * from './protected-route';
export * from './SocialLoginButtons';

// Usage — clean import
import { SocialLoginButtons } from '@/components/auth';
```

**Component Organization:**

```
components/
├── auth/           # Auth-specific: SocialLoginButtons, ProtectedRoute
├── layout/         # Shell: Header, Footer, Navigation, Breadcrumbs, Sidebar
├── ui/             # Generic: Button, Card, Input, Modal, Badge, Avatar, etc.
├── providers/      # Context providers
├── shared/         # Cross-domain reusable components
├── programs/       # Program-specific (Sprint 2)
├── coaching/       # Coaching-specific (Sprint 3)
└── payments/       # Payment-specific (Sprint 4)
```

---

### 2.7 Protected Route HOC

**Category:** Structural
**Location:** `apps/web/src/components/auth/protected-route.tsx`

A higher-order component that wraps dashboard/admin pages and redirects unauthenticated users to `/login`.

```typescript
// Wraps any page that requires authentication
export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=' + pathname);
    if (requiredRole && user?.role !== requiredRole) router.push('/unauthorized');
  }, [isAuthenticated]);

  return isAuthenticated ? children : <LoadingSkeleton />;
}
```

---

### 2.8 Reusable UI Component Library

**Category:** Structural
**Location:** `apps/web/src/components/ui/`

Atomic UI components built with Tailwind CSS and CSS variables (oklch color system).

| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, outline, ghost variants |
| `Input` | Form inputs with error state styling |
| `Card` | Content containers |
| `Modal` | Dialog overlays |
| `Badge` | Status labels (active, pending, etc.) |
| `Avatar` | User profile images with fallback |
| `Spinner` | Loading indicators |
| `Skeleton` | Content placeholder loading states |
| `Toast` | Notification messages |
| `Tabs` | Tabbed interfaces |
| `Dropdown` | Menu dropdowns |

---

## 3. Cross-Cutting Patterns

### 3.1 Monorepo Workspace Pattern

**Category:** Structural

Internal packages are referenced by workspace name, not relative paths:

```json
// apps/web/package.json
{
  "dependencies": {
    "@tbcn/shared": "workspace:*",
    "@tbcn/ui": "workspace:*"
  }
}
```

---

### 3.2 Barrel Export Convention

**Category:** Structural

Every directory that contains more than one export uses an `index.ts` barrel file:

```
// Backend
modules/auth/dto/index.ts          → exports all DTOs
modules/auth/strategies/index.ts   → exports all strategies
common/guards/index.ts             → exports all guards
common/decorators/index.ts         → exports all decorators

// Frontend
components/auth/index.ts           → exports all auth components
lib/api/index.ts                   → exports all API modules
lib/store/index.ts                 → exports all stores
types/index.ts                     → exports all types
```

---

### 3.3 Environment Configuration Pattern

**Category:** Structural

| Layer | File | Scope |
|-------|------|-------|
| Root | `turbo.json` → `globalDependencies: ["**/.env.*local"]` | Turbo cache invalidation |
| API | `.env.local` / `.env` | NestJS `ConfigModule.forRoot()` with Joi validation |
| Web | `.env.local` | Next.js `NEXT_PUBLIC_*` client-safe variables |

**API configuration cascade:**

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.local', '.env'],  // .env.local takes priority
  validationSchema: configValidationSchema,  // Joi schema
})
```

**Environment variables (Sprint 1):**

| Variable | App | Purpose |
|----------|-----|---------|
| `JWT_SECRET` | API | Token signing key |
| `GOOGLE_CLIENT_ID/SECRET` | API | Google OAuth |
| `FACEBOOK_APP_ID/SECRET` | API | Facebook OAuth |
| `LINKEDIN_CLIENT_ID/SECRET` | API | LinkedIn OAuth |
| `FRONTEND_URL` | API | OAuth callback redirect target |
| `NEXT_PUBLIC_API_URL` | Web | API base URL for client requests |
| `DATABASE_HOST/PORT/NAME` | API | PostgreSQL connection |
| `REDIS_HOST/PORT` | API | Cache & job queue |
| `SMTP_HOST` | API | SMTP server hostname (empty = console fallback) |
| `SMTP_PORT` | API | SMTP server port (default: 587) |
| `SMTP_USER` | API | SMTP authentication username |
| `SMTP_PASS` | API | SMTP authentication password |
| `SMTP_SECURE` | API | Use TLS (true for port 465) |
| `SMTP_FROM_EMAIL` | API | Sender email address |
| `SMTP_FROM_NAME` | API | Sender display name |
