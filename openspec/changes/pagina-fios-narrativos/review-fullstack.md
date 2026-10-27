# Review — Desenvolvedor Fullstack

**Change:** pagina-fios-narrativos
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: N/A
- Sem backend novo. `routers/admin/fios.py` já usa `APIRouter(dependencies=[Depends(require_dono)])`, então a barreira real de acesso continua no servidor.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **Permissão (`canEdit` vs `isDono`).** `EditModeContext` define `canEdit = true` para qualquer membro com sessão administrativa e `isDono` só para o dono. O design (Decisão 3) e as tasks 1.1/1.2 usam `canEdit && enabled`; um editor não dono veria o item e receberia 403 da API. Usar `isDono && enabled` no item e na página, e tratar `ready` (como `Tools` faz) para não piscar «só do mestre» antes de carregar. A página de Sessões já usa `isDono` (`routes/sessoes.tsx`).
- **`lib/navigation.tsx`: `CAMPAIGN_SUBROUTES` precisa incluir `/fios`.** O `Link` do app só prefixa `/c/{id}/{slug}` para rotas listadas ali (`/relacoes`, `/rota`, `/sessoes`, `/cronologia`, `/linha-do-tempo`, `/itens`); `/ferramentas` nem consta. O link do bloco da sessão (`SessionReadBlocks`, hoje um `<a href="#fios-em-aberto">`) deve usar o `Link` de `@/lib/navigation` com `to="/fios"`, o que só funciona se `/fios` entrar em `CAMPAIGN_SUBROUTES`. Acrescentar à task 3.2 (e à 1.1).
- **`Shell.tsx`.** `lenses`/`gmLens` são `as const` e o mapa `labels` (`mapa → map`, …, `ferramentas → tools`) precisa da chave `fios → threads`. O item entra condicionalmente: `canEdit ? [...lenses, gmLens] : lenses` passa a ter um segundo critério (`isDono && enabled`). Ícone: `Waypoints` (lucide) ou `GitBranch`; confirmar que existe na versão instalada.
- **`FiosList.tsx` (270 linhas)** é uma `<section id="fios-em-aberto" aria-label=...>` com `h2`. Na página própria a seção vira a página: o `h1` fica em `fios.tsx`, a `<section>` deixa de ter `id` e o `h2` interno vira o `h1` da página para não duplicar títulos. Ajustar na 2.1.
- **`<details>` com ações.** Botões dentro de `<summary>` quebram o clique/teclado; as ações devem ficar no corpo expandido (como o design diz) e o estado (em aberto/resolvido) no `summary`. A reordenação (subir/descer) dentro do `<details>` exige expandir antes de reordenar: aceitável, mas vale registrar.
- Responsividade: largura total e cartões funcionam; a barra inferior com sete itens é o risco já registrado.

## 3. Deploy e operação
Veredito: OK
- Sem variável, migração, container ou script novo. Rollback é reverter o código.

## 4. Qualidade de código
Veredito: Atenção
- **Testes existentes a ajustar** (a task 4.2 cobre, mas listar): `SessoesPage.test.tsx` tem vários testes que esperam o heading e a região «Fios em aberto» na página de Sessões (linhas ~540–644: dono com Modo GM, GM desligado, criar/editar via região); eles migram para o teste da página «Fios». `SessionReadBlocks.test.tsx` (linha ~60) verifica o link `#fios-em-aberto` e `onShowThreads`; muda para o `href` da página «Fios».
- Teste de recarga: afirmar que o bloco da sessão consulta os fios ao montar, após mudanças na página «Fios» (o spec exige).
- Teste do item de navegação nos dois estados do Modo GM e para editor não dono (sem item).
- Vitest/jsdom: `<details>` abre via `fireEvent.click` no `summary` ou pelo atributo `open`; prever isso nos testes de ações.

## 5. Execução das decisões arquiteturais
Veredito: OK
- Segue o padrão de rotas (`campaignChildren()`), de navegação (`Shell.tsx`) e de `<details>` da Cronologia. Nada reaberto.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- `CAMPAIGN_SUBROUTES` não é derivado das rotas de `campaignRoutes.tsx`: toda rota nova de campanha exige lembrar de editar a lista (e `/ferramentas` hoje não está nela). Fora de escopo, mas é a fonte provável de link quebrado; follow-up opcional: derivar a lista.
