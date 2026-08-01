import type { ChangeEvent } from 'react'

interface ImageUploadFieldProps {
  category: 'map' | 'portraits' | 'locals'
  label: string
  value: string | null | undefined
  onUploaded: (url: string) => void
}

export function ImageUploadField({ category, label, value, onUploaded }: ImageUploadFieldProps) {
  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append('category', category)
    body.append('file', file)
    const res = await fetch('/api/admin/uploads', { method: 'POST', body })
    if (!res.ok) {
      const detail = await res.text()
      window.alert(detail || 'Falha no upload')
      return
    }
    const data = (await res.json()) as { url: string }
    onUploaded(data.url)
  }

  return (
    <div className="field">
      <label>{label}</label>
      {value && <img src={value} alt="" className="admin-thumb" />}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onChange} />
    </div>
  )
}
