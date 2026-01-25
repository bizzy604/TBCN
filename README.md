# The Brand Coach Network

[![Status: Development](https://img.shields.io/badge/Status-Development-blue)](https://github.com/brand-coach-network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tech Stack: NestJS + Next.js](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS-black)](https://brandcoachnetwork.com)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()

The **Brand Coach Network (TBCN)** is a transformational digital ecosystem designed to bridge the gap between aspiring entrepreneurs and sustainable success. It serves as the technological backbone of the *#ABillionLivesGlobally* mission, providing a unified platform where individuals discover their brand, build visibility, and create measurable impact through structured coaching, community, and commerce.

## 📋 Table of Contents
- [About the Platform](#-about-the-platform)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Contact](#-contact)

## 🌍 About the Platform
TBCN positions itself at the intersection of professional skill development (LinkedIn Learning), inspirational storytelling (MasterClass), and structured pathways (Coursera), tailored specifically for the African entrepreneurial spirit. It solves the "Access Gap" and "Visibility Challenge" by connecting aspiring brands with world-class certified coaches and resources.

## 🚀 Key Features

### 🎓 Learning & Development
*   **Structured LMS**: Multi-module courses with video lessons, text resources, and progress tracking.
*   **Assessments**: Auto-graded quizzes and coach-reviewed capstone projects.
*   **Certifications**: Verifiable digital credentials issued upon program completion.

### 🤝 Coaching Marketplace
*   **Mentor Discovery**: Search and filter certified coaches by industry, expertise, and rating.
*   **Session Management**: Integrated booking, scheduling, and video conferencing (Zoom/Meet).
*   **Feedback Loops**: Post-session ratings and reviews to ensure quality.

### 💬 Community & Collaboration
*   **Topic Circles**: Specialized discussion forums for peer support (e.g., "Personal Branding", "SME Growth").
*   **Innovation Hub**: Platform for submitting, showcasing, and collaborating on business projects.
*   **Direct Messaging**: Secure 1-on-1 communication between members and coaches.

### 💳 Commerce & Events
*   **Flexible Memberships**: Tiered access models (Discover, Build, Thrive, Impact).
*   **Event Management**: Ticketing for virtual masterclasses and physical conferences with QR check-in.
*   **Merchandise Store**: Integrated e-commerce for digital and physical brand assets.

## 🛠 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | SEO, Performance, Server Components |
| **Backend** | NestJS (Node.js) | Modular Architecture, Type Safety, Scalability |
| **Language** | TypeScript | Strong typing across full stack |
| **Database** | PostgreSQL 15+ | ACID Compliance for financial transactions |
| **Caching** | Redis 7+ | High-speed jobs, sessions, and data caching |
| **Queue** | BullMQ | Asynchronous job processing (emails, transcoding) |
| **Styling** | Tailwind CSS | Utility-first, responsive design system |
| **DevOps** | Docker & Turborepo | Containerization & Monorepo management |

## 📦 Prerequisites

Ensure you have the following installed on your local machine:

*   **Node.js**: v18.17.0 or higher
*   **npm** or **pnpm**: Package manager
*   **Docker Desktop**: For running database and cache services
*   **Git**: Version control

## ⚡ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/brand-coach/brand-coach-network.git
    cd brand-coach-network
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Start infrastructure services:**
    This spins up PostgreSQL and Redis containers.
    ```bash
    npm run docker:up
    ```

4.  **Configure Environment:**
    Copy the example environment files.
    ```bash
    cp apps/web/.env.example apps/web/.env.local
    cp apps/api/.env.example apps/api/.env
    ```

5.  **Initialize Database:**
    Run migrations and seed the database with initial data.
    ```bash
    npm run db:migrate
    npm run db:seed
    ```

## 💻 Usage

To start the entire development stack (Frontend, Admin, Backend):

```bash
npm run dev
```

*   **Consumer Web App**: `http://localhost:3000`
*   **Admin Dashboard**: `http://localhost:3001`
*   **Backend API**: `http://localhost:4000`
*   **API Documentation (Swagger)**: `http://localhost:4000/api`

### Common Commands

*   `npm run build` - Build all apps and packages
*   `npm run lint` - Lint code across the monorepo
*   `npm run format` - Format code with Prettier

## ⚙️ Configuration

Key environment variables required for the application:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/brandcoach` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for auth tokens | `super-secret-key` |
| `STRIPE_SECRET_KEY` | Stripe payment API key | `sk_test_...` |
| `NEXT_PUBLIC_API_URL` | API base URL for frontend | `http://localhost:4000` |

Refer to `.env.example` in each `apps/` directory for a complete list.

## 📂 Project Structure

This project uses a **Modular Monolith** architecture within a Turborepo monorepo.

```
brand-coach-network/
├── apps/
│   ├── web/                # Next.js Consumer Web Application
│   │   └── src/app/        # App Router pages ((auth), (dashboard), (marketing))
│   ├── admin/              # Next.js Admin Portal
│   └── api/                # NestJS Backend Application
│       └── src/modules/    # Domain modules (auth, users, programs, payments...)
├── packages/
│   ├── shared/             # Shared Types, Constants, and Utilities
│   ├── ui/                 # Shared UI Component Library
│   └── config/             # Shared TSConfig, ESLint settings
├── infrastructure/         # Terraform, Docker, K8s configs
└── docs/                   # Architecture, API Specs, and Runbooks
```

## 📖 API Documentation

The API follows RESTful principles. Detailed documentation is available at `docs/api/api-spec.md` or via Swagger UI at `/api` when running locally.

### Example Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user and return JWT |
| `GET` | `/programs` | List available learning programs |
| `POST` | `/programs/{id}/enroll` | Enroll a user in a specific program |
| `GET` | `/users/me` | Get current user profile |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  **Fork** the repository.
2.  **Create a branch**: `git checkout -b feature/amazing-feature`.
3.  **Commit changes**: `git commit -m 'feat: add amazing feature'`.
4.  **Push to branch**: `git push origin feature/amazing-feature`.
5.  **Open a Pull Request**.

Please adhere to the project's coding standards (ESLint/Prettier) and ensure all tests pass.

## 🧪 Testing

Run unit and integration tests across the workspace:

```bash
# Run all tests
npm run test

# Run tests for specific app
npm run test --filter=api
```

## 🚀 Deployment

The project is designed to be containerized and deployed to cloud platforms (AWS, GCP, Vercel).

1.  **Build Docker Images**:
    ```bash
    docker build -t tbnc-api -f apps/api/Dockerfile .
    docker build -t tbnc-web -f apps/web/Dockerfile .
    ```
2.  **Infrastructure**: Provision resources using Terraform in `infrastructure/terraform`.
3.  **CI/CD**: Workflows are defined in `.github/workflows`.

## ❓ Troubleshooting

**Issue: Database connection failed**
*   Check if Docker container is running: `docker ps`
*   Verify `DATABASE_URL` in `.env` matches docker-compose credentials.

**Issue: Hot reload not working**
*   Ensure you are running the command from the root.
*   Try restarting the dev server.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 📞 Contact

For support or inquiries, please contact the development team:

*   **Lead Developer**: Amoni Kevin
*   **Project Lead**: Winston Eboyi
*   **Email**: dev@brandcoachnetwork.com
*   **Issues**: [GitHub Issues](https://github.com/brand-coach/brand-coach-network/issues)

---
*Built with ❤️ for the #ABillionLivesGlobally mission.*
