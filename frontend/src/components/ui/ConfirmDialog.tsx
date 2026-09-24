import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Dialog } from './Dialog'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation('comum')
  const confirmRef = useRef<HTMLButtonElement>(null)

  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      {description ? <p className="ui-dialog__body">{description}</p> : null}
      <div className="ui-dialog__actions">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel ?? t('buttons.cancel')}
        </Button>
        <Button
          ref={confirmRef}
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {confirmLabel ?? t('buttons.delete')}
        </Button>
      </div>
    </Dialog>
  )
}
