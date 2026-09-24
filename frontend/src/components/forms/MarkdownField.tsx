import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MarkdownSafe } from '../common/MarkdownSafe'
import { Tabs, Textarea } from '../ui'
import './formShell.css'

interface MarkdownFieldProps {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  rows?: number
  controlClassName?: string
}

export function MarkdownField({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 5,
  controlClassName,
}: MarkdownFieldProps) {
  const { t } = useTranslation('comum')
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  return (
    <div className="field">
      <label>{label}</label>
      <Tabs
        items={[
          { id: 'write', label: t('form.mdWrite') },
          { id: 'preview', label: t('form.mdPreview') },
        ]}
        value={tab}
        onChange={(id) => setTab(id as 'write' | 'preview')}
      />
      {tab === 'write' ? (
        <Textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          className={controlClassName}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <div className="markdown-field__preview">
          {value.trim() ? (
            <MarkdownSafe>{value}</MarkdownSafe>
          ) : (
            <p className="markdown-field__preview-empty">{t('form.mdEmpty')}</p>
          )}
        </div>
      )}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}
