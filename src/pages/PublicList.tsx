import { useEffect, useState } from 'react'

type Item = { id: string; title: string; genres: string[]; createdAt: number }

export default function PublicList() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/list').then(r=>r.json()).then(d=>{
      setItems(d.items||[])
    }).finally(()=>setLoading(false))
  }, [])

  return (
    <div className="card">
      <h2>Available Scripts</h2>
      {loading ? <p className="muted">Loading…</p> : null}
      <ul style={{listStyle:'none', padding:0}}>
        {items.map(it => (
          <li key={it.id} style={{padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.12)'}}>
            <div style={{fontWeight:600}}>{it.title}</div>
            <div className="muted">{it.genres.join(', ')} • {new Date(it.createdAt).toLocaleDateString()}</div>
            <div style={{marginTop:8}}>
              <a href={`/api/download?id=${it.id}`} download>Download TXT</a>
            </div>
          </li>
        ))}
        {items.length===0 && !loading ? <p className="muted">No scripts yet.</p> : null}
      </ul>
    </div>
  )
}
