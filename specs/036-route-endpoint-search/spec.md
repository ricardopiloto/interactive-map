# Feature Specification: Busca De/Para no Calcular Rota

**Feature Branch**: `036-route-endpoint-search`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Para a lista no Calcular Rota (De e Para), vamos adicionar uma pesquisa para que o usuário possa pesquisar o nome da cidade, com autocomplete, então teremos a lista completa mas com uma filtragem de acordo com a digitação do usuário (se ele digitar)"

## Clarifications

### Session 2026-08-03

- Q: Padrão de interação De/Para (combobox vs filtro+select vs select nativo) → A: Combobox — campo de texto com lista filtrada de sugestões; escolher um item confirma origem/destino
- Q: Digitar de novo após já ter selecionado → A: Ao alterar o texto depois de uma seleção, limpar a seleção desse campo até o utilizador escolher de novo nas sugestões
- Q: Acentos na pesquisa → A: Ignorar acentos na comparação (ex.: "sao" encontra "São") além de maiúsculas/minúsculas
- Q: Mostrar o outro extremo nas sugestões → A: Mostrar todos os nós elegíveis em ambos; só validar De ≠ Para ao calcular

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar origem e destino ao digitar (Priority: P1)

Um jogador (ou GM) abre **Calcular rota**, quer ir de uma cidade a outra, e em vez de percorrer uma lista longa de nós, digita parte do nome no combobox **De** (e depois em **Para**). As sugestões estreitam em tempo real; escolhe o item certo e calcula a rota como hoje.

**Why this priority**: Com muitas entradas na rede, escolher origem/destino sem busca é lento e sujeito a erro; este é o valor central do pedido.

**Independent Test**: Abrir Calcular rota com vários nós nomeados; digitar um fragmento conhecido em De; confirmar que só opções cujo rótulo coincide aparecem; selecionar e repetir em Para; calcular rota com sucesso.

**Acceptance Scenarios**:

1. **Given** o painel Calcular rota aberto e o combobox De sem texto de filtro (ou filtro vazio), **When** o utilizador consulta as sugestões de origem, **Then** vê a lista completa de nós elegíveis (mesma cobertura de hoje), ordenada de forma estável e legível.
2. **Given** vários nós cujos rótulos incluem nomes distintos (ex.: cidades), **When** o utilizador digita parte de um nome no combobox De, **Then** só permanecem sugestões cujo rótulo contém esse texto (sem distinguir maiúsculas/minúsculas nem acentos), e a filtragem atualiza à medida que digita.
3. **Given** o mesmo comportamento em Para, **When** o utilizador filtra e escolhe um destino diferente da origem, **Then** pode calcular a rota e obter o mesmo tipo de resultado que já existe hoje.
4. **Given** um filtro ativo em De ou Para, **When** o utilizador limpa o texto digitado, **Then** a lista completa volta a aparecer nesse campo.

---

### User Story 2 - Autocomplete ao escolher um resultado (Priority: P2)

Ao filtrar no combobox, o utilizador escolhe um item das sugestões; o campo passa a refletir a escolha (rótulo do nó/cidade selecionado) e a seleção fica pronta para o cálculo, sem obrigar a voltar a percorrer a lista completa.

**Why this priority**: Completa o “autocomplete” pedido — filtrar sem poder confirmar a escolha de forma clara reduz o valor da pesquisa.

**Independent Test**: Digitar até restar poucas opções; selecionar uma; verificar que De/Para mostra o nó escolhido e que Calcular usa essa seleção.

**Acceptance Scenarios**:

1. **Given** uma lista filtrada com pelo menos uma opção, **When** o utilizador seleciona uma opção, **Then** essa opção fica como origem ou destino desse campo e o cálculo usa esse nó.
2. **Given** uma origem já selecionada, **When** o utilizador reabre/refina a pesquisa nesse campo e escolhe outro nó, **Then** a seleção anterior é substituída pela nova.
3. **Given** um nó já selecionado em De ou Para, **When** o utilizador altera o texto desse combobox, **Then** a seleção desse campo é limpa até escolher de novo uma sugestão; Calcular não usa o nó antigo.

---

### Edge Cases

- Digitar texto que não coincide com nenhum rótulo: a lista desse campo fica vazia (ou equivalente sem opções selecionáveis) e o utilizador percebe que não há correspondência; não se calcula rota com origem/destino inválidos.
- Alterar o texto de um combobox depois de uma seleção: a seleção desse campo é invalidada até nova escolha nas sugestões.
- Caracteres especiais, acentos e espaços: a correspondência ignora maiúsculas/minúsculas e acentos/diacríticos (ex.: "sao" encontra "São"); espaços no início/fim do texto digitado são ignorados; não se exige pesquisa fonética avançada.
- Origem e destino iguais após filtrar/selecionar: ambos os comboboxes podem listar o mesmo nó; ao calcular, mantém-se a regra atual — o sistema impede ou avisa que devem ser diferentes.
- Rede com poucos nós: a pesquisa continua disponível; com filtro vazio a lista completa (curta) é mostrada.
- Nós sem nome de cidade explícito (só rótulo genérico tipo “Nó N”): a pesquisa continua a filtrar pelo rótulo apresentado na lista, não só por “cidades” cadastradas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel Calcular rota MUST oferecer, em **De** e em **Para**, um combobox (campo de texto com lista filtrada de sugestões) para escolher origem e destino.
- **FR-002**: Com o texto de filtro vazio, cada combobox MUST expor a lista completa de nós elegíveis à escolha (mesma população de opções que o seletor atual).
- **FR-003**: Com texto digitado, as sugestões desse combobox MUST mostrar apenas opções cujo rótulo visível contém o texto, atualizando-se enquanto o utilizador digita; a correspondência MUST ignorar maiúsculas/minúsculas e acentos/diacríticos (ex.: "sao" encontra "São") e MUST ignorar espaços só no início/fim do texto digitado.
- **FR-004**: O filtro de De e o de Para MUST ser independentes (filtrar um não altera o texto/filtro do outro).
- **FR-005**: O utilizador MUST poder selecionar uma sugestão da lista (filtrada ou completa); essa seleção define o nó usado no cálculo de rota e o campo passa a refletir o rótulo escolhido.
- **FR-009**: Se o utilizador alterar o texto de um combobox depois de já ter uma seleção nesse campo, o sistema MUST limpar essa seleção até o utilizador escolher novamente uma sugestão; MUST NÃO calcular rota com o nó antigo enquanto a seleção estiver limpa.
- **FR-006**: O rótulo pesquisável MUST ser o mesmo texto que o utilizador vê na lista de opções (nome do nó, nome do local associado quando aplicável, ou rótulo de recurso já usado hoje).
- **FR-007**: Esta funcionalidade MUST NÃO alterar as regras de cálculo de rota, ritmos, custos ou apresentação dos resultados — apenas a descoberta/seleção de origem e destino.
- **FR-008**: Se nenhum resultado corresponder ao filtro, o utilizador MUST perceber que não há opções; não MUST ser possível confirmar um cálculo com origem ou destino em falta.
- **FR-010**: Cada combobox MUST poder listar todos os nós elegíveis (sujeito ao filtro de texto); MUST NÃO omitir o nó já escolhido no outro extremo. A regra De ≠ Para aplica-se ao calcular, como hoje.

### Key Entities

- **Opção De/Para**: Entrada da lista de origem ou destino — identidade do nó da rede e rótulo legível usado na lista e na pesquisa.
- **Texto de filtro**: Cadeia digitada pelo utilizador num dos campos; vazia = sem filtragem; não vazia = restringe as opções desse campo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com uma lista de pelo menos 20 opções, um utilizador que conhece o nome (ou parte do nome) encontra e seleciona origem e destino em menos de 30 segundos usando a pesquisa, sem percorrer a lista completa visualmente.
- **SC-002**: Em 100% dos testes manuais com filtro vazio, o número de opções disponíveis em De (e em Para) coincide com o número de nós elegíveis antes desta funcionalidade.
- **SC-003**: Em 100% dos testes com um fragmento que só um rótulo contém (incluindo variante sem acento quando o rótulo tem acento), a lista filtrada mostra exatamente essa opção (ou o conjunto mínimo esperado), e selecioná-la produz o mesmo cálculo que escolher o mesmo nó na lista completa.
- **SC-004**: Após escolher De e Para via pesquisa, o fluxo “Calcular” completa com sucesso sempre que haveria rota entre esses nós no comportamento atual (sem regressão funcional do planejador).

## Assumptions

- “Nome da cidade” refere-se ao texto já mostrado na lista (frequentemente o nome do local/cidade ligado ao nó, ou o nome do nó) — não se exige um tipo de dado novo só para cidades.
- A filtragem é local sobre as opções já carregadas no painel; não se exige pesquisa no servidor nem novo endpoint.
- “Autocomplete” significa combobox: digitar no campo + sugestões filtradas + seleção de um item (não filtro separado acima de um `<select>` nativo, nem depender só da filtragem nativa do browser).
- Correspondência por substring do rótulo, ignorando maiúsculas/minúsculas e acentos, é suficiente; não se exige fuzzy match nem sinónimos.
- Jogadores e GM usam o mesmo painel Calcular rota; ambos beneficiam da pesquisa.
- Ambos os campos De e Para partilham a mesma população de nós elegíveis; não se remove o extremo oposto da lista de sugestões.
- Fora de escopo: alterar o mapa, a Rede de rotas (digitizer), ou criar nós a partir da pesquisa.
