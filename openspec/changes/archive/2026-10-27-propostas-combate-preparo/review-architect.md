# Review — Arquiteto de Soluções

**Change:** propostas-combate-preparo
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: Atenção
- Stack coerente: sem dependência nova, sem tabela, sem rota; reusa `react-markdown` + `rehype-sanitize` e o motor `motor_ia_assistente`. Escala não é preocupação (texto dentro de `notas_preparo`).
- **Soft line breaks colapsam o formato proposto.** O frontend usa só `react-markdown` + `rehype-sanitize` (sem `remark-breaks`/`remark-gfm`). O exemplo do design (`> [!combate] Título` seguido de `> **Inimigos:** ...` em linhas consecutivas) vira UM parágrafo: título e os quatro campos aparecem numa linha corrida, e extrair "o resto da primeira linha" como título exige partir o primeiro nó de texto. — Recomendação: definir no design um formato que sobreviva ao markdown padrão (campos como itens de lista `> - **Inimigos:** ...`, ou linhas `>` em branco entre campos) e fazer o prompt da IA e o spec usarem exatamente esse formato; testar com o parser real.
- O renderizador de `blockquote` precisa inspecionar a árvore de `children` do React (não a string markdown). — Recomendação: registrar no design como o título é extraído e que variações (`[!Combate]`, sem espaço) degradam para citação comum.

## 2. Integração com a infraestrutura existente
Veredito: OK
- Sem mudança de deploy, banco, backup, exportação ou importação; o bloco é texto de `notas_preparo`, que já trafega como hoje. Rollback trivial.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **Escopo do renderizador é global.** `RichContent` é usado em itens, relações, cronologia e descrição de locais, além das sessões. Um `blockquote` customizado passa a valer em todos, inclusive em campos visíveis a jogadores, embora o spec trate o bloco como coisa só de Notas de Preparo. Não há vazamento (o texto já era exibido), mas o comportamento fica mais amplo que o descrito. — Recomendação: ou assumir explicitamente no design/spec que o callout é reconhecido em qualquer markdown, ou ligar o reconhecimento por prop (por exemplo, só em `SessionReadBlocks`).
- **Contexto da IA pode tratar combate planejado como fato.** `contexto_ia.py` usa `sessao.resumo or sessao.notas_preparo` para sessões anteriores, e o prompt trata notas como fonte de "o que aconteceu". Blocos de combate de sessões nunca jogadas podem ser lidos como ocorridos. — Recomendação: registrar no design se o contexto deve filtrar/rotular blocos de combate, ou aceitar o risco de forma explícita.
- **Garantias do spec dependem de comportamento do modelo.** "Sem estatísticas", "sem combates se o mestre pedir" e "Resumo não copia combate" são obediência de prompt, não invariante do sistema. — Recomendação: reescrever os cenários como verificáveis (o prompt contém a instrução) e aceitar a variação residual, como o design já aponta.
- Segurança preservada: nada de HTML bruto, `rehype-sanitize` mantido, privacidade herdada de `notas_preparo`.
- Acessibilidade bem pensada (ícone + texto, não só cor). Falta exigir contraste mínimo verificável nos dois temas (tokens novos ao lado de `seal`, `destructive`, `ochre` já existentes).

## 4. Documentação e decisões (ADRs)
Veredito: Atenção
- `design.md` segue o padrão das changes anteriores, com alternativas rejeitadas (entidade estruturada, plugin remark, ação dedicada).
- `PROMPT_VERSAO` aparece definido em `motor_ia_assistente.py` e a busca não mostra outro uso fora de testes; a tarefa de "subir para 2" pode não ter efeito. — Recomendação: confirmar onde a versão é consumida (log/registro de uso) ou remover a tarefa.
- Diagrama desnecessário para a complexidade.

## 5. Ponte entre produto e técnico
Veredito: OK
- O pedido ("como no Obsidian, bloco de cor diferente, combate em notas e no assistente") foi traduzido em callout markdown + rascunho de IA. Combate estruturado, estatísticas e loot ficaram corretamente fora (BKLG-041/042/043).
- Só o ponto 1 (quebra de linha) ameaça entregar algo que não "parece Obsidian" na prática.

## Bloqueantes antes de implementar
- nenhum (a ressalva sobre o formato multilinha deve ser resolvida no design antes do apply, pois define o prompt e o parser)
