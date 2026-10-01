# My App

Monorepo aplikasi full-stack berbasis Bun untuk mengelola data user. Backend menyediakan REST API
dengan Hono dan PostgreSQL, sedangkan frontend menggunakan React, Vite, dan TanStack untuk
menampilkan, mencari, mengurutkan, membuat, memperbarui, serta menghapus user.

## Fitur utama

- CRUD user melalui REST API dan antarmuka web.
- Pagination, pencarian berdasarkan nama atau email, serta pengurutan daftar user.
- Validasi request dengan Zod dan kontrak input bersama antara API dan web.
- Normalisasi nama dan email sebelum data disimpan.
- Health check proses API dan readiness check koneksi database.
- Request ID, secure headers, CORS, structured logging, dan format error yang konsisten.
- Unit test, integration test PostgreSQL, laporan coverage, typecheck, dan lint/format check.
- Container production terpisah untuk API dan web serta publikasi image ke GHCR melalui CI.

## Tech stack

- Bun 1.4 dan Bun workspaces
- TypeScript
- Hono, Zod, Drizzle ORM, dan PostgreSQL 17
- React 19, Vite 8, dan Tailwind CSS 4
- TanStack Router, Query, dan Form
- Bun Test, Testing Library, dan Happy DOM
- Biome dan Oxlint
- Docker, Nginx, GitHub Actions, GHCR, dan Dependabot

## Struktur proyek

```text
.
├── .github/
│   ├── workflows/ci.yml       # Quality check, integration test, dan publish image
│   └── dependabot.yml         # Update dependency Bun dan GitHub Actions
├── apps/
│   ├── api/                   # Hono API, Drizzle schema/migration, dan test API
│   └── web/                   # React SPA, route, fitur user, dan test UI
├── packages/
│   └── contracts/             # Zod schema dan tipe input yang dipakai bersama
├── compose.yaml               # PostgreSQL development pada port 55432
├── compose.test.yaml          # PostgreSQL integration test pada port 55433
├── biome.json                 # Konfigurasi lint dan format repository
├── bun.lock                   # Lockfile seluruh workspace
├── package.json               # Script dan konfigurasi root workspace
└── tsconfig.base.json         # Konfigurasi TypeScript bersama
```

## Prasyarat

- [Bun](https://bun.sh/) 1.4 atau lebih baru
- Docker dengan Docker Compose

## Menjalankan proyek

1. Instal seluruh dependency dari root monorepo:

   ```bash
   bun install
   ```

2. Salin konfigurasi environment:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Di PowerShell:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.example apps/web/.env
   ```

3. Jalankan PostgreSQL development:

   ```bash
   docker compose up -d postgres
   ```

   Database tersedia di `localhost:55432`. Port ini dipilih agar tidak bertabrakan dengan
   PostgreSQL lokal yang biasanya menggunakan port `5432`.

4. Terapkan migration database:

   ```bash
   bun run --cwd apps/api db:migrate
   ```

5. Jalankan API dan web secara bersamaan:

   ```bash
   bun run dev
   ```

Setelah aktif:

- Web: <http://localhost:5173>
- Halaman user: <http://localhost:5173/users>
- API: <http://localhost:3000>
- Health check: <http://localhost:3000/api/v1/health>
- Database readiness: <http://localhost:3000/api/v1/ready>

## API

Semua endpoint aplikasi berada di bawah prefix `/api/v1`.

| Method | Path | Status berhasil | Keterangan |
| --- | --- | --- | --- |
| `GET` | `/health` | `200` | Memeriksa apakah proses API aktif |
| `GET` | `/ready` | `200` | Memeriksa koneksi database; menghasilkan `503` jika belum siap |
| `GET` | `/users` | `200` | Mengambil daftar user dengan pagination, pencarian, dan sorting |
| `GET` | `/users/:id` | `200` | Mengambil detail user berdasarkan UUID |
| `POST` | `/users` | `201` | Membuat user baru |
| `PATCH` | `/users/:id` | `200` | Memperbarui sebagian atau seluruh data user |
| `DELETE` | `/users/:id` | `204` | Menghapus user |

### Query daftar user

`GET /api/v1/users` menerima parameter berikut:

| Parameter | Default | Batas/nilai | Keterangan |
| --- | --- | --- | --- |
| `page` | `1` | Integer minimal `1` | Nomor halaman |
| `pageSize` | `20` | Integer `1`–`100` | Jumlah data per halaman |
| `search` | — | Maksimal 100 karakter | Mencari nama atau email |
| `sortBy` | `createdAt` | `name`, `email`, `createdAt` | Kolom pengurutan |
| `sortOrder` | `desc` | `asc`, `desc` | Arah pengurutan |

Contoh:

```bash
curl "http://localhost:3000/api/v1/users?page=1&pageSize=10&search=john&sortBy=name&sortOrder=asc"
```

Respons daftar user:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Membuat user

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

Respons berhasil:

```json
{
  "data": {
    "id": "f6ea515e-3870-4611-a49f-9dcdd61fdc0c",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-10-01T00:00:00.000Z",
    "updatedAt": "2026-10-01T00:00:00.000Z"
  }
}
```

Nama dibersihkan dari spasi di awal dan akhir. Email juga dibersihkan, diubah menjadi huruf kecil,
dan harus unik.

### Format error

Input yang tidak valid menghasilkan status `400`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "fields": {
      "email": "Email is invalid"
    },
    "requestId": "request-id"
  }
}
```

Error domain lain menggunakan bentuk yang sama. User yang tidak ditemukan menghasilkan
`USER_NOT_FOUND` dengan status `404`, sedangkan email yang sudah terdaftar menghasilkan
`EMAIL_ALREADY_EXISTS` dengan status `409`.

## Perintah utama

Jalankan perintah berikut dari root monorepo:

| Perintah | Kegunaan |
| --- | --- |
| `bun run dev` | Menjalankan seluruh workspace development secara paralel |
| `bun run typecheck` | Memeriksa tipe pada seluruh workspace yang memiliki script typecheck |
| `bun run test` | Menjalankan unit test API dan web |
| `bun run test:integration` | Menjalankan integration test API menggunakan `.env.test` |
| `bun run coverage` | Menjalankan unit test API dan web dengan laporan coverage |
| `bun run build` | Menjalankan build seluruh workspace yang memiliki script build |
| `bun run build:web` | Membuat production build frontend |
| `bun run biome:check` | Memeriksa lint, format, dan import repository |
| `bun run biome:fix` | Menerapkan perbaikan Biome yang tersedia |
| `bun run check` | Menjalankan Biome, typecheck, coverage, dan build web |
| `bun run check:all` | Menjalankan `check` lalu integration test API |

Perintah khusus workspace:

| Perintah | Kegunaan |
| --- | --- |
| `bun run --cwd apps/api dev` | Menjalankan API dengan hot reload |
| `bun run --cwd apps/api test:unit` | Menjalankan unit test API |
| `bun run --cwd apps/api test:coverage` | Menjalankan unit test API dengan coverage |
| `bun run --cwd apps/web dev` | Menjalankan frontend Vite |
| `bun run --cwd apps/web test` | Menjalankan unit/component test web |
| `bun run --cwd apps/web test:watch` | Menjalankan test web dalam watch mode |
| `bun run --cwd apps/web lint` | Menjalankan Oxlint untuk frontend |

## Database dan migration

Perintah Drizzle dijalankan pada workspace API:

| Perintah | Kegunaan |
| --- | --- |
| `bun run --cwd apps/api db:generate` | Membuat migration dari perubahan schema Drizzle |
| `bun run --cwd apps/api db:migrate` | Menerapkan migration ke database development |
| `bun run --cwd apps/api db:migrate:test` | Menerapkan migration menggunakan `.env.test` |
| `bun run --cwd apps/api db:studio` | Membuka Drizzle Studio |

## Testing

### Unit dan component test

Unit test menggunakan mock untuk dependency eksternal sehingga tidak membutuhkan database aktif:

```bash
bun run test
```

Untuk menjalankan test sekaligus menghasilkan laporan coverage di folder `coverage` masing-masing
workspace:

```bash
bun run coverage
```

### Integration test API

Integration test menggunakan PostgreSQL terpisah pada port `55433`. Datanya disimpan di `tmpfs`
dan tidak dipertahankan setelah container dihentikan.

Buat file lokal `apps/api/.env.test`:

```dotenv
NODE_ENV=test
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://app:app@localhost:55433/app_test
```

Kemudian jalankan:

```bash
docker compose -f compose.test.yaml up -d postgres-test
bun run --cwd apps/api db:migrate:test
bun run test:integration
docker compose -f compose.test.yaml down
```

Pastikan database test aktif dan migration sudah diterapkan sebelum menjalankan `bun run check:all`.

## Environment

Konfigurasi API berada di `apps/api/.env`:

| Variabel | Contoh/default | Keterangan |
| --- | --- | --- |
| `NODE_ENV` | `development` | Mode aplikasi: `development`, `test`, atau `production` |
| `PORT` | `3000` | Port HTTP API |
| `CORS_ORIGIN` | `http://localhost:5173` | Daftar origin yang diizinkan, dipisahkan dengan koma |
| `DATABASE_URL` | `postgresql://app:app@localhost:55432/app` | Connection string PostgreSQL |

Konfigurasi web berada di `apps/web/.env`:

| Variabel | Contoh | Keterangan |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL API yang dipanggil browser |

File `.env` dan `.env.test` lokal tidak boleh di-commit. Gunakan file `.env.example` sebagai template
untuk development dan konfigurasi pada bagian testing untuk integration test.

## Docker dan CI

Build image production dari root repository:

```bash
docker build -f apps/api/Dockerfile --target runtime -t my-app-api .
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_URL=http://localhost:3000 \
  -t my-app-web .
```

Image API menggunakan Bun sebagai runtime dan mengekspos port `3000`. Image web menyajikan hasil
build SPA melalui Nginx pada port `80`.

Workflow GitHub Actions menjalankan Biome, typecheck, coverage, build web, migration, dan integration
test. Push yang berhasil ke branch `main` juga memublikasikan image `latest` dan `sha-*` berikut ke
GitHub Container Registry:

- `ghcr.io/<owner>/<repository>-api`
- `ghcr.io/<owner>/<repository>-web`

Dependabot memeriksa dependency Bun dan GitHub Actions setiap minggu.

## Menghentikan database

Hentikan database development dengan:

```bash
docker compose down
```

Perintah tersebut mempertahankan data pada named volume `postgres_data`. Jangan tambahkan opsi
`--volumes` kecuali data development memang ingin dihapus.
