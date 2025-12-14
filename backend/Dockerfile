# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including devDependencies) to run tsc
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install OpenSSL (required for Prisma on Alpine)
RUN apk -U add openssl

COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy the prisma schema and generate the client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]