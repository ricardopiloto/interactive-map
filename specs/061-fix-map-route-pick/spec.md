# Feature Specification: Fix Map Pick for Calcular Rota

**Feature Branch**: `061-fix-map-route-pick`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "spec 060 não funcionou como o esperado, fazendo uma análise como um usuário do google maps, o que nós precisamos é que quando o usuário estiver com o calcular rota aberto, ao clicar no pin do local, se aquele local tiver um nó, o sistema deve preencher o De/Para com o local que foi clicado (respeitando a ordem De primeiro Para segundo)."

## Clarifications

### Session 2026-08-06

- Q: Sintoma actual ao clicar no pin com Calcular rota aberto? → A: Abre o detalhe do Local (modal) e De/Para não mudam
- Q: As cidades testadas no mapa aparecem no combobox De/Para? → A: Sim — dá para as escolher na lista
- Q: Ao preencher Para no mapa, calcular automaticamente? → A: Sim — quando De e Para ficam ambos preenchidos via mapa, calcular já (estilo Google Maps)

## Problem

A funcionalidade 060 (seleccionar cidades no mapa para Calcular rota) **não entregou** o comportamento esperado. Do ponto de vista de um utilizador à la Google Maps Directions: com o painel de rotas aberto, tocar num sítio no mapa deve ir directamente para os campos origem/destino — sem digitar.

**Sintoma observado (2026-08-06):** com o painel aberto, o clique no pin abre o **modal do Local** e os campos **De/Para permanecem inalterados** — o atalho de direcções não dispara. As mesmas cidades **estão disponíveis** no combobox De/Para, portanto o nó existe; o defeito está no caminho **clique no pin → preenchimento**, não na ausência de rede.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - De e Para pelo mapa (estilo Directions) (Priority: P1)

Com **Calcular rota** aberto, o utilizador clica no pin de um Local que tem nó da rede. O sistema preenche **De** com essa cidade se De estiver vazio; se De já tiver valor, preenche/substitui **Para**. Quando **ambos** De e Para ficam preenchidos (via mapa), o sistema **calcula automaticamente** e mostra as rotas — como no Google Maps Directions — sem obrigar a clicar Calcular (o botão continua disponível).

**Why this priority**: É o comportamento pedido e o que 060 falhou em proporcionar de forma fiável.

**Independent Test**: Abrir Calcular rota; clicar pin A (com nó) → De = A; clicar pin B (com nó) → Para = B e lista de rotas aparece sem clicar Calcular. Repetir após refresh.

**Acceptance Scenarios**:

1. **Given** Calcular rota aberto e De vazio, **When** o utilizador clica num pin de Local **com** nó, **Then** o campo **De** mostra essa cidade (nome reconhecível) de forma imediata e observável.
2. **Given** Calcular rota aberto e De já preenchido, **When** o utilizador clica noutro pin **com** nó, **Then** o campo **Para** mostra essa cidade (De mantém-se) e a **lista de rotas actualiza-se automaticamente**.
3. **Given** De e Para preenchidos via mapa com auto-cálculo, **When** o utilizador observa o painel, **Then** vê alternativas de rota sem ter premido Calcular (equivalente ao cálculo manual com as mesmas cidades).
4. **Given** Calcular rota aberto, **When** o utilizador clica um terceiro pin com nó, **Then** só **Para** é actualizado e o cálculo corre de novo automaticamente.
5. **Given** De e Para válidos, **When** o utilizador prefere premir Calcular manualmente, **Then** o botão continua a funcionar.

---

### User Story 2 - Pin sem nó e painel fechado (Priority: P1)

Se o Local **não** tiver nó, o clique **não** altera De/Para. Com o painel **fechado**, o mapa comporta-se como antes (detalhe do Local, etc.).

**Why this priority**: Evita regressões e falsos positivos (“cliquei e nada / cliquei e abriu só o modal”).

**Independent Test**: Pin sem nó com painel aberto → De/Para intactos; painel fechado → detalhe normal.

**Acceptance Scenarios**:

1. **Given** painel aberto e pin **sem** nó, **When** clica, **Then** De/Para não mudam; o detalhe do Local pode abrir como hoje.
2. **Given** painel **fechado**, **When** clica qualquer pin, **Then** o comportamento pré-060/061 mantém-se (detalhe/selecção).
3. **Given** painel aberto e pin **com** nó, **When** clica, **Then** De/Para actualizam-se e o modal do Local **não** interrompe o fluxo de direcções (não abre por cima a impedir ver De/Para).

---

### User Story 3 - Combobox continua a funcionar (Priority: P2)

O utilizador pode misturar mapa e combobox: De no combobox, Para no mapa (ou o contrário via limpar De). Sem zonas clicáveis novas no mapa. Auto-cálculo também aplica quando o segundo endpoint chega via mapa com De já no combobox (ambos preenchidos).

**Why this priority**: Atalho complementar, não substituto.

**Independent Test**: De via lista → clique no mapa preenche Para e calcula; limpar De → próximo clique preenche De; zero halos novos.

**Acceptance Scenarios**:

1. **Given** De preenchido no combobox, **When** clica pin com nó, **Then** Para é preenchido sem sobrescrever De e as rotas calculam automaticamente.
2. **Given** De limpo no combobox, **When** clica pin com nó, **Then** De é preenchido de novo (ainda sem auto-cálculo completo até Para existir).
3. **Given** painel aberto, **When** observa o mapa, **Then** não há overlays novos de “zona clicável para rota”.

---

### Edge Cases

- Local com nó: clique MUST actualizar De ou Para de forma visível no painel (não basta “estado interno”).
- Dois cliques rápidos em pins distintos: ambos reflectidos (De depois Para) e auto-cálculo após o segundo.
- Mesmo pin duas vezes (origem = destino): MUST NÃO inventar rotas; feedback de erro actual (ou equivalente) ao tentar calcular.
- Zoom/pan: clique no pin (não arrastar) conta como selecção.
- Placement GM / digitizer: fora de âmbito; não quebrar esses modos.
- Se a lista de nós ainda não carregou: o clique não deve falhar silenciosamente de forma permanente — ao estar pronto, cliques seguintes MUST funcionar.
- Clique elegível que ainda cai no modal (sintoma 060): MUST ser tratado como defeito a eliminar (FR-009), não como comportamento aceitável.
- Auto-cálculo em curso / falha de rede: o utilizador MUST poder premir Calcular de novo; erro legível como hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Com Calcular rota **aberto**, clique num pin de Local que tenha **nó** associado MUST preencher **De** se De estiver vazio, senão MUST preencher/substituir **Para**, com o nome da cidade visível nos campos.
- **FR-002**: A ordem de preenchimento MUST ser **De primeiro, Para segundo** (estado dos campos: De vazio → De; De preenchido → Para).
- **FR-003**: Valores preenchidos via mapa MUST ser os mesmos nós que o combobox usaria para essa cidade (cálculo idêntico).
- **FR-004**: Com painel aberto e pin **sem** nó, De/Para MUST NÃO mudar; o detalhe do Local MAY abrir como hoje.
- **FR-005**: Com painel aberto e pin **com** nó, o fluxo de direcções MUST NÃO ser interrompido pelo modal do Local (modal MUST NÃO abrir nesse clique).
- **FR-006**: Com painel **fechado**, cliques no mapa MUST preservar o comportamento actual.
- **FR-007**: Combobox De/Para MUST continuar utilizável; mapa é atalho (híbrido: De no texto + Para no mapa permitido).
- **FR-008**: MUST NÃO introduzir zonas/halos/hit-areas visuais novas para “clicar rota”.
- **FR-009**: A falha de 060 MUST ficar corrigida: o sintoma “modal abre e De/Para não mudam” ao clicar pin **com** nó (painel aberto) MUST deixar de ocorrer; o cenário US1 passa de forma fiável em smoke manual.
- **FR-010**: Para pins de Locais cujas cidades já são seleccionáveis no combobox De/Para, o clique no mapa (painel aberto) MUST preencher De/Para usando **esse mesmo** nó — não MAY cair no modal como se não houvesse nó.
- **FR-011**: Quando De e Para ficam ambos preenchidos e distintos (incluindo o momento em que o mapa completa o segundo campo), o sistema MUST **iniciar o cálculo de rotas automaticamente** (mesmo resultado que premir Calcular). O botão Calcular MUST permanecer disponível. Origem = destino MUST NÃO produzir lista falsa (validação actual).

### Key Entities

- **Local (pin)**: Alvo do clique no mapa.
- **Nó da rede**: Endpoint De/Para ligado ao Local.
- **Campos De / Para**: Origem e destino no painel Calcular rota.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% de 5 tentativas manuais (painel aberto, dois pins com nó distintos), De e Para ficam preenchidos na ordem correcta e a lista de rotas aparece **sem** premir Calcular.
- **SC-002**: Em ≤ 10 segundos um utilizador familiarizado completa De → Para só com cliques no mapa, vê os nomes nos campos e vê resultados de rota.
- **SC-003**: Em 100% dos cliques em pins sem nó (painel aberto), De/Para não mudam.
- **SC-004**: Em 100% dos cliques elegíveis (painel aberto), o modal do Local não abre.
- **SC-005**: Com painel fechado, detalhe do Local por pin continua a funcionar (spot-check ≥ 3 pins).
- **SC-006**: Premir Calcular manualmente com De/Para válidos continua a funcionar em smoke.

## Assumptions

- Reutiliza as clarificações de 060: estado dos campos (não contagem cega); pin com nó sem modal; pin sem nó com modal; sem zonas novas.
- “Ter um nó” = Local ligado a um nó nomeado usável no combobox De/Para.
- O problema reportado é de **comportamento/entrega** (060 não funciona como esperado), não um pedido de UX diferente da ordem De→Para.
- Sintoma locked: modal do Local abre; De/Para não mudam (Clarifications 2026-08-06) — indica que o clique está a seguir o caminho “sem nó / fallthrough”, não o caminho de preenchimento.
- Dados locked: as cidades usadas no teste **aparecem** no combobox (Clarifications 2026-08-06) — o nó nomeado existe; a correcção MUST ligar pin→esse nó sem exigir o utilizador a digitar.
- Auto-cálculo locked: ao completar De+Para (mapa e/ou híbrido com segundo campo via mapa), calcular já (Clarifications 2026-08-06).
- Google Maps aqui é metáfora de produto (tocar no mapa preenche direcções e obtém rotas), não cópia de UI Google.

## Out of Scope

- Redesign visual do painel Calcular rota.
- Selecção de nós sem pin de Local.
- Alterar o algoritmo de cálculo de rotas (só disparar o existente).
- Digitizer / modos de colocar pin.
