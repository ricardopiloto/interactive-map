## Context

- `routes/sessoes.tsx` renderiza `FiosList` dentro do `<nav>` da coluna de 300 px (`lg:grid-cols-[300px_1fr]`), só para o dono com o Modo GM ligado, e mantém `fiosRevision` para sincronizar a lista com o bloco da sessão. `SessionReadBlocks` mostra o link `#fios-em-aberto`, e `sessoes.tsx` rola até a seção.
- A navegação da campanha está em `Shell.tsx` (`lenses` + `gmLens` «Ferramentas», exibida para `canEdit`), com barra superior (`lg`) e barra inferior no celular; as rotas filhas estão em `campaignRoutes.tsx`. A página Ferramentas (`routes/ferramentas.tsx`) mostra «só mestre» quando `!canEdit`.
- A Cronologia usa `<details>`/`<summary>` por evento (cartão `rounded-2xl border bg-card`). É o padrão de «menu suspenso» pedido.
- A proposta de fios por IA (`FiosReview`) abre do editor da sessão e depende da sessão aberta (origem = sessão do editor).

## Goals / Non-Goals

**Goals:** dar espaço próprio aos fios; reaproveitar o padrão expansível da Cronologia; manter o bloco da sessão coerente com a lista.
**Non-Goals:** mudar API, regras de visibilidade, estados dos fios ou a proposta por IA; filtros por estado ou sessão; vincular fios a sessões em que foram trabalhados.

## Decisions

1. **Página própria `fios`** (rota filha ao lado de `sessoes`, `cronologia`, `ferramentas`), em vez de painel dentro de Sessões ou menu suspenso global: o mestre escolheu a página; permite largura total e endereço compartilhável. *Alternativas rejeitadas:* painel expansível em Sessões (continua acoplado à lista de sessões) e dropdown na barra superior (lista longa e editável não cabe bem em menu suspenso).
2. **Cartões expansíveis.** `FiosList` passa a renderizar cada fio como `<details>` com `<summary>` (título + estado, sem botões dentro dele, pois controles em `<summary>` quebram clique e teclado) e, ao expandir, descrição e ações (editar, reordenar, resolver/reabrir, remover); o formulário de novo fio fica no topo da página. Abertos antes dos resolvidos, mantendo a ordem atual (`Number(estado==="resolvido")`, depois `ordem`). Os controles de edição e de reordenar permanecem os atuais, só reposicionados (reordenar exige expandir o cartão; aceito). A `<section id="fios-em-aberto">` com `h2` do componente atual deixa de existir: o `h1` fica em `fios.tsx`, o título interno não se repete e o `id` antigo sai.
3. **Acesso.** O item de navegação aparece para `isDono && enabled` (mestre dono com o Modo GM ligado), coerente com a regra existente «lista visível só com o Modo GM ligado». `canEdit` NÃO serve: no `EditModeContext` ele vale para qualquer membro com sessão administrativa, e só `isDono` identifica o mestre dono (a API usa `require_dono`; um editor não dono receberia 403). A página usa `ready` do `EditModeContext` para mostrar carregamento até a permissão chegar, e então: quem não é dono vê a mensagem «só para o mestre» (como Ferramentas), sem dados; o dono com o Modo GM desligado vê a orientação de ligar o Modo GM, sem carregar a lista. A API continua sendo a barreira real. Consequência registrada: diferente de «Ferramentas» (que depende só de permissão), o item «Fios» some com o Modo GM desligado, então a barra de navegação muda de tamanho ao ligar ou desligar o modo.
4. **Link do bloco.** `SessionReadBlocks` troca o âncora pelo `Link` de `@/lib/navigation` com `to="/fios"`, e `/fios` entra em `CAMPAIGN_SUBROUTES` (`lib/navigation.tsx`), a lista que decide quando o `Link` prefixa `/c/{id}/{slug}`; saem `onShowThreads`, o `scrollIntoView` e o `id="fios-em-aberto"` de `sessoes.tsx`. `fiosRevision` permanece só para o bloco atualizar quando fios são aceitos na proposta de IA do editor; mudanças feitas na página «Fios» aparecem na sessão ao voltar, porque o bloco consulta os fios ao montar.
5. **Textos.** Chaves novas em `sessoes.json` (título e introdução da página, avisos de acesso e do Modo GM) e `v2.threads` («Fios» / «Threads») em `comum.json`, com o mesmo conjunto em pt-BR e en.

6. **Barra superior sem sobreposição.** `Shell.tsx` posiciona a barra com `absolute left-1/2 -translate-x-1/2` entre a identidade da campanha (esquerda) e os controles (direita); com o item «Fios» o dono vê oito itens e, entre `lg` (1024 px) e cerca de `xl`, os rótulos não cabem e a barra invade os controles (reportado com captura de tela). Decisão: abaixo de `xl` a barra superior mostra só ícones (`aria-label`/`title` com o nome; rótulo visível a partir de `xl`), mantendo a barra inferior do celular como está (abaixo de `lg`). *Alternativas rejeitadas:* subir o ponto de troca para a barra inferior para `xl` (a barra inferior já está justa com oito itens) e remover o centro absoluto (reorganiza o cabeçalho inteiro; fora do escopo).

## Risks / Trade-offs

- **[Barra inferior cheia]** O dono passa a ter sete itens (Mapa, Relações, Rota, Sessões, Cronologia, Ferramentas, Fios) na barra inferior do celular, já justa. Mitigação: rótulo curto, ícone `GitBranch`/`Waypoints`, teste de layout em 320 px; se não couber, `Fios` migra para dentro de «Sessões» como atalho (decisão a tomar na verificação manual).
- **[Rota nova com URL canônica]** Precisa funcionar em `/c/:id/:slug/fios` e na forma compatível; coberto pelo `campaignChildren()` único.
- **[Âncora antiga]** `#fios-em-aberto` deixa de existir. Aceito: era interno e nunca documentado.
- **[Lista `CAMPAIGN_SUBROUTES` manual]** Toda rota nova de campanha exige editá-la (e `/ferramentas` hoje nem consta). Aceito nesta change, só acrescentando `/fios`; derivar a lista das rotas fica como follow-up.
- **[Sincronização]** O bloco da sessão não atualiza em tempo real a partir da página «Fios» (são páginas diferentes); atualiza ao abrir a sessão. Aceito.

## Migration Plan

Deploy único do frontend; sem migração. Rollback: reverter o código.

## Open Questions

- Se a barra inferior não comportar o sétimo item, mover «Fios» para um atalho dentro de «Sessões».
- A proposta de fios por IA continua só no editor da sessão (não há botão de IA na página «Fios»); reconfirmar na verificação manual.
