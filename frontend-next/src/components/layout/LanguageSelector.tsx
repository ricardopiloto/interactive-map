import { useState } from 'react'
import { IconCheck } from '@tabler/icons-react'

const LANGS = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
]

/**
 * Mock — o protótipo não tem i18n de verdade (ver frontend-next/README.md),
 * isso só representa que o controle existe no cabeçalho, igual ao app real.
 */
export function LanguageSelector() {
  const [lang, setLang] = useState<string>(() => localStorage.getItem('codex-proto-lang') || 'pt-BR')
  const [open, setOpen] = useState(false)

  function choose(value: string) {
    setLang(value)
    localStorage.setItem('codex-proto-lang', value)
    setOpen(false)
  }

  return (
    <div className="dropdown" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="dropdown__trigger" onClick={() => setOpen((o) => !o)}>
        {lang === 'pt-BR' ? 'PT' : 'EN'}
      </button>
      {open && (
        <div className="dropdown__panel">
          {LANGS.map((l) => (
            <button key={l.value} type="button" className={`dropdown__item${lang === l.value ? ' is-active' : ''}`} onClick={() => choose(l.value)}>
              {l.label}
              {lang === l.value && <IconCheck size={14} aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
