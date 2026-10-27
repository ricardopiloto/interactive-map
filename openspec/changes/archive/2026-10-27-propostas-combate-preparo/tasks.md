## 1. Backend

- [x] 1.1 Em `backend/app/services/motor_ia_assistente.py`, estender o bloco `rascunho_sessao` do prompt para propor combates no formato canônico (`> [!combate] Título` seguido de lista com Inimigos, Ambiente, Tática ou gatilho e Desfecho), só onde a cena pedir conflito, em número reduzido (até 3), sem estatísticas (usando `PLACEHOLDER_MECANICA`) e com a instrução do mestre prevalecendo; abrir a exceção da sintaxe `> [!combate]` na regra 8 do prompt base. O exemplo no prompt não pode conter `---`, `[[` nem chaves `{}`. Não alterar `PROMPT_VERSAO`.
- [x] 1.2 Estender o bloco `resumo_sessao` para não copiar blocos de combate como fatos ocorridos.
- [x] 1.3 Em `backend/app/services/contexto_ia.py`, função que remove dos textos de notas os blocos de combate (da linha `> [!combate]` até o fim das linhas de citação contíguas) e aplicá-la às notas de sessões diferentes da alvo: em `_texto_sessao` quando usa as notas por falta de resumo e em `notas_preparo_anterior`; as notas da sessão alvo seguem inteiras.
- [x] 1.4 Testes em `backend/tests/test_motor_ia_assistente.py` e no teste de contexto: o prompt do rascunho contém o formato, a regra de conflito, a proibição de estatísticas com o marcador de mecânica e a precedência da instrução do mestre; a exceção da regra 8 está presente; o prompt do resumo contém a instrução; `test_prompts_fixos` continua passando; o contexto omite o bloco de combate de notas anteriores e de sessão sem resumo, mantém o resto do texto e mantém as notas da sessão alvo inteiras. Rodar `uv run pytest` completo fora do sandbox do codex (o `TestClient` trava dentro dele).

## 2. Frontend

- [x] 2.1 Tokens `--combat` e `--combat-foreground` em `frontend-v2/src/styles.css` nos temas claro e escuro, mapeados como `--color-combat` e `--color-combat-foreground` no `@theme inline`, distintos de `seal` e `destructive`, com contraste legível nos dois temas.
- [x] 2.2 Em `RichContent.tsx`, prop opcional `callouts` (padrão desligada) que ativa o renderizador de `blockquote`: reconhece `[!combate]` no início do primeiro parágrafo (sem diferenciar maiúsculas), extrai o título do primeiro nó de texto (ou usa o rótulo padrão), e renderiza o bloco de combate com fundo, borda e faixa lateral na cor de combate, cabeçalho com ícone `Swords` e texto, e quebra de palavras longas; qualquer outra citação e todos os usos sem a prop permanecem como estão; manter `rehype-sanitize`.
- [x] 2.3 Ligar `callouts` apenas no `RichContent` das Notas de Preparo em `SessionReadBlocks.tsx`.
- [x] 2.4 Rótulo padrão "Combate" em `frontend-v2/src/locales/{pt-BR,en}/comum.json` com o mesmo conjunto de chaves e teste de paridade passando.
- [x] 2.5 Testes em `RichContent.test.tsx` e `SessionReadBlocks.test.tsx`: bloco canônico multilinha (título e cada campo em sua linha, usando o parser real), bloco sem título, maiúsculas/minúsculas, citação comum e callout de outro tipo inalterados, `[!combate]` fora da primeira linha como citação comum, callout aninhado dentro de citação ou lista, ausência de HTML bruto, e o mesmo texto sem a prop (e no Resumo) exibido como citação comum.

## 3. Verificação e registro

- [x] 3.1 `uv run pytest` completo do backend (fora do sandbox do codex) e `npx vitest run`, `npx tsc --noEmit` e `npx eslint .` do `frontend-v2` passando.
- [x] 3.2 Verificação manual: escrever um bloco de combate nas Notas de Preparo e ver a cor própria na leitura (claro, escuro e 320 px) com cada campo em sua linha; pedir um rascunho de IA em uma sessão com conflito e ver o combate proposto no formato, sem estatísticas; pedir "sem combates" e conferir que não vêm blocos; conferir que o mesmo texto no Resumo ou na descrição de um local aparece como citação comum e que o jogador não vê nada.
- [x] 3.3 Registrar em `CHANGELOG.md`, em Unreleased, o bloco de combate nas Notas de Preparo e a proposta de combates no rascunho da IA.
