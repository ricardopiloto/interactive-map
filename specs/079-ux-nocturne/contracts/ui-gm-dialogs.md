# UI Contract: Diálogos GM — hierarquia visual

**Feature**: `079-ux-nocturne`  
**Scope**: Diálogos abertos a partir de Mapa, Relações ou digitalização (FR-007a)

## Covered dialogs

| Dialog | Source surface |
|--------|----------------|
| `PersonagemFormDialog` | Relações |
| `VinculoFormDialog` | Relações |
| `LocalFormDialog` | Mapa |
| `NpcFormDialog` | Mapa |
| `ArcoFormDialog` | Mapa |

Waypoint/aresta editing stays **inline** in digitizer toolbar/stage — not modal — but inherits modal tokens if future modal added.

## Modal chrome

| Element | Requirement |
|---------|-------------|
| Backdrop | Darkened overlay (~55% black); click outside closes if already supported |
| Dialog surface | `--elevation-modal`; cantos 8px |
| Title | Hierarquia tipográfica clara (kicker opcional + título) |

## Field grouping (`.dialog__group`)

Visual group container: subtle surface or spacing; small group label (12px muted).

### Personagem

1. **Identidade** — nome, tipo, retrato  
2. **Atributos** — facção, status, papel  
3. **Módulos** — widgets dinâmicos (`FadigaWidget`, etc.)  
4. **Notas** — descrição (full width)

### Vínculo

1. **Personagens** — A + B lado a lado (desktop) / stacked (narrow)  
2. **Tipo** — tipo + qualificador + direção  
3. **Nota** — campo isolado abaixo

### Local

1. **Identidade** — nome, arco  
2. **Posição** — coordenadas se expostas  
3. **Imagem** — slot retrato/imagem

### NPC / Arco

Agrupamentos mínimos: identidade vs metadados vs corpo de texto.

## Non-goals

- `AdminGateDialog` — gate de senha; sem redesign de agrupamento  
- Alterar campos obrigatórios ou validação  
- i18n (080)

## Verification

Open each dialog GM → campos relacionados visualmente agrupados; modal claramente acima do palco (sombra + backdrop).
