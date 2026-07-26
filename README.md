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

Mode Manual Input:

```text
Scrape anime -> review/edit form -> generate episodes/link manual -> Submit to Turso
```

Submit memakai `VITE_API_BASE_URL` dan selalu mengirim data form ke Node.js
backend (`POST /api/anime/upsert`). Frontend tidak menyimpan credential Turso,
tidak menginstal package Turso, dan tidak membuat database ID.

Mode Bulk Insert:

```text
Upload JSON -> review/edit per anime -> mark reviewed -> Update Bulk Data
-> Insert per row atau Insert Selected to Turso
```

Upload JSON dibaca di browser dan disimpan ke `localStorage` dengan key
`resnime_admin_bulk_items_v1`. Upload tidak otomatis mengirim data ke Turso.
Selection table tidak disimpan.

Root file JSON harus array. Contoh minimal:

```json
[
  {
    "id": "52991",
    "title_en": "Frieren: Beyond Journey's End",
    "title_romaji": "Sousou no Frieren",
    "photo": "https://example.com/poster.jpg",
    "rating": 9.1,
    "status": "Finished",
    "aired": "Sep 29, 2023 to Mar 22, 2024",
    "season": "Fall 2023",
    "type": "TV",
    "studio": "Madhouse",
    "description": "Description",
    "banner_bg_img": "https://example.com/banner.jpg",
    "genres": ["Adventure", "Drama", "Fantasy"],
    "episode_total": 28,
    "episodes": [],
    "characters": []
  }
]
```

Status review:

```text
is_reviewed false -> Not Reviewed
is_reviewed true  -> Reviewed
```

Status import:

```text
null       -> Not Imported
"imported" -> Imported
"failed"   -> Failed
```

`is_reviewed` hanya berubah saat admin mencentang checkbox di form bulk dan klik
`Update Bulk Data`. Item belum reviewed tidak bisa dipilih atau dikirim. Setelah
insert sukses, item menjadi `is_reviewed: false` dan `import_status: "imported"`.
Jika gagal, item tetap ada dengan `is_reviewed: true` dan
`import_status: "failed"`.

`Clear Data` hanya menghapus bulk state, localStorage, selection, dan active
review di browser. Data Turso tidak dihapus.
