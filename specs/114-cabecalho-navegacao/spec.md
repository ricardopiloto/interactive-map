# Feature Specification: Cabeçalho e navegação (reconstrução)

**Feature Branch**: `114-cabecalho-navegacao`

**Created**: 2026-09-22

**Status**: Draft

**Input**: User description: "Reconstrução estrutural do cabeçalho. Estrutura do protótipo CampaignLayout (marca + seletor de campanha à esquerda; abas Mapa/Relações/Rota/Sessões centradas sublinhadas; à direita Modo edição em pílula preenchida, seletor de tema, avatar/menu). Comparar e substituir CodexHeader/CampaignBottomNav atuais. Manter dados e rotas reais, i18n, useEditMode. Critério-chave: captura do cabeçalho em /c/wfrp bate visualmente com o protótipo sem diferença a olho nu; só a casca muda."

**Depends on**: Spec 110 (paridade de tokens — `--radius-full`, acento, superfícies). Specs 111–113 podem coexistir; esta não altera género nem revelação.

**Phase**: Paridade estrutural com o protótipo (`frontend-next`) — casca de navegação da mesa.

## Constitution *(constraints; not implementation)*

- Isolation (I): Nenhuma superfície HTTP nova de dados de campanha; só navegação UI. Matriz de isolamento N/A salvo se surgir rota de API (não prevista).
- Testes primeiro (II): UI de polimento — quickstart/captura visual e verificação manual de abas/toggle bastam; sem mudança de auth/schema.
- Produção legada (III): Corte já feito; MUST NOT tocar instâncias fora deste produto.
- Simplicidade (IV): Reutilizar permissões e preferências já existentes (Modo edição, tema Auto/Claro/Escuro, menu do utilizador); não inventar segundo sistema de sessão ou tema.
- i18n (V): Todas as strings novas de UI MUST ter chaves pt-BR e en; nomes de campanha (texto do mestre) MUST NOT ser traduzidos.
- Migrações (VI): N/A — sem schema.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cabeçalho da mesa alinhado ao protótipo (Priority: P1)

Um visitante (ou mestre) abre uma campanha (ex.: `/c/wfrp`). No ecrã largo vê, numa única barra: à **esquerda**, a marca «Campaign Codex» (leva à página inicial) agrupada com um **seletor** que mostra o **nome real** da campanha e abre um menu com «Minhas campanhas» e «Descobrir outras»; ao **centro**, quatro abas **Mapa / Relações / Rota / Sessões** com sublinhado na aba activa; à **direita**, o toggle de **Modo edição** como botão **preenchido em pílula** quando ligado (não texto fantasma), o controlo de **tema** (Auto / Claro / Escuro) e o menu do utilizador (avatar/entrada já existente). Em ecrã estreito, as abas principais passam para a **barra inferior** com as mesmas quatro destinações; a marca some do topo e o nome da campanha continua acessível no seletor.

**Why this priority**: Critério-chave visual — fecha o gap estrutural do cabeçalho vs. protótipo.

**Independent Test**: Abrir `/c/wfrp` desktop e móvel; comparar captura do cabeçalho (e barra inferior) com o layout do protótipo; confirmar links e toggle sem alterar quem pode editar.

**Acceptance Scenarios**:

1. **Given** campanha existente com nome conhecido, **When** o utilizador vê o cabeçalho em desktop, **Then** marca + seletor estão agrupados à esquerda, as quatro abas estão centradas com sublinhado na activa, e a direita mostra Modo edição (se elegível) + tema + menu do utilizador.
2. **Given** Modo edição permitido e desligado, **When** o utilizador liga o toggle, **Then** o controlo passa a aspecto de botão preenchido/pílula com cor de acento (não permanece como texto fantasma) e o restante comportamento de edição existente continua igual.
3. **Given** viewport estreita, **When** o utilizador navega a mesa, **Then** as quatro abas estão na barra inferior; a aba activa destaca-se; o topo não duplica a fila completa de abas.
4. **Given** captura lado a lado com o cabeçalho do protótipo na mesma campanha de referência, **When** um revisor compara posição, hierarquia e forma do toggle, **Then** não há diferença a olho nu nestes aspectos (copy de rótulos pode seguir i18n «Modo edição», não o texto mock «Modo mestre»).

---

### User Story 2 - Trocar de campanha sem sair do cabeçalho (Priority: P1)

O utilizador clica no nome da campanha no seletor. Abre-se um menu com destino para a lista das suas campanhas (Painel) e para descobrir outras (página inicial / catálogo). Escolher um destino navega como hoje essas páginas já fazem; o menu fecha.

**Why this priority**: O protótipo trata o nome como switcher; hoje é só um rótulo morto.

**Independent Test**: Com sessão autenticada e anónima, abrir o seletor e seguir cada opção; voltar à mesa pelo fluxo habitual.

**Acceptance Scenarios**:

1. **Given** cabeçalho com nome da campanha, **When** o utilizador abre o seletor, **Then** vê opções etiquetadas (i18n) para «minhas campanhas» e «descobrir outras».
2. **Given** menu aberto, **When** escolhe «minhas campanhas», **Then** vai ao Painel; **When** escolhe «descobrir outras», **Then** vai à página inicial / catálogo público.
3. **Given** menu aberto, **When** o utilizador navega para fora ou selecciona um item, **Then** o menu fecha sem deixar a barra num estado inconsistente.

---

### User Story 3 - Quatro abas, incluindo Rota, sem mudar permissões (Priority: P2)

O utilizador usa as abas Mapa, Relações, Rota e Sessões (topo ou barra inferior). Cada aba leva à superfície correspondente da campanha actual (slug real). Quem não tem permissão de edição **não** vê o toggle de Modo edição (mesma regra de hoje). Ocultar a aba Mapa quando a mesa não deve mostrar navegação de mapa (mesma regra de produto actual: sem imagem de mapa e fora de edição) continua válido.

**Why this priority**: Completa a paridade de navegação; Rota ainda não está no cabeçalho real.

**Independent Test**: Percorrer as quatro abas; confirmar URL/slug; repetir como anónimo e como membro elegível a editar.

**Acceptance Scenarios**:

1. **Given** campanha com mapa, **When** o utilizador activa cada aba, **Then** chega a Mapa, Relações, Rota e Sessões dessa campanha sem misturar slug.
2. **Given** utilizador sem direito de edição, **When** vê o cabeçalho, **Then** o toggle de Modo edição **não** aparece; as abas e o seletor continuam utilizáveis.
3. **Given** mesa em que a navegação de mapa deve ser omitida (mesma regra actual), **When** o cabeçalho/barra inferior renderizam, **Then** a aba Mapa fica oculta e as restantes permanecem.

---

### Edge Cases

- Nome de campanha muito longo: elipse no seletor; o título completo permanece acessível (tooltip ou equivalente).
- Menu do seletor aberto + redimensionar para móvel: menu fecha ou não cobre a barra inferior de forma a bloquear navegação.
- Tema Auto vs. Claro vs. Escuro: mudar no seletor do cabeçalho actualiza a preferência já persistida pelo produto; não introduz um quarto modo.
- Utilizador anónimo no seletor «Minhas campanhas»: pode ir ao Painel e encontrar o fluxo de login já existente (não inventar bypass).
- Aba Rota: a navegação e o contentor mínimo para não 404 fazem parte desta spec; o redesenho completo do conteúdo da página Rota (painel flutuante partilhado) fica para a spec de Relações/Rota seguinte.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O cabeçalho da mesa MUST apresentar três zonas estáveis: esquerda (marca + seletor de campanha), centro (abas), direita (Modo edição se elegível, tema, menu do utilizador).
- **FR-002**: A marca MUST rotular o produto (i18n) e ligar à página inicial; MUST NOT depender de texto hardcoded só num idioma.
- **FR-003**: O seletor MUST mostrar o nome real da campanha aberta e MUST oferecer destinos «minhas campanhas» e «descobrir outras» (rótulos i18n), com o mesmo significado de Painel e catálogo/início já usados no produto.
- **FR-004**: As abas MUST ser Mapa, Relações, Rota e Sessões, com indicação clara da activa (sublinhado / estado activo no protótipo); no móvel, as mesmas quatro MUST aparecer na barra inferior.
- **FR-005**: O toggle de edição MUST reutilizar a regra de elegibilidade e o estado já existentes (quem vê / o que o modo activa); só a apresentação muda para botão em pílula preenchida com acento quando ligado.
- **FR-006**: O cabeçalho MUST expor escolha de tema Auto, Claro e Escuro (seletor dedicado na zona direita ou controlo equivalente visível nessa zona), reutilizando a preferência já persistida; MUST NOT substituir por um interruptor binário que elimine Auto.
- **FR-007**: O menu do utilizador (entrar / sair / idioma e afins já existentes) MUST permanecer acessível na zona direita; MUST NOT remover fluxos de autenticação actuais.
- **FR-008**: Todas as strings novas de UI (seletor, abas em falta, estados do toggle se reescritos, aria-labels) MUST ter chaves pt-BR e en.
- **FR-009**: Comportamento de rotas e permissões existentes (Mapa, Relações, Sessões, quem pode editar, omissão condicional da aba Mapa) MUST permanecer; esta feature MUST NOT alterar ACL ou payloads de API.
- **FR-010**: A aba Rota MUST navegar para uma superfície de rota da campanha actual; se ainda não existir página dedicada, esta feature MUST fornecer um contentor mínimo que hospede o planeador de rotas já existente (sem redesenhar o conteúdo interno — isso é da spec seguinte).

### Key Entities

- **Cabeçalho da mesa**: Barra persistente da campanha aberta; organiza marca, troca de campanha, abas e controlos de modo/tema/utilizador.
- **Seletor de campanha**: Controlo que identifica a mesa actual e oferece atalhos para Painel e descoberta.
- **Barra inferior de abas**: Navegação principal em viewport estreita; espelho das abas do topo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Captura do cabeçalho (desktop) em `/c/wfrp` alinhada ao layout de referência do protótipo — posição esquerda/centro/direita, abas centradas, toggle em pílula quando ligado — sem diferença a olho nu nesses critérios para um revisor humano.
- **SC-002**: Em viewport estreita, as quatro destinações (Mapa, Relações, Rota, Sessões, respeitando omissão condicional de Mapa) estão na barra inferior e a activa é reconhecível em menos de 2 segundos numa revisão manual.
- **SC-003**: 100% das strings novas do cabeçalho/seletor/abas aparecem correctamente em pt-BR e en ao alternar idioma.
- **SC-004**: Utilizador sem direito de edição nunca vê o toggle; utilizador elegível activa/desactiva Modo edição e obtém o mesmo efeito prático de edição que antes (só muda a casca).
- **SC-005**: Nenhum destino de aba leva a campanha errada (slug da URL actual); seletor «minhas campanhas» / «descobrir outras» abre Painel e início/catálogo respectivamente.

## Assumptions

- Tokens e forma de pílula da spec 110 já estão disponíveis (`--radius-full`, acento de género, superfícies).
- O rótulo do produto continua «Campaign Codex»; o toggle usa a família «Modo edição» (não é obrigatório copiar o copy mock «Modo mestre» do protótipo).
- «Descobrir outras» mapeia para a página inicial / catálogo público do produto real (equivalente a «explorar» do protótipo).
- O seletor de tema de três estados já existe no produto; esta spec só o torna visível/agrupado na zona direita do cabeçalho como no desenho alvo, sem inventar preferência nova.
- O redesenho profundo das páginas Mapa / Relações / Rota (painéis flutuantes) é das specs 115–116; aqui só cabeçalho, barra inferior e contentor mínimo de Rota se necessário.
- `CampaignBottomNav` actual cobre 3 abas; passa a 4 para paridade com o protótipo.
- Ícones nas abas (como no protótipo) são desejáveis para paridade visual, desde que não alterem o destino das rotas.
