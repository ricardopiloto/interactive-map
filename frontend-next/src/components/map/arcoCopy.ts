export function arcoCopy(key: string): string {
  const en = localStorage.getItem('codex-proto-lang') === 'en'
  const copy: Record<string, [string, string]> = {
    manage: ['Gerenciar arcos', 'Manage arcs'],
    title: ['Arcos da campanha', 'Campaign arcs'],
    add: ['Novo arco', 'New arc'],
    name: ['Título', 'Title'],
    summary: ['Resumo', 'Summary'],
    visible: ['Visível para todos', 'Visible to everyone'],
    hidden: ['Oculto dos jogadores', 'Hidden from players'],
    delete: ['Excluir', 'Delete'],
    warning: ['Os locais serão mantidos e ficarão sem arco.', 'Locations will remain and become unassigned.'],
    empty: ['Ainda não há arcos.', 'There are no arcs yet.'],
    none: ['Sem arco', 'No arc'],
  }
  return copy[key]?.[en ? 1 : 0] ?? key
}
