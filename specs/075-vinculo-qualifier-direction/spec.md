# Feature Specification: Vínculo Qualifier & Direction

**Feature Branch**: `075-vinculo-qualifier-direction`

**Created**: 2026-08-12

**Status**: Implemented

**Input**: User description: "Ler docs/feature-rede-relacoes.md e gerar spec para 6.1 Qualificador (autocomplete por tipo + Medo em qualquer tipo), 6.2 Direção opcional genérica (null / a_para_b / b_para_a), e propagações nas secções 5.2, 7, 8, 9; secção 11 questão 3 resolvida via 6.2."

**Depends on**: Rede de Relações existente (`066`+); vínculos tipados e duas vias (`071`); visibilidade por sentido (`073`) quando aplicável

**Source**: [docs/feature-rede-relacoes.md](../../docs/feature-rede-relacoes.md) §§ 6.1, 6.2, 5.2, 7, 8, 9, 11.3

## Clarifications

### Session 2026-08-12

- Q: Como mostrar qualificador/seta nas etiquetas quando o vínculo é duas vias (tipos nos extremos)? → A: Duas vias: tipos nos extremos; meio só qualificador e/ou seta. Recíproco: tipo(+qualificador)(+seta) no meio/foco
- Q: Em modo duas vias no formulário, de onde vêm as sugestões do (único) qualificador? → A: União das listas dos dois tipos (+ Medo)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Qualificador opcional com sugestões por tipo (Priority: P1)

O mestre, ao criar ou editar uma conexão, pode acrescentar um **qualificador** curto (ex. Mentor, Rival, Medo) que afina o tipo sem criar tipos/cores novos. Ao escolher o tipo, o campo de qualificador sugere opções típicas desse tipo; o mestre pode escrever texto livre fora da lista. **Medo** aparece como sugestão em **qualquer** dos seis tipos (não fica preso a um só).

**Why this priority**: É o segundo eixo relacional pedido no documento — textura sem multiplicar tipos.

**Independent Test**: Criar Aliado + Mentor; criar Inimizade + Rival; criar Família + Medo via sugestão; gravar texto livre “Companheiro de guerra” em Amizade.

**Acceptance Scenarios**:

1. **Given** Modo GM no diálogo de conexão em modo **recíproco**, **When** escolhe tipo **Aliado** e abre o qualificador, **Then** vê sugestões incluindo Mentor, Protegido, Patrono, Devedor, Segredo **e** Medo.
2. **Given** tipo **Romance** (recíproco), **When** abre sugestões, **Then** Medo está disponível (mesmo sem outras sugestões específicas de Romance além disso).
3. **Given** modo **duas vias** com Aliado num sentido e Inimizade no outro, **When** abre sugestões do qualificador, **Then** vê a união das listas (ex. Mentor e Rival) **e** Medo, sem duplicar Segredo se existir nos dois.
4. **Given** o mestre escreve um qualificador livre (não listado), **When** grava, **Then** o valor persiste e aparece nas etiquetas/lista.
5. **Given** um vínculo sem qualificador, **When** jogador ou mestre o vê, **Then** continua a ler-se só pelo tipo (sem parênteses vazios).

---

### User Story 2 - Direção opcional em qualquer vínculo (Priority: P1)

Qualquer vínculo pode ter **direção** opcional: mútuo (omissão), de A para B, ou de B para A — independentemente do qualificador. Serve especialmente Medo/Dívida, mas **não** está restrito a eles. Quando a direção está definida, a etiqueta na rede e a entrada na ficha mostram uma **seta** subtil no sentido; quando é mútuo, não há seta.

**Why this priority**: Fecha a questão 11.3 do documento; generaliza assimetria sem novos schemas por qualificador.

**Independent Test**: Gravar Aliado (Medo) A→B; ver seta na linha e na lista; voltar a mútuo e a seta desaparece; gravar direção sem qualificador e a seta ainda aparece.

**Acceptance Scenarios**:

1. **Given** um par com personagens A e B, **When** o mestre define direção A→B e grava, **Then** a etiqueta no palco e o tipo na lista de vínculos indicam o sentido (seta), sem mudar a cor do tipo.
2. **Given** direção mútua (omissão), **When** observa etiqueta e lista, **Then** não há seta de sentido.
3. **Given** um vínculo com qualificador “Mentor” sem necessidade de seta, **When** o mestre deixa direção omissa, **Then** grava e exibe só `Tipo (Mentor)`.
4. **Given** jogador (sem Modo GM), **When** o vínculo é visível segundo as regras actuais de público/conhecidos, **Then** vê qualificador e seta se existirem — não edita esses campos.

---

### User Story 3 - Etiquetas, ficha e diálogo reflectem o modelo (Priority: P2)

O que foi gravado aparece de forma consistente: no **meio da linha** (ou nas etiquetas de foco, conforme o comportamento actual de rótulos), na **lista Vínculos** do painel (tipo + qualificador entre parênteses + seta se houver), e no **diálogo GM** (campos tipo, qualificador com autocomplete, direção mútuo/A→B/B→A, nota).

**Why this priority**: Propaga 5.2 / 7 / 8 / 9 — sem isto o dado não se lê na mesa.

**Independent Test**: Um vínculo `Aliado (Mentor)` mútuo e outro `Inimizade (Medo)` A→B; comparar palco, ficha e formulário.

**Acceptance Scenarios**:

1. **Given** `Aliado` + qualificador `Mentor`, mútuo (**recíproco**), **When** selecciona um extremo, **Then** a etiqueta/lista mostra algo equivalente a **Aliado (Mentor)** sem seta.
2. **Given** um par **duas vias** com tipos distintos nos extremos + qualificador `Medo` + direção A→B, **When** olha a linha, **Then** cada extremo mostra o seu tipo; no meio aparece `(Medo)` (ou o texto do qualificador) e a seta de sentido — sem repetir o tipo no meio.
3. **Given** Modo GM, **When** edita pela linha ou pela lista, **Then** o diálogo mostra tipo, qualificador, direção e nota já preenchidos.

---

### Edge Cases

- Qualificador vazio ou só espaços: trata-se como ausente (não mostrar `()`).
- Mudar o tipo no formulário: as sugestões de autocomplete actualizam-se; o texto já escrito **não** é apagado automaticamente (o mestre decide).
- Vínculos **duas vias**: tipos nos extremos; qualificador/seta no **meio** da linha (clarificação 2026-08-12); qualificador e direção continuam **do par** (um valor cada).
- Direção A→B / B→A refere-se aos extremos do par; o diálogo usa **nomes** dos personagens.
- Filtros por tipo (chips) continuam a filtrar pelo **tipo** (e regras de duas vias/conhecidos); o qualificador **não** cria chips novos.
- Fora de escopo: novos tipos/cores; multi-qualificador; direção obrigatória por regra de negócio; substituir o modelo de duas vias (`tipo` por sentido) por esta direção.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir um **qualificador** opcional (texto curto) em cada vínculo, independente do tipo.
- **FR-002**: Ao editar o qualificador, o sistema MUST oferecer **autocomplete com sugestões conforme o tipo** actual, aceitando também texto livre. Em modo **recíproco**, as sugestões seguem o tipo único (+ Medo). Em modo **duas vias**, as sugestões MUST ser a **união** das listas dos dois tipos (+ Medo), sem duplicar entradas iguais.
- **FR-003**: As sugestões por tipo MUST incluir pelo menos o conjunto documentado (Aliado: Mentor, Protegido, Patrono, Devedor, Segredo; Amizade: Segredo, Companheiro de guerra; Inimizade: Rival, Traidor, Antigo aliado; Família: Pai/Mãe, Irmão/Irmã, Tutor; Conhecido: Rival, Desconfiança, Contato; Romance: sem lista própria além do transversal).
- **FR-004**: **Medo** MUST constar nas sugestões de **todos** os seis tipos.
- **FR-005**: O sistema MUST permitir **direção** opcional em qualquer vínculo: mútuo (omissão), A→B ou B→A — sem restringir a qualificadores específicos.
- **FR-006**: Quando a direção estiver definida, etiquetas de linha e entradas da lista de vínculos MUST indicar o sentido com uma seta (ou equivalente claro); quando mútuo, MUST NOT mostrar seta.
- **FR-006a**: Em vínculos **duas vias**, as etiquetas dos **extremos** MUST continuar a mostrar só o tipo de cada sentido; qualificador e/ou seta MUST aparecer numa indicação **no meio** da linha (não duplicar o tipo no meio). Em vínculos **recíprocos**, a etiqueta de meio/foco MUST combinar tipo + qualificador (se houver) + seta (se houver).
- **FR-007**: Quando houver qualificador na **lista da ficha**, a apresentação MUST usar a forma **Tipo (Qualificador)** relativa à leitura da linha (tipo da perspectiva em primeiro plano); sem qualificador, só o tipo.
- **FR-008**: O diálogo GM de criar/editar conexão MUST expor tipo, qualificador (com autocomplete), direção (mútuo / A→B / B→A) e nota.
- **FR-009**: Pares já existentes MUST continuar válidos com qualificador ausente e direção mútua (omissão), sem acção do mestre.
- **FR-010**: Jogadores MUST NOT criar/editar qualificador ou direção; vêem-nos quando o vínculo for visível pelas regras actuais.

### Key Entities

- **Vínculo**: par entre dois personagens; tipo(s) emocional(is) já existentes; **qualificador** opcional; **direção** opcional (mútuo / A→B / B→A); nota.
- **Sugestão de qualificador**: texto recomendado por tipo (+ Medo transversal).
- **Etiqueta de linha / linha da ficha**: leitura composta tipo + qualificador + seta se direcional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um mestre cria um vínculo com qualificador da lista e vê-o no palco e na ficha em menos de **2 minutos**.
- **SC-002**: Em **3 em 3** observações, `Aliado (Medo)` com direção A→B é lido como assimétrico (seta) sem confundir com a cor de outro tipo.
- **SC-003**: **100%** dos vínculos antigos (sem qualificador/direção) continuam legíveis como antes após a mudança.
- **SC-004**: Medo é oferecido como sugestão em **6 de 6** tipos no diálogo GM.
- **SC-005**: Um jogador **nunca** edita qualificador/direção; num vínculo público visível, lê qualificador e seta quando existirem.

## Assumptions

- Fonte de verdade de produto: `docs/feature-rede-relacoes.md` §§ 6.1–6.2 e propagações 5.2, 7–9; questão 11.3 considerada **resolvida** por §6.2.
- Um qualificador e uma direção **por par** (não por cada sentido das duas vias).
- “A” e “B” na direção são os dois personagens do vínculo; a UI nomeia-os para o mestre.
- Sugestões são **ajuda**, não enum fechado; texto livre permitido; em duas vias = união das listas dos dois tipos (+ Medo).
- Não se criam tipos/cores novos; Medo não é tipo — é qualificador.
- UI em português; sem emoji; visual Nocturne existente.
