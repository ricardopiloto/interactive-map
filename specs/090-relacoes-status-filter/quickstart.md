# Quickstart: Filtro de estado na Rede de Relações

**Feature**: `090-relacoes-status-filter`  
**Purpose**: Validar US1 ([spec.md](./spec.md), [contracts/ui-status-filter.md](./contracts/ui-status-filter.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Modo GM: pelo menos **um** personagem em cada estado (`vivo`, `morto`, `desaparecido`, `desconhecido`) e ≥4 vivos
- Viewport de secretária

## Scenarios

### 1. Controlo junto a Isolar (FR-001, FR-002, SC-002)

1. Abrir `/relacoes`.
2. **Expect**: abaixo da lista de personagens, **acima** de Isolar selecção, um filtro «Estado» com Todos / Vivos / Mortos / Desconhecidos / Desaparecido. Valor inicial **Todos**.

### 2. Todos = comportamento actual (FR-003, SC-003)

1. Filtro em Todos.
2. **Expect**: palco e lista com o mesmo conjunto de sempre (visibilidade + busca + chips).

### 3. Mortos / Vivos (FR-003, FR-004, SC-001, SC-001b, SC-006)

1. Escolher **Mortos**.
2. **Expect**: só mortos na lista e no palco; linhas só entre mortos; anéis **sem** buracos onde estavam os outros.
3. Escolher **Vivos**.
4. **Expect**: só vivos; 0 mortos/desaparecidos/desconhecidos; anéis contínuos (≥4 vivos).

### 4. Desconhecidos e Desaparecido (FR-003)

1. Escolher cada um.
2. **Expect**: só esse estado; personagem sem status gravado aparece em **Desconhecidos**.

### 5. Selecção inválida (FR-007)

1. Seleccionar um vivo; mudar o filtro para **Mortos**.
2. **Expect**: painel de detalhe fecha; ninguém seleccionado.

### 6. Isolar depois do filtro (FR-005, SC-004)

1. Filtro **Vivos**, seleccionar um vivo com um vizinho morto e um vizinho vivo.
2. Ligar Isolar.
3. **Expect**: o vizinho morto **não** aparece (já estava fora do conjunto); o vizinho vivo aparece se for conexão directa.
4. Filtro **Todos** com Isolar ainda ligado: o vizinho morto pode voltar a aparecer (se for directo).

### 7. Busca e vazio (FR-006)

1. Filtro Mortos + busca que não bate em nenhum morto: mensagem de busca vazia.
2. Filtro Desaparecido sem nenhum desaparecido (busca limpa): «Nenhum personagem neste estado.»

### 8. Persistência (FR-009, SC-005)

1. Filtro em Vivos; recarregar `/relacoes`.
2. **Expect**: filtro de volta a **Todos**.

### 9. Manual e i18n

1. `docs/manual-relacoes.md` descreve o filtro junto a Isolar.
2. Alternar PT/EN: rótulos Todos / Alive / Dead / Missing / Unknown (ou equivalentes) correctos.

### 10. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
