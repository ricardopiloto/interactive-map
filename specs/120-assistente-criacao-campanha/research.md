# Research: Assistente de criação de campanha — 120

## 1. Extrair formulário vs. redesenhar no sítio

**Decision**: Nova página `NovoCodexPage` em `/painel/novo`; `PainelPage` só lista + import/ações; CTA `createCta` → `navigate('/painel/novo')` ou `<Link to="/painel/novo">`. Remover state/handlers do create inline (`nome`/`slug`/`sistema`/`genero`/`visibilidade`/`onCreate`/`focusCreate` e fieldset).

**Rationale**: FR-001/008; protótipo é rota própria.

**Alternatives considered**: Wizard modal sobre o Painel — diverge do NovoCodexWizard e complica deep-link.

## 2. Contrato de API

**Decision**: Chamar exactamente `campanhasApi.criar({ nome, slug, sistema, genero, visibilidade })`. **Não** enviar `resumo`. Mapear erros API (`ApiError` / códigos existentes) para mensagem i18n no passo actual ou Revisão.

**Rationale**: FR-002/010; body actual do Painel.

**Alternatives considered**: Estender backend com resumo — fora de escopo.

## 3. Slugify

**Decision**: Util partilhado (ex. `frontend/src/utils/slugify.ts`): lower-case, NFD strip diacríticos, `[^a-z0-9]+` → `-`, trim hífens — alinhado ao protótipo. Auto-preenche enquanto `slugTouched === false`; edição manual marca touched. Aviso i18n de imutabilidade sob o campo.

**Rationale**: FR-003; UX do wizard.

**Alternatives considered**: Só slug manual como hoje no Painel — pior UX e falha o protótipo.

## 4. Pré-visualização de género

**Decision**: No mount do wizard e ao mudar `genero`, set `document.documentElement.dataset.genre` (padrão já usado em `PainelPage` create e `campaignGenre.ts`). No unmount, restaurar valor anterior (ou clear). Cards de género no passo 2 espelham o protótipo (grid 2×2, swatch, label i18n, tagline i18n se existir).

**Rationale**: FR-004; SC-004.

**Alternatives considered**: Preview só num swatch sem `data-genre` — não re-skina a tela.

## 5. Auth guard

**Decision**: Mesmo padrão do Painel: `authApi.me()` no mount; falha → `navigate('/login?next=/painel/novo')`. Não renderizar wizard até ready.

**Rationale**: Spec acceptance; consistência.

## 6. Passos e validação client-side

**Decision**:

| Step | Avançar se |
|------|------------|
| 0 Identidade | `nome.trim().length > 1` && `slug.trim().length > 1` |
| 1 Sistema e género | `sistema.trim().length > 1` (+ género sempre seleccionado, default fantasia) |
| 2 Visibilidade | sempre |
| 3 Revisão | POST |

Slug duplicado: se API devolver conflito no POST, mostrar erro; opcionalmente não há check client-side de uniqueness sem endpoint — falha no create basta (protótipo checava store mock).

**Rationale**: Protótipo + API real.

## 7. Sucesso

**Decision**: State `created: { slug, nome }` após POST OK; UI sucesso com links Abrir → `/c/:slug`, Ir painel → `/painel`. Não confiar só em navigate imediato — ecrã de sucesso é requisito.

**Rationale**: FR-007.

## 8. i18n

**Decision**: Chaves sob `comum.wizard.*` (ou `painel.wizard.*`): step labels, titles, hints, slug immutable, genre live hint, visibility copy, review, success, buttons. Labels de género reutilizar `painel.genre_*` / `home.genre_*` se já existirem.

**Rationale**: Constituição V.

## 9. Validação

**Decision**: Quickstart autenticado: 4 passos × 2 géneros + create listada/so_link + listagens; cancelar; unauth redirect; `tsc`.

**Rationale**: Constituição II UI polish.
