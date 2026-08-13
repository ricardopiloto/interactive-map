# UI Contract: Namespaces e ficheiros de tradução

**Feature**: `080-i18n-interface`  
**Scope**: FR-001, FR-005, US2, SC-002

## Directory layout

```text
frontend/src/locales/
├── pt-BR/
│   ├── comum.json
│   ├── mapa.json
│   ├── relacoes.json
│   └── admin.json
└── en/
    ├── comum.json
    ├── mapa.json
    ├── relacoes.json
    └── admin.json
```

Both locales **bundled** at build time (static imports in `i18n/index.ts`).

## Namespace responsibilities

### `comum`

- Header nav (`Mapa`, `Relações`), brand kicker
- Generic buttons: Salvar, Cancelar, Apagar, Fechar
- Personagem status labels: Vivo, Morto, Desaparecido
- AdminGate copy
- **`erros.*`** — all API error codes (see [api-error-codes.md](./api-error-codes.md))
- Empty states shared: "Sem descrição.", loading

### `mapa`

- SideMenu sections, search, arco cards
- MapPage GM tools, pin modal chrome
- Route planner panel
- Local reposition hints (UI only)

### `relacoes`

- Graph toolbar, filters, column headers
- Detail panel chrome (not master `descricao` body)
- Vinculo type labels, qualificador placeholders
- Personagem/Vinculo form **labels and group titles** (`.dialog__group-title`)

### `admin`

- Local, NPC, Arco form dialogs (labels/groups)
- **Route digitizer** (`RouteDigitizerView`, `DigitizerListPanel`): column, search, sheet toggle, section headers Waypoints/Arestas
- Image upload placeholders
- Module widgets chrome (e.g. Fadiga label) — not campaign lore

## Key naming

- Use dot paths: `nav.mapa`, `gm.save`, `digitizer.searchPlaceholder`
- Group related keys: `dialog.local.identity`, `status.vivo`
- Error keys mirror API code: `erros.CREDENCIAIS_INVALIDAS`

## Usage in components

```tsx
const { t } = useTranslation('mapa')
return <button>{t('gm.digitizer.open')}</button>
```

Cross-namespace:

```tsx
t('comum:buttons.save')
```

## Master content exclusion (FR-004)

Do **not** wrap in `t()`:

- `personagem.nome`, `personagem.descricao`
- `local.nome`, `local.descricao`
- `vinculo.nota` and custom qualificador text
- User-typed waypoint names
- Arc/NPC titles from API

Do wrap:

- Enum **display** for `status`, fixed `tipo` catalog, button labels, section titles

## Coverage targets (SC-002)

| Surface | Namespace(s) | In ≥95% audit |
|---------|----------------|---------------|
| CodexHeader + nav | comum | yes |
| Mapa + SideMenu | mapa, comum | yes |
| Relações + grafo + detail | relacoes, comum | yes |
| Digitalização rotas | admin, comum | yes |
| GM dialogs (Local/NPC/Arco/Personagem/Vínculo) | admin, relacoes | yes |
| Hub index | — | **out of scope** |

## Verification

1. Grep audit: no Portuguese string literals in covered components (allowlist: proper nouns WFRP, CSS class names).
2. EN session: quickstart flow SC-001 without PT chrome.
3. Missing EN key test: temporarily remove one key → runtime shows PT-BR text; audit script flags it.
