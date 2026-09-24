import { useState } from 'react'
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react'
import { useTheme, type ThemePreference } from '../../theme/ThemeContext'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof IconSun }[] = [
  { value: 'auto', label: 'Automático', icon: IconDeviceDesktop },
  { value: 'light', label: 'Claro', icon: IconSun },
  { value: 'dark', label: 'Escuro', icon: IconMoon },
]

/** Auto (segue o sistema) / Claro / Escuro — três estados, como o app real; não é só um toggle dia/noite. */
export function ThemeSelector() {
  const { preference, setPreference, mode } = useTheme()
  const [open, setOpen] = useState(false)
  const CurrentIcon = mode === 'dark' ? IconMoon : IconSun

  return (
    <div className="dropdown" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="icon-btn icon-btn-plain" onClick={() => setOpen((o) => !o)} aria-label="Tema da interface">
        <CurrentIcon size={18} aria-hidden />
      </button>
      {open && (
        <div className="dropdown__panel">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`dropdown__item${preference === opt.value ? ' is-active' : ''}`}
              onClick={() => { setPreference(opt.value); setOpen(false) }}
            >
              <span className="row gap-2"><opt.icon size={15} aria-hidden /> {opt.label}</span>
              {preference === opt.value && <IconCheck size={14} aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
