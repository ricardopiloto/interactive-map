## Why

Os campos de texto rico (Notas de Preparo, Resumo, descrições) aceitam markdown, mas o usuário só vê um campo de texto vazio e precisa saber de cabeça a sintaxe de negrito, listas, títulos, citações e links. Isso piora com o bloco de combate (`> [!combate]` com uma lista de campos), cujo formato exato é fácil de errar e que só funciona se digitado certo.

## What Changes

- Novo componente de campo de texto com **barra de formatação** sobre o `Textarea` atual: botões que inserem ou envolvem a sintaxe markdown na seleção (negrito, itálico, título, lista com marcadores, lista numerada, citação, link).
- Botão **Bloco de combate**, que insere o modelo completo do bloco (título e os quatro campos em lista) e só aparece nas Notas de Preparo, onde o bloco é reconhecido na leitura.
- Atalhos de teclado para negrito e itálico, rótulos acessíveis e textos em pt-BR e en.
- A barra passa a ser usada em todos os campos que a leitura exibe como texto rico: Notas de Preparo e Resumo da sessão, descrições de local, de personagem (no mapa e em Relações), de evento e de item, e notas mecânicas do personagem. Fios, notas de vínculo e o resumo de arco, que a leitura não exibe como markdown, ficam como estão.
- O que é salvo continua sendo o mesmo markdown em texto: sem mudança de banco, API, renderização ou visibilidade.

## Capabilities

### New Capabilities
- `editor-texto-formatado`: barra de formatação dos campos de texto rico, com as ações de formatação, o modelo do bloco de combate e o comportamento de seleção, teclado e acessibilidade.

### Modified Capabilities
<!-- nenhuma: o bloco de combate segue o formato já definido em `bloco-combate-preparo` -->

## Impact

- Frontend: componente novo em `frontend-v2/src/components/codex/` (barra e funções puras de transformação de texto), substituição do `Textarea` nos editores `SessionEditor.tsx`, `MapEditors.tsx` (`LocalEditor`, `NpcEditor`), `RelationEditors.tsx` (`PersonagemEditor`) e `routes/cronologia.tsx` (evento e item), textos em `locales/{pt-BR,en}/comum.json`.
- Sem mudança no backend, na API, no banco, no renderizador ou em dependências.
