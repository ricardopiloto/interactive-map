import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  claimCampaignSlug,
  getCampaignSlug,
  releaseCampaignSlug,
} from './campaignSlug.ts'

test('claim grava o slug e release só apaga o dono atual', () => {
  claimCampaignSlug('wfrp', 1)
  assert.equal(getCampaignSlug(), 'wfrp')

  claimCampaignSlug('wfrp', 1)
  releaseCampaignSlug(99)
  assert.equal(getCampaignSlug(), 'wfrp')

  releaseCampaignSlug(1)
  assert.equal(getCampaignSlug(), null)

  claimCampaignSlug('wfrp', 1)
  claimCampaignSlug('shadow', 2)
  releaseCampaignSlug(1)
  assert.equal(getCampaignSlug(), 'shadow')

  releaseCampaignSlug(2)
  assert.equal(getCampaignSlug(), null)
})
