# Feature Specification: Modais que cabem na tela

**Feature Branch**: `018-modal-viewport-fit`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Com base na spec specs/017-location-connections, temos que ter cuidado com o tamanho do modal, se ele ficar grande mais ele vai quebrar a visualização em tela."

## Clarifications

### Session 2026-08-03

- Q: Onde ficam as ações do modal? → A: Rodapé fixo — ações sempre visíveis; só o conteúdo do meio rola.
- Q: Listas longas de Saídas/NPCs (chips)? → A: Só o corpo do modal rola; chips fazem parte desse scroll (sem scroll interno separado na área de chips).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar local sem perder a tela (Priority: P1)

O GM abre o formulário de criar/editar local (agora mais longo com a lista de saídas da 017 e outros campos). Em telas comuns (notebook, janela não maximizada ou altura limitada), o modal não “estoura” a viewport: o conteúdo do meio é acessível por rolagem interna, e os botões Cancelar/Salvar ficam **sempre visíveis** num rodapé fixo do modal (sem precisar rolar até o fim nem arrastar a janela do navegador).

**Why this priority**: A 017 aumentou o formulário do local; sem limite de altura, o GM não consegue salvar ou ver o mapa por baixo de forma previsível.

**Independent Test**: Com muitos locais na campanha (lista longa de saídas) e/ou janela com altura reduzida (~700px ou menos), abrir “Editar local”, rolar os campos e salvar/cancelar **sem** rolar para achar os botões.

**Acceptance Scenarios**:

1. **Given** o formulário de local aberto com muitos destinos de saída possíveis, **When** a altura da janela é limitada, **Then** o modal permanece contido na área visível e Cancelar/Salvar permanecem visíveis no rodapé.
2. **Given** o conteúdo do formulário excede a altura disponível, **When** o GM rola a área de conteúdo, **Then** consegue ver e usar todos os campos (incluindo Saídas) enquanto as ações do rodapé continuam visíveis.
3. **Given** o modal de local aberto, **When** o GM cancela ou salva, **Then** o fluxo fecha normalmente e o mapa volta ao uso esperado.

---

### User Story 2 - Ler o pin sem cobrir demais a vista (Priority: P2)

O jogador (ou GM) abre o painel de detalhe do pin. Com descrição longa, muitos NPCs ou conteúdo rico, o painel não quebra a leitura nem empurra controles essenciais para fora da tela; o excesso rola dentro do painel.

**Why this priority**: O pin ao lado do mapa já compete por espaço; conteúdo longo piora o problema da 017 (linhas + painel).

**Independent Test**: Abrir um local com descrição longa e vários chips; em viewport típica e estreita, fechar o painel e ler o conteúdo via rolagem sem scroll da página “por trás” de forma quebrada.

**Acceptance Scenarios**:

1. **Given** um local com descrição longa no pin, **When** o usuário abre o detalhe, **Then** o painel respeita a altura útil da tela e o excesso é rolável na área de conteúdo.
2. **Given** o painel do pin aberto com conteúdo longo, **When** o usuário quer fechar, **Then** o botão Fechar permanece visível no rodapé fixo (sem precisar rolar até o fim).

---

### User Story 3 - Outros diálogos GM não regressam (Priority: P3)

Diálogos semelhantes do Modo GM (ex.: NPC, arco, gate) que cresçam com conteúdo também respeitam o mesmo princípio de caber na viewport, sem redesenhar cada fluxo do zero além do padrão compartilhado.

**Why this priority**: Evita corrigir só o local e deixar o mesmo problema nos outros forms.

**Independent Test**: Abrir formulário de NPC com texto longo em janela baixa; confirmar que cabe/rola e ações ficam acessíveis.

**Acceptance Scenarios**:

1. **Given** um diálogo GM com conteúdo alto, **When** a janela é baixa, **Then** o comportamento de contenção/rolagem é coerente com o do formulário de local.

---

### Edge Cases

- Viewport estreita (mobile / painel estreito): modal ainda usável; não exige zoom da página.
- Poucos campos / pouco conteúdo: modal não precisa ocupar altura desnecessária (não forçar “tela cheia” vazia).
- Muitos chips de saídas/NPCs: aumentam o corpo rolável; não empurram o rodapé de ações para fora da tela.
- Redimensionar a janela com o modal aberto: o painel continua contido na nova altura.
- Modal ao lado do pin vs centrado: em ambos os modos, a regra de caber na tela vale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Diálogos de formulário/detalhe que possam crescer com o conteúdo MUST permanecer visualmente contidos na viewport (altura útil da tela, com margem segura).
- **FR-002**: Quando o conteúdo exceder a altura disponível, o sistema MUST permitir rolar a **área de conteúdo** do modal (corpo entre título e ações), sem rolar a página por trás de forma a “perder” o diálogo.
- **FR-003**: Ações primárias do modal (Salvar, Cancelar, Fechar) MUST permanecer **sempre visíveis** num **rodapé fixo** do próprio modal enquanto ele estiver aberto (não apenas alcançáveis após rolar até o fim do conteúdo).
- **FR-004**: O formulário de local (incluindo a seção de Saídas da 017) MUST cumprir FR-001–FR-003.
- **FR-005**: O painel de detalhe do pin MUST cumprir FR-001–FR-003.
- **FR-006**: Outros diálogos GM que usem o mesmo padrão de modal MUST herdar o mesmo comportamento de contenção (sem regressão óbvia).
- **FR-007**: Em conteúdo curto, o modal MUST NOT ocupar artificialmente a tela inteira só para “preencher”.
- **FR-008**: Listas densas (ex.: chips de Saídas ou NPCs) MUST rolar junto com o corpo do modal; NÃO exigem uma região de scroll aninhada própria nesta feature.

### Key Entities

- **Modal / diálogo**: Superfície flutuante (formulário GM ou detalhe do pin) sobre o mapa.
- **Viewport**: Área visível da janela onde o mapa e o modal competem por espaço.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em janela com altura ≤ 700px, o GM consegue abrir o formulário de local com ≥10 destinos na lista de Saídas, marcar/desmarcar um destino e salvar ou cancelar em menos de 1 minuto sem redimensionar a janela.
- **SC-002**: Em 100% dos testes manuais com descrição longa no pin (viewport desktop e ~375px de largura), o botão Fechar permanece visível no rodapé e o texto completo é legível via rolagem da área de conteúdo.
- **SC-003**: Com modal aberto e conteúdo longo, botões críticos nunca ficam fora da área visível do modal (rodapé fixo).
- **SC-004**: Formulários curtos (poucos campos) continuam com aparência compacta — não “esticados” à altura máxima sem necessidade; o rodapé acompanha o painel compacto (não cria faixa vazia enorme).

## Assumptions

- O problema foi agravado pela 017 (campo Saídas + formulário de local já rico); o escopo prioriza o formulário de local e o painel do pin, estendendo o padrão aos demais diálogos GM.
- Solução esperada em termos de experiência: **altura máxima relativa à tela + rolagem só do corpo + rodapé fixo de ações** (clarificado); chips longos entram no mesmo scroll do corpo; não remover campos nem paginar o formulário nesta feature.
- Não é necessário um novo tipo de “wizard” multi-etapas para o local nesta feature.
- Mapas e linhas da 017 continuam iguais; esta feature só trata da superfície do modal/painel.
- Fora de escopo: redesenho visual completo do design system; mudar o posicionamento “ao lado do pin” (013) além do necessário para caber na tela.
