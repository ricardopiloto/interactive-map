# Quickstart: Mapa reconstrução (115)

## Prerequisites

- Backend + frontend locais; campanha `wfrp` com mapa e pinos.
- Spec 114 chrome no ar (cabeçalho + bottom nav).
- Referência: `frontend-next` MapPage / MapSidePanel (ou captura).

## Desktop panel

1. Abrir `/c/wfrp` (viewport ≥ 900px), tema claro e escuro.
2. Confirmar cartão flutuante à esquerda (margem, raio, sombra) — **não** coluna flush.
3. Busca pílula + chips Tudo/Locais/Personagens filtram a lista.
4. Clicar pino **e** item da lista → detalhe **no mesmo** painel; sem popover ao lado do pino.
5. «Voltar» → lista.
6. Captura vs. protótipo (SC-001).

## Mobile sheet

1. Viewport ≤ 860px.
2. Folha recolhida; focar busca ou seleccionar → expande.
3. Detalhe + voltar na folha.

## Zoom & FAB

1. Zoom +/−/reset: pinos não incham; controlos inferiores direitos em pílula/círculo.
2. Ir ao grupo (se existir).
3. Sem Edit Mode: sem FAB +.
4. Com Edit Mode: FAB + → clicar mapa → formulário de local (fluxo de dados intacto).
5. No detalhe + Edit Mode: editar / excluir local.

## GM extras

1. Entrada para digitalizador de rotas (se a mesa usa) ainda abre o digitizer actual — sem exigir SideMenu.
2. Gestão de arcos/grupo ainda possível sem coluna flush.

## i18n

Alternar pt-BR ↔ en: filtros, voltar, FAB aria, empty state.
