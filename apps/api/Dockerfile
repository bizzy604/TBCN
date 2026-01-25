# apps/api/Dockerfile

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# Stage 2: Installer
FROM node:20-alpine AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npm run build --filter=api...

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=installer /app .

CMD ["node", "apps/api/dist/main"]
