# Design

## Context

`activeSlug` vive em `frontend/src/api/campaignSlug.ts` e só é escrito no `useEffect` de `CampaignShell`. Os efeitos das páginas correm antes. Com a `InstanceConfig` já na `Map` de `useInstanceConfig`, o shell não espera e o mapa pede dados com o slug ainda `null`. O cleanup do shell anterior também zera o slug depois de o shell novo o ter gravado, se a gravação for só na renderização e o cleanup for incondicional. Ver proposal.md e `docs/v2/tr-bug-004-abrir-mesa.md`.

## Goals / Non-Goals

**Goals:**

- O slug da rota existir antes de qualquer efeito de página.
- O cleanup de um shell que já saiu não apagar o slug do shell que acabou de entrar.
- Sair para o Painel voltar a deixar o slug vazio.

**Non-Goals:**

- Parâmetro de slug em cada método de `admin.ts` / `campaign.ts`.
- `ErrorBoundary` ou novo texto de erro.
- Mudar `listWaypoints` no mapa, que já recebe o slug.

## Decisions

- **Reivindicar o slug no corpo de `CampaignShell`, não num efeito.** O corpo do pai corre antes da renderização dos filhos e, portanto, antes dos efeitos deles. Cada instância do shell guarda um identificador estável (`useRef` preenchido uma vez). `claim(slug, owner)` grava os dois. Alternativa considerada: `useLayoutEffect`. Rejeitada porque a ordem continua a ser filho antes do pai.
- **`release(owner)` só apaga se o dono atual for esse owner.** Ao trocar de rota, a renderização do shell novo reivindica primeiro; o cleanup do shell antigo vê outro dono e não mexe. Ao ir para o Painel não há shell novo, o cleanup é o dono, e o slug volta a `null`. Alternativa considerada: nunca apagar. Rejeitada porque um pedido posterior no Painel passaria a usar a campanha anterior.
- **Esse cleanup liberta num microtask, e só se o efeito não voltou a subscrever.** O `StrictMode` repete os efeitos (cleanup e setup) sem nova renderização. Um `release` síncrono apagava o slug e o segundo efeito da página, que corre antes do setup do pai, falhava com `CAMPAIGN_SLUG_REQUIRED` — o pedido da primeira passagem já tinha ido à API e era descartado. O claim na renderização cobre a primeira passagem. Uma geração no ref aumenta em cada setup; o microtask do cleanup anterior vê a geração nova e não liberta. Na saída real não há novo setup, e o microtask liberta.
- **A lógica de claim/release fica em funções puras ao lado de `campaignSlug.ts`, sem React.** O teste `node:test` cobre: claim define o slug; release do dono certo limpa; release de um dono antigo não limpa o slug de um claim posterior. Alternativa considerada: passar o slug só em `useCampaignData`. Rejeitada porque Relações, Rota, Sessões e Linha do Tempo repetem o mesmo efeito sem slug.

## Risks / Trade-offs

- **Efeito de módulo durante a renderização** → `claim` com o mesmo owner e o mesmo slug é idempotente, para o double render do `StrictMode` não criar um segundo dono. O identificador só nasce quando o ref ainda está vazio.
- **Dois shells montados ao mesmo tempo** → as rotas atuais montam um `CampaignShell` de cada vez. Se isso deixar de ser verdade, o último claim ganha e o release do outro não pode apagá-lo.

## Migration Plan

Não há migração. Reverter é voltar a gravar o slug só no `useEffect` de `CampaignShell`.
