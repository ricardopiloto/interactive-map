import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/parseApiError'

export function useApiErrorMessage() {
  const { t } = useTranslation('comum')

  return useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        if (err.codigo) {
          const msg = t(`errors.${err.codigo}`, { ...err.detalhes, defaultValue: '' })
          if (msg) return msg
        }
        return t('errors.GENERICO')
      }
      if (err instanceof Error && err.message) {
        return t('errors.GENERICO')
      }
      return t('errors.GENERICO')
    },
    [t],
  )
}
