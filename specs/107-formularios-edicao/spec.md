# Feature Specification: Formulários e edição

**Feature Branch**: `107-formularios-edicao`

**Created**: 2026-09-20

**Status**: Implemented

**Input**: User description: "Formulários e edição. Diálogos de local, NPC, arco e vínculo viram Drawer com seções, validação inline e aviso de alterações não salvas. Editor de Markdown com pré-visualização (a descrição já aceita Markdown). Envio de imagem com arrastar e soltar e Toast de erro. Depende de: UX-2, UX-5. Critério-chave: fechar com alterações pendentes pede confirmação; erros de validação aparecem junto ao campo."

**Depends on**: [101-componentes-base-icones](../101-componentes-base-icones/spec.md) (UX-2 — Drawer, ConfirmDialog, Toast, Input/…); [104-listas-edicao-mapa](../104-listas-edicao-mapa/spec.md) (UX-5 — entrada Editar/Excluir só no Modo edição); [102-estrutura-navegacao](../102-estrutura-navegacao/spec.md) (UX-3 — Modo edição); RFC ([docs/v2/rfc-ux-redesign.md](../../docs/v2/rfc-ux-redesign.md) fase UX-8); constituição v1.0.0 (III, IV, V). Coordena com [105-rede-relacoes](../105-rede-relacoes/spec.md) para o formulário de vínculo sem redesenhar o grafo.

**Phase**: UX-8. Experiência de **criar/editar** local, NPC/personagem, arco e vínculo. Substitui diálogos modais centrados por **Drawer** com secções, validação inline, protecção de alterações não salvas, editor Markdown com pré-visualização e upload de imagem por arrastar e soltar. **MUST NOT** alterar contratos de API/schema de conteúdo (campos e regras de negócio existentes mantêm-se).

## Clarifications

### Session 2026-09-21

- Q: Como fica o editor Markdown com pré-visualização? → A: Separadores Escrever / Pré-visualizar (vista única alternada).
- Q: Quais campos ganham o editor Markdown? → A: Só descrições que já são Markdown na leitura (local + NPC/personagem); notas de vínculo ficam textarea simples.
- Q: Com Drawer sujo, abrir Editar/Novo de outra entidade? → A: ConfirmDialog; ao confirmar, descartar e abrir a nova entidade.
- Q: Quando aparecem os erros de validação inline? → A: Só ao Guardar; depois do 1.º submit, revalidar ao alterar campos com erro.
- Q: De que lado / como abre o Drawer? → A: Direita no desktop; bottom sheet / full-width em viewport estreita.

## Constitution

- Isolamento (I): formulários só da campanha do slug; uploads e gravações já isolados; sem rotas novas de conteúdo salvo justificação no plano.
- Testes primeiro (II): «fechar com alterações pendentes pede confirmação» e «erros de validação junto ao campo» MUST ser verificáveis (cenários manuais/checklist; testes automatizados onde o plano o definir).
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): reutilizar Drawer, ConfirmDialog, Toast, Input/Select/Textarea da UX-2; sem biblioteca de formulários pesada sem justificação.
- i18n (V): rótulos, secções, erros de validação, confirmações e toasts MUST ter pt-BR e en. Texto escrito pelo mestre (nome, descrição, notas) MUST NOT ser traduzido.
- Migrações (VI): N/A (sem schema), salvo se o plano descobrir campo já existente a expor — sem inventar campos novos de conteúdo nesta fase.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edição em Drawer com secções (Priority: P1)

Ao editar (ou criar) um **local**, **NPC/personagem**, **arco** ou **vínculo**, o mestre vê um **Drawer** (painel lateral acessível: Esc, foco preso e devolvido, aria-modal, bloqueio de scroll) em vez de um diálogo modal centrado genérico. O formulário está organizado em **secções** claras (ex. identidade, descrição, imagem, visibilidade — conforme campos já existentes), não numa pilha única sem hierarquia.

**Why this priority**: Base da fase; UX-5 só abre a edição — esta fase entrega o contentor.

**Independent Test**: A partir do Modo edição (lista/grafo), Abrir Editar em cada entidade; Drawer abre; secções visíveis; Esc/fechar devolvem o foco; jogador não vê estes drawers.

**Acceptance Scenarios**:

1. **Given** Modo edição activo e permissão, **When** o mestre escolhe Editar (ou Novo) para local, NPC, arco ou vínculo, **Then** abre um **Drawer** (não um modal centrado legado) com o formulário dessa entidade.
2. **Given** o Drawer aberto, **When** se observa o conteúdo, **Then** os campos estão agrupados em **secções** com títulos compreensíveis (pt-BR/en).
3. **Given** o Drawer aberto, **When** o mestre carrega Esc (sem alterações pendentes) ou um fechar explícito, **Then** o Drawer fecha e o **foco volta** ao controlo que o abriu.
4. **Given** utilizador sem Modo edição / sem permissão, **When** navega a app, **Then** **não** consegue abrir estes Drawers de edição (entrada continua a ser UX-5 / permissões).

---

### User Story 2 - Validação inline e alterações não salvas (Priority: P1)

Erros de validação aparecem **junto ao campo** (não só num alerta global). Se o mestre tentar **fechar** o Drawer (Esc, overlay, botão fechar) com **alterações pendentes** não gravadas, a app **pede confirmação** (ConfirmDialog) antes de descartar. Guardar com sucesso fecha (ou confirma) sem esse aviso.

**Why this priority**: Critério-chave da fase.

**Independent Test**: Campo obrigatório vazio → erro junto ao campo ao tentar gravar; editar um campo → Esc → ConfirmDialog; confirmar descarte → fecha sem gravar; cancelar o diálogo → permanece no Drawer.

**Acceptance Scenarios**:

1. **Given** um campo inválido ou obrigatório em falta, **When** o mestre tenta gravar, **Then** vê a mensagem de erro **junto a esse campo** (e o foco pode ir para o primeiro erro); MUST NOT depender só de `window.alert` ou toast genérico sem indicação do campo.
2. **Given** o formulário com alterações não gravadas, **When** tenta fechar o Drawer, **Then** aparece **ConfirmDialog** a avisar de alterações não salvas; confirmar descarta e fecha; cancelar mantém o Drawer aberto com os dados.
3. **Given** formulário sem alterações (ou acabou de gravar com sucesso), **When** fecha, **Then** **não** pede confirmação de descarte.
4. **Given** alterações pendentes, **When** grava com sucesso, **Then** o estado «sujo» limpa-se e um fecho posterior imediato não pede descarte.

---

### User Story 3 - Markdown com pré-visualização (Priority: P1)

Campos de **descrição** (e afins que já aceitam Markdown) usam um **editor Markdown com pré-visualização** (escrever / ver resultado), alinhado ao renderizado seguro já usado na leitura (sem HTML perigoso).

**Why this priority**: A descrição já aceita Markdown na leitura; a edição deve mostrar o resultado antes de gravar.

**Independent Test**: Escrever Markdown conhecido (negrito, lista, link http); pré-visualização reflecte; gravar e reler na ficha/popover mostra o mesmo espírito.

**Acceptance Scenarios**:

1. **Given** Drawer de local (e outras entidades com descrição Markdown no âmbito), **When** o mestre edita a descrição, **Then** pode alternar ou ver em simultâneo **edição** e **pré-visualização** Markdown.
2. **Given** Markdown na pré-visualização, **When** se compara com a leitura pública existente, **Then** o resultado é coerente (renderização segura; sem scripts/imagens inseguras além das regras já definidas).
3. **Given** descrição vazia, **When** pré-visualiza, **Then** vê estado vazio discreto (não erro técnico).

---

### User Story 4 - Imagem por arrastar e soltar + Toast de erro (Priority: P2)

O envio de **imagem** (retrato, mapa de local, etc. já suportados) aceita **arrastar e soltar** além do selector de ficheiro. Falhas de upload (tipo, tamanho, rede, cota) mostram **Toast** de erro compreensível (pt-BR/en), sem `window.alert`.

**Why this priority**: Completa o fluxo de mídia; secundário ao Drawer e à validação.

**Independent Test**: Arrastar imagem válida → upload; ficheiro inválido ou erro de servidor → Toast; sucesso reflecte-se no formulário.

**Acceptance Scenarios**:

1. **Given** campo de imagem no Drawer, **When** o mestre arrasta um ficheiro aceite para a zona, **Then** o envio inicia (mesmo destino/regras de upload já existentes).
2. **Given** upload que falha, **When** o erro ocorre, **Then** aparece **Toast** com mensagem útil; MUST NOT usar `window.alert`.
3. **Given** upload bem-sucedido, **When** o formulário actualiza, **Then** a pré-visualização/miniatura reflecte a nova imagem (sem exigir recarregar a página).

---

### Edge Cases

- Fechar por overlay / botão X / Esc: todos MUST respeitar o aviso de alterações não salvas.
- Gravar com vários campos inválidos: MUST mostrar erros por campo; preferência por focar o primeiro.
- Rede lenta no upload: estado de progresso ou desactivar duplo-envio; erro ainda via Toast.
- Drawer já aberto e abrir outra entidade: MUST pedir confirmação se sujo; ao confirmar, descartar e substituir pelo formulário da nova entidade.
- Telemóvel: Drawer em **bottom sheet** / largura útil; alvos de toque ≥ 40/44 px (UX-2); drop zone utilizável ou fallback claro ao selector de ficheiro.
- Vínculo: Drawer a partir da Rede; MUST NOT redesenhar o grafo (UX-6).
- Conteúdo do mestre (Markdown, nomes) MUST NOT ser traduzido pela i18n da UI.
- `/opt/codex-*` intocado; sem mudança de API de conteúdo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Formulários de **local**, **NPC/personagem**, **arco** e **vínculo** (criar/editar) MUST abrir em **Drawer** acessível (Esc, foco preso e devolvido, aria-modal, bloqueio de scroll — padrão UX-2). No desktop MUST ancorar à **direita**; em viewport estreita MUST usar **bottom sheet** / largura útil.
- **FR-002**: Cada formulário MUST organizar campos em **secções** com títulos i18n.
- **FR-003**: Validação MUST mostrar erros **inline junto ao campo** afectado ao **Guardar** (critério-chave); após o primeiro submit falhado, MUST revalidar ao alterar campos com erro. MUST NOT depender só de alerta global nem validar a cada tecla antes do primeiro Guardar.
- **FR-004**: Fechar o Drawer com **alterações pendentes** MUST pedir **confirmação** via ConfirmDialog antes de descartar (critério-chave). Fechar sem alterações MUST NOT pedir. Abrir outra entidade com Drawer sujo MUST pedir a mesma confirmação; ao confirmar, MUST descartar e abrir a nova.
- **FR-005**: Descrições de **local** e **NPC/personagem** (já Markdown na leitura) MUST oferecer **editor com pré-visualização** em **separadores** Escrever / Pré-visualizar; renderização MUST permanecer segura. Notas de vínculo MUST NOT exigir editor Markdown nesta fase.
- **FR-006**: Upload de imagem nos formulários desta fase MUST aceitar **arrastar e soltar** (além do selector); erros MUST usar **Toast** (não `window.alert`).
- **FR-007**: Entrada nos formulários MUST respeitar **Modo edição** e permissões (UX-5 / UX-3 / 095): jogador não edita.
- **FR-008**: MUST NOT alterar contratos de API nem schema de conteúdo; MUST NOT redesenhar listas (UX-5), mapa (UX-4) ou grafo (UX-6) além do contentor de edição.
- **FR-009**: MUST NOT exigir `/opt/codex-*`. MUST NOT reintroduzir `window.confirm` / `window.alert`.

### Out of Scope

- Novos campos de domínio (sistema de jogo, módulos, etc.).
- Redesenho do digitalizador de vias (UX-7) ou da home/painel (098).
- Editor WYSIWYG rico além de Markdown + pré-visualização.
- Temas/acento por campanha (UX-9).

### Key Entities

- **Drawer de edição**: contentor lateral para um formulário de entidade.
- **Secção de formulário**: grupo nomeado de campos relacionados.
- **Estado sujo (alterações pendentes)**: diferença entre valores carregados/últimos gravados e o rascunho actual.
- **Erro inline**: mensagem associada a um campo concreto.
- **Pré-visualização Markdown**: vista renderizada segura do texto do mestre.
- **Zona de soltar imagem**: área que aceita ficheiro por drag-and-drop.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das tentativas de fecho com formulário alterado e não gravado (Esc, overlay, botão fechar), aparece confirmação antes de descartar; 0 fechos silenciosos com perda de dados.
- **SC-002**: Em amostragem de validações (campo obrigatório, formato inválido), **100%** dos erros visíveis estão **junto ao campo** correspondente (não só toast/alerta global).
- **SC-003**: Local, NPC, arco e vínculo abrem em Drawer com secções; 0 destes quatro fluxos permanece só no modal centrado legado.
- **SC-004**: Descrição Markdown: o mestre consegue pré-visualizar antes de gravar; a pré-visualização não executa HTML inseguro.
- **SC-005**: Upload falhado mostra Toast em pt-BR e en; 0 `window.alert` nestes fluxos.
- **SC-006**: Jogador / Modo edição off: 0 Drawers de edição acessíveis pelos pontos de entrada das listas/grafo.

## Assumptions

- Drawer, ConfirmDialog, Toast e controlos de formulário vêm da UX-2; esta fase **adopta** esses componentes nos quatro formulários. Drawer: **direita** no desktop; **bottom sheet** em viewport estreita.
- Campos e regras de validação de negócio (obrigatórios, enums, etc.) são os **já existentes**; UX-8 muda *como* e *onde* se mostram os erros, não inventa regras novas salvo clarificação de copy.
- «NPC» cobre o formulário de personagem/NPC já usado no mapa; vínculo é o da Rede de Relações.
- Pré-visualização Markdown (separadores) só em **descrição** de local e NPC/personagem; reutiliza o mesmo pipeline seguro da leitura (`MarkdownSafe` ou equivalente) — detalhe no plano.
- Notas de vínculo e campos curtos: textarea simples (sem editor MD nesta fase).
- Drag-and-drop usa os endpoints/cota de upload já existentes (096); não redefine limites.
- Um primário por ecrã (Guardar): secundários/fantasma para cancelar/fechar, alinhado à constituição/UX-2.
- UX-2 e UX-5 entregues (ou em curso) antes da implementação desta fase.
