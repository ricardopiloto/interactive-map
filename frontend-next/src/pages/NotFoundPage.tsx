import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 16 }}>
      <h1>Página não encontrada</h1>
      <p className="text-2">Esse endereço não existe neste protótipo.</p>
      <Link to="/" className="btn btn-primary">Voltar ao início</Link>
    </div>
  )
}
