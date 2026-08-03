# Feature Specification: Seletor de cor do pin de local

**Feature Branch**: `009-pin-visit-colors`

**Created**: 2026-08-03

**Status**: Draft

**Input**: User description: "Adicionar a possibilidade de trocar a cor do pin, façamos um seletor de cor, vou utilizar essa funcionalidade para que o usuários possam identificar locais já visitados e não visitados. Ou, separar por apenas duas cores pré-definidas (vermelho para locais já visitados e azul ou lilás para locais ainda não visitados que os jogadores já sabem que vão)"

## Clarifications

### Session 2026-08-03

- Q: Mecanismo de cor? → A: Seletor de cor **livre** por local (opção A)
- Q: Quem pode alterar? → A: Apenas **Modo GM** (opção A)
- Q: Local sem classificação? → A: **Obrigar** escolha de cor ao criar/editar o local — sem estado vazio (opção C)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Reconhecer locais pela cor do pin (Priority: P1)

Jogadores e o mestre olham o mapa e distinguem locais pela **cor do pin** (ex.: vermelho = visitado, lilás/azul = conhecido ainda não visitado), segundo a convenção que o GM aplicar com o seletor. A diferença é visível sem abrir o detalhe de cada pin.

**Why this priority**: Valor central — orientação visual do progresso/conhecimento da campanha no mapa.

**Independent Test**: Com pins em cores distintas (ex. vermelho e lilás), um avaliador diferencia as categorias só pela cor no mapa, com a legenda/sugestão de convenção disponível.

**Acceptance Scenarios**:

1. **Given** locais com cores diferentes atribuídas, **When** o usuário visualiza o mapa, **Then** cada pin de local usa a cor persistida daquele local.
2. **Given** a legenda ou texto de convenção sugerida (visitado / conhecido não visitado), **When** o usuário consulta o mapa, **Then** consegue associar as cores usadas pelo GM ao significado pretendido, sem confundir com o pin do grupo.

---

### User Story 2 — GM escolhe a cor ao criar ou editar o local (Priority: P1)

No Modo GM, ao criar ou editar um local, o mestre **obrigatoriamente** escolhe uma cor no seletor (livre, com atalhos/sugestões opcionais para vermelho = visitado e lilás/azul = conhecido não visitado). A cor é salva e vista por todos no mapa.

**Why this priority**: Sem atribuição obrigatória no fluxo de cadastro, a US1 não tem dados confiáveis.

**Independent Test**: Em Modo GM, criar/editar um local escolhendo uma cor; sair do GM e confirmar o pin na cor escolhida; tentar salvar sem cor deve ser bloqueado.

**Acceptance Scenarios**:

1. **Given** Modo GM e formulário de local (novo ou edição), **When** o GM escolhe uma cor e salva, **Then** o pin no mapa usa essa cor.
2. **Given** Modo GM no formulário de local, **When** tenta salvar sem cor selecionada, **Then** o sistema impede o salvamento e indica que a cor é obrigatória.
3. **Given** cor salva, **When** um jogador (fora do Modo GM) abre o mapa, **Then** vê o pin na mesma cor; **não** há controle de edição de cor para o jogador.

---

### Edge Cases

- Não existe local “sem cor”: criação e edição exigem cor antes de persistir.
- Locais já existentes antes desta feature: na primeira edição pelo GM (ou migração/default na entrega), devem receber uma cor válida — ver Assumptions.
- Muitos locais na mesma cor: distinguíveis por posição/nome; a cor comunica a categoria escolhida pelo GM.
- Pin do grupo: **não** muda com a cor de locais.
- Acessibilidade: nome do local (e, se houver, texto no detalhe) permanece disponível; a cor não é o único meio de identificar *qual* local é.
- Troca de cor: atualiza o pin na sessão e permanece após recarregar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada pin de local no mapa MUST ser renderizado com a **cor persistida** daquele local.
- **FR-002**: Em Modo GM, o formulário de criar/editar local MUST incluir um **seletor de cor livre**; a interface SHOULD oferecer atalhos/sugestões alinhados à convenção de visita (ex. vermelho = visitado, lilás ou azul = conhecido não visitado), sem limitar o GM a apenas essas duas cores.
- **FR-003**: A cor do local MUST persistir e ser visível a jogadores e mestres no mapa.
- **FR-004**: Apenas o **Modo GM** MUST poder definir ou alterar a cor do pin; jogadores MUST apenas visualizar.
- **FR-005**: A legenda do mapa (ou texto equivalente) MUST explicar a **convenção sugerida** de cores para visita (visitado vs. conhecido não visitado), deixando claro que o GM pode usar outras cores.
- **FR-006**: A cor do pin de local MUST NOT alterar a aparência do pin/ícone do grupo.
- **FR-007**: Criar ou salvar um local MUST exigir cor selecionada; o sistema MUST NOT persistir local sem cor.
- **FR-008**: Jogadores MUST NOT ver controle de edição de cor no mapa ou no fluxo de jogador.

### Key Entities

- **Local**: ponto no mapa com nome, posição e **cor do pin** (obrigatória).
- **Cor do pin**: valor de cor escolhido no seletor; usado na renderização do marcador.
- **Convenção sugerida de visita**: orientação de uso (vermelho ≈ visitado; lilás/azul ≈ conhecido não visitado), não um enum rígido no produto após a clarificação A.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com ≥3 locais com cores distintas, 100% dos pins exibem a cor salva correspondente no mapa.
- **SC-002**: Após o GM alterar a cor de um local, 100% das visualizações subsequentes (incluindo recarregar) mostram a nova cor.
- **SC-003**: Em ≤30 segundos, um GM muda a cor de um local existente e vê o pin atualizado no mapa.
- **SC-004**: Em 100% dos testes, tentativa de salvar local sem cor é bloqueada com feedback claro.
- **SC-005**: Em 100% dos testes em modo jogador, não há UI para editar cor de pin.
- **SC-006**: 100% dos testes confirmam que o ícone do grupo não muda por causa desta feature.

## Assumptions

- O seletor livre é o mecanismo; a distinção visitado / não visitado é uma **convenção de uso** do GM (atalhos sugeridos vermelho / lilás-ou-azul), não um status enum obrigatório nesta entrega.
- Entre azul e lilás para a sugestão de “não visitado”, a implementação escolhe **uma** cor sugerida (preferência: lilás) como swatch; o GM ainda pode escolher azul livremente.
- Locais legados sem cor: na entrega, receberão uma cor padrão sugerida (ex. lilás “conhecido não visitado”) via migração ou default na leitura, até o GM editar.
- Fora de escopo: filtros por cor, histórico de visitas com datas, cores por jogador, edição de cor por jogadores.
