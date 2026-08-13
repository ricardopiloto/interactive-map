import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import './LanguageSelector.css'

const LOCALES = [
  { code: 'pt-BR' as const, sigla: 'PT', nameKey: 'language.pt' as const },
  { code: 'en' as const, sigla: 'EN', nameKey: 'language.en' as const },
]

function resolveActive(language: string): 'pt-BR' | 'en' {
  return language.startsWith('en') ? 'en' : 'pt-BR'
}

export function LanguageSelector() {
  const { i18n, t } = useTranslation('comum')
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)

  const active = resolveActive(i18n.language)
  const activeLocale = LOCALES.find((l) => l.code === active) ?? LOCALES[0]
  const activeIndex = LOCALES.findIndex((l) => l.code === active)

  function closeAndFocusTrigger() {
    setOpen(false)
    // Defer so React can unmount the list before focusing
    queueMicrotask(() => triggerRef.current?.focus())
  }

  function openList(startIndex = activeIndex >= 0 ? activeIndex : 0) {
    setFocusIndex(startIndex)
    setOpen(true)
  }

  function pick(code: 'pt-BR' | 'en') {
    void i18n.changeLanguage(code)
    closeAndFocusTrigger()
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        queueMicrotask(() => triggerRef.current?.focus())
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) openList()
      else {
        setFocusIndex((i) => {
          if (e.key === 'ArrowDown') return Math.min(i + 1, LOCALES.length - 1)
          return Math.max(i - 1, 0)
        })
      }
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) openList()
      else pick(LOCALES[focusIndex].code)
      return
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      closeAndFocusTrigger()
    }
  }

  function onListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIndex((i) => Math.min(i + 1, LOCALES.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(LOCALES[focusIndex].code)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closeAndFocusTrigger()
    }
  }

  return (
    <div className="language-selector" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-ghost language-selector__trigger"
        aria-label={t('language.aria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? closeAndFocusTrigger() : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="language-selector__sigla">{activeLocale.sigla}</span>
        <span className="language-selector__chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          className="language-selector__list"
          role="listbox"
          aria-label={t('language.aria')}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
        >
          {LOCALES.map((locale, i) => {
            const selected = locale.code === active
            const focused = i === focusIndex
            return (
              <li key={locale.code} role="presentation">
                <button
                  type="button"
                  id={`${listId}-opt-${locale.code}`}
                  role="option"
                  aria-selected={selected}
                  className={`language-selector__option${selected ? ' language-selector__option--selected' : ''}${focused ? ' language-selector__option--focused' : ''}`}
                  onMouseEnter={() => setFocusIndex(i)}
                  onClick={() => pick(locale.code)}
                >
                  {t(locale.nameKey)}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
