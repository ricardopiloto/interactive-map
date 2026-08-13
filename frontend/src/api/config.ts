import { api } from './client'
import type { InstanceConfig } from '../types'

export function fetchInstanceConfig(): Promise<InstanceConfig> {
  return api.get<InstanceConfig>('/api/config')
}
