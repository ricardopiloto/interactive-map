# Design

## Context

- A leitura de sessão vive em `frontend-v2/src/routes/sessoes.tsx`. Hoje renderiza as notas de preparo só quando `enabled` (Modo GM) e há texto, em um `<section>` sem moldura, e o resumo logo abaixo, sem rótulo. Não há fios na leitura; a lista geral é `FiosList`, exibida só para `isDono`.
- `notas_preparo` já está fora de `SessaoPublic` e só existe em `SessaoAdmin` (`schemas/sessao.py`); o spec `sessao-notas-preparo` proíbe expô-las a jogadores. Os fios existem só em rotas `admin` com `require_dono` (`routers/admin/fios.py`); `FioRead` traz `sessao_origem_id`, mas `GET /fios` filtra apenas por `estado`.
- `sessoes.tsx` busca `admin/sessoes` apenas quando o Modo GM está ligado (`enabled`) e `sessoes` público nos demais casos (`api/sessoes.ts`); `SessaoPublic` não tem `notas_preparo`.
- A seção "Fios em aberto" (`FiosList`) hoje é renderizada com `isDono` apenas, sem exigir o Modo GM, e o contador `fiosRevision` do pai só muda quando propostas da IA são aceitas.
- A página já distingue o gate de edição (`enabled`, Modo GM) do gate de dono (`isDono`) pelo `useEditMode`.
- Textos em `locales/{pt-BR,en}/sessoes.json` (já há `fieldNotasPreparo`, `fieldResumo` e o grupo `fios.*`), com teste de paridade de chaves.

## Goals / Non-Goals

**Goals:**

- Separar visualmente, na leitura, o material privado (Notas de Preparo, Fios Narrativos) do texto público (Resumo), com rótulos e selo "só para o mestre".
- Mostrar os fios criados na sessão, em leitura, com caminho para a lista completa.
- Garantir, com teste, que nada de notas ou fios chega a jogadores nem entra no Resumo.

**Non-Goals:**

- Alterar regras de visibilidade, o editor de sessão (`SessionEditor`) ou o que jogadores veem.
- Editar, resolver ou criar fios a partir da leitura da sessão (isso continua na seção "Fios em aberto").
- Mostrar o estado público da sessão (visível/oculta) ou um selo "público" no Resumo.
- Mostrar a todos os fios em aberto da campanha na sessão (essa visão é a lista geral).
- Atualizar `docs/api-contracts.md`.

## Decisions

1. **Três blocos só para o mestre em Modo GM; para os demais, leitura inalterada.**
   O componente novo `SessionReadBlocks` recebe `sessao`, `slug`, `enabled` e `isDono`. Sem `enabled`, renderiza só o resumo exatamente como hoje (mesma marcação, sem rótulo), o que preserva a leitura pública e a do mestre com Modo GM desligado. Com `enabled`: Notas de Preparo (quem já o vê hoje), Fios Narrativos (só `isDono`, pois a rota é `require_dono`) e Resumo. Ordem fixa: preparo → fios → resumo, do material de trabalho para o texto final.
   *Alternativa:* abas por seção — rejeitada, esconde dois dos três blocos e o ponto é ver tudo de relance. *Alternativa:* rotular o resumo também para jogadores — rejeitada, muda a leitura pública sem necessidade.

2. **Distinção visual: moldura, rótulo e selo.**
   Notas e Fios em cartões com borda e fundo sutil, `eyebrow` com o rótulo e um selo "Só para o mestre" (ícone de cadeado + texto, não só cor, por acessibilidade). O Resumo mantém o tratamento tipográfico atual (capitular), com apenas o rótulo "Resumo" para o mestre. Blocos vazios ficam visíveis com mensagem em texto discreto, para a estrutura ser previsível.

3. **Fios da sessão via filtro no servidor.**
   `GET /admin/fios?sessao_origem_id=N` (parâmetro opcional, `gt=0`, combinável com `estado`), ordenado como a lista. Sem o parâmetro, nada muda.
   Os fios da sessão aparecem em qualquer estado (abertos e resolvidos) por decisão de produto: o bloco é o registro do que a sessão gerou, e a lista geral continua sendo a visão do que está em aberto na campanha.
   *Alternativa:* filtrar no cliente a lista completa — rejeitada: baixa a lista inteira a cada troca de sessão e duplica a ordenação. O custo do filtro é uma cláusula `where`.
   Resposta ordenada no cliente com abertos antes de resolvidos. Os fios são carregados quando a sessão em leitura muda, com cancelamento/ignorar resposta tardia (chave por id da sessão), para nunca mostrar fios da sessão anterior. Falha de rede vira aviso dentro do bloco, sem derrubar a página.

4. **Link para a lista completa.**
   A seção `FiosList` ganha `id="fios-em-aberto"`; o link do bloco é uma âncora (`#fios-em-aberto`) com rolagem suave que respeita `prefers-reduced-motion`. Sem rota nova.

5. **Privacidade em duas camadas; o Resumo só renderiza `resumo`.**
   A barreira primária é o endpoint escolhido: a página só busca `admin/sessoes` com o Modo GM ligado e `sessoes` público nos demais casos, e `SessaoPublic` não tem `notas_preparo`; assim, para jogador, visitante e Modo GM desligado as notas nem chegam ao navegador. A segunda camada é o componente: o bloco de Resumo recebe apenas `sessao.resumo`, notas e fios vêm de props e consultas separadas (nunca concatenados), e os blocos privados nem são montados nem os fios buscados fora de `enabled` (fios: `enabled && isDono`). No servidor, `SessaoPublic` não ganha campos novos; um teste de regressão afirma que a listagem e o detalhe públicos de uma sessão com notas e fios de origem não contêm `notas_preparo` nem chaves de fios.

6. **Seção "Fios em aberto" da página só com o Modo GM ligado.**
   `FiosList` passa a ser renderizada com `enabled && isDono` (hoje só `isDono`). Motivo: o Modo GM desligado é o modo de apresentação (por exemplo, tela projetada para a mesa), e a lista de fios é material privado; manter a lista visível com o Modo GM desligado contradiria a separação que esta change introduz. Isso altera o comportamento entregue na `fios-narrativos-lista` e, por isso, vira um delta MODIFIED na capability `fios-narrativos`. O link do bloco de Fios só existe com `enabled && isDono`, que é exatamente quando a lista está montada, então a âncora nunca fica sem destino.
   *Alternativa:* manter como está e registrar como fora de escopo — rejeitada pelo produto (opção A).

7. **Bloco da sessão e `FiosList` sincronizados por um contador de revisão.**
   O pai (`sessoes.tsx`) mantém o contador `fiosRevision` já existente; a `FiosList` ganha um callback `onChange` chamado após cada mutação bem-sucedida (criar, editar, resolver, reabrir, remover, reordenar), que incrementa o contador, e o bloco da sessão usa o contador como parte da chave de recarga. A aceitação de propostas da IA já incrementa o mesmo contador. Assim as duas visões do mesmo dado não divergem, sem estado global novo.

8. **Texto e layout.**
   Chaves novas em `sessoes.json` (pt-BR e en): rótulos dos blocos, selo, mensagens de vazio e de erro, texto do link. Layout em coluna única com espaçamento fixo; cartões ocupam a largura toda no mobile (sem grade), com quebra de palavras longas.

## Risks / Trade-offs

- **[Vazamento por regressão futura]** → Um campo novo em `SessaoPublic` poderia expor notas. Mitigação: teste de regressão nas rotas públicas e teste de DOM do jogador (sem rótulos nem textos de notas/fios).
- **[Requisição extra por sessão]** → Uma chamada leve por troca de sessão, só para o dono em Modo GM; sem cache nesta etapa.
- **[Limite de 30/minuto do `GET /fios`]** → Percorrer sessões muito rápido pode gerar 429. Aceito: o erro fica contido no bloco de Fios (as Notas e o Resumo continuam), e a recarga acontece na próxima troca de sessão.
- **[Mudança no comportamento entregue da lista de fios]** → Com o Modo GM desligado o dono deixa de ver a seção "Fios em aberto". Mitigação: é a intenção (modo de apresentação), documentada como delta MODIFIED e coberta por teste.
- **[`docs/api-contracts.md` defasado]** → O documento gerado não contém as rotas `admin/fios`; atualizá-lo está fora do escopo desta change.
- **[Editor não dono sem fios]** → Quem edita sem ser dono vê as notas mas não os fios, porque a rota é exclusiva do dono; é consistente com a regra atual de fios. Se virar problema, vira decisão de produto separada.
- **[Mudança visual em testes existentes]** → `SessoesPage.test.tsx` assume a marcação atual das notas; será ajustado sem enfraquecer as asserções de visibilidade.

## Migration Plan

Deploy backend e frontend juntos. Sem migração de banco. O filtro novo é opcional, então o frontend antigo continua funcionando com o backend novo. Rollback: reverter o componente; o filtro pode ficar sem uso.

## Open Questions

- Se o bloco de Fios deve mostrar também a descrição de cada fio ou só o título (ponto de partida: título e descrição, descrição recolhida em telas estreitas).
- Se o selo "só para o mestre" precisa de tooltip explicando o que jogadores veem (ponto de partida: texto curto visível, sem tooltip).
