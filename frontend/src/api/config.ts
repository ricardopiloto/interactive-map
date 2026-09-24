import { api } from './client'
import { campaignApiPrefix } from './campaignSlug'
import type { InstanceConfig } from '../types'

export function fetchInstanceConfig(slug: string): Promise<InstanceConfig> {
  return api.get<InstanceConfig>(`${campaignApiPrefix(slug)}/config`)
}
