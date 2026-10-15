# Checklist de paridade — `frontend/` (15 páginas) vs `frontend-v2/` (task 11.1)

Inventário de `frontend/src/pages/` (via `frontend/src/App.tsx`) contra as rotas de `frontend-v2/src/main.tsx`. Exclusões explícitas confirmadas (não portadas, por decisão do design.md): `AdminPage.tsx` (página deprecated, substituída pelo console novo), `frontend/src/components/gm/AdminGateDialog.tsx` e `frontend/src/components/admin/GrupoAdminPanel.tsx` (componentes órfãos, sem rota viva em `frontend/`).

| # | Página em `frontend/` | Rota | Equivalente em `frontend-v2/` | Ações cobertas (tasks.md) | Status |
|---|---|---|---|---|---|
| 1 | `HomePage.tsx` | `/` | `/` → `HomePage` (`routes/home.tsx`) | 8.1 | ✅ |
| 2 | `ExplorarPage.tsx` | `/explorar` | `/explorar` → `ExplorarPage` (`routes/explorar.tsx`) | 8.2 | ✅ |
| 3 | `AuthPages.tsx::LoginPage` | `/login` | `/login` → `LoginPage` (`auth/Login.tsx`), incl. modo modal sobre a página de origem | 2.4 | ✅ |
| 4 | `AuthPages.tsx::ConvitePage` | `/convite/:token` | `/convite/:token` → `ConvitePage` (`routes/convite.tsx`) | 8.3 | ✅ |
| 5 | `AuthPages.tsx::ResetPage` | `/reset/:token` | `/reset/:token` → `ResetPage` (`routes/reset.tsx`) | 8.3 | ✅ |
| 6 | `AuthPages.tsx::ContaPage` | `/conta` | `/conta` → `ContaPage` (`routes/conta.tsx`), exige sessão (`RequireSession`) | 8.4 | ✅ |
| 7 | `PainelPage.tsx` | `/painel` | `/painel` → `PainelPage` (`routes/painel.tsx`) | 9.1, 9.2, 9.3 | ✅ |
| 8 | `NovoCodexPage.tsx` | `/painel/novo` | `/painel/novo` → `NovoCodexPage` (`routes/novo.tsx`), wizard 4 passos | 9.4 | ✅ |
| 9 | `MapPage.tsx` | `/c/:slug` (índice) | `/c/:slug/mapa` → `MapPage` (`routes/index.tsx`); índice (`CampaignIndex`) redireciona para `mapa` ou `relacoes` conforme `has_map_image` | 2.2, 3.1-3.6 | ✅ |
| 10 | `RelacoesPage.tsx` | `/c/:slug/relacoes` | `/c/:slug/relacoes` → `Relations` (`routes/relacoes.tsx`) | 4.1-4.5 | ✅ |
| 11 | `RotaPage.tsx` | `/c/:slug/rota` | `/c/:slug/rota` → `RoutePage` (`routes/rota.tsx`) | 5.1-5.5 | ✅ |
| 12 | `SessoesPage.tsx` | `/c/:slug/sessoes` | `/c/:slug/sessoes` → `Sessions` (`routes/sessoes.tsx`) | 6.1-6.4 | ✅ |
| 13 | `LinhaTempoPage.tsx` | `/c/:slug/linha-do-tempo` | `/c/:slug/cronologia` e `/c/:slug/linha-do-tempo` → `Timeline` (`routes/cronologia.tsx`), 3 modos | 7.1-7.10 | ✅ |
| 14 | `AdminConsolePage.tsx` | `/admin` | `/admin` → `AdminConsolePage` (`routes/admin.tsx`), exige `RequireSession admin` | 10.1, 10.2 | ✅ |
| 15 | `AdminConvitesPage.tsx` | `/admin/convites` | `/admin/convites` → `AdminConvitesPage` (`routes/admin-convites.tsx`) | 10.3 | ✅ |
| — | `AdminPage.tsx` | `/c/:slug/admin` | **excluída intencionalmente** — página deprecated em `frontend/`, console super-admin novo (`/admin`) já cobre o caso real | — | N/A (exclusão confirmada) |
| — | `CampaignMissingPage.tsx` | `*` (catch-all) | **lacuna encontrada e corrigida nesta sessão**: `frontend-v2/` não tinha rota catch-all; adicionada `NotFoundPage` (`routes/not-found.tsx`) no vocabulário visual do template, registrada em `main.tsx` | — | ✅ (corrigido) |
| — | `StyleGuidePage.tsx` | `/__styleguide` | `/__styleguide` → `StyleGuide` (`routes/styleguide.tsx`), só em dev | 1.8 | ✅ |

## Verificação

- Todas as 15 páginas de produção de `frontend/` têm rota equivalente funcional em `frontend-v2/`, confirmadas por build (`npm run build`), lint (0 erros), 43 testes unitários e 22 testes e2e Playwright (`npx playwright test`) passando sobre o código integrado das seções 1-10.
- Única lacuna real encontrada durante esta validação: ausência de rota catch-all (`*`) para URLs inexistentes — corrigida com `NotFoundPage`.
- `AdminPage.tsx` e os componentes órfãos (`AdminGateDialog.tsx`, `GrupoAdminPanel.tsx`) confirmados como não aplicáveis, conforme já previsto no enunciado da task 11.1.
