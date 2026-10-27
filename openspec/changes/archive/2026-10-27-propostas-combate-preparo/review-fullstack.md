# Review — Desenvolvedor Fullstack

**Change:** propostas-combate-preparo
**Data:** 2026-10-27
**Veredito geral:** Aprovado com ressalvas

## 1. Desenvolvimento do backend
Veredito: Atenção
- Implementável: a mudança é só texto nos blocos `rascunho_sessao` e `resumo_sessao` de `BLOCOS_TIPO` e na regra 8 de `PROMPT_BASE` (`motor_ia_assistente.py`). Sem modelo, rota ou migração.
- **`PROMPT_VERSAO` não é consumida em lugar nenhum** (só definida em `motor_ia_assistente.py:35`, sem uso em código nem testes). A task 1.1 "subir para 2" não tem efeito observável. — Recomendação: remover essa parte da task 1.1 (ou registrar a versão no log de uso, o que seria escopo novo).
- `test_prompts_fixos` (`test_motor_ia_assistente.py`) exige que o prompt não tenha `---`, `[[` nem chaves `{...}`. O exemplo do bloco de combate não pode usar essas sequências; um exemplo com `{}` ou `---` quebraria o teste. — Recomendação: citar no design/tasks essa restrição ao escrever o exemplo no prompt.
- Os cenários "sem combates quando o mestre pede" e "sem estatísticas" não são testáveis com o cliente de IA mockado; só dá para afirmar que o prompt contém a instrução. — Recomendação: escrever a task 1.3 e os cenários nesses termos.

## 2. Desenvolvimento do frontend
Veredito: Atenção
- **O formato multilinha não renderiza como o design supõe.** `RichContent` usa `react-markdown` + `rehype-sanitize` sem `remark-breaks`: linhas `>` consecutivas viram um único parágrafo, então título e campos (Inimigos, Ambiente, ...) sairiam numa linha corrida. Como `[!combate] Título` fica no mesmo nó de texto da linha seguinte, extrair o título exige dividir o primeiro nó de texto em `\n`. — Recomendação: adotar campos em lista (`> - **Inimigos:** ...`) ou linhas `>` em branco, usar o mesmo formato no prompt e nos testes, e implementar o título lendo o primeiro filho de texto do primeiro `p`.
- Implementação viável via `components.blockquote` do `react-markdown` v10; o ícone `Swords` existe no `lucide-react` instalado.
- O rótulo padrão deve ir em `locales/{pt-BR,en}/comum.json` (namespace que `RichContent` já usa, `useTranslation("comum")`), não em `sessoes.json`; a task 2.3 não diz onde.
- Tokens: além de `--combat` em `:root` e no tema escuro, é preciso mapear `--color-combat` no `@theme inline` (como `--color-seal`), senão as classes Tailwind não existem.
- `RichContent` é usado em itens, relações, cronologia e locais; o callout passa a ser reconhecido em todos. Não vaza dado, mas o spec fala só de Notas de Preparo. — Recomendação: decidir entre reconhecimento global ou prop opt-in e escrever no design.
- Mobile: já previsto (quebra de palavras, sem rolagem horizontal).

## 3. Deploy e operação
Veredito: OK
- Sem variável, porta ou serviço novo; deploy único de backend e frontend; rollback por reversão.
- Operação: o pytest completo trava no sandbox do codex (`TestClient`); a verificação das tasks 1.3 e 3.1 deve ser rodada fora dele.

## 4. Qualidade de código
Veredito: Atenção
- A task 2.4 testa os casos certos (título, sem título, caixa, citação comum, HTML bruto); falta um teste com o texto multilinha realmente produzido pelo formato definido, que é onde o risco está.
- Falta cenário de borda: bloco de combate dentro de lista ou com `>` aninhado, e `[!combate]` no meio da citação (não na primeira linha) deve continuar citação comum.
- Verificação manual (3.2) cobre claro, escuro e 320 px; adequado.

## 5. Execução das decisões arquiteturais
Veredito: OK
- tasks seguem as decisões 1–5 do design. Nenhuma decisão reaberta.

## Bloqueantes antes de implementar
- nenhum

## Limitações técnicas a reportar ao Arquiteto
- Soft line breaks do markdown padrão desfazem o formato multilinha proposto (precisa de decisão de formato no design).
- `PROMPT_VERSAO` não tem consumidor; a decisão de subir a versão é inócua.
- Escopo global do renderizador de `blockquote` em todos os usos de `RichContent`.
