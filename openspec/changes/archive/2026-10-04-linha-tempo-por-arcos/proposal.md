# Proposal

## Why

A Linha do Tempo hoje só tem o modo cronológico (lista vertical de `Evento`), que não deixa visível a continuidade de um fio narrativo (arco) quando outros assuntos acontecem entre as sessões que o compõem. O mestre e os jogadores não conseguem, hoje, acompanhar visualmente "o que aconteceu neste arco" sem reconstruir manualmente a sequência a partir da lista cronológica misturada. Esta proposta formaliza como spec OpenSpec a feature já desenhada e validada em [BKLG-039](../../../docs/backlog/backlog.md#bklg-039-produto--linha-do-tempo-por-arcos-e-por-descoberta) — decisão de produto e protótipo navegável já aprovados — para que a implementação siga o fluxo `apply` deste repositório.

## What Changes

- Novo modo **"Por arcos"** na Linha do Tempo, com raia vertical por arco (estilo grafo git: mais recente no topo), ao lado do modo cronológico existente (que não muda).
- O modo é **opt-in por campanha**: só aparece no seletor depois que um mestre autorizado o habilitar numa tela de configuração da campanha; por padrão, fica indisponível.
- `Arco` passa a ter **cor persistida** e **associação com sessões** (hoje só associa `Local`). Cada sessão pertence a no máximo um arco, com uma exceção explícita de sessão de transição (fecha um arco e abre o seguinte, aparecendo nas duas raias sem duplicar o registo).
- Indicação visual de tempo decorrido entre sessões consecutivas da mesma raia, com ligação tracejada para intervalos longos.
- Sessões sem arco continuam visíveis numa raia neutra "Sem arco".
- Gestão de arcos (criar/editar) ganha campo de cor e seleção de sessões/locais; somente mestre autorizado edita, jogador só lê.
- Filtro por arco (chips), sem teto artificial de seleção, com estado vazio compreensível quando a campanha não tem arcos.
- Escolha explícita entre criar arco manualmente ou solicitar criação por IA (apenas o gancho — toggle + estado "IA não habilitada" quando o módulo de IA não está ativo na campanha); o motor de deteção de arcos por IA está fora de escopo.
- Toda copy nova em pt-BR e en.

## Capabilities

### New Capabilities
- `linha-tempo-por-arcos`: modo "Por arcos" da Linha do Tempo — raias verticais por arco, gestão de arco (cor + sessões + locais), sessão de transição, filtro e escolha manual/IA na criação.

### Modified Capabilities
(nenhuma — não existem capabilities OpenSpec registadas em `openspec/specs/` ainda; este é o primeiro corte de specs feito neste modelo para a Linha do Tempo.)

## Impact

- **Backend**: migração `Arco.cor` (string hex, mesmo padrão de `Local.cor_pin`); migração `Sessao.arco_id` (FK opcional, mesmo padrão de `Local.arco_id`) e um mecanismo para a exceção de sessão de transição; `ArcoCreate`/`ArcoUpdate`/`ArcoRead` (`backend/app/schemas/arco.py`) ganham os novos campos; dois novos valores possíveis em `Campanha.modulos_ativos` (ex. `"linha_tempo_arcos"` pro opt-in deste modo e `"ia_arcos"` pro gancho de IA) — sem migração de schema adicional, reaproveitando o mesmo campo JSON já existente; novo setter de serviço (mesmo padrão de `set_visibilidade`/`set_unidade_distancia` em `backend/app/services/campanha_admin.py`) pra alternar esse módulo.
- **Frontend**: `ArcoFormDialog.tsx`/`ArcoAdminList.tsx` ganham color picker e seleção de sessões; layout novo de raias verticais por arco (reaproveita a técnica de posicionamento calculado já usada em `GraphStage.tsx`/`graphLayout.ts`, mas com cálculos próprios de posição por data real e raias); segmented control de 3 modos na Linha do Tempo (só mostra "Por arcos" se habilitado); chips de filtro por arco (mesmo padrão de Relações); novo toggle de habilitação na tela de configuração da campanha (reaproveita o padrão de toggle já usado em `PainelPage.tsx` pra `visibilidade`/`unidade_distancia`); i18n (`pt-BR`/`en`).
- **Sem dependência nova** além do já existente no produto; detalhes de estimativa e achados técnicos completos em `docs/v2/tr-timeline-arcos-descoberta.md` e nesta mudança em [`design.md`](design.md).
