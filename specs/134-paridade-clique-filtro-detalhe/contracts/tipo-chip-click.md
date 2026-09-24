# Contract: Interação de chips de tipo de vínculo

**Surface**: UI — filtros de tipo em `/c/:slug/relacoes` (grafo geral e painel de detalhe).

**Constant**: `CHIP_CLICK_DELAY_MS = 280` (fonte de verdade única; os dois filtros MUST usar o mesmo valor).

## Clique único

1. Agenda um `setTimeout` de `CHIP_CLICK_DELAY_MS`.
2. Ao disparar, alterna a presença do tipo no `Set` activo desse filtro (`toggle`).
3. Um segundo clique único no mesmo ou noutro chip **antes** do timeout cancela o pendente e agenda o novo (comportamento actual do grafo).
4. Side-effects opcionais (ex. expandir painel) só no call site do grafo — fora do contrato mínimo do detalhe.

## Duplo-clique

1. `preventDefault` no evento de duplo-clique.
2. Cancela qualquer clique único pendente nesse filtro.
3. **Solo / restore**:
   - Se o `Set` activo tem exactamente um tipo e é o clicado → `Set = all VINCULO_TIPOS`.
   - Senão → `Set = { tipo clicado }`.

## Independência

Os dois filtros MUST NOT ler nem escrever o `Set` um do outro. Só a mecânica de evento é partilhada.

## Cancelamento por ciclo de vida

Desmontar o call site (incl. remount de `PersonagemDetailBody` ao mudar `personagem.id`) MUST cancelar o timer pendente daquele call site — nenhum toggle atrasado após unmount.
