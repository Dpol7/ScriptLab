// api/download.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || '')
  if (!id) return res.status(400).send('Missing id')

  const url = process.env.BLOB_READ_URL! + `scriptlab/scripts/${id}.txt`
  const r = await fetch(url)
  if (!r.ok) return res.status(404).send('Not found')

  const buf = Buffer.from(await r.arrayBuffer())
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${id}.txt"`)
  res.status(200).send(buf)
}
