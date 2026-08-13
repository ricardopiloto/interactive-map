# Feature Specification: Cores de Vínculo (Sangue, Inimizade, Adversário)

**Feature Branch**: `085-vinculo-color-rethink`

**Created**: 2026-08-13

**Status**: Implemented

**Input**: User description: "Eu gostaria de repensar as cores dos vínculos, pelo menos as cores de: Inimizade, Adversário e Vinculo de Sangue. Gostaria que vinculo de sangue fosse um vermelho escuro, e o motivo de repensar as outras duas é para que esse vermelho escuro não atrapalhe na distinção das demais"

**Depends on**: Catálogo de 8 tipos da Rede de Relações ([081-novos-tipos-vinculo](../081-novos-tipos-vinculo/spec.md))

## Clarifications

### Session 2026-08-13

- Q: Qual deve ser a nova família de cor da Inimizade? → A: Magenta / fúcsia (hostilidade quente, longe do borgonha e do rosa suave de Romance).
- Q: Qual deve ser a família de cor do Adversário? → A: Manter cobre / laranja queimado (tom estrutural; distingue-se do borgonha e do magenta).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vínculo de Sangue lê-se como sangue (Priority: P1)

Quem olha a Rede de Relações associa **Vínculo de Sangue** a um **vermelho escuro** (borgonha / vinho), em todas as superfícies onde a cor do tipo aparece: linha no palco, chip de filtro, legenda e bolinha na ficha.

**Why this priority**: É o pedido central — o tipo deixa o violeta actual e passa a ter a metáfora visual de sangue.

**Independent Test**: Isolar o filtro «Vínculo de Sangue» e confirmar que a aresta, o chip e a legenda usam o mesmo vermelho escuro, distinto dos outros sete tipos.

**Acceptance Scenarios**:

1. **Given** um vínculo do tipo Vínculo de Sangue, **When** o utilizador vê o palco, o chip e a legenda, **Then** as três superfícies usam o mesmo vermelho escuro.
2. **Given** a paleta completa visível (legenda ou chips), **When** se compara Vínculo de Sangue com os outros tipos, **Then** o vermelho escuro não se confunde com Aliado, Romance, Família, nem com o magenta/fúcsia de Inimizade nem com o cobre de Adversário.

---

### User Story 2 - Inimizade e Adversário continuam distinguíveis (Priority: P1)

Com o vermelho escuro ocupado por Vínculo de Sangue, **Inimizade** passa a **magenta / fúcsia** e **Adversário** **mantém** cobre / laranja queimado. Os três tipos permanecem distintos entre si e dos cinco que não mudam.

**Why this priority**: Sem isto, o vermelho escuro do sangue anula a razão de existirem três tipos hostis/coercivos separados.

**Independent Test**: Com um vínculo de cada um dos três tipos no palco, um avaliador identifica cada tipo só pela cor (sem ler a etiqueta), e confirma o mesmo mapeamento nos chips e na legenda.

**Acceptance Scenarios**:

1. **Given** arestas de Inimizade, Adversário e Vínculo de Sangue visíveis ao mesmo tempo, **When** o utilizador olha o palco, **Then** as três cores são reconhecíveis à primeira vista, sem hesitação entre vermelho-sangue, magenta/fúcsia de Inimizade e cobre de Adversário.
2. **Given** chips e legenda, **When** o utilizador filtra só Inimizade e depois só Adversário, **Then** cada filtro isola as arestas correctas e o chip activo usa a cor catalogada desse tipo (magenta/fúcsia e cobre, respectivamente).
3. **Given** um vínculo **duas vias** com Vínculo de Sangue num sentido e Inimizade ou Adversário no outro, **When** se observa a linha, **Then** ambos os tons permanecem legíveis no gradiente (nenhum “come” o outro).

---

### User Story 3 - Paleta restante e documentação alinhadas (Priority: P2)

Os outros cinco tipos (**Aliado**, **Amizade**, **Romance**, **Família**, **Conhecido**) mantêm a linguagem visual actual. A documentação de produto descreve Vínculo de Sangue = vermelho escuro, Inimizade = magenta/fúcsia, Adversário = cobre, e deixa de chamar «violeta» ao Vínculo de Sangue ou «vermelho» à Inimizade.

**Why this priority**: Evita um redesenho completo da paleta; o ajuste é cirúrgico e a documentação não mente sobre o que o utilizador vê.

**Independent Test**: Abrir Relações e confirmar que Aliado, Amizade, Romance, Família e Conhecido estão iguais ao estado anterior; a tabela de tipos no documento de produto descreve Sangue como vermelho escuro, Inimizade como magenta/fúcsia e Adversário como cobre.

**Acceptance Scenarios**:

1. **Given** a paleta anterior conhecida, **When** se comparam Aliado, Amizade, Romance, Família e Conhecido, **Then** cor e estilo de linha (sólida vs tracejada de Conhecido) estão inalterados.
2. **Given** o documento de produto da Rede de Relações, **When** a frente fecha, **Then** a tabela de tipos descreve Vínculo de Sangue como vermelho escuro, Inimizade como magenta/fúcsia e Adversário como cobre.

---

### Edge Cases

- Vínculo **duas vias** misturando dois dos três tipos ajustados (ex. Sangue + Inimizade, Sangue + Adversário, Inimizade + Adversário): o gradiente tem de mostrar os dois tons, não um único vermelho-acastanhado ilegível.
- Fundo escuro da interface: vermelho escuro, magenta/fúcsia e cobre MUST permanecer visíveis (contraste suficiente contra o palco), não só distintos entre si.
- Etiquetas de tipo no meio da linha e bolinhas da ficha usam a mesma cor da linha — sem paleta paralela.
- Tipos e identificadores internos **não** mudam; só a cor catalogada. Vínculos já gravados adoptam a nova cor automaticamente (a cor não está guardada em cada vínculo).
- Daltonismo / visão reduzida de cor: as três famílias MUST continuar distinguíveis também por posição na legenda e pelo rótulo do tipo; a cor sozinha não é o único canal. Inimizade (magenta/fúcsia) MUST não colapsar visualmente com Romance (rosa) nem com o vermelho escuro do sangue.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Vínculo de Sangue** MUST usar uma cor da família **vermelho escuro** (borgonha / vinho), em todas as superfícies que hoje pintam o tipo (palco, chips de filtro, legenda, bolinha e texto de tipo na ficha).
- **FR-002**: **Inimizade** MUST deixar a família vermelho–rosa actual e passar a **magenta / fúcsia**, distinta do vermelho escuro de Vínculo de Sangue e do rosa suave de Romance.
- **FR-003**: **Adversário** MUST **manter** a família **cobre / laranja queimado**, visualmente distinta do vermelho escuro de Vínculo de Sangue e do magenta/fúcsia de Inimizade.
- **FR-004**: Vermelho escuro (Sangue), magenta/fúcsia (Inimizade) e cobre (Adversário) MUST ser mutuamente distinguíveis à primeira vista no palco (linhas sólidas sobre fundo escuro) e na coluna esquerda (chips e legenda).
- **FR-005**: **Aliado**, **Amizade**, **Romance**, **Família** e **Conhecido** MUST manter cor e estilo de linha actuais (Conhecido continua tracejado).
- **FR-006**: A mudança é só de catálogo visual: tipos, ordem canónica, qualificadores, direcção e dados gravados MUST permanecer iguais; a nova cor aplica-se de imediato a todos os vínculos existentes desses tipos.
- **FR-007**: Documentação de produto da Rede de Relações MUST actualizar a tabela de tipos: Vínculo de Sangue = vermelho escuro; Inimizade = magenta/fúcsia; Adversário = cobre — para coincidir com o que o utilizador vê.

### Out of Scope

- Novos tipos de vínculo, renomear tipos ou alterar a ordem canónica.
- Mudar o estilo de linha (sólida vs tracejada) — só Conhecido continua tracejado.
- Recolorir Aliado, Amizade, Romance, Família ou Conhecido.
- Seletor de cor livre por vínculo (a paleta continua catalogada por tipo).
- Alterar regras de filtro, duas vias, qualificadores ou visibilidade.

### Key Entities

- **Tipo de vínculo**: os 8 valores canónicos inalterados; cada tipo tem uma cor de catálogo e um estilo de linha.
- **Catálogo visual**: fonte única de cor por tipo, consumida pelo palco, filtros, legenda e ficha.
- **Vínculo duas vias**: uma linha pode mostrar duas cores de tipo (uma por sentido); as combinações entre os três tipos ajustados fazem parte do critério de distinção.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em **3 em 3** observações com os três tipos visíveis ao mesmo tempo, um avaliador identifica correctamente Vínculo de Sangue, Inimizade e Adversário **só pela cor** (sem ler a etiqueta), em menos de 5 segundos.
- **SC-002**: **100%** das superfícies que mostram cor de tipo (palco, chip, legenda, ficha) usam o mesmo tom para cada um dos três tipos ajustados — zero paleta “à parte”.
- **SC-003**: Os cinco tipos fora de âmbito permanecem reconhecíveis como antes (sem regressão visual reportada na comparação lado a lado).
- **SC-004**: A tabela de tipos no documento de produto descreve Sangue como vermelho escuro, Inimizade como magenta/fúcsia e Adversário como cobre, antes do fecho da frente.

## Assumptions

- «Vermelho escuro» para Vínculo de Sangue significa borgonha / vinho (saturado, escuro, claramente sangue — não rosa, não laranja, não violeta). O tom exacto afina-se no planeamento dentro desta família.
- Adversário permanece na família cobre actual; o tom exacto pode afinar-se no planeamento só se o borgonha novo encostar demasiado, sem sair de cobre. Inimizade (magenta/fúcsia) afina-se no planeamento para não colapsar com Romance.
- Só mudam **três** tipos; «pelo menos» no pedido trata-se como tecto desta frente, não como convite a redesenhar os outros cinco.
- A cor vive no catálogo do tipo, não em cada vínculo gravado — não há migração de dados.
- Fundo de referência: palco escuro da Rede de Relações (tema Nocturne).
- Distinção inclui linhas em **duas vias** (gradiente) entre qualquer par dos três tipos.
- Documentação canónica a actualizar: a mesma tabela de tipos da Rede de Relações já mantida para o catálogo de 8 tipos.
