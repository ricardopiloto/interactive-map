# Feature Specification: Tema e identidade por campanha

**Feature Branch**: `108-tema-identidade-campanha`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Tema e identidade por campanha. Cada campanha escolhe uma cor de acento (paleta curta que passe no contraste AA nos dois temas), uma imagem de capa e um conjunto padrão sugerido pelo sistema (WFRP, WoD, outro). O acento troca o token do RFC e vale na campanha inteira. Capa e acento aparecem no cartão da página inicial (spec 098). Inclui uma pequena mudança de backend (campos no banco de controle e envio da capa pelo endpoint de mídia da 096). Fora de escopo: temas totalmente customizados. Depende de: 093, 096, 098, UX-3. Critério-chave: nenhuma cor de acento escolhida pode reprovar o contraste; sem acento definido vale o latão padrão."

**Depends on**: [093-controle-alembic-sqlite](../093-controle-alembic-sqlite/spec.md) (banco de controlo / Campanha); [096-uploads-cota](../096-uploads-cota/spec.md) (mídia + cota); [098-home-painel-mestre](../098-home-painel-mestre/spec.md) (cartões da home e painel); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (UX-3 — chrome / tema claro-escuro); [100-fundacoes-sistema-visual](../100-fundacoes-sistema-visual/spec.md) (UX-1 — token de acento); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-9); constituição v1.0.0 (I–VI).

**Phase**: UX-9. **Identidade visual por campanha**: acento (paleta curta pré-validada), imagem de capa, e **sugestões** de conjunto padrão conforme o **sistema** da campanha (WFRP, WoD, outro). O acento **substitui o token** de acento do RFC **nessa campanha** (mesa inteira sob `/c/:slug`). Capa e acento enriquecem os **cartões** da página inicial (098). Pequena mudança de backend no **controlo** + upload de capa via mídia (096). **Fora de escopo**: temas totalmente customizados (cores livres arbitrárias, CSS por campanha, temas inventados pelo mestre).

## Clarifications

### Session 2026-09-21

- Q: Quantas cores tem a paleta curta de acento? → A: 5 no total (latão + 4).
- Q: Onde o dono configura acento e capa? → A: Só no Painel (`/painel`), por cartão de campanha.
- Q: O que inclui o conjunto padrão sugerido por sistema? → A: Só acento sugerido da paleta (sem capa de referência do produto).
- Q: Export/import transporta acento e capa? → A: Sim — incluir acento + capa no pacote nesta fase.
- Q: Categoria de upload da capa? → A: Nova categoria `covers` no endpoint de mídia.

## Constitution

- Isolamento (I): identidade (acento, capa) só da campanha do slug; catálogo público pode expor capa/acento das `listada` sem vazar `so_link` nem dados de outros donos no painel. Rotas novas de escrita MUST entrar na matriz (dono vs anónimo vs outro mestre).
- Testes primeiro (II): contraste AA de **todas** as cores da paleta nos dois temas; default latão; isolamento de PATCH identidade; upload de capa na cota — testes a falhar antes da implementação correspondente.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): paleta curta fechada; um token de acento; reutilizar upload 096; 098 continua dona da home/painel — esta fase só acrescenta campos visuais.
- i18n (V): rótulos da paleta, sugestões por sistema, erros de upload/validação MUST ter pt-BR e en. Nome da campanha e ficheiro do mestre MUST NOT ser traduzidos.
- Migrações (VI): campos novos em `Campanha` (controlo) MUST ser Alembic `render_as_batch`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acento da campanha na mesa inteira (Priority: P1)

O dono escolhe uma **cor de acento** numa **paleta curta** (todas as opções já passam contraste AA nos temas claro e escuro). Ao abrir `/c/<slug>`, a mesa aplica esse acento via o **token** do sistema visual (acções primárias, selecção, foco). Se **não** houver acento definido, vale o **latão padrão** do RFC/UX-1.

**Why this priority**: Critério-chave de contraste + identidade na sessão de jogo.

**Independent Test**: Campanha com acento A vs sem acento; tema claro e escuro; botão primário/foco usam A ou latão; nenhuma opção da paleta falha o script/checklist de contraste.

**Acceptance Scenarios**:

1. **Given** campanha **sem** acento gravado, **When** se abre a mesa nos dois temas, **Then** o acento é o **latão padrão**.
2. **Given** dono escolhe uma cor da paleta e grava, **When** qualquer ecrã da mesa (`/c/<slug>/…`) renderiza, **Then** o token de acento reflecte essa cor (não o latão, salvo se escolheu o latão).
3. **Given** a paleta completa, **When** se valida contraste AA (texto sobre acento / acento sobre fundos relevantes) em **tema claro e escuro**, **Then** **nenhuma** cor da paleta reprova.
4. **Given** acento da campanha A, **When** se abre a campanha B, **Then** B **não** herda o acento de A.

---

### User Story 2 - Capa e cartão na página inicial (Priority: P1)

O dono pode definir uma **imagem de capa** (upload pela mídia da 096, contando para a cota). Nos cartões da **página inicial** (campanhas `listada`), a capa e o acento (ou latão) aparecem de forma reconhecível. Campanhas sem capa mostram cartão sem imagem grande inventada (estado discreto / sugestão do conjunto padrão se aplicável).

**Why this priority**: RFC — capa e acento no cartão da 098; descoberta pública.

**Independent Test**: Listada com capa+acento no `/`; so_link sem capa na home; upload falha com mensagem clara; cota aumenta.

**Acceptance Scenarios**:

1. **Given** campanha `listada` com capa e acento, **When** um anónimo abre `/`, **Then** o cartão mostra capa e indicação de acento (além de nome/sistema da 098).
2. **Given** campanha `listada` **sem** capa, **When** abre `/`, **Then** o cartão continua utilizável (nome/sistema) **sem** exigir imagem; MUST NOT inventar foto de stock obrigatória.
3. **Given** campanha `so_link` com capa, **When** abre `/`, **Then** **não** aparece no catálogo (098); a capa só se usa onde a campanha já é visível (painel / mesa).
4. **Given** dono faz upload de capa válida, **When** completa, **Then** a capa fica associada à campanha e os bytes contam na cota (096). Upload inválido ou acima da cota → recusa com erro claro (Toast/copy i18n).

---

### User Story 3 - Conjunto padrão sugerido pelo sistema (Priority: P1)

Ao criar ou ao configurar identidade, o sistema (WFRP, WoD, **outro**) **sugere** um conjunto padrão (acento e/ou capa de referência do produto — não tema CSS livre). O mestre pode **aceitar a sugestão** ou escolher outra cor da paleta / outra capa. O campo **sistema** da campanha permanece o da 093/098 (**imutável** após criar); esta fase **não** reabre alteração de sistema.

**Why this priority**: Acelera identidade coerente por tipo de mesa sem temas custom.

**Independent Test**: Criar/editar identidade com sistema WFRP vs WoD vs outro → sugestões distintas ou claramente rotuladas; aceitar sugestão aplica valores da paleta válida; rejeitar e escolher outra cor também válido.

**Acceptance Scenarios**:

1. **Given** campanha com sistema WFRP (ou WoD / outro), **When** o dono abre a configuração de identidade no painel, **Then** vê **sugestão de acento** associada a esse sistema (rótulos i18n).
2. **Given** a sugestão, **When** a aceita, **Then** o acento da paleta aplica-se.
3. **Given** a sugestão, **When** escolhe outra cor da paleta, **Then** a escolha prevalece; MUST NOT forçar a sugestão.
4. **Given** sistema já gravado, **When** configura identidade, **Then** MUST NOT pedir nem permitir mudar o sistema (098/093).

---

### User Story 4 - Dono configura no painel; isolamento (Priority: P2)

Só o **dono** altera acento/capa da sua campanha no **painel autenticado** (não dentro da mesa). Outro mestre e anónimo não. O painel «minhas campanhas» pode mostrar preview discreto (acento/capa) das **suas** mesas.

**Why this priority**: Segurança e ponto de edição; secundário à aplicação na mesa/home.

**Independent Test**: PATCH identidade: dono OK; anónimo e mestre B → falha; painel de A não mostra campanhas de B.

**Acceptance Scenarios**:

1. **Given** dono autenticado, **When** actualiza acento e/ou capa no painel, **Then** persiste e reflecte-se na home (se listada) e na mesa.
2. **Given** anónimo ou mestre não-dono, **When** tenta alterar identidade de A, **Then** é recusado (sem alterar dados).
3. **Given** mestre A, **When** vê o painel, **Then** só as suas campanhas; preview de identidade MUST NOT vazar mesas de B.

---

### Edge Cases

- Acento `null`/ausente → latão padrão (nunca “sem acento” visual quebrado).
- Cor fora da paleta (API maliciosa) → recusa; MUST NOT aplicar hex arbitrário.
- Remover capa → cartão sem imagem; ficheiro órfão tratado conforme política 096 (reconcile / apagar — detalhe no plano).
- Tema claro/escuro do utilizador (UX-3) **combina** com acento da campanha: ambos os temas MUST continuar AA com essa cor.
- Campanha inactiva: fora das listas 098; identidade não precisa de UI extra.
- Export/import (097): MUST incluir acento e capa no pacote nesta fase (manifest + ficheiro de capa).
- `/opt/codex-*` intocado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Campanha MUST poder persistir **acento** (identificador da paleta curta ou ausente) e **referência de capa** no **banco de controlo** (migração Alembic).
- **FR-002**: A paleta de acentos MUST ter **5** opções (latão + 4) e ser **fechada**; **todas** as cores MUST passar contraste **AA** nos temas **claro e escuro** (critério-chave). MUST NOT oferecer cor livre / tema totalmente customizado.
- **FR-003**: Sem acento definido, a mesa MUST usar o **latão padrão** (critério-chave).
- **FR-004**: Com acento definido, a mesa sob `/c/:slug` MUST aplicar essa cor ao **token de acento** do RFC (acções primárias, selecção, foco) em toda a campanha.
- **FR-005**: Upload de capa MUST usar o **endpoint de mídia** da 096 com categoria nova **`covers`** (cota, ACL, isolamento por slug).
- **FR-006**: Cartões da página inicial (098) MUST mostrar **capa** (se existir) e **acento** (ou latão) para campanhas `listada`, sem expor `so_link`.
- **FR-007**: MUST existir **sugestão de acento** por sistema conhecido (WFRP, WoD, outro), aceitável ou substituível pelo dono; MUST NOT incluir capa de stock obrigatória do produto; MUST NOT tornar o sistema editável.
- **FR-008**: Só o **dono** MUST poder alterar acento/capa **no Painel**; anónimo e não-dono MUST falhar. MUST NOT exigir UI de identidade dentro da mesa. Cobertura na matriz de isolamento.
- **FR-009**: Catálogo público / «minhas campanhas» MUST incluir os campos necessários à UI (acento, URL/ref de capa) **sem** vazar campanhas alheias ou `so_link` na home.
- **FR-010**: MUST NOT exigir `/opt/codex-*`. MUST NOT permitir temas CSS arbitrários por campanha.
- **FR-011**: Export/import de campanha MUST transportar **acento** e **capa** (quando existirem) sem quebrar pacotes antigos sem esses campos.

### Out of Scope

- Temas totalmente customizados (picker de cor livre, upload de CSS, modos além claro/escuro global).
- Alterar nome/slug/sistema/módulos (já fora ou imutáveis na 098).
- Redesign completo da home/painel (098 é dona; UX-9 só identidade).
- Co-mestre a editar identidade (só dono nesta fase).

### Key Entities

- **Acento de campanha**: escolha na paleta fechada, ou ausente (= latão).
- **Paleta de acentos**: conjunto curto pré-validado AA (claro + escuro).
- **Capa**: imagem associada à campanha via mídia 096.
- **Conjunto padrão por sistema**: sugestão (acento ± capa de referência) para WFRP, WoD, outro.
- **Token de acento**: variável visual da UX-1 sobrescrita no âmbito da mesa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: **0** cores da paleta falham contraste AA nos temas claro e escuro (script ou checklist equivalente ao da UX-1).
- **SC-002**: Campanha sem acento → latão em 100% dos ecrãs da mesa amostrados; com acento → 100% desses ecrãs usam o acento escolhido (não o de outra campanha).
- **SC-003**: Cartão `listada` na home reflecte capa (se houver) e acento/latão; `so_link` continua ausente da home.
- **SC-004**: 100% dos pedidos de escrita de identidade por anónimo ou não-dono falham; dono sucede.
- **SC-005**: Upload de capa conta na cota; falha de cota/tipo produz erro compreensível (pt-BR/en).
- **SC-006**: Sugestão por sistema está disponível para WFRP, WoD e outro sem permitir editar o sistema.

## Assumptions

- «Conjunto padrão sugerido pelo sistema» = presets de produto (acento da paleta ± asset de capa opcional), **não** novos valores do campo `sistema`.
- Latão = acento default da UX-1/RFC quando `acento` está vazio.
- Acento na home pode ser uma faixa/borda/swatch no cartão — detalhe visual no plano; MUST ser perceptível.
- Capas de referência dos presets podem ser assets estáticos do produto ou só a cor até haver assets — o plano escolhe; upload do mestre é sempre suportado.
- 098 Implemented: esta fase estende APIs/UI existentes; não redesenha fluxos de criar/visibilidade/export.
- Tema claro/escuro continua a ser preferência do **utilizador** (UX-3); acento é da **campanha**.
