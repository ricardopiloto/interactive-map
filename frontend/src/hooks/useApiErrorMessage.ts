import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '../api/parseApiError'

export function useApiErrorMessage() {
  const { t } = useTranslation('comum')

  return useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        if (err.codigo) {
          if (err.codigo === 'PROPRIETARIO_COM_MESAS' && Array.isArray(err.detalhes.campanhas)) {
            const campaigns = err.detalhes.campanhas.map((campaign) => {
              if (campaign && typeof campaign === 'object') {
                const row = campaign as { nome?: string; slug?: string }
                return row.slug ? `${row.nome ?? row.slug} (${row.slug})` : row.nome ?? ''
              }
              return String(campaign)
            }).filter(Boolean).join(', ')
            return t(`errors.${err.codigo}`, { campanhas: campaigns })
          }
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
