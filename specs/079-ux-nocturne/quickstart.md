# Quickstart: UX Nocturne & Débitos

**Feature**: `079-ux-nocturne`  
**Purpose**: Validate digitizer column, pinch-zoom, Nocturne elevation, and GM dialog grouping ([spec.md](./spec.md)).

## Prerequisites

- Frontend dev server or Docker stack with GM access
- Campanha com **20+ waypoints** e vários segmentos (seed ou produção clone)
- Dispositivos touch: notebook touchscreen + tablet ou telefone (SC-002)
- Browser devtools para simular `≤800px` width

```bash
cd frontend && npm run dev
# or: docker compose up --build
```

## Scenarios

### 1. Busca e foco na digitalização (US1 / SC-001)

1. Modo GM → Mapa → abrir **Digitalizar rotas**.
2. Confirmar coluna **236px** à esquerda com busca e secções Waypoints/Arestas.
3. Digitar nome de um waypoint conhecido.
4. **Expect**: lista filtra em tempo real; waypoints e segmentos relacionados aparecem.
5. Clicar num waypoint na lista.
6. **Expect**: mapa centra/destaca o pin em **<10 s** total desde abrir busca (SC-001).
7. Clicar num segmento na lista.
8. **Expect**: segmento destacado no mapa; row visível na lista.

### 2. Bottom sheet mobile digitalização (US1 / FR-004)

1. Redimensionar janela para **≤800px** (ou device toolbar).
2. Abrir digitalização.
3. **Expect**: lista **não** ocupa faixa fixa permanente em baixo; toggle abre bottom sheet.
4. Fechar sheet → mapa full width.
5. Abrir sheet → secções e busca funcionais.

### 3. Pinch-zoom na Rede (US2 / SC-002)

1. Abrir `/relacoes`.
2. Em dispositivo touch, pinça in/out no palco do grafo.
3. **Expect**: zoom suave; limites 0.35–2.5 respeitados.
4. Usar roda do rato (desktop) → alternar para pinça (touch).
5. **Expect**: mesmo nível de zoom (sem reset).
6. Gesto com 3 dedos → **Expect**: sem crash; pan/zoom estável.
7. Repetir em **3 dispositivos** (SC-002).

### 4. Verificação Mapa pinch (FR-005a)

1. Abrir mapa principal em touch.
2. Pinça no mapa.
3. **Expect**: zoom funciona (lib default). Se **não** funcionar, registar bug e corrigir antes de fechar 079.

### 5. Elevação Nocturne (US3 / SC-003)

1. Comparar side-by-side (screenshot before/after ou memória):
   - Coluna Mapa (`SideMenu`)
   - Coluna Relações
   - Coluna digitalização
2. **Expect**: separação por sombra, sem borda grossa como delimitador principal.
3. Abrir painel detalhe na Rede.
4. **Expect**: sombra mais forte que a coluna.

### 6. Diálogos GM agrupados (US3 / FR-007a)

1. Abrir cada diálogo: personagem, vínculo, local, NPC, arco.
2. **Expect**: campos relacionados agrupados; backdrop escurecido; modal elevado.

### 7. Non-regression digitalização (SC-004)

1. Modo **Novo nó** → clique no mapa → waypoint criado.
2. Modo **Traçar segmento** → origem → intermediários → destino.
3. **Expect**: protocolo idêntico ao anterior; só layout mudou.

## Build gate

```bash
cd frontend && npm run build
```

**Expect**: `tsc -b` clean.

## Contracts

- [ui-digitizer-column.md](./contracts/ui-digitizer-column.md)
- [ui-graph-gestures.md](./contracts/ui-graph-gestures.md)
- [ui-nocturne-elevation.md](./contracts/ui-nocturne-elevation.md)
- [ui-gm-dialogs.md](./contracts/ui-gm-dialogs.md)
