import type { ComponentType } from 'react'
import type { InstanceConfig } from '../types'
import { FadigaWidget } from './fadiga/FadigaWidget'

export const IMPLEMENTED_MODULES = new Set(['fadiga'])

/** View choices, not character-sheet widgets. Stored keys must not raise the missing-module banner. */
const MODULOS_SEM_WIDGET = new Set(['linha_tempo_arcos', 'linha_tempo_descoberta'])

export interface ModuleWidgetProps {
  value: Record<string, unknown>
  onChange: (patch: Record<string, unknown>) => void
}

export const componentesPorModulo: Record<string, ComponentType<ModuleWidgetProps>> = {
  fadiga: FadigaWidget,
}

export function unimplementedActiveModules(config: InstanceConfig): string[] {
  const implemented = IMPLEMENTED_MODULES
  return config.modulos_ativos.filter(
    (m) => !implemented.has(m) && !MODULOS_SEM_WIDGET.has(m),
  )
}

export function activeImplementedModules(config: InstanceConfig): string[] {
  return config.modulos_ativos.filter((m) => IMPLEMENTED_MODULES.has(m))
}
