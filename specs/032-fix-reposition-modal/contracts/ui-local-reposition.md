# UI Contract: Reposicionar local (modal oculto)

**Feature**: 032-fix-reposition-modal  
**Surface**: GM — edição de local + mapa

## Triggers

| Acção | Pré-condição | Efeito obrigatório |
|-------|--------------|-------------------|
| Clique “Reposicionar no mapa” | Dialog de editar local aberto (`!isNew`) | `placement = reposition`; dialog **não** montado; banner visível com texto de reposicionar + **Cancelar** |
| Clique no mapa (stage) | `placement = reposition`, draft presente | Draft `x/y` = coordenadas relativas; `placement = none`; dialog monta de novo |
| Clique **Cancelar** no banner | `placement = reposition` | `placement = none`; draft inalterado (mesmos `x/y` e campos); dialog monta de novo |
| Cancelar / Salvar no dialog | Dialog visível | Comportamento actual (limpar draft / persistir) |

## Banner (CampaignMap)

Quando `placementMode === 'reposition'`:

- Texto: indicar clique para reposicionar o local (mensagem actual ou equivalente).
- Controlo acessível **Cancelar** (botão ou link) que dispara `onCancelPlacement` sem propagar como clique de posicionamento no stage.

Opcional nesta feature: Cancelar noutros `placementMode` — **não requerido**.

## Non-goals

- Alterar `GET`/`PUT` de locais ou schema.
- Alterar fluxo add-pin ou move-group para além de não os regredir.
- Escape-key como único cancel (pode existir além do botão; não substitui FR-005).

## Acceptance mapping

| Spec | Contrato |
|------|----------|
| FR-001, SC-001 | Dialog não montado em reposition |
| FR-002 | Banner presente |
| FR-003, SC-002 | Clique → coords + dialog de volta |
| FR-004, SC-003 | Draft preservado |
| FR-005, SC-004 | Cancelar no banner |
| FR-006–007 | Save/cancel edição inalterados |
