# Feature Specification: Visibilidade de Personagem (GM)

**Feature Branch**: `084-personagem-visibility`

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Quando o GM cria (ou gere) um personagem, pode escolher se esse personagem é visível para todos. Se não for, o personagem e **todas as suas conexões** ficam invisíveis para jogadores; só o GM os vê até marcar o personagem como visível para todos.

## Clarifications

### Session 2026-08-13

- Q: Âmbito do ocultamento (Relações vs Mapa)? → A: **Todas as vistas de jogador** da app Codex (Relações, Mapa, listagens de personagens/NPCs) — não só a rede de Relações.
- Q: Indicação visual em modo GM? → A: **Em ambos** — distintivo no nó do grafo **e** indicação no formulário de criar/editar.
- Q: Controlo no formulário? → A: **Checkbox/toggle «Visível para todos»** ligado por omissão; desligado = apenas GM.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - GM marca personagem como não visível ao criar (Priority: P1)

O GM cria um personagem na rede de Relações e escolhe que **não** é visível para todos. Após gravar, em modo jogador esse personagem não aparece na rede; as conexões ligadas a ele também não.

**Why this priority**: É o núcleo do pedido — segredo de campanha controlado pelo GM na criação.

**Independent Test**: Criar personagem «oculto», criar pelo menos uma conexão com um personagem público; em sessão jogador confirmar ausência do personagem e das conexões; em modo GM ambos visíveis.

**Acceptance Scenarios**:

1. **Given** o GM está a criar um personagem, **When** escolhe que **não** é visível para todos e grava, **Then** o personagem fica guardado e, em modo GM, continua visível na rede com **distintivo no nó** e indicação no formulário de que está oculto aos jogadores.
2. **Given** um personagem não visível para todos com uma ou mais conexões, **When** um jogador (sem modo GM) abre Relações, **Then** não vê esse personagem nem nenhuma conexão em que ele participe.
3. **Given** o mesmo estado, **When** o GM está em modo restrito, **Then** vê o personagem oculto e todas as suas conexões.

---

### User Story 2 - GM torna o personagem visível para todos (Priority: P1)

O GM edita um personagem oculto e passa a «visível para todos». Jogadores passam a ver o personagem e as conexões que, pelas outras regras já existentes de revelação de vínculos, forem públicas/conhecidas.

**Why this priority**: Sem isto, o ocultamento seria permanente na prática.

**Independent Test**: Personagem oculto com conexões; mudar para visível; sessão jogador vê o personagem; conexões reaparecem conforme as regras de visibilidade de vínculo já existentes.

**Acceptance Scenarios**:

1. **Given** um personagem oculto, **When** o GM o marca como visível para todos e grava, **Then** jogadores passam a ver esse personagem na rede.
2. **Given** esse personagem acabou de ficar visível, **When** um jogador vê a rede, **Then** as conexões desse personagem só aparecem se também forem permitidas pelas regras já existentes de visibilidade de conexão (não se revelam automaticamente segredos de vínculo só por tornar o personagem visível).

---

### User Story 3 - Personagens existentes e default seguro (Priority: P2)

Personagens já criados antes desta funcionalidade comportam-se como **visíveis para todos**. Novos personagens, por omissão, também nascem visíveis para todos (o GM tem de optar por ocultar).

**Why this priority**: Evita surpresa em campanhas em curso e alinhamento com «opt-in» ao segredo.

**Independent Test**: Abrir campanha com personagens antigos em modo jogador — rede inalterada; criar personagem sem mudar o controlo — jogadores veem-no.

**Acceptance Scenarios**:

1. **Given** personagens criados antes desta funcionalidade, **When** um jogador abre Relações, **Then** continua a vê-los como hoje (equivalente a visível para todos).
2. **Given** o GM cria um personagem e **não** altera o controlo de visibilidade, **When** grava, **Then** o personagem é visível para todos por omissão.

---

### Edge Cases

- Conexão entre dois personagens ambos ocultos: jogador não vê nenhum dos dois nem a conexão; GM vê tudo.
- Conexão entre um oculto e um visível: jogador não vê a conexão; o personagem visível continua na rede; o oculto não.
- Jogador tenta abrir/seleccionar (URL, estado residual) um personagem oculto: não obtém dados desse personagem nem das suas conexões na vista de jogador.
- Ocultar um personagem que já tinha conexões «públicas»: para o jogador, essas conexões deixam de aparecer enquanto o personagem estiver oculto (a configuração de visibilidade do personagem prevalece sobre a exposição da conexão).
- Mapa / listagens de personagens noutras vistas da app voltadas ao jogador: o personagem oculto **não** é exposto de forma alguma ao jogador (sem nome, sem entrada em listas de NPCs do local, sem indício genérico); o GM continua a gerir tudo em modo restrito.
- Remover o modo GM: a rede actualiza-se de imediato para a vista de jogador (ocultos desaparecem).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: No formulário de criar/editar personagem (Modo GM), o GM MUST poder controlar a visibilidade com um controlo **«Visível para todos»** (checkbox ou interruptor): **ligado** = visível para todos; **desligado** = apenas para o GM.
- **FR-002**: Por omissão (novo personagem e personagens já existentes sem valor explícito), o personagem MUST ser tratado como **visível para todos**.
- **FR-003**: Em vista de jogador, a app MUST NÃO mostrar personagens marcados como apenas para o GM.
- **FR-004**: Em vista de jogador, a app MUST NÃO mostrar nenhuma conexão em que participe um personagem apenas para o GM, independentemente das outras definições de visibilidade dessa conexão.
- **FR-005**: Em modo GM, a app MUST mostrar todos os personagens e conexões, incluindo os apenas para o GM, com indicação visual de oculto aos jogadores **no nó do grafo** e **no formulário** de criar/editar personagem.
- **FR-006**: O GM MUST poder alterar a visibilidade de um personagem existente (ocultar ou revelar) e a mudança MUST aplicar-se de imediato às vistas de jogador após gravação (personagem e conexões afectadas).
- **FR-007**: Revelar um personagem NÃO MUST, por si só, revelar ligações que as regras existentes de visibilidade de conexão ainda ocultem ao jogador.
- **FR-008**: A restrição de visibilidade do personagem MUST aplicar-se a **todas** as superfícies de jogador da app Codex — rede de Relações, Mapa (incl. listagens/detalhes de NPCs em locais) e quaisquer outras listagens de personagens voltadas ao jogador — de forma coerente. NÃO MUST limitar-se ao grafo de Relações.

### Out of Scope

- Visibilidade parcial (ex.: «só alguns jogadores»).
- Agendar revelação automática por data/sessão.
- Alterar o modelo de visibilidade por ponta de vínculo (público / conhecido) já existente — apenas combinar com a nova regra de personagem.
- Hub estático de campanhas.

### Key Entities

- **Personagem**: figura da campanha (PJ ou NPC) com atributo de visibilidade para jogadores (visível para todos vs apenas GM).
- **Conexão (vínculo)**: relação entre dois personagens; para o jogador, só é mostrada se ambos os extremos forem visíveis para todos **e** as regras já existentes de revelação da conexão o permitirem.
- **Vista jogador / Vista GM**: dois modos de consumo dos mesmos dados, com filtros diferentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais, um personagem «apenas GM» e todas as suas conexões estão ausentes da vista jogador e presentes na vista GM.
- **SC-002**: Após o GM mudar um personagem de «apenas GM» para «visível para todos», um jogador vê o personagem na rede em menos de 3 segundos após refresh/recarregar dados (ambiente local).
- **SC-003**: Campanha com N personagens pré-existentes (N≥5) sem alteração manual: vista jogador idêntica à de antes desta funcionalidade (nenhum personagem some por omissão).
- **SC-004**: O GM completa «criar personagem oculto → ligar a um público → confirmar ocultação em vista jogador → revelar → confirmar aparição» num único fluxo guiado sem passos fora da UI de Relações/Modo GM.

## Assumptions

- O controlo aparece na criação e na edição de personagem (mesmo formulário GM).
- O controlo no formulário é **«Visível para todos»** (checkbox/toggle), **ligado por omissão**; desligar significa apenas GM.
- A regra de personagem oculto **sobrepõe-se** à visibilidade da conexão: se o personagem está oculto, as suas conexões não aparecem ao jogador mesmo que a conexão esteja marcada como pública.
- Personagens unificados (PJ e NPC) usam a mesma regra.
- Indicação visual em modo GM: **distintivo no nó do grafo** e **indicação no formulário** («oculto aos jogadores» ou equivalente localizado).
- Não há audiências intermédias (só «todos os jogadores» vs «só GM»).
- Ocultamento aplica-se a **todas** as vistas de jogador (Relações, Mapa, listagens), sem indício genérico no Mapa.
