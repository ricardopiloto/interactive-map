# Research: Aposentar nocturne.css — 117

## 1. Inventário (snapshot 2026-09-22)

**Decision**: Tratar como classes-alvo obrigatórias tudo o que `nocturne.css` define sob botões/forms/seg/card/tag/dialog/nav utilitários listados na spec; consumidores confirmados fora de `components/ui/` incluem (não exaustivo até ao grep final na implementação):

| Área | Exemplos de ficheiros |
|------|------------------------|
| Auth / Painel / Sessões | `AuthPages.tsx`, `PainelPage.tsx`, `SessoesPage.tsx` |
| Admin forms / lists | `LocalFormDialog`, `NpcAdminList`, `ArcoAdminList`, `LocalAdminList`, `GrupoAdminPanel` |
| Relações | `RelacoesPage`, `PersonagemFormDialog`, `VinculoFormDialog`, `RelacoesDetailPanel`, `RelacoesSideColumn`, `GraphStage` |
| Mapa / rotas | `MapPage`, `CampaignMap`, `RoutePlannerPanel`, `WaypointCombobox` |
| GM | `RouteDigitizerView`, `DigitizerListPanel`, `AdminGateDialog` |
| Outros | `LanguageSelector`, `FadigaWidget` |
| Dívida no kit | `ConfirmDialog` ainda usa `dialog-body` |

**Rationale**: FR-001/002; grep real no repo.

**Alternatives considered**: Migrar só páginas «visíveis» — falha SC-001.

## 2. Mapa classe → kit

**Decision**:

| Legado | Destino |
|--------|---------|
| `.btn` + `.btn-primary/secondary/ghost/danger` | `Button` `variant=` → `ui-btn--*` |
| `.btn-icon` | `IconButton` ou `Button` + size/icon prop |
| `.btn-block` / `.btn-sm` | Extender `Button` (`block?`, `size?: 'sm'\|'md'`) em `ui.css` |
| `.input` (input/textarea/select) | `Input` / `Textarea` / `Select` |
| `.seg` / `.seg-opt` | **Novo** `SegmentedControl` (+ `ui-seg*`) |
| `.tag` / `.tag-accent` / `-neutral` / `-outline` / `-accent-2` | Extender `Chip` com `variant` |
| `.card` / `.card-meta` / `.elev-*` | `Card` + classes `ui-card__meta` / shadow utilities no kit ou `className` com tokens |
| `.dialog*` / `.dialog-backdrop` | `Dialog` / `Drawer` / `ConfirmDialog` (`ui-backdrop`, `ui-dialog`) |
| `.dialog-body` (kit + MarkdownSafe) | Renomear para `ui-dialog__body` / prop no kit |
| `.field > label` | Já parcial em `global.css` + FormDrawer; manter em global, não em nocturne |
| `.text-muted`, tipografia body/h*, `:focus-visible`, `::selection` | Absorver em `global.css` |
| `.nav` / `.nav-brand` | Só se ainda usados pós-114; senão omitir (CodexHeader já próprio) |
| `.npc-form__*` / `.local-form__*` em nocturne | Mover para CSS do formulário/media (`formShell.css` / ImageSlot) — **não** são o kit, mas não podem ficar só em nocturne |
| `.lighten`, `.radio` | Migrar se ainda referenciados; senão dropar com o ficheiro após grep |

**Rationale**: FR-003/004; um caminho = `components/ui`.

**Alternatives considered**:
- Copiar nocturne para `legacy-ui.css` — proibido.
- Só trocar classNames para `ui-btn` sem componentes — pior DX e foge ao pedido «equivalente em components/ui».

## 3. Extensões mínimas do kit

**Decision** (implemented in Phase 2):
1. **`SegmentedControl`** — API radiogroup: `options[{value,label}]`, `value`, `onChange`; styles `ui-seg` / `ui-seg__opt`.
2. **`Chip` variants** — `variant?: 'default' | 'accent' | 'neutral' | 'outline'`; optional `onClick` → `<button>`.
3. **`Button`** — `block?: boolean`, `size?: 'sm' | 'md'`; icon-only continua `IconButton`.
4. **ConfirmDialog / Dialog body** — class `ui-dialog__body` em vez de `dialog-body`.

**Status**: gaps closed (T003–T006).

**Rationale**: Lacunas reais no inventário; YAGNI além disto.

**Alternatives considered**: Usar `Tabs` para PJ/NPC — semanticamente errado (tabs ≠ exclusive choice).

## 4. Ordem de migração

**Decision**:
1. Extensões do kit + absorber globais em `global.css` (ainda com nocturne carregado).
2. Migrar consumidores por lotes (auth → painel → forms → gm → mapas/relações restos → misc).
3. Limpar dívida interna do kit (`dialog-body`).
4. Grep gate = 0 fora de `components/ui` **e** zero selectors órfãos necessários só em nocturne.
5. Remover import + apagar ficheiro; `tsc` + smoke.

**Rationale**: FR-008; evita flash partido.

**Alternatives considered**: Apagar nocturne primeiro — quebra tudo.

## 5. Dependência 114–116

**Decision**: Não apagar nocturne num branch onde SideMenu/coluna/PinModal ainda sejam o chrome principal **e** dependam massivamente de `.btn/.input` sem migração — na prática, implementar 117 **depois** (ou no topo) de 114–116 merged, mas a migração de classes pode começar em paralelo nos mesmos ficheiros.

**Rationale**: Spec Depends on; edge case.

## 6. Critério de grep

**Decision**: Gate script/manual:

```bash
# Must return empty (adjust patterns to inventory):
rg -n '\b(btn-primary|btn-secondary|btn-ghost|btn-danger|btn-icon|btn-block|btn-sm)\b|\bclassName="[^"]*\bbtn\b|\bclassName=\{`[^`]*\bbtn\b' frontend/src --glob '!**/components/ui/**'
# Similar for: \binput\b as class, \bseg\b, \btag\b, \bdialog-backdrop\b, \bdialog\b (careful with ui-dialog)
```

False positives (`auth-card`, `map-page__*`, `ui-btn`) excluded. Document exact patterns in [contracts/removal-gates.md](./contracts/removal-gates.md).

**Rationale**: SC-001.

## 7. Validação

**Decision**: Quickstart smoke auth/painel/mapa/relações/rota + tsc; visual &lt; 15 min claro/escuro.

**Rationale**: Constituição II UI polish.
