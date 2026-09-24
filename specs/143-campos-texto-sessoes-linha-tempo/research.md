# Research: Campos de texto padronizados em Sessões e Linha do Tempo

**Data**: 2026-09-24  
**Escopo**: definir “padrão visual da aplicação” como o modelo concreto dos campos do formulário de criação de Novo Codex.

## Referência visual atual

Os campos de texto de `NovoCodexPage` usam altura mínima de 44 px, padding vertical/horizontal de 10/12 px, borda sutil, raio médio, fundo de superfície secundária, tipografia herdada e foco com outline de 2 px afastado 2 px. Cores e dimensões vêm dos tokens CSS existentes. O estilo está hoje definido localmente em `frontend/src/pages/NovoCodexPage.css`.

Os campos genéricos `Input`/`Textarea` (`ui-input`) têm atualmente outras dimensões e propriedades: altura mínima de 40 px, padding de 6/10 px, fundo de superfície, raio pequeno e foco sem afastamento. Logo, usar o `Input` genérico sem uma variante não satisfaz a clarificação do usuário.

## Decisão 1: um modelo visual compartilhado com Novo Codex como referência

**Decision**: Extrair o estilo de campo de Novo Codex para uma variante reutilizável em `frontend/src/components/ui/ui.css`; fazer Novo Codex e os campos abrangidos nas duas páginas usarem essa variante. Manter cores ligadas aos tokens atuais.

**Rationale**: Evita duplicar a regra local e mantém os três formulários iguais, mesmo que os campos genéricos do produto tenham intencionalmente outra densidade.

**Alternatives considered**:
- Aplicar o `ui-input` genérico já disponível: rejeitado, pois sua altura, padding, fundo, raio e foco são diferentes do campo de Novo Codex.
- Copiar regras específicas para `SessoesPage.css` e `LinhaTempoPage.css`: rejeitado, pois manteria três fontes de verdade sujeitas a divergência.
- Redesenhar todos os inputs genéricos do produto: rejeitado, pois alteraria formulários fora do escopo.

## Decisão 2: aplicar o padrão também à escrita Markdown, preservando o editor

**Decision**: `MarkdownField` deve permitir que os formulários de Sessões e Linha do Tempo apliquem a variante visual ao textarea de escrita. A prévia Markdown, abas, conteúdo, placeholders e fluxo de edição continuam iguais.

**Rationale**: Resumo e descrição são caixas de texto abrangidas pela solicitação, embora sejam editadas por um componente compartilhado.

**Alternatives considered**:
- Alterar o estilo padrão de todo `MarkdownField`: rejeitado, porque outros formulários usam esse componente e não estão no escopo.
- Alterar apenas título e rótulos de uma linha: rejeitado, pois deixaria resumo e descrição visualmente divergentes.

## Decisão 3: paridade visual sem mudança de domínio

**Decision**: Aplicar a variante às caixas textuais especificadas em Novo Codex, Sessões e Linha do Tempo. Preservar a área, as labels e o layout externos dos formulários, bem como os estados normal/foco e compatibilidade dos temas.

**Rationale**: A referência serve para o controle em si; a solicitação não pede que formulários Sessões/Linha do Tempo adotem o wizard ou a composição de página de Novo Codex.

**Alternatives considered**:
- Copiar a página ou o layout do wizard Novo Codex: rejeitado, pois excede a caixa de texto e redesenharia os formulários.

## Implementation surface

- `frontend/src/components/ui/ui.css`: variante visual reutilizável com as propriedades/token da referência.
- `frontend/src/pages/NovoCodexPage.tsx` e `NovoCodexPage.css`: migrar os campos existentes para a variante e remover regra local duplicada, sem alterar a aparência.
- `frontend/src/components/forms/MarkdownField.tsx`: aceitar classe opcional para o textarea de escrita.
- `frontend/src/pages/SessoesPage.tsx`: aplicar a variante a título, rótulo de data e resumo Markdown.
- `frontend/src/pages/LinhaTempoPage.tsx`: aplicar a variante a título, rótulo de era e descrição Markdown.

Não há alteração de dados, validação, API, backend, dependência ou copy/i18n.
