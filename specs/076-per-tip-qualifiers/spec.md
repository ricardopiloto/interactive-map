# Feature Specification: Per-Tip Qualifiers

**Feature Branch**: `076-per-tip-qualifiers`

**Created**: 2026-08-12

**Status**: Implemented

**Input**: User description: "Não gostei da maneira que a apresentação da spec 075. Eu quero que a qualificação apareça junto ao tipo de vínculo, ou seja, se existe um link bidirecional e do lado Inimizade o qualificador é \"medo\", então eu tenho que ter \"Inimizade (Medo)\", e se do outro lado for \"Romance\" e eu tiver um qualificador de \"Admiração\", então tem que ser \"Romance (Admiração)\"."

**Depends on**: Qualificador & direção (`075`); duas vias (`071`); conhecido por sentido (`073`)

**Supersedes (presentation)**: Em `075`, o qualificador era **um por par** e, em duas vias, aparecia **no meio** da linha separado dos tipos. Esta feature corrige o modelo de leitura: o qualificador passa a ser **por sentido**, colado ao tipo desse sentido.

## Clarifications

### Session 2026-08-12

- Q: Migração do qualificador único (075) em vínculos duas vias — copiar para ambos os sentidos, só A→B, ou outro? → A: Copiar para **ambos** os sentidos; esta regra de migração aplica-se **somente** a conexões bidirecionais (duas vias). Recíproco mantém um único qualificador (sem duplicar sentidos).
- Q: Ao passar de duas vias → recíproco com qualificadores diferentes, qual sobrevive? → A: Manter o qualificador do sentido **primário que permanece**; descartar o outro.
- Q: Visibilidade das etiquetas `Tipo (Qual)` nos extremos em duas vias? → A: Mostrar sempre com as **mesmas regras** das etiquetas de tipo nos extremos hoje (não só em foco/hover).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Qualificador por sentido em duas vias (Priority: P1)

Num vínculo **duas vias**, cada sentido tem o seu próprio qualificador (opcional). No palco, cada extremo mostra **Tipo (Qualificador)** quando há texto (ex. `Inimizade (Medo)` num extremo e `Romance (Admiração)` no outro). Sem qualificador nesse sentido, mostra-se só o tipo, sem parênteses vazios.

**Why this priority**: Corrige a leitura pedida pelo mestre — a textura emocional vai com o tipo de cada lado, não “a meio” do par.

**Independent Test**: Criar duas vias Inimizade+Medo / Romance+Admiração; verificar etiquetas dos extremos e a ficha (“eu vejo” / “vê-te como…”).

**Acceptance Scenarios**:

1. **Given** um par duas vias com Inimizade+Medo num sentido e Romance+Admiração no outro, **When** se observa a linha no palco (nas condições em que os tipos dos extremos já seriam visíveis), **Then** um extremo lê-se `Inimizade (Medo)` e o outro `Romance (Admiração)` (sem qualificador solto no meio só por causa desses textos).
2. **Given** o mesmo par e um personagem seleccionado, **When** se abre a ficha, **Then** a linha principal do vínculo mostra o tipo+qualificador **da perspectiva** desse personagem, e “Vê-te como…” mostra o tipo+qualificador do **outro** sentido (quando visível).
3. **Given** duas vias em que só um sentido tem qualificador, **When** se olha as etiquetas, **Then** esse extremo tem `Tipo (Qual)` e o outro só `Tipo`.
4. **Given** vínculos **duas vias** antigos com um único qualificador de par (075), **When** a mudança entra em vigor, **Then** o texto aparece nos **dois** sentidos (sem desaparecer sem acção do mestre); vínculos **recíprocos** antigos mantêm um único qualificador.

---

### User Story 2 - Formulário GM com um qualificador por tipo/sentido (Priority: P1)

No diálogo de criar/editar conexão, em modo **recíproco** há um único campo de qualificador (como hoje, ligado ao tipo único). Em modo **duas vias**, há **dois** campos de qualificador — um junto a cada tipo/sentido — cada um com autocomplete das sugestões **desse** tipo (+ Medo), aceitando texto livre. Mudar o tipo de um sentido actualiza as sugestões desse campo sem apagar o texto já escrito.

**Why this priority**: Sem isto o mestre não consegue gravar qualificadores distintos por lado.

**Independent Test**: Em duas vias, escolher Mentores só num lado e Rival no outro; gravar; reabrir o diálogo e ver ambos preenchidos.

**Acceptance Scenarios**:

1. **Given** modo duas vias, **When** o mestre preenche qualificadores diferentes em cada sentido e grava, **Then** ambos persistem e reaparecem ao editar.
2. **Given** modo recíproco, **When** define um qualificador, **Then** o comportamento de sugestões continua por tipo único (+ Medo), como em 075 para o caso simples.
3. **Given** modo duas vias, **When** abre sugestões do sentido Inimizade, **Then** vê a lista desse tipo (+ Medo), **não** a união forçada com o outro tipo.
4. **Given** jogador (sem Modo GM), **When** vê o vínculo, **Then** lê os qualificadores por sentido quando o vínculo/sentido é visível; não edita.

---

### User Story 3 - Direção do par sem misturar com qualificadores de ponta (Priority: P2)

A **direção** opcional do par (mútuo / A→B / B→A) de 075 **mantém-se** ao nível do par. Em duas vias, a seta de sentido (quando existir) **não** substitui nem oculta os `Tipo (Qual)` nos extremos; se precisar de indicação no meio, é só a seta (ou equivalente), não o texto do qualificador.

**Why this priority**: Evita regressão na direção genérica enquanto se corrige a apresentação do qualificador.

**Independent Test**: Duas vias com qualificadores distintos + direção A→B; extremos com Tipo (Qual); seta presente sem apagar os textos dos extremos.

**Acceptance Scenarios**:

1. **Given** duas vias com qualificadores nos dois lados e direção definida, **When** se observa o palco, **Then** os extremos mostram `Tipo (Qual)` e a seta de direção continua perceptível.
2. **Given** vínculo **recíproco** com qualificador e direção, **When** se observa etiqueta/ficha, **Then** continua `Tipo (Qual)` (+ seta se houver), como leitura única do par.

---

### Edge Cases

- Qualificador vazio ou só espaços num sentido: esse sentido mostra só o tipo.
- Recíproco não usa “dois qualificadores” na UI — um campo só.
- Ao passar de recíproco para duas vias: o qualificador já escrito pode copiar-se para o primeiro sentido; o segundo começa vazio (o mestre preenche se quiser).
- Ao passar de duas vias para recíproco: mantém-se o qualificador do sentido **primário que permanece** (o tipo/sentido que fica como vínculo recíproco); o qualificador do sentido descartado é abandonado.
- Sentido secreto (073): se o tipo desse sentido não é visível ao jogador, o respectivo qualificador também não deve ser revelado na etiqueta/ficha do jogador.
- Filtros por tipo (chips) continuam a filtrar pelo **tipo**, não pelo texto do qualificador.
- Fora de escopo: novos tipos/cores; multi-qualificador no mesmo sentido; mudar o modelo de direção de par.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir um **qualificador opcional por sentido** do vínculo (não um único valor obrigatoriamente partilhado pelo par em duas vias).
- **FR-002**: Em vínculos **duas vias**, cada etiqueta de extremo MUST mostrar `Tipo (Qualificador)` para esse sentido quando o qualificador existir; MUST NOT mostrar o qualificador apenas como texto “órfão” no meio da linha. A visibilidade dessas etiquetas MUST seguir as **mesmas regras** já usadas para mostrar o tipo em cada extremo (não restringir `(Qual)` a foco/hover se o tipo já estiver visível).
- **FR-003**: Em vínculos **recíprocos**, a etiqueta de meio/foco MUST continuar a combinar o tipo único com o seu qualificador (e seta de direção do par, se houver).
- **FR-004**: Na **ficha**, a leitura da perspectiva seleccionada MUST usar `Tipo (Qual)` do sentido “eu vejo”; “Vê-te como…” MUST usar `Tipo (Qual)` do sentido de retorno quando esse sentido for mostrado.
- **FR-005**: O diálogo GM MUST expor um campo de qualificador em modo recíproco e **dois** em modo duas vias (um por sentido), com autocomplete por **tipo desse sentido** (+ Medo) e texto livre.
- **FR-006**: A **direção** opcional do par (075) MUST permanecer; em duas vias, qualificadores ficam nos extremos e a seta MUST NOT apagar esses rótulos.
- **FR-007**: Pares já existentes MUST permanecer válidos. Em vínculos **duas vias** com qualificador de par herdado de 075, o texto MUST ser copiado para **ambos** os sentidos na migração; em **recíproco**, o valor MUST mapear para o único qualificador do tipo (sem inventar um segundo sentido).
- **FR-008**: Jogadores MUST NOT editar qualificadores; vêem-nos só quando o vínculo/sentido for visível pelas regras actuais (incluindo 073).
- **FR-009**: Ao mudar o modo de **duas vias** para **recíproco**, o sistema MUST conservar o qualificador do sentido primário que permanece e MUST discardar o qualificador do sentido removido.

### Key Entities

- **Vínculo**: par entre dois personagens; tipos por sentido; **qualificador por sentido**; direção opcional ao nível do par; notas; público/conhecido.
- **Etiqueta de extremo / linha da ficha**: leitura `Tipo` + opcional `(Qualificador)` + indicação de direção do par quando aplicável.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **3 em 3** observações, um par duas vias `Inimizade (Medo)` / `Romance (Admiração)` é lido nos extremos (ou ficha) sem confundir o qualificador com um rótulo único do meio.
- **SC-002**: Um mestre grava qualificadores distintos por sentido e confirma-os no palco e na ficha em menos de **2 minutos**.
- **SC-003**: **100%** dos vínculos que já tinham qualificador de par (075) continuam a mostrar esse texto nalgum sentido após a mudança, sem edição manual obrigatória.
- **SC-004**: Um jogador **nunca** edita qualificadores; num sentido secreto, não vê o `Tipo (Qual)` desse sentido.

## Assumptions

- Motivação: correcção de produto sobre a apresentação definida em `075` (qualificador único no meio em duas vias).
- Direção (`direcao` do par) **não** muda de modelo nesta feature.
- Sugestões em duas vias passam a ser **por sentido** (já não a união num único campo).
- Migração do qualificador único de 075: a regra “copiar para os dois sentidos” aplica-se **somente** a **duas vias**; em **recíproco**, o valor passa a ser o qualificador desse tipo único. Em duas vias, o mestre pode depois diferenciar os dois textos.
- Autocomplete, Medo transversal e texto livre de 075 mantêm-se, aplicados ao tipo do sentido em edição.
