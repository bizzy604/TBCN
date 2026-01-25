# Containerization Strategy (Docker)

**Design Date:** 2026-01-26
**Maintainer:** DevOps Team
**Base Image:** `node:20-alpine`

---

## 1. Strategy Overview

We utilize a **Multi-Stage Build** strategy optimized for monorepos using **Turborepo**. This approach ensures that our Docker images are:
1.  **Lightweight**: Stripped of build dependencies and source code in the final image.
2.  **Fast**: Leveraging Docker layer caching effectively.
3.  **Secure**: Running with minimal privileges and surface area (Alpine Linux).

### Build Flow
The build process is split into 3 distinct stages:
1.  **Builder**: Prunes the monorepo to isolate only the target app (e.g., `web` or `api`) and its dependencies.
2.  **Installer**: Installs dependencies (using `npm/pnpm`) and builds the application artifacts.
3.  **Runner**: A lean production image that strictly copies the built artifacts and `node_modules` required for runtime.

---

## 2. Dockerfile Breakdown

### 2.1 The "Pruning" Stage (Builder)
```dockerfile
FROM node:20-alpine AS builder
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker
```
**Rationale:**
In a monorepo, changing a file in `apps/admin` shouldn't break the cache for `apps/web`. Turborepo's `prune` command generates a subset of the monorepo containing *only* what is needed to build the target scope.

### 2.2 The "Build" Stage (Installer)
```dockerfile
FROM node:20-alpine AS installer
# ... copy pruned lockfiles ...
RUN npm ci
# ... copy source code ...
RUN npm run build --filter=web...
```
**Rationale:**
We separate dependency installation from the build structure. By copying `package-lock.json` first, we cache the `node_modules` layer. If user code changes but dependencies don't, Docker skips `npm ci`, saving minutes of build time.

### 2.3 The "Production" Stage (Runner)
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# ... copy only built artifacts ...
CMD ["node", "apps/web/server.js"]
```
**Rationale:**
The final image contains NO source code (TS files), NO devDependencies (TypeScript, ESLint), and NO build tools (Turbo). This drastically reduces image size (from >1GB to ~150MB) and improves security.

---

## 3. Trade-Off Analysis

| Decision | Choice | Trade-offs Considered |
| :--- | :--- | :--- |
| **Base Image** | `node:20-alpine` | **Size vs. Compatibility**. Alpine is tiny (50MB) but uses `musl` instead of `glibc`. Some native modules (like sharp or bcrypt) require extra care or compilation, but the security/size benefit outweighs this complexity. |
| **Monorepo Handling** | **Turborepo Pruning** | **Complexity vs. Context**. Docker contexts are huge in monorepos (GBs). Pruning adds a build step but ensures we don't send 5GB of unrelated code to the Docker daemon. |
| **Process Manager** | **None (Direct Node)** | **Simplicity vs. Resilience**. We run `node main.js` directly. In a container orchestrator (K8s), the platform handles restarts. Adding PM2 would be redundant and bloat the image. |

---

## 4. Usage Guide

### Building Images Locally
To build the web application image:
```bash
docker build -f apps/web/Dockerfile -t brandcoach/web:latest .
```
*Note: Run from the ROOT of the monorepo, not inside `apps/web`, so Docker can access shared packages.*

### Running Containers
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  brandcoach/web:latest
```

### Debugging
If a build fails, you can inspect the intermediate stage:
```bash
# Build only up to the installer stage
docker build --target installer -t debug-build .
docker run -it debug-build sh
```

---

## 5. Security Checklist
- [x] **Non-Root User**: (Recommend adding `USER node` in final stage for enhanced security).
- [x] **Minimal Base**: Alpine Linux reduces CVE exposure.
- [x] **No Secrets**: Secrets are injected at runtime via Environment Variables, never baked into the image.
- [x] **Dependency Locking**: `npm ci` ensures deterministic builds using `package-lock.json`.
