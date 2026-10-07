import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi, type StatBlockField } from '../../api/admin'
import { Input, Textarea } from '../ui'

function useStatFields() {
  const [fields, setFields] = useState<StatBlockField[]>([])

  useEffect(() => {
    let cancel = false
    adminApi
      .statBlockSchema()
      .then((schema) => {
        if (!cancel) setFields(schema.fields)
      })
      .catch(() => {
        if (!cancel) setFields([])
      })
    return () => {
      cancel = true
    }
  }, [])

  return fields
}

function splitFields(fields: StatBlockField[]) {
  return {
    atributos: fields.filter((field) => field.tipo === 'int'),
    outros: fields.filter((field) => field.tipo !== 'int'),
  }
}

function displayValue(field: StatBlockField, value: unknown): string {
  if (field.tipo === 'list[str]') {
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string').join(', ') : ''
  }
  if (value == null || value === '') return ''
  return String(value)
}

export function StatBlockFields({
  value,
  onChange,
}: {
  value: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}) {
  const { t } = useTranslation('admin')
  const fields = useStatFields()
  if (fields.length === 0) return null
  const { atributos, outros } = splitFields(fields)

  function setStat(nome: string, nextValue: unknown) {
    const next = { ...value }
    if (nextValue === '' || nextValue == null || (Array.isArray(nextValue) && nextValue.length === 0)) {
      delete next[nome]
    } else {
      next[nome] = nextValue
    }
    onChange(next)
  }

  return (
    <>
      <h6 className="form-drawer__section-title">{t('statBlock.title')}</h6>
      {atributos.length > 0 ? (
        <table className="stat-block__table">
          <thead>
            <tr>
              {atributos.map((field) => (
                <th key={field.nome} scope="col">
                  {field.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {atributos.map((field) => {
                const current = value[field.nome]
                return (
                  <td key={field.nome}>
                    <Input
                      aria-label={field.rotulo}
                      type="number"
                      value={typeof current === 'number' ? String(current) : ''}
                      onChange={(e) =>
                        setStat(field.nome, e.target.value === '' ? '' : Number(e.target.value))
                      }
                    />
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      ) : null}
      {outros.map((field) => {
        if (field.tipo === 'list[str]') {
          const lines = Array.isArray(value[field.nome])
            ? (value[field.nome] as string[]).join('\n')
            : ''
          return (
            <div className="field" key={field.nome}>
              <label htmlFor={`stat-${field.nome}`}>{field.rotulo}</label>
              <Textarea
                id={`stat-${field.nome}`}
                value={lines}
                placeholder={t('statBlock.listHint')}
                onChange={(e) =>
                  setStat(
                    field.nome,
                    e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
          )
        }
        return (
          <div className="field" key={field.nome}>
            <label htmlFor={`stat-${field.nome}`}>{field.rotulo}</label>
            <Input
              id={`stat-${field.nome}`}
              value={typeof value[field.nome] === 'string' ? String(value[field.nome]) : ''}
              onChange={(e) => setStat(field.nome, e.target.value)}
            />
          </div>
        )
      })}
    </>
  )
}

/** Read-only sheet for the GM. Empty characteristics stay visible. */
export function StatBlockSummary({ value }: { value?: Record<string, unknown> }) {
  const { t } = useTranslation('admin')
  const fields = useStatFields()
  const block = value ?? {}
  if (fields.length === 0) return null
  const { atributos, outros } = splitFields(fields)

  return (
    <section className="stat-block" aria-label={t('statBlock.title')}>
      <h3 className="stat-block__title">{t('statBlock.title')}</h3>
      {atributos.length > 0 ? (
        <table className="stat-block__table">
          <thead>
            <tr>
              {atributos.map((field) => (
                <th key={field.nome} scope="col">
                  {field.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {atributos.map((field) => (
                <td key={field.nome}>{displayValue(field, block[field.nome]) || '—'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : null}
      {outros.length > 0 ? (
        <dl className="stat-block__grid">
          {outros.map((field) => {
            const shown = displayValue(field, block[field.nome])
            return (
              <div className="stat-block__item stat-block__item--wide" key={field.nome}>
                <dt>{field.rotulo}</dt>
                <dd>{shown || '—'}</dd>
              </div>
            )
          })}
        </dl>
      ) : null}
    </section>
  )
}
