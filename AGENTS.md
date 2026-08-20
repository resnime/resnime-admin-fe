# Resnime Admin Importer Frontend

- Project ini adalah Resnime Admin Importer frontend.
- Stack: React 19, Vite, JavaScript, Ant Design 6.
- Jangan menggunakan TypeScript.
- Jangan menggunakan UI library selain Ant Design.
- Jangan menambahkan routing, authentication, atau Cloudflare Worker.
- Frontend tidak boleh mengakses Turso langsung.
- Frontend tidak boleh memiliki Turso credentials.
- Ant Design Form adalah single source of truth.
- Submit selalu melalui Node.js backend.
- Jangan generate database IDs di frontend.
- Submit ulang MAL ID mengganti nested data lama melalui backend.
- Preview harus selalu membaca data terbaru dari form.
- Seluruh data harus editable.
- Episode hanya dibuat dari frontend setelah tindakan admin.
- Streaming link tidak discrape dan diisi manual.
- Jangan menambahkan image validator.
- Jangan mengubah kontrak API tanpa persetujuan.
