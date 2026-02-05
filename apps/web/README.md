# Brand Coach Network - Web Application

Next.js 14 web application for The Brand Coach Network platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Components**: Custom + Heroicons
- **Theming**: next-themes (dark/light mode)
- **Notifications**: react-hot-toast

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `apps/api/README.md`)

## Getting Started

### 1. Install Dependencies

From the root of the monorepo:
```bash
npm install
```

### 2. Environment Setup

Create `.env.local` file in `apps/web`:
```bash
cd apps/web
touch .env.local
```

Add the following:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The web app will be available at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Lint code with ESLint |
| `npm run type-check` | TypeScript type checking |

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth layout group
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── forgot-password/ # Password reset
│   │   └── layout.tsx       # Auth layout
│   ├── (dashboard)/         # Dashboard layout group
│   │   ├── dashboard/       # User dashboard
│   │   │   ├── page.tsx    # Dashboard home
│   │   │   └── profile/    # Profile pages
│   │   └── layout.tsx       # Dashboard layout
│   ├── (admin)/             # Admin layout group
│   │   └── admin/           # Admin pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── loading.tsx         # Loading state
│   ├── error.tsx           # Error boundary
│   └── not-found.tsx       # 404 page
├── components/              # React components
│   ├── auth/               # Auth-related components
│   │   └── protected-route.tsx
│   ├── providers/          # Context providers
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── toast-provider.tsx
│   └── [feature]/          # Feature-specific components
├── hooks/                   # Custom React hooks
│   └── use-auth.ts         # Authentication hook
├── lib/                     # Library code
│   ├── api/                # API client & services
│   │   ├── client.ts       # Axios instance
│   │   ├── auth.ts         # Auth API calls
│   │   ├── users.ts        # Users API calls
│   │   └── index.ts
│   ├── store/              # Zustand stores
│   │   ├── auth-store.ts   # Auth state
│   │   ├── ui-store.ts     # UI state
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── index.ts
├── styles/                  # Additional styles
└── types/                   # TypeScript types
    ├── api.ts              # API response types
    ├── auth.ts             # Auth types
    ├── user.ts             # User types
    ├── program.ts          # Program types
    ├── enrollment.ts       # Enrollment types
    └── index.ts
```

## Features

### Implemented (Sprint 1)
- ✅ User authentication (login/register)
- ✅ Protected routes with role-based access
- ✅ Dashboard layout
- ✅ User profile pages
- ✅ Admin section scaffolding
- ✅ Dark/light theme toggle
- ✅ Toast notifications
- ✅ Form validation
- ✅ API integration layer
- ✅ State management (Zustand + React Query)

### Coming Soon (Future Sprints)
- 🔄 Program catalog & enrollment
- 🔄 Payment integration
- 🔄 Coaching session scheduling
- 🔄 Community features
- 🔄 Assessment tools
- 🔄 Progress tracking & analytics
- 🔄 Messaging system
- 🔄 Content library

## Application Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset request

### Protected Routes (User)
- `/dashboard` - User dashboard
- `/dashboard/profile` - View profile
- `/dashboard/profile/edit` - Edit profile

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/users` - User management

## Authentication Flow

1. **Login/Register** → Get JWT tokens (access + refresh)
2. **Store tokens** → Zustand auth store + localStorage
3. **API calls** → Axios interceptor adds `Authorization` header
4. **Token refresh** → Auto-refresh on 401 responses
5. **Logout** → Clear tokens and redirect

## State Management

### Zustand Stores
- **auth-store**: User state, tokens, login/logout
- **ui-store**: UI state (modals, sidebar, theme)

### React Query
- Server state caching
- Automatic refetching
- Optimistic updates
- Background sync

## API Integration

### Axios Client
Located in `src/lib/api/client.ts`:
- Base URL configuration
- Request/response interceptors
- Token injection
- Auto token refresh
- Error handling

### API Services
Each feature has its own API service file:
```typescript
// src/lib/api/auth.ts
export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (data) => axios.post('/auth/register', data),
  // ...
}
```

## Styling

### Tailwind CSS
Utility-first CSS framework with custom configuration:
- Custom colors
- Extended spacing
- Typography plugin
- Forms plugin
- Responsive design

### Theme Support
Uses `next-themes` for dark/light mode:
```tsx
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
```

## Forms

Forms use **React Hook Form** + **Zod** for validation:
```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
})
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

⚠️ **Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Development Tips

### Hot Reload
Next.js automatically reloads on file changes. If it doesn't:
```bash
# Restart dev server
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Debug API Calls
Open browser DevTools → Network tab to inspect API requests/responses.

### Clear Cache
```bash
rm -rf .next
npm run dev
```

## Production Build

### Build
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run build
npm start
```

### Environment
Set `NODE_ENV=production` and update API URL for production backend.

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

### Docker
```bash
docker build -t tbcn-web .
docker run -p 3000:3000 tbcn-web
```

### Other Platforms
- **Netlify**: Supports Next.js
- **AWS Amplify**: Full Next.js support
- **Self-hosted**: Use `npm start` after build

## Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on `http://localhost:4000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings in backend

### Module Not Found
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clean build
rm -rf .next
npm run build
```

### Type Errors
```bash
# Check types
npm run type-check
```

## Performance Optimization

- **Image Optimization**: Use Next.js `<Image>` component
- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: Dynamic imports for heavy components
- **React Query**: Deduplicates API requests
- **Caching**: React Query + browser cache

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Ensure type safety: `npm run type-check`
4. Follow linting rules: `npm run lint`
5. Test in both light/dark themes
6. Submit pull request

## License

Proprietary - The Brand Coach Network © 2026
