import { useState } from 'react'

export default function AdminUpload() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setMsg('')
    const form = e.currentTarget
    const fd = new FormData(form)
    try {
      const r = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': (form.elements.namedItem('token') as HTMLInputElement).value
        },
        body: fd
      })
      const data = await r.json().catch(()=>({}))
      if (!r.ok) throw new Error(data?.error || 'Upload failed')
      setMsg('Uploaded ✓')
      form.reset()
    } catch (err:any) {
      setMsg(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h2>Admin Upload (sanitized)</h2>
      <p className="muted">Paste plain text or upload .txt/.fdx. PDFs should be converted to text first. The server sanitizes and stores without any source info.</p>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input name="token" placeholder="Admin token" required />
        <input name="title" placeholder="Title" required />
        <input name="genres" placeholder="Genres (comma-separated)" />
        <textarea name="text" rows={8} placeholder="Paste script TXT here (optional if uploading a file)"></textarea>
        <input type="file" name="file" accept=".txt,.fdx" />
        <button disabled={busy} type="submit">{busy ? 'Uploading…' : 'Upload & Sanitize'}</button>
      </form>
      {msg && <p className="muted" style={{marginTop:8}}>{msg}</p>}
    </div>
  )
}
