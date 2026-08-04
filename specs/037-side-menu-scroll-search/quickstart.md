# Quickstart: Scroll e busca no menu lateral

**Feature**: `037-side-menu-scroll-search`  
**Date**: 2026-08-04

Validação manual. Ver [contracts/ui-side-menu-scroll-search.md](./contracts/ui-side-menu-scroll-search.md) e [data-model.md](./data-model.md).

## Prerequisites

- Frontend (+ backend se dados vierem da API) a correr
- Campanha com listas longas (≥15 locais e/ou NPCs) e vários arcos com locais ligados
- Testar modo jogador e modo GM

## Scenarios

### A — Scroll Locais / NPCs / História

1. Abrir menu lateral na aba Locais com lista longa.
2. Rolar o corpo.

**Expect**: Itens inferiores visíveis; brand/abas (e busca) permanecem no sítio.

Repetir NPCs e História. Em GM, repetir nas listas admin.

### B — Scroll Grupo (GM)

1. Modo GM → aba Grupo com conteúdo alto (ou viewport baixa).
2. Rolar o corpo.

**Expect**: Scroll funciona; **sem** campo de busca.

### C — Filtro Locais / NPCs

1. Digitar fragmento de um nome conhecido.
2. **Expect**: Só matches; limpar → lista completa.
3. Digitar sem matches → estado vazio perceptível.

### D — Filtro História (arco ∨ local)

1. Digitar parte do **título** de um arco → esse arco aparece.
2. Digitar parte do **nome de um local** ligado a outro arco → esse arco aparece mesmo sem o texto no título.
3. (Opcional) Variante sem acento se houver nome acentuado.

### E — Persistência entre abas

1. Em Locais, filtrar com um termo.
2. Mudar para NPCs (sem limpar).

**Expect**: O mesmo texto está no campo; a lista de NPCs já está filtrada por esse termo.

### F — Jogador e GM

1. Confirmar busca visível em Locais/NPCs/História nos dois modos.
2. Em GM, filtrar Locais admin e editar/apagar um item filtrado — acções iguais às de antes.

### G — Móvel

1. Viewport estreita / overlay do menu.
2. Repetir A e C.

**Expect**: Scroll do corpo + busca utilizáveis.

## Regression

- Seleccionar local/NPC/arco continua a focar o mapa / expandir como hoje.
- Calcular rota e Rede de rotas inalterados.
