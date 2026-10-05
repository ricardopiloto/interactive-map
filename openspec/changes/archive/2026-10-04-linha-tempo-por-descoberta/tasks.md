# Tasks

## 1. Entidade Item (backend)

- [x] 1.1 Criar model `Item` (nome obrigatório, descrição opcional, visibilidade, campanha) seguindo o padrão de `Evento`; verificar com teste de criação/leitura de item mínimo
- [x] 1.2 Criar schemas `ItemCreate`/`ItemUpdate`/`ItemRead`; verificar com teste de validação rejeitando item sem nome
- [x] 1.3 Criar migração versionada para a tabela `Item` e as tabelas de vínculo `Item↔Sessao`/`Item↔Evento` (equivalentes a `EventoLocalLink`/`EventoNpcLink`); verificar aplicando a migração localmente e confirmando o schema resultante
- [x] 1.4 Criar router admin (criar/editar/excluir item, associar/desassociar sessões e eventos) com autorização restrita ao mestre; verificar com testes de API cobrindo CRUD completo e rejeição de jogador
- [x] 1.5 Criar router público/de leitura para itens respeitando visibilidade (`visivel_para_todos`); verificar com teste de API confirmando que item/associação oculta não é retornada para jogador
- [x] 1.6 Garantir que excluir um item remove apenas o item e suas associações, sem afetar sessões/eventos; verificar com teste de API confirmando sessão/evento intactos após exclusão do item associado

## 2. Agregação de primeira aparição e reaparições (backend ou client-side)

- [x] 2.0 Adicionar o valor de opt-in do modo "Por descoberta" em `Campanha.modulos_ativos` (ex. `"linha_tempo_descoberta"`, independente de `"linha_tempo_arcos"` e `"ia_arcos"`) e um endpoint para o mestre ligar/desligar, seguindo o mesmo padrão de `set_visibilidade`/`set_unidade_distancia` (`backend/app/services/campanha_admin.py`); verificar com teste de API confirmando que jogador não consegue alterar o valor e que o modo some do retorno da API quando desabilitado
- [x] 2.1 Implementar a agregação de primeira aparição (MIN cronológico) para Personagens e Locais a partir de `SessaoLocalLink`/`SessaoNpcLink`/`EventoLocalLink`/`EventoNpcLink` já existentes, incluindo a variante restrita a sessões/eventos visíveis (perspectiva do jogador); verificar com testes cobrindo entidade com aparição em sessão oculta anterior a uma visível
- [x] 2.2 Estender a agregação para incluir Itens (via os vínculos criados na seção 1); verificar com teste cobrindo item associado a sessão e a evento em datas diferentes
- [x] 2.3 Implementar o cálculo de reaparições (todas as aparições após a primeira, com intervalo desde a anterior, sem limiar que oculte reaparições) para os quatro tipos; verificar com teste cobrindo intervalo curto e intervalo longo
- [x] 2.4 Implementar a agregação de Facções a partir de `Personagem.faccao`, normalizando trim + case-insensitive e preservando a grafia mais legível para exibição; verificar com teste cobrindo variações de grafia agrupadas e facção vazia ignorada
- [x] 2.5 Implementar o alerta de inconsistência (personagem em sessão visível com sessão oculta anterior do mesmo personagem), computado sob demanda na gestão de sessão e no modo "Por descoberta" em perspectiva de mestre; verificar com teste confirmando que o alerta aparece sem bloquear a gravação nem alterar visibilidade

## 3. Gestão de Itens no admin (frontend)

- [x] 3.1 Criar tela/formulário de CRUD de Item (nome, descrição, visibilidade) reaproveitando os componentes já usados para `Evento`; verificar manualmente criando, editando e excluindo um item no browser
- [x] 3.2 Adicionar seleção de sessões e eventos na gestão de Item, reaproveitando o padrão de `EventoDraft.local_ids`/`personagem_ids`; verificar manualmente associando um item a uma sessão e a um evento e confirmando a persistência após reload
- [x] 3.3 Garantir que a gestão de Itens não oferece ações de escrita para jogador; verificar com teste e2e logado como jogador

## 4. Modo "Por descoberta" na Linha do Tempo (frontend)

- [x] 4.0 Adicionar o toggle de habilitação do modo "Por descoberta" na tela de configuração da campanha (`PainelPage.tsx`, mesmo padrão dos toggles de `visibilidade`/`unidade_distancia` e do toggle equivalente em `linha-tempo-por-arcos`), visível apenas ao mestre; verificar manualmente que o toggle persiste após recarregar e que um jogador não o vê
- [x] 4.1 Adicionar a opção "Por descoberta" ao segmented control de modos (compartilhado com a capability `linha-tempo-por-arcos`), mostrando-a apenas quando o opt-in da tarefa 4.0 estiver ativo; verificar manualmente a alternância entre os modos habilitados, e que "Por descoberta" não aparece quando desabilitado
- [x] 4.2 Implementar a lista agrupada por tipo (Personagens/Locais/Facções/Itens) ordenada por primeira aparição, com indicação de reaparições e intervalo; verificar manualmente com entidades de aparição única e com múltiplas reaparições
- [x] 4.3 Implementar o filtro por tipo (um tipo ou Todos); verificar manualmente alternando entre os quatro tipos e "Todos"
- [x] 4.4 Implementar o estado vazio "sem associações de descoberta" com caminho de volta ao modo cronológico; verificar manualmente numa campanha sem associações
- [x] 4.5 Garantir que itens/aparições ocultos não aparecem para jogador em nenhuma superfície do modo (lista, detalhe, contagem); verificar com teste e2e logado como jogador confirmando ausência total de vazamento (nome, descrição ou contagem)
- [x] 4.6 Exibir o alerta de inconsistência (sessão oculta anterior) apenas na perspectiva de mestre; verificar manualmente como mestre e confirmar ausência do alerta na perspectiva de jogador

## 5. Internacionalização

- [x] 5.1 Adicionar todas as strings novas (rótulos de tipo, filtros, estado vazio, CRUD de Item, alerta de inconsistência, toggle de opt-in na configuração da campanha) em pt-BR e en; verificar alternando o idioma da interface e confirmando ausência de chaves não traduzidas

## 6. Isolamento e testes de integração

- [x] 6.1 Adicionar Item e suas associações à matriz de testes de isolamento entre campanhas já existente no produto; verificar com os testes de isolamento passando para itens e vínculos
- [x] 6.2 Executar o quickstart manual descrito no PRD/BKLG-039 (quatro tipos, temas claro/escuro, mobile, estados vazios, filtros, perspectiva mestre vs. jogador) e registrar o resultado
  - Resultado (Chromium em `http://localhost:5173`, dados isolados em `/tmp/codex-descoberta-ui`, 2026-10-04): quatro tipos na mesa `mesa` (Aldo com várias reaparições, Recruta com uma aparição, Ponte com intervalo de 3 sessões, Guarda da Cidade, item criado e depois excluído); filtros Todos/Personagens/Locais/Facções/Itens; estado vazio em `vazia` com volta à linha cronológica; tema claro `rgb(243, 236, 217)` e escuro `rgb(25, 22, 16)`; viewport 390×844 sem overflow horizontal e com filtros quebrando de linha; mestre vê alerta e sessão oculta, perspectiva pública não. Idioma alternado pt-BR/en sem chaves cruas.
