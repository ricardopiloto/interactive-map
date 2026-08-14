# Quickstart: Lista, hover e anel compacto (Relações)

**Feature**: `086-relacoes-list-compact`  
**Purpose**: Validar US1–US3 ([spec.md](./spec.md), [contracts/ui-relacoes-list-compact.md](./contracts/ui-relacoes-list-compact.md)).

## Prerequisites

- Backend + frontend (`uv run uvicorn app.main:app --reload --port 8000`, `npm run dev`)
- Rede com **≥8** personagens visíveis (mistura PJ + NPC) e pelo menos um personagem com **8** vínculos directos visíveis e outro com **4**
- Modo GM para criar vínculos de teste se a campanha ainda for pequena

## Scenarios

### 1. Lista abaixo dos tipos (US1, FR-001, FR-002, FR-005)

1. Abrir `/relacoes`.
2. **Expect**: abaixo dos chips de tipo, **antes** de Isolar / legenda, uma lista com **todos** os PJ e NPC visíveis, A→Z.
3. Se a lista for longa, fazer scroll **dentro da lista**.
4. **Expect**: chips e legenda continuam acessíveis; a lista não os empurra para fora.

### 2. Clique = disco (US1, FR-003, SC-001)

1. Clicar um nome na lista.
2. **Expect**: o palco foca esse personagem e o painel de detalhe abre (igual a clicar no disco).
3. Clicar de novo o mesmo nome.
4. **Expect**: desselecciona / fecha o detalhe.

### 3. Busca filtra a lista (FR-004)

1. Escrever na busca um fragmento de nome.
2. **Expect**: a lista só mostra correspondências; no palco os outros discos atenuam-se como hoje.

### 4. Visibilidade (FR-002, SC-002)

1. Como jogador (sem GM), confirmar que a lista **não** tem personagens ocultos.
2. Entrar em Modo GM.
3. **Expect**: ocultos aparecem na lista (com indicação) se já aparecem no palco.

### 5. Isolar não reduz a lista

1. Seleccionar alguém, ligar **Isolar seleção**.
2. **Expect**: palco só com vizinhos; lista completa (salvo busca). Clicar outro nome na lista salta o foco.

### 6. Anel compacto só no foco com >6 (US2, FR-006–FR-008, SC-003–SC-005)

1. Vista geral com ≥7 NPCs no anel exterior: **Expect** folga igual à de sempre (não compacta).
2. Seleccionar personagem com **4** conexões visíveis: **Expect** anel interior como hoje.
3. Seleccionar personagem com **6** conexões: **Expect** ainda a folga padrão (limiar é **>6**).
4. Seleccionar personagem com **8** conexões: **Expect** anel interior visivelmente mais junto; nomes/discos **não** se sobrepõem; anel exterior não «cola» do mesmo modo.

### 7. Hover na lista (US3, FR-009–FR-013, SC-006, SC-007)

1. Vista geral, **sem clicar**, passar o rato num nome.
2. **Expect** (≤2 s): disco correspondente + linhas de vínculo **directas visíveis** destacados; painel **não** abre; anéis **não** rearranjam; zoom/pan iguais.
3. Sair do nome: **Expect** destaque de hover some.
4. Passar a outro nome: **Expect** o preview muda.
5. Seleccionar A, depois hover em B na lista: **Expect** preview de B; A continua seleccionado; ao sair do hover, o foco de A regressa.
6. Isolar em A, hover num nome que **não** está no palco: **Expect** sem preview; Isolar permanece.
7. Personagem sem conexões visíveis: **Expect** só o disco destacado.

### 8. Documentação

1. `docs/manual-relacoes.md` — coluna descreve lista, hover e anel compacto no foco.
2. CHANGELOG `[0.18.0]`; `specs/v2/README.md` linha 086.

### 9. Build

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` passa.
