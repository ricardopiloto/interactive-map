# Feature Specification: Focar pin ao clicar no mapa

**Feature Branch**: `015-map-pin-focus`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Algo que percebi, se eu selecionar um pin diretamente no mapa, ele da o zoom no mapa porém ele posiciona o pin fora do campo de visão, e o modal acompanha a posição do pin. Ao clicar em um pin diretamente no mapa ele deve focar o zoom no pin que foi clicado."

## Clarifications

### Session 2026-08-03

- Q: Foco ao clicar no pin no Modo GM? → A: Foco por clique no pin só no modo jogador.
- Q: Clicar de novo no mesmo pin já selecionado? → A: Reaplicar foco (pan+zoom moderado) a cada clique no mesmo pin.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clicar no pin e vê-lo no centro da vista (Priority: P1)

Como jogador, ao clicar um pin diretamente no mapa, quero que o mapa **centralize e aplique zoom moderado nesse pin**, para o marcador ficar claramente na área visível enquanto o detalhe abre ao lado — sem o pin sumir fora do campo de visão.

**Why this priority**: Corrige o problema relatado; o clique no pin deve garantir que o local fique legível na vista.

**Independent Test**: Com o mapa afastado ou panado para longe, clicar um pin no mapa; após a transição, o pin fica na região central (ou claramente visível) com zoom moderado; o detalhe, se aberto, acompanha o pin sem deixá-lo oculto sob o painel (comportamento de detalhe ao lado já existente).

**Acceptance Scenarios**:

1. **Given** o mapa está afastado ou panado de forma que um pin X não está no centro da vista, **When** o usuário clica o pin X no mapa (modo jogador), **Then** o mapa anima pan+zoom para **focar X** num zoom moderado fixo (o mesmo nível usado ao focar pelo menu) e X permanece **visível** na área útil do mapa.
2. **Given** o detalhe do local abre após o clique no pin, **When** o foco termina, **Then** o pin continua visível (não fora do campo de visão) e o painel de detalhe permanece utilizável ao lado conforme o comportamento já entregue.
3. **Given** o usuário clica outro pin Y no mapa, **When** o clique ocorre, **Then** o mapa refoca Y com o mesmo zoom moderado fixo.
4. **Given** o pin X já está selecionado (detalhe aberto) e o usuário panou/zoomou para longe, **When** clica X de novo no mapa, **Then** o mapa **reaplica** o foco (pan+zoom moderado) em X.

---

### User Story 2 - Consistência com o menu e sem regressão (Priority: P2)

Como usuário, quero que o foco ao clicar no pin seja consistente com o foco ao clicar no menu, e que hover, GM placement e fechar o detalhe continuem como hoje.

**Why this priority**: Evita dois comportamentos divergentes de “ir até o pin”.

**Independent Test**: Comparar clique no menu vs clique no pin: ambos deixam o pin visível no zoom moderado; hover não foca; em placement GM o bloqueio de seleção existente permanece.

**Acceptance Scenarios**:

1. **Given** o usuário clica um local no menu e depois clica outro pin no mapa, **When** ambos os gestos completam, **Then** ambos usam o **mesmo** nível de zoom moderado fixo de foco.
2. **Given** hover sobre um nome no menu, **When** o usuário não clica, **Then** o mapa **não** aplica o foco de pan/zoom (só o destaque de hover existente).
3. **Given** Modo GM (com ou sem placement), **When** o usuário clica um pin no mapa, **Then** o foco de pan/zoom desta feature **não** é exigido; permanecem apenas as regras atuais de seleção/placement do GM.

---

### Edge Cases

- Pin já aproximadamente centrado no zoom moderado: o foco **reaplica** a animação curta a cada clique no mesmo pin (não é no-op só por já estar selecionado).
- Mapa sem superfície / pin sem nó visível: clique não deve gerar falha bloqueante; foco pode ser no-op.
- Mobile: após clicar o pin, o pin deve permanecer reconhecível na área do mapa disponível.
- Modal ao lado do pin (013): o posicionamento do detalhe continua ancorado ao pin; o foco no mapa deve ocorrer de modo que pin + painel façam sentido (pin na vista).
- Modo GM: foco por clique no pin não é exigido nesta feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao clicar um pin de local diretamente no mapa em **modo jogador** (interação permitida), o sistema MUST focar esse pin na área visível do mapa com pan + **zoom moderado fixo** (o mesmo nível usado no foco pelo menu). Em Modo GM, o clique no pin MUST NOT ser obrigado a disparar este foco.
- **FR-002**: Após o foco por clique no pin, o pin clicado MUST permanecer **visível** na área útil do mapa (não fora do campo de visão).
- **FR-003**: O foco por clique no pin MUST usar transição animada suave e curta, alinhada ao comportamento de foco já usado pelo menu. Cada novo clique no pin (incluindo o **mesmo** pin já selecionado) MUST **reaplicar** o foco.
- **FR-004**: O clique no pin MUST continuar abrindo/selecionando o detalhe do local conforme o fluxo jogador existente; o foco é complemento, não substituto.
- **FR-005**: Hover no menu MUST NOT, por si só, disparar este foco de pan/zoom.
- **FR-006**: Em Modo GM, esta feature MUST NOT exigir foco por clique no pin. Se a seleção estiver bloqueada por placement, o comportamento de seleção existente permanece.
- **FR-007**: Se o mapa ou o pin não puderem ser focados (modo jogador), o clique MUST NOT gerar erro bloqueante na interface.

### Key Entities

- **Local (pin)**: Marcador clicável no mapa com posição e detalhe associado.
- **Foco de mapa**: Ajuste transitório de pan/zoom para destacar um pin específico após clique no mapa ou no menu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais com mapa carregado, após clicar um pin no mapa o pin clicado fica visível na área útil (não fora da vista).
- **SC-002**: Em 100% desses testes, o zoom estabiliza no mesmo nível moderado fixo usado pelo foco via menu.
- **SC-003**: O usuário reconhece o pin focado em menos de 3 segundos após o clique no mapa, incluindo a animação.
- **SC-004**: Nenhuma regressão: hover no menu não foca; clique no menu continua focando; detalhe ao lado do pin continua utilizável quando aplicável; Modo GM não fica obrigado a focar ao clicar pin.

## Assumptions

- O nível de zoom e a duração da animação reutilizam os mesmos alvos já definidos para o foco pelo menu (zoom moderado fixo + animação curta).
- O problema observado (“pin fora do campo de visão” com modal acompanhando) é tratado garantindo foco explícito e correto no pin clicado no mapa.
- Modo jogador é o único fluxo em que o clique no pin **deve** disparar foco + detalhe; Modo GM não exige este foco.
- Não há mudança de dados persistidos nem de API.
- Clique no pin no mapa passa a **exigir** foco (diferente da decisão anterior de focar só pelo menu).
- Cada clique no mesmo pin **reaplica** o foco (como o nonce do foco pelo menu).
