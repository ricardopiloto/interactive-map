import { useRef, useState, type CSSProperties, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../api/admin'
import { useApiErrorMessage } from '../../hooks/useApiErrorMessage'
import { toast } from '../ui'
import './ImageSlot.css'

type UploadCategory = 'map' | 'portraits' | 'locals' | 'covers'

interface ImageSlotProps {
  src?: string | null
  placeholder?: string
  shape?: 'rect' | 'rounded' | 'circle'
  editable?: boolean
  category?: UploadCategory
  fit?: 'cover' | 'contain'
  className?: string
  style?: CSSProperties
  onUploaded?: (url: string) => void
}

export function ImageSlot({
  src,
  placeholder,
  shape = 'rounded',
  editable = false,
  category = 'locals',
  fit = 'cover',
  className = '',
  style,
  onUploaded,
}: ImageSlotProps) {
  const { t } = useTranslation('comum')
  const apiErrorMessage = useApiErrorMessage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [quotaHint, setQuotaHint] = useState<string | null>(null)
  const displayPlaceholder = placeholder ?? t('image.dragHere')

  async function handleFile(file: File | undefined) {
    if (!file || !editable || !onUploaded) return
    setQuotaHint(null)
    try {
      const result = await adminApi.upload(category, file)
      onUploaded(result.url)
      if (result.aviso_cota) {
        setQuotaHint(t('quota.warningNearFull'))
      }
    } catch (e) {
      toast.error(apiErrorMessage(e))
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    if (!editable) return
    void handleFile(e.dataTransfer.files?.[0])
  }

  const classes = [
    'image-slot',
    `image-slot--${shape}`,
    `image-slot--${fit}`,
    editable ? 'image-slot--editable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={style}
      onDragOver={(e) => editable && e.preventDefault()}
      onDrop={onDrop}
      onClick={() => editable && inputRef.current?.click()}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={(e) => {
        if (editable && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
      }}
    >
      {src ? (
        <img src={src} alt="" draggable={false} />
      ) : (
        <span className="image-slot__ph">{displayPlaceholder}</span>
      )}
      {quotaHint && <span className="image-slot__quota">{quotaHint}</span>}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      )}
    </div>
  )
}
