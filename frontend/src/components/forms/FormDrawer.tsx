import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ConfirmDialog, Drawer } from '../ui'
import './formShell.css'

export interface FormDrawerProps {
  open: boolean
  title: string
  dirty: boolean
  onClose: () => void
  onSave: () => void
  saveDisabled?: boolean
  children: ReactNode
}

/** Drawer + unsaved ConfirmDialog (spec 107). */
export function FormDrawer({
  open,
  title,
  dirty,
  onClose,
  onSave,
  saveDisabled,
  children,
}: FormDrawerProps) {
  const { t } = useTranslation('comum')
  const [confirmOpen, setConfirmOpen] = useState(false)

  function requestClose() {
    if (dirty) setConfirmOpen(true)
    else onClose()
  }

  return (
    <>
      <Drawer open={open} onClose={requestClose} title={title}>
        <div className="form-drawer__body">{children}</div>
        <div className="form-drawer__actions">
          <Button type="button" variant="secondary" onClick={requestClose}>
            {t('buttons.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={onSave} disabled={saveDisabled}>
            {t('buttons.save')}
          </Button>
        </div>
      </Drawer>
      <ConfirmDialog
        open={confirmOpen}
        title={t('form.unsavedTitle')}
        description={t('form.unsavedBody')}
        confirmLabel={t('form.unsavedDiscard')}
        cancelLabel={t('buttons.cancel')}
        danger
        onConfirm={() => {
          setConfirmOpen(false)
          onClose()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
