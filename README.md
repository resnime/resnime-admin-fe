# Resnime Admin Importer Frontend

```bash
cd resnime-admin-fe
npm install
npm run dev
```

Frontend berjalan di URL Vite lokal, biasanya:

```text
http://localhost:5173
```

Backend harus hidup sebelum melakukan scraping:

```bash
cd ../resnime-admin-be
npm install
npm run dev
```

Flow MVP 2:

```text
Scrape anime -> review/edit form -> generate episodes/link manual -> Submit to Turso
```

Submit memakai `VITE_API_BASE_URL` dan selalu mengirim data form ke Node.js
backend (`POST /api/anime/upsert`). Frontend tidak menyimpan credential Turso,
tidak menginstal package Turso, dan tidak membuat database ID.
