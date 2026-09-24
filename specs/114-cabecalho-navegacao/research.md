# Research: Cabeçalho e navegação (114)

## 1. Layout do cabeçalho vs. produção actual

**Decision**: Reestruturar `CodexHeader` em três zonas (left / tabs / right) espelhando `CampaignLayout` do protótipo; manter o nome do componente e os call sites (`MapPage`, `RelacoesPage`, `SessoesPage`, futura `RotaPage`).

**Rationale**: Spec exige paridade visual sem mudar permissões; o chrome já é partilhado via `CodexHeader`.

**Alternatives considered**:
- Extrair `CampaignShell` layout único com `<Outlet>` — melhor a longo prazo, mas alarga o escopo para além do cabeçalho (Map/Relacoes wrappers).
- Copiar CSS classes `campaign-bar__*` do protótipo para o app — ok como nomes internos; não importar ficheiros de `frontend-next/`.

## 2. Seletor de campanha

**Decision**: Botão com nome real (`campaignName` / config) + menu dropdown com duas acções: navegar `/painel` («minhas campanhas») e `/` («descobrir outras»). Fechar ao seleccionar ou ao perder foco/hover (padrão próximo do protótipo).

**Rationale**: FR-003; hoje o nome é `<span>` morto.

**Alternatives considered**:
- Listar todas as campanhas no dropdown — fora de escopo (Painel/catálogo já existem).
- Link directo no nome sem menu — não cobre os dois destinos do protótipo.

## 3. Quatro abas e breakpoint

**Decision**: Abas Mapa / Relações / Rota / Sessões no centro (desktop); esconder tabs do topo em viewport estreita (~860px como protótipo, ou alinhar o media query actual 800px ao valor do protótipo numa só constante documentada). Barra inferior ganha a 4.ª aba Rota. Ícones Tabler nas abas (paridade visual).

**Rationale**: FR-004 / SC-002; bottom nav actual tem só 3.

**Alternatives considered**:
- Manter 800px sem alinhar — pequena divergência visual aceitável, mas preferir um breakpoint único.
- Omitir ícones — piora a comparação a olho nu com o protótipo.

## 4. Modo edição — casca

**Decision**: Continuar `useEditMode()` (`canEdit`, `enabled`, `toggle`). Trocar `.btn.btn-ghost` por controlo estilo chip/pílula (`border-radius: var(--radius-full)`), estado ligado com fundo `accent-wash` / cor de acento (como `.campaign-bar__mode-toggle.is-active` no protótipo). Copy i18n «Modo edição» (não «Modo mestre»).

**Rationale**: FR-005; critério-chave é a pílula.

**Alternatives considered**:
- Renomear para «Modo mestre» — rejeitado pela spec (família «Modo edição»).
- Segundo contexto de GM — rejeitado (ACL intacta).

## 5. Tema Auto / Claro / Escuro no header

**Decision**: Controlo visível na zona direita (dropdown ou menu compacto) ligado a `readThemePreference` / `setThemePreference`. Remover duplicação confusa: ou o tema sai do `UserMenu` para este controlo, ou o `UserMenu` deixa de listar as três opções de tema (preferência: um único sítio no cabeçalho da mesa; Home/Painel podem manter tema no menu se já existir).

**Rationale**: FR-006 — MUST NOT virar toggle binário que elimine Auto.

**Alternatives considered**:
- Ícone sol/lua do protótipo (só claro/escuro) — rejeitado pela spec.
- Manter tema só dentro do `UserMenu` — falha o requisito de seletor na zona direita «como no desenho alvo».

## 6. Contentor mínimo Rota

**Decision**: Adicionar rota React `/c/:slug/rota` → `RotaPage` com o mesmo `CodexHeader` + `RoutePlannerPanel` alimentado por dados de campanha (`useCampaignData` / waypoints + locais). Sem pick no mapa nesta página mínima (`mapPick=null`); overlay de rota no mapa fica para 116 se necessário. `App.tsx` regista a route dentro de `CampaignShell` / `EditModeProvider`.

**Rationale**: FR-010 — aba não pode 404; redesenho do painel flutuante é 116.

**Alternatives considered**:
- Redirect para `/c/:slug` com tab lateral «rota» — não espelha URL do protótipo nem a aba do chrome.
- Reimplementar planeador — fora de escopo / YAGNI.

## 7. Omissão condicional da aba Mapa

**Decision**: Preservar prop `showMapNav` (ou equivalente) nos call sites; quando falsa, omitir Mapa no topo e na barra inferior.

**Rationale**: FR-009 / comportamento actual Map/Relacoes.

## 8. Validação visual

**Decision**: Quickstart com captura desktop (+ móvel opcional) de `/c/wfrp` vs. protótipo `CampaignLayout`; checklist posição / pílula / 4 abas. Sem novos testes de API.

**Rationale**: Constituição II para UI de polimento.
