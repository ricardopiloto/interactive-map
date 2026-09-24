import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconChevronDown, IconChevronRight, IconPencil, IconTrash } from '@tabler/icons-react'
import { ConfirmDialog, DropdownMenu, EmptyState, IconButton, Button} from '../ui'
import type { Arco, Local } from '../../types'
import './adminList.css'

interface LocalAdminListProps {
  locais: Local[]
  arcos: Arco[]
  adding: boolean
  onStartAdd: () => void
  onCancelAdd: () => void
  onEdit: (local: Local) => void
  onDelete: (id: number) => void
  onLocalHover?: (id: number | null) => void
}

type Section = { key: string; title: string; items: Local[] }

export function LocalAdminList({
  locais,
  arcos,
  adding,
  onStartAdd,
  onCancelAdd,
  onEdit,
  onDelete,
  onLocalHover,
}: LocalAdminListProps) {
  const { t } = useTranslation('mapa')
  const { t: tc } = useTranslation('comum')
  const { t: ta } = useTranslation('admin')
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const sections = useMemo(() => {
    const byArco = new Map<number | 'none', Local[]>()
    for (const loc of locais) {
      const key = loc.arco_id ?? 'none'
      const list = byArco.get(key) ?? []
      list.push(loc)
      byArco.set(key, list)
    }
    const ordered: Section[] = []
    const sortedArcos = [...arcos].sort((a, b) => a.ordem - b.ordem || a.id - b.id)
    for (const arco of sortedArcos) {
      const items = byArco.get(arco.id)
      if (items?.length) {
        ordered.push({ key: String(arco.id), title: arco.titulo, items })
        byArco.delete(arco.id)
      }
    }
    const none = byArco.get('none')
    if (none?.length) {
      ordered.push({ key: 'none', title: t('list.noArco'), items: none })
    }
    for (const [id, items] of byArco) {
      if (id === 'none' || !items.length) continue
      ordered.push({ key: String(id), title: t('list.noArco'), items })
    }
    return ordered
  }, [locais, arcos, t])

  function toggle(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function isExpanded(key: string) {
    return !collapsed[key]
  }

  return (
    <div className="list-section">
      {!adding ? (
        <Button variant="primary" block className="list-section__add" type="button" onClick={onStartAdd}>
          {ta('local.newBtn')}
        </Button>
      ) : (
        <div className="text-muted list-section__add" style={{ fontSize: 13 }}>
          {t('list.placeOnMap')}{' '}
          <Button variant="ghost" type="button" onClick={onCancelAdd}>
            {tc('buttons.cancel')}
          </Button>
        </div>
      )}
      <div className="list-section__stack">
        {sections.length === 0 ? (
          <EmptyState title={t('list.emptyLocais')} />
        ) : (
          sections.map((sec) => {
            const open = isExpanded(sec.key)
            return (
              <div key={sec.key} className="list-arco">
                <button
                  type="button"
                  className="list-arco__head"
                  aria-expanded={open}
                  onClick={() => toggle(sec.key)}
                >
                  <span>{sec.title}</span>
                  {open ? <IconChevronDown size={16} aria-hidden /> : <IconChevronRight size={16} aria-hidden />}
                </button>
                {open ? (
                  <div className="list-arco__body">
                    {sec.items.map((loc) => (
                      <div
                        key={loc.id}
                        className="list-row list-row--hoverable"
                        onMouseEnter={() => onLocalHover?.(loc.id)}
                        onMouseLeave={() => onLocalHover?.(null)}
                      >
                        <div className="list-row__main">
                          <div className="list-row__title">
                            {loc.nome}
                            {loc.visivel_para_todos === false ? (
                              <span
                                className="list-row__oculto"
                                title={ta('local.ocultoAria')}
                                aria-label={ta('local.ocultoAria')}
                              />
                            ) : null}
                          </div>
                        </div>
                        <div className="list-row__actions list-row__actions--hover">
                          <IconButton label={tc('buttons.edit')} onClick={() => onEdit(loc)}>
                            <IconPencil size={16} aria-hidden />
                          </IconButton>
                          <IconButton label={tc('buttons.delete')} onClick={() => setPendingId(loc.id)}>
                            <IconTrash size={16} aria-hidden />
                          </IconButton>
                        </div>
                        <div className="list-row__menu">
                          <DropdownMenu
                            label={t('list.rowMenu')}
                            items={[
                              { id: 'edit', label: tc('buttons.edit'), onSelect: () => onEdit(loc) },
                              {
                                id: 'del',
                                label: tc('buttons.delete'),
                                onSelect: () => setPendingId(loc.id),
                                danger: true,
                              },
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
      <ConfirmDialog
        open={pendingId != null}
        title={ta('local.confirmDelete')}
        danger
        onCancel={() => setPendingId(null)}
        onConfirm={() => {
          const id = pendingId
          setPendingId(null)
          if (id != null) onDelete(id)
        }}
      />
    </div>
  )
}
