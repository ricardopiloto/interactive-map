import type { ComponentType } from 'react'
import type { InstanceConfig } from '../types'
import { FadigaWidget } from './fadiga/FadigaWidget'

export const IMPLEMENTED_MODULES = new Set(['fadiga'])

export interface ModuleWidgetProps {
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export const componentesPorModulo: Record<string, ComponentType<ModuleWidgetProps>> = {
  fadiga: FadigaWidget,
}

export function unimplementedActiveModules(config: InstanceConfig): string[] {
  const implemented = IMPLEMENTED_MODULES
  return config.modulos_ativos.filter((m) => !implemented.has(m))
}

export function activeImplementedModules(config: InstanceConfig): string[] {
  return config.modulos_ativos.filter((m) => IMPLEMENTED_MODULES.has(m))
}
