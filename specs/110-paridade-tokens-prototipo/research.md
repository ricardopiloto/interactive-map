# Research: Paridade de tokens com o protótipo

**Feature**: `110-paridade-tokens-prototipo`  
**Date**: 2026-09-22

## 1. Fonte da verdade

**Decision**: Valores de `frontend-next/src/styles/tokens.css` (género **fantasia** + `:root` partilhado: raios, espaço, sombras, fontes, semânticas, `--link-*`) e forma de `frontend-next/src/styles/global.css` (pílula em `.btn`/`.chip`/`.search-field`).

**Rationale**: Prompt e `docs/v2/proxima-fase-speckit-prompts.md` — protótipo é o padrão.

**Alternatives**: Manter cinza UX-1 e só acrescentar `radius-full` — rejeitado (não cumpre SC-001).

## 2. Mapeamento de papéis (protótipo → app)

| Protótipo | App (manter nome) | Notas |
|-----------|-------------------|--------|
| `--color-bg` | `--color-bg` | direct |
| `--color-surface` | `--color-surface` | direct |
| `--color-surface-2` | `--color-elevated` **ou** novo alias `--color-surface-2` → elevated/column conforme uso | Coluna do app: `--color-column` ← surface (ou surface-2 se contraste da coluna exigir); validar lado a lado |
| `--color-elevated` | `--color-elevated` | se conflitar com surface-2, elevated = superfície mais alta do protótipo |
| `--color-text-1/2/3` | `--color-text` / `--color-text-secondary` / `--color-text-tertiary` | |
| `--color-border` | `--color-border-subtle` + `--color-divider` | divider = border |
| `--color-border-field` | `--color-border-field` | |
| `--color-accent` (+ hover/active/on/wash) | `--color-accent`, `--color-accent-hover`, `--color-accent-fill`(=accent), `--color-on-accent`, `--color-accent-label-bg` ← wash ou elevated lavado | active opcional via alias |
| `--link-*` | `--vinculo-afinidade/laco/hostil/neutro` | |
| `--shadow-sm/md/lg/float` | `--shadow-*`; mapear `--elevation-column/panel/modal` para md/lg/float | |
| `--radius-sm/md/lg/full` | idem; full=999px | |
| `--space-1…4` | idem | |
| `--space-5` (24) | **manter** `--space-6: 24px` (compat) | não renumerar consumidores |
| `--space-6` (32) | **manter** `--space-8: 32px` | |
| `--space-7` (48) | **adicionar** `--space-7: 48px` | |
| `--font-sans` | `--font-body` / `--font-heading` (Inter) | |
| `--font-display` | `--font-display` (Cormorant) | |
| `--dur-*` / `--ease-out` | manter `--motion-*` nomes; opcional alinhar ms ao protótipo | |

**Aliases obrigatórios** (não remover): `--color-accent-fill`, `--color-accent-100/300/800`, `--color-accent-2*`, `--color-neutral-*`.

## 3. Pílula

**Decision**: `border-radius: var(--radius-full)` em `.ui-btn`, `.ui-icon-btn`, `.ui-chip`, contentor de busca (`.input[type=search]` / side-menu search wrap / classe dedicada se existir), `.btn`, `.tag` em `nocturne.css`.

**Rationale**: Clarify default (kit + legados). Inputs caixa e drawers: `sm`/`md`/`lg`.

## 4. Cormorant local

**Decision**: Adicionar woff2 500/600 em `public/fonts/`; `@font-face` em `fonts.css`; definir `--font-display` em `:root`. Home/Painel/SiteChrome/CampaignMissing já referenciam `var(--font-display, …)` — passam a resolver.

**Alternatives**: Google Fonts — rejeitado (FR-009, constituição UX-1).

## 5. Acentos 108

**Decision**: Mecanismo `data-campaign-accent` intacto. Base/latão = acento fantasia do protótipo. Recalibrar swatches hex **só** se `test:contrast` falhar; não remover opções.

## 6. Géneros

**Decision**: Não copiar blocos gotico/scifi/urbano nesta fase; 111 introduz `data-genre`.

## 7. Aceite

**Decision**: Quickstart checklist lado a lado (5×2) + `npx playwright test --update-snapshots` e commit das PNGs; CI `frontend-quality` verde.
