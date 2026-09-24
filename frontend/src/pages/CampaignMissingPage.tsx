import { useTranslation } from 'react-i18next'
import './CampaignMissingPage.css'

export function CampaignMissingPage() {
  const { t } = useTranslation('comum')
  return (
    <main className="campaign-missing">
      <h1 className="campaign-missing__title">{t('campaignMissing.title')}</h1>
      <p className="campaign-missing__body">{t('campaignMissing.body')}</p>
    </main>
  )
}
