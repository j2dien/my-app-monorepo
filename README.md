# My App

Monorepo aplikasi full-stack berbasis Bun. Backend menggunakan Hono dan
PostgreSQL, sedangkan frontend menggunakan React dan Vite.

## Tech stack

- Bun workspaces
- Hono + Zod
- PostgreSQL 17 + Drizzle ORM
- React 19 + Vite
- TanStack Router + TanStack Query
- Tailwind CSS

## Struktur proyek

```text
.
├── apps/
│   ├── api/          # REST API, schema, dan migration database
│   └── web/          # Aplikasi React
├── compose.yaml      # PostgreSQL untuk development
├── package.json      # Script dan konfigurasi workspace
└── tsconfig.base.json
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

   Di PowerShell, gunakan:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/web/.env.example apps/web/.env
   ```

3. Jalankan PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

   PostgreSQL tersedia di `localhost:55432`. Port tinggi ini digunakan agar
   tidak bertabrakan dengan instalasi PostgreSQL lokal pada port `5432`.

4. Terapkan migration database:

   ```bash
   cd apps/api
   bun run db:migrate
   cd ../..
   ```

5. Jalankan API dan web secara bersamaan:

   ```bash
   bun run dev
   ```

Setelah aktif:

- Web: <http://localhost:5173>
- API: <http://localhost:3000>
- Health check: <http://localhost:3000/api/v1/health>
- Database readiness: <http://localhost:3000/api/v1/ready>

## API endpoints

| Method | Path | Keterangan |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Memeriksa apakah proses API aktif |
| `GET` | `/api/v1/ready` | Memeriksa kesiapan API dan koneksi database |
| `GET` | `/api/v1/users` | Mengambil seluruh user |
| `GET` | `/api/v1/users/:id` | Mengambil user berdasarkan UUID |
| `POST` | `/api/v1/users` | Membuat user baru |

Contoh membuat user:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

Respons berhasil menggunakan properti `data`:

```json
{
  "data": {
    "id": "f6ea515e-3870-4611-a49f-9dcdd61fdc0c",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Input yang tidak valid menghasilkan status `400` dengan format berikut:

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

Email dibersihkan dari spasi dan diubah menjadi huruf kecil sebelum disimpan.
Email yang sudah terdaftar menghasilkan status `409` dengan kode
`EMAIL_ALREADY_EXISTS`.

## Perintah utama

Jalankan perintah berikut dari root monorepo:

| Perintah | Kegunaan |
| --- | --- |
| `bun run dev` | Menjalankan semua aplikasi dalam mode development |
| `bun run --filter @app/api typecheck` | Memeriksa tipe TypeScript API |
| `bun run --filter @app/api test` | Menjalankan test API |
| `bun run --filter web build` | Membuat production build web |
| `bun run --filter web lint` | Menjalankan linter web |

Perintah database dijalankan dari `apps/api`:

| Perintah | Kegunaan |
| --- | --- |
| `bun run db:generate` | Membuat migration dari perubahan schema Drizzle |
| `bun run db:migrate` | Menerapkan migration ke database |
| `bun run db:studio` | Membuka Drizzle Studio |

## Testing

Pastikan container PostgreSQL sudah aktif sebelum menjalankan test karena
readiness test mengakses database secara langsung:

```bash
docker compose up -d postgres
bun run --filter @app/api test
```

Untuk menjalankan test API saja:

```bash
cd apps/api
bun test
```

## Environment

Konfigurasi API berada di `apps/api/.env`:

| Variabel | Keterangan |
| --- | --- |
| `NODE_ENV` | Mode aplikasi: `development`, `test`, atau `production` |
| `PORT` | Port HTTP API |
| `CORS_ORIGIN` | Origin frontend yang diizinkan |
| `DATABASE_URL` | Connection string PostgreSQL |

Konfigurasi web berada di `apps/web/.env`:

| Variabel | Keterangan |
| --- | --- |
| `VITE_API_URL` | Base URL API yang dipanggil dari browser |

File `.env` mengandung konfigurasi lokal dan tidak boleh di-commit. Gunakan
file `.env.example` sebagai template.

## Menghentikan database

```bash
docker compose down
```

Perintah tersebut mempertahankan data pada named volume `postgres_data`.
Untuk mencegah kehilangan data, jangan tambahkan opsi `--volumes` kecuali data
development memang ingin dihapus.
