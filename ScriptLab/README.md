# ScriptLab (Public downloads + admin-only uploads)

This project lets you (the admin) upload **sanitized** scripts (TXT/FDX) and serves a public list with **download links** to the cleaned text. No source URLs are stored.

## Quick start
```bash
npm install
npm run dev
```

Open http://localhost:5173 and use the tabs:
- **Scripts**: public listing and download links
- **Admin Upload**: paste text or upload .txt/.fdx (requires ADMIN_TOKEN when deployed)

## Deploy on Vercel
1. Push this project to GitHub.
2. Import into Vercel as a Vite app.
3. Set environment variable `ADMIN_TOKEN` to a secure value.
4. First upload will create Blob storage keys. Ensure `BLOB_READ_URL` is available in your project (Vercel Blob).

## Admin Upload endpoint
- `POST /api/upload` with multipart/form-data fields:
  - `token` (header `x-admin-token` or query `?token=...`)
  - `title`, `genres` (comma-separated), `text` (optional if uploading a file)
  - `file` (.txt or .fdx)

## Public endpoints
- `GET /api/list` → `{ items: [{ id, title, genres, createdAt }] }`
- `GET /api/download?id=ID` → forces a `.txt` download

## Sanitization
We remove common watermarks and repeated headers/footers and normalize whitespace.
See `api/_sanitize.ts` for details.
