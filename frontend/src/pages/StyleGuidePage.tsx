import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import {
  Button,
  Card,
  Chip,
  ConfirmDialog,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  Skeleton,
  Tabs,
  toast,
} from '../components/ui'
import './StyleGuidePage.css'

const SWATCHES = [
  'bg',
  'column',
  'surface',
  'elevated',
  'text',
  'text-secondary',
  'text-tertiary',
  'accent',
  'accent-fill',
  'success',
  'warning',
  'danger',
  'info',
] as const

export function StyleGuidePage() {
  const [preview, setPreview] = useState<'dark' | 'light'>('dark')
  const [tab, setTab] = useState('a')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="styleguide">
      <header className="styleguide__header">
        <h1>Style guide</h1>
        <p className="styleguide__note">
          Dev only — preview theme is scoped below (app root still follows the OS).
        </p>
      </header>

      <div className="styleguide-preview" data-theme={preview}>
        <div className="styleguide-preview__toolbar">
          <span>Preview theme</span>
          <Button variant={preview === 'dark' ? 'primary' : 'secondary'} onClick={() => setPreview('dark')}>
            Dark
          </Button>
          <Button variant={preview === 'light' ? 'primary' : 'secondary'} onClick={() => setPreview('light')}>
            Light
          </Button>
        </div>

        <section className="styleguide-preview__section">
          <h2>Colors</h2>
          <div className="styleguide-preview__swatches">
            {SWATCHES.map((name) => (
              <div key={name} className="styleguide-preview__swatch">
                <div
                  className="styleguide-preview__chip"
                  style={{ background: `var(--color-${name})` }}
                />
                <code>--color-{name}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="styleguide-preview__section">
          <h2>UI kit (UX-2)</h2>
          <div className="styleguide-preview__row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <IconButton label="Delete">
              <IconTrash size={20} aria-hidden />
            </IconButton>
            <Chip>Chip</Chip>
          </div>
          <div style={{ marginTop: 'var(--space-3)', maxWidth: 320 }}>
            <Input placeholder="Input" defaultValue="Sample" />
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Tabs
              items={[
                { id: 'a', label: 'Tab A' },
                { id: 'b', label: 'Tab B' },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <Card className="styleguide-preview__section">
            <Skeleton height={12} width="60%" />
            <EmptyState title="Empty state" description="Invitation, not an apology." />
          </Card>
          <div className="styleguide-preview__row" style={{ marginTop: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => toast.info('Toast info')}>
              Toast
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              ConfirmDialog
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Drawer
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm sample"
        description="Esc closes and returns focus."
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer sample">
        <p>Formulários de produto usam Drawer na UX-8. Aqui só a demo.</p>
        <Button variant="primary" onClick={() => setDrawerOpen(false)}>
          Fechar
        </Button>
      </Drawer>
    </div>
  )
}
