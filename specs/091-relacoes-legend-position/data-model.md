# Data Model: Legenda da Rede no mesmo sítio que no mapa

**Feature**: `091-relacoes-legend-position`  
**Date**: 2026-08-14

Nenhuma entidade persistida. Nenhuma coluna, migração, contrato HTTP ou estado React novo.

## Overlay da chave (só UI)

| Campo | Valor | Notas |
|-------|--------|--------|
| Posição | canto inferior esquerdo do palco | igual à chave do mapa; fora de `__world` |
| Orientação | lista vertical | PJ, NPC, depois cada `VinculoTipo` |
| Título visível | nenhum | `aria-label` = `column.legend` |
| Fundo | nenhum | sem placa |
| Opacidade | 0,55 | contentor inteiro |
| Gestos | atravessam | `pointer-events: none` |
| Persistência | N/A | sempre visível na vista Relações |

**Itens** (ordem fixa, todos sempre presentes):

1. Disco PJ + rótulo `tipo.pj`
2. Disco NPC + rótulo `tipo.npc`
3. Um traço (sólido/tracejado + cor) por tipo em `VINCULO_TIPOS`, com o nome i18n actual

**Validação**: não omitir tipos; não filtrar a chave com Isolar, busca ou estado (FR-007 — palco vazio ainda mostra a chave).

**Lifecycle**: monta com o palco; não tem transições; pan/zoom do grafo não a movem.

## Relação com outros controlos

| Controlo | Relação |
|----------|---------|
| Chips de tipo (coluna) | filtram **linhas**; a chave **não** é clicável |
| Isolar / filtro de estado | não escondem a overlay |
| Zoom +/− / 1:1 | canto oposto; não se sobrepõem |
| Legenda do mapa | só referência de **canto**; conteúdo distinto |
