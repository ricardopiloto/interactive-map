# Design

## Context

- As Notas de Preparo são o campo de texto `notas_preparo` da Sessão, só do mestre (spec `sessao-notas-preparo`). O editor (`SessionEditor.tsx`) é um `Textarea` simples; a leitura renderiza o texto com `RichContent` (`react-markdown` + `rehype-sanitize`), em `SessionReadBlocks.tsx`.
- `RichContent` não distingue tipos de citação: `> [!combate]` hoje apareceria como citação comum com o texto literal.
- O assistente de IA (`motor_ia_assistente.py`) tem um prompt base com regras fixas (sem regras de sistema, sem links wiki, marcador "[Mecânica a definir pelo mestre]") e um bloco por tipo (`rascunho_sessao`, `resumo_sessao`...). O rascunho grava em `notas_preparo`, passando pelo painel de revisão.
- Nas notas do Obsidian da campanha o combate é planejado como um bloco de destaque separado do texto; aqui o objetivo é o mesmo reconhecimento visual, usando a convenção de callout do Obsidian.

## Goals / Non-Goals

**Goals:**

- Dar ao combate planejado um bloco de cor própria, reconhecível na leitura da sessão.
- Fazer o rascunho de IA propor combates nesse formato, sem inventar mecânica.
- Manter tudo como texto em `notas_preparo`: sem banco, rota ou migração.

**Non-Goals:**

- Entidade estruturada de combate, estatísticas, iniciativa, rastreador de combate ou loot (ver BKLG-041/042/043).
- Suporte a outros tipos de callout e reconhecimento do callout fora da leitura das Notas de Preparo.
- Botão ou atalho no editor para inserir o bloco, e pré-visualização no editor (o `Textarea` continua simples; a cor aparece na leitura).
- Ação dedicada "Propor combates" ou revisão item a item (a proposta vive dentro do rascunho).

## Decisions

1. **Formato: callout markdown com lista, como no Obsidian.**
   ```
   > [!combate] Emboscada na ponte
   > - **Inimigos:** 3 bandoleiros e um batedor
   > - **Ambiente:** ponte de corda, neblina baixa
   > - **Tática ou gatilho:** atacam quando o último cruza
   > - **Desfecho:** a fuga do batedor leva ao esconderijo
   ```
   Os campos vão em lista porque o `react-markdown` sem `remark-breaks` junta linhas de citação consecutivas num único parágrafo; um item de lista pode interromper o parágrafo do marcador e cada campo ganha sua linha com o markdown padrão. Texto puro dentro do campo existente: exportação, importação, backup e visibilidade não mudam. *Alternativas:* entidade estruturada — rejeitada pelo produto (tabela, rotas, migração, sistema de regras indefinido); adicionar `remark-breaks` — rejeitado: muda o espaçamento de todo texto rico do app.

2. **Detecção na renderização, ligada por prop (opt-in).**
   `RichContent` ganha a prop opcional `callouts` (padrão desligada). Com ela ligada, um renderizador de `blockquote` (`components` do `react-markdown`, sem plugin novo e sem HTML bruto, mantendo o `rehype-sanitize`) examina o primeiro parágrafo da citação: se o primeiro nó de texto começa com `[!combate]` (sem diferenciar maiúsculas), o restante dessa primeira linha é o título (ou o rótulo padrão traduzido, se vazio) e o que sobra do parágrafo e os demais filhos formam o corpo. `SessionReadBlocks` liga a prop só no bloco de Notas de Preparo. Qualquer outra citação, `[!combate]` fora do início do primeiro parágrafo ou o mesmo texto em outros usos (itens, personagens, locais, eventos, Resumo) segue o caminho atual. *Alternativas:* reconhecer em todo `RichContent` — rejeitado: alarga o comportamento para campos visíveis a jogadores sem pedido de produto; plugin remark de callouts — rejeitado: dependência nova para um único tipo.

3. **Cor e acessibilidade.**
   Tokens `--combat` e `--combat-foreground` em `styles.css`, nos temas claro e escuro, mapeados como `--color-combat` e `--color-combat-foreground` no `@theme inline` (como `--color-seal`), distintos de `seal` (privado) e `destructive`. O bloco usa fundo tingido, borda e faixa lateral na cor de combate; o cabeçalho tem ícone (`Swords`, do lucide-react) e o texto "Combate" ou o título, para não depender só de cor. O rótulo padrão fica em `locales/{pt-BR,en}/comum.json`, o namespace que o `RichContent` já usa. Quebra de palavras longas como nos demais blocos.

4. **IA: combate dentro do rascunho, nunca estatísticas, garantia só no prompt.**
   O bloco `rascunho_sessao` do prompt ganha: propor combate só onde a cena pedir conflito, poucos por sessão (até 3 como ponto de partida), no formato da decisão 1, nascendo de fios, arcos, personagens e locais do contexto, sem estatísticas (marcador de mecânica onde necessário), com a instrução do mestre prevalecendo (inclusive "sem combates"). A regra 8 do prompt base (sem links wiki, frontmatter e prompts de imagem) recebe a exceção explícita da sintaxe `> [!combate]`. O bloco `resumo_sessao` ganha a instrução de não copiar blocos de combate como acontecidos. O exemplo escrito no prompt não pode conter `---`, `[[` nem chaves `{}`, pois `test_prompts_fixos` rejeita essas sequências. As garantias são de instrução: o sistema testa que o prompt as contém, não que o modelo as obedece; formato fora do padrão cai como citação comum. `PROMPT_VERSAO` não é alterada (não tem consumidor).
   *Alternativa:* ação dedicada com revisão por item — rejeitada pelo produto; o painel de revisão existente já protege a gravação.

5. **Contexto da IA omite combates planejados de outras sessões.**
   Em `contexto_ia.py`, uma função pequena remove dos textos de notas os blocos de combate (da linha `> [!combate]` até o fim das linhas de citação contíguas). É aplicada às notas de sessões diferentes da alvo: no `_texto_sessao` quando ele usa as notas por falta de resumo, e em `notas_preparo_anterior`. As notas da sessão alvo seguem inteiras, e o prompt orienta o tratamento. Motivo: evitar que um combate planejado numa sessão não jogada seja lido como fato. *Alternativa:* rotular em vez de remover — rejeitada por gastar contexto com conteúdo que a IA não deve usar como histórico.

6. **Privacidade sem trabalho novo.**
   O bloco vive em `notas_preparo`, que já nunca sai em respostas públicas; o teste de regressão existente cobre o campo, e a spec nova apenas registra o requisito.

## Risks / Trade-offs

- **[A IA ignora o formato]** → O modelo pode produzir variações (campos sem lista, `[! combate]`). Mitigação: detecção sem diferenciar maiúsculas; variação residual cai como citação comum, sem quebrar a página; o exemplo do prompt usa o formato canônico.
- **[Estatísticas escapam]** → O modelo pode inventar números de regra. Mitigação: a regra de mecânica do prompt base continua valendo e o bloco repete a proibição; o teste afirma que o prompt a contém (o comportamento do modelo não é testável).
- **[Remoção por regex no contexto]** → Notas mal formadas podem manter ou cortar mais do que o bloco. Mitigação: só linhas de citação contíguas a partir do marcador são removidas; o pior caso é texto de combate a mais ou a menos no contexto, sem efeito na gravação.
- **[Edição às cegas]** → Sem pré-visualização, o mestre vê a cor só ao ler. Aceito nesta etapa; um botão de inserção fica como melhoria futura.
- **[Cor parecida com o selo privado]** → Mitigação: token próprio e conferência de contraste nos dois temas.
- **[Teste de prompt existente]** → `test_prompts_fixos` rejeita `---`, `[[` e chaves no prompt; o exemplo é escrito sem elas. Demais testes do prompt serão ajustados sem enfraquecer asserções.

## Migration Plan

Deploy backend e frontend juntos; sem migração. Notas antigas não mudam; citações existentes seguem iguais. Rollback: reverter o renderizador, o prompt e o filtro do contexto; os blocos já escritos aparecem como citação comum.

## Open Questions

- Se até 3 combates por rascunho é o limite razoável (ponto de partida; ajustável só no prompt).
- Se vale oferecer depois um botão "Inserir bloco de combate" no editor (fora desta change).
