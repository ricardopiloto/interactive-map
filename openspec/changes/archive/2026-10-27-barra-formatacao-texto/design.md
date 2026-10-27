# Design

## Context

- Os campos de texto rico são `<Textarea>` controlados (`components/ui/textarea.tsx`), em `SessionEditor.tsx` (Notas de Preparo, Resumo), `MapEditors.tsx` (`LocalEditor` e `NpcEditor`, descrição de local e de personagem), `RelationEditors.tsx` (`PersonagemEditor`, descrição e notas mecânicas) e `routes/cronologia.tsx` (descrição de evento e de item). Cada um faz `onChange={(e) => onChange({ campo: e.target.value })}`. Fios (`FiosList`, `FiosReview`), notas de vínculo e o resumo de arco (`cronologia.tsx`) também usam `Textarea`, mas a leitura não os exibe como markdown (nenhum deles passa por `RichContent`), então ficam sem a barra.
- A leitura usa `react-markdown` + `rehype-sanitize` (CommonMark, sem GFM); o callout de combate só é reconhecido com a prop `callouts`, ligada na leitura das Notas de Preparo (spec `bloco-combate-preparo`).
- `SessionEditor` guarda uma ref do campo de Notas de Preparo (`notasPreparoRef`) para foco e posição do cursor; essa ref precisa continuar funcionando.
- Hoje não há nenhuma ajuda de formatação nem pré-visualização. Textos em `locales/{pt-BR,en}/comum.json`.

## Goals / Non-Goals

**Goals:**

- Dar ao usuário botões para as formatações que a leitura realmente renderiza, inclusive o bloco de combate com o formato certo.
- Manter o valor salvo como markdown simples e o campo como `textarea` (sem mudar o que já está salvo).
- Funcionar por teclado, em telas estreitas e nos dois idiomas.

**Non-Goals:**

- Editor visual (WYSIWYG) ou pré-visualização ao lado do campo.
- Formatações que a leitura não renderiza (código, tachado, tabela, linha horizontal); isso exigiria habilitar GFM e mudaria a exibição de todo texto rico.
- Barra em fios narrativos, notas de vínculo e resumo de arco (não exibidos como markdown).
- Mudar o renderizador, a API, o banco ou a IA.

## Decisions

1. **Barra sobre o `textarea` existente, não editor visual.**
   Um componente novo `MarkdownField` renderiza o rótulo, a barra e o `Textarea` e recebe `label`, `labelClassName`, `value`, `onValueChange(texto)` e as demais props do textarea (inclusive `ref` repassada). Os editores substituem o bloco `<label><span/>…<Textarea/></label>` por `<MarkdownField label=…>`; o resto do formulário não muda.
   **Rótulo:** hoje o `Textarea` fica dentro de um `<label>` envolvente; com botões dentro desse `<label>`, o rótulo passaria a apontar para o primeiro botão (primeiro descendente rotulável). Por isso o `MarkdownField` gera um `id` com `useId`, renderiza `<label htmlFor={id}>` e o `textarea id={id}` como irmãos da barra (que fica fora do `<label>`), com `aria-controls={id}` na barra. O rótulo e o nome acessível do campo ficam iguais aos de hoje, e testes por rótulo continuam achando o `textarea`. *Alternativa:* editor WYSIWYG — rejeitada pelo produto (biblioteca pesada, conversão de/para markdown, risco com notas antigas).

2. **Transformações em funções puras.**
   Um módulo `markdown-format.ts` expõe `aplicar(acao, texto, inicio, fim) → { texto, inicio, fim, trocaInicio, trocaFim, trecho }` para cada ação (negrito, itálico, título, lista, lista numerada, citação, link, combate): além do texto e da seleção finais, devolve a menor faixa `[trocaInicio, trocaFim)` do texto original que muda e o `trecho` que a substitui. O componente só lê a seleção do `textarea`, chama a função e aplica o resultado, o que torna toda a lógica testável sem DOM. Regras: ações em linha (negrito, itálico, link) envolvem a seleção ou inserem um exemplo selecionado e alternam se já envolvida; ações em bloco (título `## `, `- `, `1. `, `> `) operam no início de cada linha tocada pela seleção e alternam se todas já têm o prefixo (para lista numerada, qualquer prefixo `\d+\. ` conta como já aplicado; ao aplicar usa-se `1. ` em todas as linhas, e o markdown renumera).

3. **Modelo do bloco de combate no idioma da interface.**
   O botão insere, em linhas próprias com linha em branco antes e depois:
   ```
   > [!combate] Título do combate
   > - **Inimigos:** 
   > - **Ambiente:** 
   > - **Tática ou gatilho:** 
   > - **Desfecho:** 
   ```
   com o título de exemplo selecionado, ou a primeira linha da seleção como título. Rótulos e exemplo vêm de `comum.json` (pt-BR/en); o marcador `[!combate]` é fixo, e a leitura não depende dos rótulos. O botão só existe quando o campo é o de Notas de Preparo (prop `combat` do `MarkdownField`, ligada apenas lá), porque é o único lugar em que o bloco é reconhecido na leitura.

4. **Um único caminho de aplicação, preservando o desfazer quando possível.**
   O `onChange` do próprio `textarea` é a única fonte de `onValueChange`. Para aplicar uma ação, o componente seleciona a faixa `[trocaInicio, trocaFim)` e chama `document.execCommand("insertText", false, trecho)`; o navegador dispara o evento `input`, que passa pelo `onChange` e atualiza o formulário uma vez, mantendo o Ctrl+Z nativo. Se `execCommand` não existir ou retornar `false`, ou se o valor do campo não mudou depois da chamada, o componente aplica `texto` direto por `onValueChange`; esse ramo é exclusivo, nunca roda depois de um `execCommand` bem-sucedido. Em seguida o foco permanece no campo e a seleção é restaurada para o trecho editável (exemplo inserido ou endereço do link) no frame seguinte.
   **Foco ao clicar:** os botões chamam `preventDefault()` em `onMouseDown`/`onPointerDown` (o clique não tira o foco do `textarea`, inclusive no toque) e o componente chama `textarea.focus()` antes de aplicar, já que `execCommand` só age no elemento focado.

5. **Teclado e acessibilidade.**
   Barra com `role="toolbar"` e nome acessível; botões `type="button"` (não enviam o formulário, que muitas vezes está dentro de `Dialog`), com nome acessível e dica (`title`) com o atalho. Atalhos Ctrl/Cmd+B e Ctrl/Cmd+I tratados no `onKeyDown` do campo. Botões desabilitados quando o campo está desabilitado. Todos os botões entram na ordem de Tab, sem navegação por setas nesta etapa.

6. **Layout.**
   Barra em linha com quebra (`flex-wrap`), botões só com ícone (lucide-react: `Bold`, `Italic`, `Heading2`, `List`, `ListOrdered`, `Quote`, `Link as LinkIcon`, `Swords`) e alvos de toque confortáveis; sem rolagem horizontal até 320 px. Borda e fundo seguem os tokens existentes; a barra fica visualmente ligada ao campo.

## Risks / Trade-offs

- **[Desfazer nativo]** `execCommand` é obsoleto, mas é a única forma de preservar o desfazer do navegador em campos controlados. Mitigação: usar com fallback exclusivo; sem ele, a ação funciona mas o Ctrl+Z desfaz mais do que a ação. Aceito.
- **[Caminho principal não coberto no jsdom]** O ambiente de teste (`jsdom`) não tem `execCommand`, então os testes automáticos exercitam o fallback e as funções puras; o caminho com `execCommand` e o Ctrl+Z são verificados manualmente (task 4.2).
- **[Campo controlado e seleção]** Atualizar o valor reposiciona o cursor. Mitigação: restaurar a seleção após o render e testar o comportamento com a ref do `SessionEditor` (foco/cursor) intacto.
- **[Formatação que a leitura não mostra]** A barra só oferece o que `react-markdown` sem GFM renderiza; títulos usam `##` porque a leitura estiliza `h2`. Outros níveis ficam fora para evitar títulos sem estilo.
- **[Muitos pontos de troca]** Nove campos em quatro arquivos. Mitigação: troca mecânica do bloco rótulo + `Textarea` por `MarkdownField label=…`; o rótulo e o nome acessível ficam idênticos, os testes existentes por rótulo continuam válidos e nada muda no que é enviado à API.
- **[Teste de campos existentes]** Testes que localizam o campo por rótulo continuam válidos; testes que dependam da estrutura exata do DOM serão ajustados sem enfraquecer asserções.

## Migration Plan

Só frontend; sem migração. Deploy normal. Rollback: reverter a troca nos editores (o componente novo pode permanecer sem uso).

## Open Questions

- Se o botão de link deve pedir o endereço em um pequeno popover em vez de inserir `https://` selecionado (ponto de partida: inserir com o endereço selecionado, sem popover).
- Se vale incluir pré-visualização mais adiante (fora desta change).
