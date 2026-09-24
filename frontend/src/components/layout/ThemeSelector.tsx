import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { IconMoon, IconSun } from '@tabler/icons-react'
import {
  effectiveTheme,
  readThemePreference,
  setThemePreference,
  type ThemePreference,
} from '../../theme/themePreference'
import './ThemeSelector.css'

const OPTIONS: ThemePreference[] = ['auto', 'light', 'dark']

/** Compact Auto / Light / Dark control for campaign chrome. */
export function ThemeSelector() {
  const { t } = useTranslation('comum')
  const [theme, setTheme] = useState<ThemePreference>(() => readThemePreference())
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    effectiveTheme(readThemePreference()),
  )
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuId = useId()

  useEffect(() => {
    if (theme !== 'auto') {
      setResolvedTheme(theme)
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => setResolvedTheme(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [theme])

  useEffect(() => {
    if (!open) return
    const onDoc = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const selectedIndex = OPTIONS.indexOf(theme)
    itemRefs.current[selectedIndex]?.focus()
  }, [open, theme])

  function choose(next: ThemePreference) {
    setThemePreference(next)
    setTheme(next)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function moveFocus(currentIndex: number, direction: 1 | -1) {
    const nextIndex = (currentIndex + direction + OPTIONS.length) % OPTIONS.length
    itemRefs.current[nextIndex]?.focus()
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setOpen(true)
  }

  function onItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(index, event.key === 'ArrowDown' ? 1 : -1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      itemRefs.current[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      itemRefs.current[OPTIONS.length - 1]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  const Icon = resolvedTheme === 'dark' ? IconMoon : IconSun

  return (
    <div className="theme-selector" ref={rootRef}>
      <button
        type="button"
        className="theme-selector__btn"
        ref={triggerRef}
        aria-label={t('theme.aria')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title={t(`theme.${theme}`)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <Icon size={18} aria-hidden />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="theme-selector__menu"
          aria-label={t('theme.menuAria')}
          onBlur={(event) => {
            if (rootRef.current?.contains(event.relatedTarget as Node | null)) return
            setOpen(false)
          }}
        >
          {OPTIONS.map((opt, index) => (
            <button
              key={opt}
              type="button"
              tabIndex={-1}
              ref={(element) => {
                itemRefs.current[index] = element
              }}
              role="menuitemradio"
              aria-checked={theme === opt}
              className={`theme-selector__item${theme === opt ? ' is-active' : ''}`}
              onClick={() => choose(opt)}
              onKeyDown={(event) => onItemKeyDown(event, index)}
            >
              {t(`theme.${opt}`)}
              <span aria-hidden>{theme === opt ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
