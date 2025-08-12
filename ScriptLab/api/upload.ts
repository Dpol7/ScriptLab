// api/upload.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { sanitizeText } from './_sanitize'
import { customAlphabet } from 'nanoid'

type Index = { items: { id: string; title: string; genres: string[]; size: number; createdAt: number }[] }
const INDEX_KEY = 'scriptlab/index.json'
const nano = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12)

async function loadIndex(): Promise<Index> {
  try {
    const r = await fetch(process.env.BLOB_READ_URL! + INDEX_KEY, { cache: 'no-store' })
    if (r.ok) return await r.json() as Index
  } catch {}
  return { items: [] }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const token = (req.headers['x-admin-token'] as string) || String(req.query.token || '')
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).send('Unauthorized')

  const buf = Buffer.from(await req.arrayBuffer())
  const ct = req.headers['content-type'] || ''
  if (!ct.includes('multipart/form-data')) return res.status(400).send('Use multipart/form-data')

  const boundary = /boundary=([^;]+)/.exec(ct as string)?.[1]
  if (!boundary) return res.status(400).send('Bad form-data')

  // Parse as FormData using Web API (Node 18+)
  const reqAsRequest = new Request('http://local', { method: 'POST', headers: { 'content-type': ct as string }, body: buf })
  // @ts-ignore
  const form = await reqAsRequest.formData()

  const title = String(form.get('title') || 'Untitled').trim()
  const genres = String(form.get('genres') || '').split(',').map(s=>s.trim()).filter(Boolean)
  const file = form.get('file') as File | null
  const text = String(form.get('text') || '')

  if (!file && !text) {
      return res.status(400).send('Provide file or text')
  }
      return res.status(400).send('Provide file or text')

  let raw = text
  if (file) {
    const name = (file.name || '').toLowerCase()
    const ab = await file.arrayBuffer()
    if (name.endsWith('.txt')) {
      raw = Buffer.from(ab).toString('utf8')
    } else if (name.endsWith('.fdx') || name.endsWith('.xml')) {
      const xml = Buffer.from(ab).toString('utf8')
      raw = xml.replace(/<Text>/g, '\n<Text>').replace(/<[^>]+>/g, '').trim()
    } else {
      return res.status(400).send('Only .txt or .fdx here (pre-convert PDFs to TXT)')
    }
  }

  const sanitized = sanitizeText(raw)
  const id = nano()
  const key = `scriptlab/scripts/${id}.txt`

  const putRes = await put(key, new Blob([sanitized], { type: 'text/plain' }), { access: 'public' })

  // Update index
  const index = await loadIndex()
  index.items.unshift({ id, title, genres: genres.length ? genres : ['Uncategorized'], size: sanitized.length, createdAt: Date.now() })
  await put(INDEX_KEY, new Blob([JSON.stringify(index)], { type: 'application/json' }), { access: 'public' })

  return res.status(200).json({ ok: true, id, title, downloadUrl: putRes.url })
}
