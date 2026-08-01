# Feature Specification: Ocultar placeholder quando o mapa já existe

**Feature Branch**: `002-hide-map-placeholder`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Caso já tenhamos o \"campaign-map\", a mensagem de \"Mapa de campanha - envie a imagem pelo painel GM\" não se faz necessária"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o mapa real sem mensagem de envio (Priority: P1)

Um visitante (jogador) ou o GM abre a visão do mapa quando a imagem de fundo da campanha já foi publicada. A área do mapa mostra apenas a imagem; a mensagem orientando a enviar o mapa pelo painel GM **não aparece**.

**Why this priority**: Evita confusão e ruído visual quando o conteúdo principal já está disponível — é o caso normal após o GM configurar o mapa.

**Independent Test**: Com a imagem de mapa da campanha já disponível, abrir a página pública (e a área de mapa do admin) e confirmar que só a imagem é vista, sem o texto de “envie a imagem”.

**Acceptance Scenarios**:

1. **Given** a imagem de fundo da campanha já está disponível, **When** o usuário abre a visão pública do mapa, **Then** a imagem é exibida e a mensagem “Mapa da campanha — envie a imagem pelo painel GM” (ou equivalente) **não** é mostrada.
2. **Given** a imagem de fundo da campanha já está disponível, **When** o GM abre a área de mapa no painel de edição, **Then** a mesma regra se aplica: imagem visível, sem mensagem de envio.

---

### User Story 2 - Placeholder só quando falta o mapa (Priority: P2)

Quando ainda não há imagem de fundo da campanha, o usuário continua vendo um estado vazio claro com orientação para o GM enviar a imagem pelo painel — para não parecer tela quebrada.

**Why this priority**: Mantém o comportamento útil do empty state; só deve aparecer na ausência do mapa.

**Independent Test**: Remover ou tornar indisponível a imagem de fundo; abrir o mapa e ver a mensagem de orientação; restaurar a imagem e ver a mensagem sumir.

**Acceptance Scenarios**:

1. **Given** a imagem de fundo da campanha **não** está disponível, **When** o usuário abre a visão do mapa, **Then** vê um estado vazio compreensível com a orientação de envio pelo painel GM (ou equivalente).
2. **Given** a imagem acaba de se tornar disponível (ex.: após o GM enviar), **When** a vista do mapa é atualizada/recarregada, **Then** a mensagem de placeholder deixa de aparecer e a imagem ocupa o lugar.

---

### Edge Cases

- Imagem configurada mas falha ao carregar (arquivo corrompido, URL quebrada): tratar como “mapa indisponível” e mostrar o estado vazio/orientação — não deixar mensagem e imagem “fantasma” ao mesmo tempo de forma confusa.
- Troca da imagem do mapa pelo GM: após sucesso, a mensagem de “envie” não deve permanecer sobre a nova imagem.
- Visão pública vs painel GM: a regra “só mostrar orientação se não houver mapa” vale em ambos os contextos onde o mapa de fundo é exibido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Quando a imagem de fundo da campanha estiver disponível e carregar com sucesso, o sistema MUST NOT exibir a mensagem orientando o envio do mapa pelo painel GM.
- **FR-002**: Quando a imagem de fundo da campanha não estiver disponível ou falhar ao carregar, o sistema MUST exibir um estado vazio claro com orientação para o GM enviar a imagem (texto equivalente ao atual).
- **FR-003**: A regra MUST aplicar-se a todas as superfícies que mostram o mapa de fundo da campanha (visão pública e área de mapa do painel GM).
- **FR-004**: A presença da mensagem de placeholder MUST ser mutuamente exclusiva com a exibição bem-sucedida da imagem de fundo (não sobrepor a mensagem sobre o mapa já carregado).

### Key Entities

- **Imagem de fundo da campanha**: o mapa visual único usado como plano de fundo (o artefato conhecido operacionalmente como campaign-map); pode estar presente ou ausente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes com mapa já disponível e carregado, a mensagem de “envie a imagem pelo painel GM” não aparece na vista do mapa.
- **SC-002**: Em 100% dos testes sem mapa disponível (ou com falha de carga), a orientação de empty state permanece visível e compreensível.
- **SC-003**: Um avaliador consegue, em menos de 10 segundos, distinguir “mapa presente” de “mapa ausente” só pelo que aparece na tela (imagem vs. mensagem).

## Assumptions

- “Já termos o campaign-map” significa que a imagem de fundo da campanha está publicada e acessível na aplicação (não apenas um arquivo local no computador do GM fora do sistema).
- O texto exato da mensagem pode ser o atual ou um equivalente com o mesmo significado; o importante é não mostrá-la quando o mapa existe e carrega.
- Não altera o fluxo de upload do GM nem o modelo de dados da campanha — apenas a condição de exibição do empty state.
- Fora de escopo: múltiplos mapas, galeria de fundos, ou redesign amplo do empty state além da regra mostrar/ocultar.
