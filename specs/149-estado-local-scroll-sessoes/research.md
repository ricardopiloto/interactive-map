# Research: Estado de locais e rolagem de sessões

**Feature**: [149-estado-local-scroll-sessoes](spec.md)
**Data**: 2026-09-24

## Decisões

### Estado Conhecido/Visitado de um Local

**Decisão:** persistir um estado explícito do Local com os valores `conhecido` e `visitado`, independente do rótulo textual de sessão (`data_sessao`) e da cor personalizada do marcador (`cor_pin`). A edição continua usando o acesso que já permite alterar o Local. Os dados de leitura e escrita dos endpoints existentes devem carregar o estado.

**Racional:** hoje os botões “Visitado” e “Conhecido” do formulário alteram somente a cor do pin, mas o Mapa e o painel calculam a situação a partir de `data_sessao`. A tela, portanto, não persiste uma escolha semântica de estado. `data_sessao` é texto livre e `cor_pin` é apresentação personalizável; nenhum dos dois deve servir como substituto do estado.

**Migração e valores existentes:** o estado padrão de novos Locais é `conhecido`. Para preservar a interpretação atualmente apresentada aos usuários, a migração inicial converte registros com `data_sessao` preenchido em `visitado`, e registros sem esse texto em `conhecido`. A migração de campanha deve usar Alembic com batch mode para SQLite. O downgrade remove o campo; antes de downgrade após novos estados terem sido gravados, restaurar backup é necessário para preservar essas alterações que o schema antigo não representa.

**Alternativas consideradas:**

- Continuar derivando o estado de `data_sessao`: rejeitada porque impede marcar como conhecido um local cujo rótulo de sessão precisa ser mantido.
- Derivar o estado de `cor_pin`: rejeitada porque uma cor é configurável e não identifica de forma confiável um estado semântico.
- Guardar estado individual por usuário: rejeitada como escopo inicial; a especificação assume o estado compartilhado da campanha, consistente com a indicação atual do Mapa.

### Rolagem da lista de Sessões

**Decisão:** garantir um caminho de rolagem vertical previsível para alcançar todas as entradas quando a lista ultrapassar a área visível, em desktop e mobile. A validação deve primeiro identificar o elemento que realmente recebe a rolagem nos viewports do produto; não assumir que uma barra visível significa que o documento está rolável. Preferir o fluxo normal da página quando ele funcionar; caso a estrutura da tela restrinja esse fluxo, a área da lista deve oferecer rolagem própria sem cortar seu conteúdo.

**Racional:** a lista principal em `SessoesPage.tsx` é renderizada sem paginação ou virtualização. O CSS da página define altura mínima, mas não limita nem cria uma área de rolagem para a lista. A regra `overflow: auto` existente em `SessoesPage.css` se aplica apenas aos checkboxes do formulário. O código inspecionado não prova a causa do relato: é necessário testar o layout executado em viewport desktop e mobile.

**Validação recomendada:** criar dados de teste suficientes para exceder a altura da janela e confirmar que a primeira e a última sessão ficam visíveis em sequência após rolagem por mouse/trackpad, teclado e touch compatível com o viewport. Verificar altura de conteúdo e área rolável na inspeção E2E; a scrollbar pode ser visualmente ocultada pelo sistema operacional.

**Alternativas consideradas:**

- Aumentar a altura ou reduzir o conteúdo até evitar rolagem: rejeitada porque a quantidade de sessões cresce e o histórico deve permanecer acessível.
- Fixar imediatamente uma lista aninhada com altura máxima: não escolhida sem comprovar que o scroll do documento é a causa; pode criar duas regiões de rolagem e prejudicar o comportamento mobile.

## Padrões do projeto consultados

- O schema/modelo `Local` já contém `data_sessao` e `cor_pin`, mas não possui estado explícito. Endpoints administrativos de campanha criam e atualizam o Local; a representação pública e administrativa usa o schema `LocalRead`.
- A migração de campanha mais recente no workspace é `006_campaign_state.py`; a nova migração deve sucedê-la após confirmar a revisão-base no checkout integrado.
- O modelo de campanha já usa um banco SQLite por campanha, logo o novo estado deve permanecer nesse banco e ser coberto por teste de isolamento.
- A tela principal de sessões é `SessoesPage`, servida pela rota `/c/:slug/sessoes`; o E2E atual cobre essa página em qualidade visual/acessibilidade, mas não cria uma lista longa nem verifica a chegada à última sessão.
- O projeto já usa pytest, Playwright, React, TypeScript, FastAPI, SQLModel, Alembic, SQLite e i18next. A feature não requer dependências novas.
