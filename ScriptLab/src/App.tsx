import { useEffect, useState } from 'react'
import PublicList from './pages/PublicList'
import AdminUpload from './pages/AdminUpload'

type Tab = 'public' | 'admin' | 'analyze'

export default function App() {
  const [tab, setTab] = useState<Tab>('public')
  useEffect(() => {
    const hash = (location.hash || '').replace('#','') as Tab
    if (hash) setTab(hash)
    window.addEventListener('hashchange', () => {
      const h = (location.hash || '').replace('#','') as Tab
      if (h) setTab(h)
    })
  }, [])

  return (
    <div className="container">
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <h1>ScriptLab</h1>
        <nav style={{display:'flex',gap:12}}>
          <a href="#public" onClick={()=>setTab('public')}>Scripts</a>
          <a href="#admin" onClick={()=>setTab('admin')}>Admin Upload</a>
        </nav>
      </header>
      {tab==='public' && <PublicList />}
      {tab==='admin' && <AdminUpload />}
    </div>
  )
}
