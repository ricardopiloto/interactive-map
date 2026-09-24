# Research: Alinhamento da Linha do Tempo ao protótipo

## Escopo e baseline

- A tela atual está em `frontend/src/pages/LinhaTempoPage.tsx` e já usa `CodexHeader`, `FormDrawer`, `MarkdownField`, `MarkdownSafe`, `EmptyState`, botões e diálogos compartilhados.
- Hoje a lista usa expansão por título para ambos os papéis. O protótipo mantém resumo expansível para mestre e mostra todos os detalhes diretamente para jogador.
- Os subtítulos por papel e o aviso ao final da timeline do jogador não existem hoje.
- O formulário mestre já oferece CRUD, associação de locais/personagens/sessão e visibilidade. Deve manter os componentes atuais, sem copiar literalmente o modal do protótipo.
- Cores, tipografia, superfícies e espaços existentes devem continuar derivados dos tokens e padrões globais; não importar valores de estilo do HTML de referência.

## Decisões

### 1. A separação de interação segue o papel do usuário

**Decision**: Mestre mantém os cards recolhíveis e expansíveis. Jogador vê descrição e associações diretamente, sem controle de expansão. Mostrar subtítulos distintos; mostrar o lembrete de eventos ainda não revelados depois da lista do jogador quando houver eventos.

**Rationale**: Corresponde às duas vistas do protótipo e reaproveita a interação de expansão que já existe na visão do mestre.

**Alternatives considered**: Expandir cards para ambos os papéis (comportamento atual), que não corresponde à vista de jogador desenhada; abrir todos os detalhes também para mestre, que não corresponde ao resumo com chevron do protótipo.

### 2. Resolver nome/número de sessão no cliente com APIs existentes

**Decision**: Associar `evento.sessao_id` ao catálogo de sessões carregado por `campaignApi.listSessoes()` na visão de jogador e por `adminApi.listSessoesAdmin()` na visão de mestre. Mostrar número e título da sessão no detalhe do card. Se não houver associação encontrada no catálogo público, omitir o metadado. O catálogo público exclui sessões não visíveis.

**Rationale**: O DTO atual de Evento traz `sessao_id`; o endpoint de sessões já fornece número e título, filtrando sessões ocultas para jogadores. Isso atende à identificação contextual sem ampliar o contrato HTTP nem expor títulos protegidos.

**Alternatives considered**: Acrescentar resumo de sessão ao DTO/API de Evento, o que cria alteração backend desnecessária; não carregar sessões para jogador, o que impossibilita exibir o metadado do protótipo.

### 3. Ocultar mês na interface sem descartar dados existentes

**Decision**: Mostrar ano e rótulo de era, sem mês; não incluir mês editável no formulário deste fluxo. Em edição, manter o valor `mes` original no draft e enviá-lo sem alteração. Para novos eventos, continuar enviando `null` para mês. Preservar a ordenação atual do serviço (`ano`, `mes` quando definido, sessão, id).

**Rationale**: O protótipo e a spec 144 usam ano/era como representação temporal, enquanto o modelo e os dados atuais já suportam mês. Ocultar o campo sem preservar o valor apagaria informação ao salvar edições. A ordenação atual é um contrato já usado pelo backend e manterá o comportamento estável.

**Alternatives considered**: Remover mês do modelo/API ou alterar sua ordenação, que aumenta o escopo e pode destruir dados ou reordenar eventos já apresentados.

### 4. Preservar shell e identidade visual existentes

**Decision**: Continuar usando `CodexHeader`, `FormDrawer`, controles compartilhados, classes locais de `LinhaTempoPage.css`, tokens CSS e namespaces i18n existentes.

**Rationale**: O pedido usa o protótipo como referência funcional e pede explicitamente a identidade visual atual.

**Alternatives considered**: Reproduzir modal, fonte, cor e dimensões explícitos do protótipo, o que criaria uma superfície visual divergente.

## Contratos e privacidade existentes

- Leitura de Eventos: `GET /api/c/{slug}/eventos`; mestre usa `GET /api/c/{slug}/admin/eventos`.
- Leitura de sessões: `GET /api/c/{slug}/sessoes` retorna apenas sessões visíveis; leitura administrativa usa `/admin/sessoes`.
- A lista pública de Eventos já exclui eventos ocultos e referências públicas a Local/Personagem já filtram associações ocultas.
- Testes existentes relevantes: `backend/tests/test_eventos_isolation.py`, `test_eventos_visibility.py`, `test_eventos_crud.py`; `frontend/e2e/` usa Playwright.
- Não foram identificadas clarificações em aberto para o plano.
