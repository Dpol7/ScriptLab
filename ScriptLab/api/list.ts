// api/list.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_: VercelRequest, res: VercelResponse) {
  try {
    const r = await fetch(process.env.BLOB_READ_URL! + 'scriptlab/index.json', { cache: 'no-store' })
    if (!r.ok) return res.status(200).json({ items: [] })
    const data = await r.json()
    return res.status(200).json(data)
  } catch {
    return res.status(200).json({ items: [] })
  }
}
