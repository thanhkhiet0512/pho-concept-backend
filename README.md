# Pho Concept — Backend

REST API cho hệ thống quản lý nhà hàng Pho Concept (Las Vegas, NV).

## Tech Stack

- **Runtime:** Node.js 22 LTS + NestJS 11
- **Language:** TypeScript 5 (strict mode)
- **Database:** PostgreSQL 16 + Prisma 6
- **Cache:** Redis 7
- **Auth:** JWT (access 15m) + Opaque refresh token (Redis, 7d)

---

## Yêu cầu cài đặt

- [Node.js 22 LTS](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

---

## Setup từ đầu

### 1. Clone repo

```bash
git clone <repo-url>
cd pho-concept-backend
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env`

```bash
cp .env.example .env
```

Mở `.env` và điền các giá trị cần thiết. Với local dev, các giá trị mặc định trong `.env.example` đã đủ để chạy (PostgreSQL, Redis, JWT secrets).

> Các biến `SENDGRID_API_KEY`, `TWILIO_*`, `STRIPE_*`, `S3_*` có thể để trống — app vẫn chạy được, chỉ tắt tính năng email/SMS/payment/storage.

### 4. Khởi động PostgreSQL và Redis bằng Docker

```bash
docker compose -f docker/docker-compose.local.yml up postgres redis -d
```

Kiểm tra đã up chưa:

```bash
docker compose -f docker/docker-compose.local.yml ps
```

PostgreSQL chạy ở `localhost:5433`, Redis ở `localhost:6380`.

> **Lưu ý:** Port PostgreSQL local là `5433` (không phải 5432 mặc định) để tránh conflict với PostgreSQL hệ thống nếu có. Đảm bảo `DATABASE_URL` trong `.env` dùng đúng port:
> ```
> DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pho_concept
> ```

### 5. Chạy migration và seed

```bash
# Apply migration (tạo toàn bộ tables)
npx prisma migrate deploy

# Seed data mẫu (admin users, location, menu, catering packages...)
npm run seed
```

Sau khi seed xong, có thể đăng nhập với:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Owner    | owner@phoconcept.com   | Demo@123456 |
| Manager  | manager@phoconcept.com | Demo@123456 |
| Staff    | staff@phoconcept.com   | Demo@123456 |
| Customer | demo@customer.com      | Demo@123456 |

### 6. Chạy server

```bash
npm run start:dev
```

Server chạy tại `http://localhost:3000`

Swagger UI: `http://localhost:3000/api/docs`

---

## Scripts thường dùng

```bash
npm run start:dev       # Chạy dev server với hot-reload
npm run type-check      # Kiểm tra TypeScript
npm run lint            # Kiểm tra lint
npm test                # Chạy toàn bộ unit tests

npx prisma studio       # Mở Prisma Studio (GUI xem DB)
npx prisma migrate dev  # Tạo migration mới sau khi sửa schema
npm run seed            # Seed lại data mẫu
```

---

## Reset database (khi cần bắt đầu lại)

```bash
npx prisma migrate reset --force
```

Lệnh này xóa toàn bộ DB, chạy lại migration và seed tự động.

---

## Cấu trúc thư mục

```
src/
  config/          # Env validation (Zod), jwt, redis configs
  common/          # Guards, decorators, filters, pipes, interceptors
  domain/          # Entities + repository ports (abstract classes)
  application/     # Use-cases + DTOs
  infrastructure/  # Prisma adapters, Redis, storage, queue
  presentation/    # NestJS controllers + modules
prisma/
  schema/          # Multi-file Prisma schema (1 file per domain)
  migrations/      # Migration files
  seed.ts          # Seed script
docker/
  Dockerfile                # Production image
  docker-compose.local.yml  # Local dev (PostgreSQL + Redis)
```

---

## Swagger API Docs

Sau khi chạy server, truy cập:

```
http://localhost:3000/api/docs
```

Có thể test toàn bộ API endpoints trực tiếp trên Swagger UI.
