export function groupCopy(key: string): string {
  const en = localStorage.getItem('codex-proto-lang') === 'en'
  const copy: Record<string, [string, string]> = {
    tools: ['Ferramentas do mapa', 'Map tools'],
    manageArcs: ['Gerenciar arcos', 'Manage arcs'],
    move: ['Mover grupo', 'Move group'],
    form: ['Usar brasão', 'Use coat of arms'],
    formFlag: ['Usar bandeira', 'Use flag'],
    hint: ['Clique no mapa para definir a nova posição do grupo.', 'Click the map to set the group’s new position.'],
    cancel: ['Cancelar movimento', 'Cancel move'],
    flag: ['Bandeira', 'Flag'],
    crest: ['Brasão', 'Coat of arms'],
  }
  return copy[key]?.[en ? 1 : 0] ?? key
}
