# Review — Arquiteto de Soluções

**Change:** barra-formatacao-texto
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Definição da arquitetura técnica
Veredito: Atenção
- Coerente com a stack: só frontend, sem dependência nova, sem mudança de API, banco ou renderizador. A escolha de barra sobre o `textarea` (e não WYSIWYG) é justificada no `design.md` e mantém o valor salvo como markdown simples.
- **Escopo dos campos não bate com o código.** O `proposal.md` e o spec listam "resumo de arco" entre os campos de texto rico, mas não há renderização de `resumo` de arco com `RichContent` em nenhum lugar do frontend (os usos de `RichContent` são local, item, personagem, notas mecânicas, evento e sessão). Uma barra num campo que a leitura mostra como texto puro (ou não mostra) gera markdown que aparece literal. Também, "descrição de local e de item" é atribuída a `MapEditors.tsx`, mas lá estão `LocalEditor` e `NpcEditor`; o item está em `cronologia.tsx`; e `RelationEditors.tsx` tem um segundo `PersonagemEditor`. — Recomendação: corrigir a lista de campos e arquivos a partir dos editores reais e confirmar, campo a campo, que a leitura o renderiza com `RichContent`; tirar o arco do escopo se continuar sem renderização.
- **Aplicação do texto pode aplicar duas vezes.** O design diz tentar `execCommand("insertText")` e cair para `onValueChange` "se indisponível ou sem efeito". Com `execCommand` funcionando, o navegador dispara um evento `input` que já passa pelo `onChange` do `textarea`; chamar `onValueChange` também duplicaria a alteração. Além disso, para alternar formatação com `insertText` é preciso selecionar a faixa a substituir antes de inserir. — Recomendação: no design, definir um único caminho de saída (o `onChange` do próprio `textarea` alimenta `onValueChange`; o fallback só roda se `execCommand` retornar falso ou o valor não mudar) e dizer como a faixa substituída é calculada pelas funções puras (devolver também o trecho a trocar).

## 2. Integração com a infraestrutura existente
Veredito: N/A
- Sem deploy, variável, serviço, banco ou backup envolvidos.

## 3. Qualidade de arquitetura e trade-offs
Veredito: Atenção
- **O formato do bloco de combate passa a viver em três lugares.** Prompt da IA (`motor_ia_assistente.py`), regex do renderizador (`RichContent.tsx`) e agora o modelo em `markdown-format.ts`/`comum.json`. Mudar um sem os outros quebra silenciosamente (a barra insere algo que a leitura não reconhece). — Recomendação: acrescentar às tasks um teste que renderiza o modelo inserido pelo botão com `RichContent` (`callouts`) e afirma que vira bloco de combate, e que o marcador `[!combate]` vem de uma constante compartilhada entre o parser e o modelo.
- **Idioma do modelo vs. idioma do conteúdo.** O modelo sai no idioma da interface, mas o conteúdo da campanha pode estar em outro (interface em en, notas em pt-BR; a IA gera os rótulos em pt-BR). Os rótulos mistos não quebram a leitura, só a consistência. — Recomendação: registrar a decisão como aceita no design (leitura independe dos rótulos, já dito no spec).
- Segurança preservada: a barra só insere texto; `rehype-sanitize` continua na leitura e o link insere `https://`. Sem HTML bruto, sem novo vetor de injeção.
- Teste automatizado do caminho principal: o ambiente de teste é `jsdom`, onde `execCommand` não existe, então os testes cobrem só o fallback. — Recomendação: assumir no design que o caminho com `execCommand` é verificado manualmente (já previsto na task 4.2) e manter a lógica de transformação nas funções puras, onde está a cobertura.
- Manutenibilidade boa: componente único, funções puras, troca mecânica nos editores.

## 4. Documentação e decisões (ADRs)
Veredito: OK
- `design.md` registra decisões com alternativas (WYSIWYG rejeitado; GFM fora de escopo), riscos (desfazer, seleção, `execCommand` obsoleto) e plano de rollback, no padrão das changes anteriores. Diagrama desnecessário.

## 5. Ponte entre produto e técnico
Veredito: OK
- O pedido ("usuário não precisa saber a sintaxe, inclusive o bloco de combate") virou barra com ações, atalhos, botão de combate só onde é reconhecido e acessibilidade. Não promete o que a leitura não renderiza (código, tabela) — só falta alinhar a lista de campos ao que é de fato renderizado (item 1).

## Bloqueantes antes de implementar
- nenhum (as duas ressalvas da dimensão 1 devem ser resolvidas nos artefatos antes do apply: lista real de campos e caminho único de aplicação do texto)
