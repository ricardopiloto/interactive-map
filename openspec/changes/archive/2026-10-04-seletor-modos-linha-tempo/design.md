# Design

## Context

Hoje `LinhaTempoPage` só renderiza o seletor quando `Campanha.modulos_ativos` contém `linha_tempo_arcos` e/ou `linha_tempo_descoberta`, e devolve o modo para cronológico se o flag some. O estado inicial já é `cronologico` e vive só no estado do componente. O painel oferece um checkbox por flag, mais o de `ia_arcos`. O `PATCH /api/campanhas/{slug}/modulos` aceita os três nomes em `MODULOS_TOGGLE_PERMITIDOS`. Os endpoints de leitura de arcos e de descoberta não consultam esses flags. Ver proposal.md para o motivo.

## Goals / Non-Goals

**Goals:**

- O seletor da Linha do Tempo lista sempre cronológica, "Por arcos" e "Por descoberta", para mestre e jogador.
- Entrar na tela seleciona o modo cronológico, sem persistir a troca.
- Os dois flags de visualização deixam de ser configuração e deixam de ser aceitos no toggle de módulos.

**Non-Goals:**

- Mudar o conteúdo dos modos, a gestão de itens, o alerta de sessão oculta ou o módulo `ia_arcos`.
- Gravar a preferência de modo na campanha, em `localStorage` ou na URL.
- Apagar de campanhas existentes as strings `linha_tempo_arcos` e `linha_tempo_descoberta` já guardadas em `modulos_ativos`.

## Decisions

1. **Tirar o portão no cliente, sem estado novo.** `LinhaTempoPage` deixa de ler os dois flags. O `SegmentedControl` fica sempre com as três opções, na ordem cronológica, por arcos, por descoberta. O `useState` inicial continua `'cronologico'`. Somem o efeito que força o modo de volta quando o flag está desligado e a condição que esconde o seletor. A busca da descoberta e o `ItemManager` seguem o caminho que hoje só roda com o módulo ligado: a descoberta carrega com a página (admin se o usuário é dono em modo edição, pública caso contrário) e a gestão de itens continua na página, restrita a `isGm && isDono`. Alternativa considerada: buscar a descoberta só ao selecionar o modo. Rejeitada porque acrescenta um estado de carregamento que o caminho já habilitado não tem, e o pedido é remover a configuração, não mudar quando os dados chegam.

2. **O toggle de API deixa de aceitar os dois modos de visualização.** `linha_tempo_arcos` e `linha_tempo_descoberta` saem de `MODULOS_TOGGLE_PERMITIDOS` e do `Literal` do schema. Um `PATCH` com esses nomes passa a falhar na validação do corpo, como qualquer módulo fora da lista. `ia_arcos` permanece. `set_modulo_ativo` continua genérico. Alternativa considerada: manter o endpoint e só esconder os checkboxes. Rejeitada porque a configuração continuaria existindo para quem chamasse a API, e a spec diz que a campanha não controla a visualização.

3. **Valores antigos ficam inertes.** Não há migração. A página não lê essas chaves. Chaves desconhecidas em `modulos_ativos` já são ignoradas pelo restante do produto.

## Risks / Trade-offs

- [Campanha que tinha o modo desligado passa a mostrá-lo] → é o comportamento pedido. Os estados vazios de cada modo já explicam a ausência de arcos ou de associações.
- [A change `linha-tempo-por-descoberta` ainda não está em `openspec/specs/`] → o delta desta change remove o opt-in dessa capability. Arquivar a change antiga depois desta, sem levar o opt-in de volta, depende de aplicar este delta na spec principal. Ver Migration Plan.
- [Gestão de itens aparece para o dono em modo edição mesmo sem o toggle antigo] → é o mesmo lugar de hoje quando o módulo estava ligado. Continua invisível para jogador e para o dono fora do modo edição.

## Migration Plan

1. Parar de ler e de oferecer os dois flags na interface.
2. Rejeitar os dois nomes no `PATCH` de módulos. Não reescrever `modulos_ativos` das campanhas já gravadas.
3. Ao arquivar, a spec principal de `linha-tempo-por-arcos` perde o requisito de opt-in. A de `linha-tempo-por-descoberta` só existe hoje dentro da change concluída de mesmo nome; este delta precisa entrar na spec principal junto com ela, substituindo o opt-in, para as duas não ficarem em conflito.

Rollback: voltar a condicionar o seletor e o painel aos dois flags e a aceitá-los no `PATCH`. Não há migração de dados para desfazer.

## Open Questions

Nenhuma.
