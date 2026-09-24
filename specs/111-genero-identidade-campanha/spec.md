# Feature Specification: Gênero como identidade da campanha

**Feature Branch**: `111-genero-identidade-campanha`

**Created**: 2026-09-22

**Status**: Implemented

**Input**: User description: "Gênero substitui acento como identidade da campanha. Campo `genero` (fantasia|gotico|scifi|urbano) imutável na criação; migração com backfill a partir de sistema/acento; aposentar acento solto; formulário de criação com 4 cards e pré-visualização ao vivo; cartões home/painel mostram gênero; export/import preserva gênero. Depende de 110. Fora de escopo: gênero editável depois; gêneros além dos 4."

**Depends on**: [110-paridade-tokens-prototipo](../110-paridade-tokens-prototipo/spec.md) (paridade visual / tokens de base); [108-tema-identidade-campanha](../108-tema-identidade-campanha/spec.md) (acento + capa a aposentar/reestruturar); [098-home-painel-mestre](../098-home-painel-mestre/spec.md) (criação e cartões); [097-exportar-importar](../097-exportar-importar/spec.md) (pacote portátil). Fonte de copy e UX de referência: protótipo (`frontend-next` — géneros e assistente de novo códex).

**Phase**: Identidade visual pós-110. O **gênero** passa a ser a identidade completa da campanha (fundo, superfícies e acento juntos), escolhido **uma vez na criação** e **imutável** (como o sistema de jogo). O seletor de 5 acentos soltos (108) é **aposentado**. Critério-chave: após migração, as mesas WFRP e WoD existentes mostram fantasia e gótico sem intervenção; nenhuma campanha nova nasce sem gênero; export → import noutra instância preserva o gênero.

## Clarifications

### Session 2026-09-22

- Q: Formato do pacote export/import após esta mudança? → A *(default no plano — clarify não respondido)*: Manifesto novo inclui `genero`. Pacotes antigos só com `acento_id` **continuam aceites**; na importação aplica-se o **mesmo mapeamento** da migração (vinho → gótico; resto → fantasia; pares WFRP/WoD quando sistema+acento batem).
- Q: Depois de remover o PATCH de identidade (acento), como o dono continua a gerir a **capa**? → A *(default no plano)*: **Endpoint/fluxo só de capa** no Painel (substitui o PATCH de identidade; acento some, capa permanece editável).
- Q: Tema claro do utilizador em géneros que o protótipo marca sem suporte a claro (gótico, sci-fi, urbano)? → A *(default no plano)*: Na **mesa** desses géneros, **forçar escuro** (a preferência claro do utilizador aplica-se em fantasia e fora da mesa / shell do produto).

## Constitution

- Isolamento (I): gênero e capa pertencem só à campanha do slug; catálogo público pode expor género das `listada` sem vazar dados de outras mesas. Rotas novas de escrita MUST entrar na matriz (dono vs anónimo vs outro mestre).
- Testes primeiro (II): migração/backfill (wfrp→fantasia, wod→gotico, fallbacks); criação exige género; recusa de alterar género depois; round-trip export/import do género; isolamento de qualquer escrita nova — testes a falhar antes da implementação correspondente.
- Produção legada (III): MUST NOT tocar `/opt/codex-*`.
- Simplicidade (IV): quatro géneros fechados; um atributo imutável; sistema continua texto livre/sugerido, **não** acoplado obrigatoriamente ao género; reutilizar tokens/contraste existentes.
- i18n (V): rótulos e taglines dos géneros, erros de validação MUST ter pt-BR e en. Nome da campanha e texto do mestre MUST NOT ser traduzidos.
- Migrações (VI): coluna nova em Campanha (controlo) MUST ser Alembic `render_as_batch` com backfill; campo NOT NULL após migração.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Migração: mesas existentes ganham género (Priority: P1)

Após actualizar a aplicação, as campanhas já criadas passam a ter um **género** sem o mestre fazer nada. A mesa WFRP (sistema WFRP + acento latão) aparece como **fantasia**; a mesa WoD (sistema WoD + acento vinho) como **gótico**. Qualquer outro caso usa a rede de segurança: acento vinho → gótico; resto → fantasia. A mesa inteira reflecte a identidade visual desse género.

**Why this priority**: Critério-chave — duas mesas no ar sem intervenção manual.

**Independent Test**: Base com as duas campanhas (ou fixtures equivalentes); correr migração; abrir cada mesa e confirmar género e aspecto visual; nenhuma campanha fica sem género.

**Acceptance Scenarios**:

1. **Given** campanha com sistema WFRP e acento latão (ou equivalente de produção), **When** a migração corre, **Then** o género é **fantasia** e a mesa renderiza identidade fantasia.
2. **Given** campanha com sistema WoD e acento vinho, **When** a migração corre, **Then** o género é **gótico** e a mesa renderiza identidade gótica.
3. **Given** campanha com acento vinho fora do par WoD, **When** a migração corre, **Then** o género é **gótico**.
4. **Given** qualquer outra combinação (acento ausente, latão, verde, azul, cobre, sistema desconhecido), **When** a migração corre, **Then** o género é **fantasia**.
5. **Given** todas as campanhas após migração, **When** se lista o catálogo/painel, **Then** **nenhuma** está sem género.

---

### User Story 2 - Criar campanha com género (imutável) (Priority: P1)

No Painel, ao criar uma campanha, o mestre **escolhe um dos quatro géneros** (fantasia, gótico, ficção científica, urbano) em **cards** com rótulo e tagline (copy alinhada ao protótipo). **Antes de confirmar**, escolher um card **re-skina o próprio formulário** de criação (pré-visualização ao vivo). O **sistema** de jogo continua campo livre, com **sugestões** por género (não obrigatórias — o mestre pode escrever outro). Depois de criada, o género **não** pode ser alterado (igual ao sistema).

**Why this priority**: Nenhuma campanha nova sem género; UX de criação é o momento de decisão.

**Independent Test**: Criar quatro campanhas (um género cada); tentar PATCH/alteração de género → recusa; formulário muda de aspecto ao trocar o card seleccionado; sistema sugerido ≠ sistema obrigatório.

**Acceptance Scenarios**:

1. **Given** mestre autenticado no Painel, **When** inicia criação sem escolher género, **Then** não consegue concluir (género obrigatório).
2. **Given** o formulário aberto, **When** selecciona cada um dos quatro cards, **Then** o formulário reflecte a identidade visual desse género **antes** de gravar.
3. **Given** género seleccionado e sistema sugerido ou livre preenchido, **When** confirma, **Then** a campanha nasce com esse género e sistema gravados.
4. **Given** campanha já criada, **When** o dono tenta mudar o género por qualquer superfície do produto, **Then** a mudança é **recusada** e o género permanece.
5. **Given** um género com sistemas sugeridos, **When** o mestre escolhe um sistema **fora** da lista, **Then** a criação **aceita** (sistema não está preso ao género).

---

### User Story 3 - Mesa e cartões usam género (já sem acento solto) (Priority: P1)

Nas rotas da mesa (`/c/<slug>/…`), a identidade visual vem **só** do género da campanha (não de um acento escolhido à parte). Nos cartões da **home** e do **Painel**, aparece o **género** (cor de amostra + rótulo), **não** o antigo acento de cinco cores. O seletor de 5 acentos e a paleta solta deixam de existir no produto. A **capa** continua a poder ser mostrada nos cartões quando existir.

**Why this priority**: Substituição visível do 108; critério de identidade na sessão.

**Independent Test**: Abrir mesa fantasia vs gótica; comparar cartões; confirmar ausência do seletor de 5 cores; isolamento A≠B.

**Acceptance Scenarios**:

1. **Given** campanha fantasia, **When** se abre a mesa, **Then** chrome e acções primárias seguem a identidade fantasia.
2. **Given** campanha gótica, **When** se abre a mesa, **Then** a identidade é gótica (não fantasia residual).
3. **Given** catálogo na home e lista no Painel, **When** se vê um cartão, **Then** mostra cor/rótulo do **género**, não chips dos 5 acentos.
4. **Given** dono no Painel, **When** procura o antigo seletor de acentos, **Then** **não** existe.
5. **Given** género da campanha A, **When** se abre a campanha B, **Then** B **não** herda o género de A.

---

### User Story 4 - Export / import preserva género (Priority: P1)

Exportar uma campanha e importá-la noutra instância (ou na mesma) **preserva o género**. Pacotes criados nesta fase carregam o género de forma explícita. Comportamento face a pacotes **antigos** (só `acento_id`) fica definido na clarificação de pacote.

**Why this priority**: Critério-chave de portabilidade entre instâncias.

**Independent Test**: Export campanha com cada género → import → género idêntico; pacote antigo conforme decisão de clarificação.

**Acceptance Scenarios**:

1. **Given** campanha com género G, **When** o dono exporta e importa noutra instância, **Then** a campanha nova tem género **G**.
2. **Given** pacote produzido após esta fase, **When** se inspecciona o manifesto, **Then** o género está presente e legível para a importação.
3. **Given** pacote antigo só com `acento_id` (sem `genero`), **When** se importa, **Then** o género é derivado pelo mapeamento de migração e a campanha **não** fica sem género.

---

### Edge Cases

- Criação com género inválido ou ausente → rejeição clara (código/mensagem mapeável i18n).
- Tentativa de alterar género após criação (API, UI, import “por cima”) → recusa; género original mantém-se.
- Campanha sem `acento_id` na migração → fantasia (fallback).
- Sistema sugerido pelo género vs sistema digitado livremente → prevalece o texto do mestre.
- Tema claro do utilizador + género sem suporte a claro → mesa força escuro (gótico / sci-fi / urbano).
- Capa presente / ausente nos cartões → continua a mostrar-se; gestão via fluxo só de capa no Painel.
- Import com género desconhecido no zip → recusa do pacote (não inventar quinto género).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada campanha MUST ter exactamente um **género** entre: fantasia, gótico, ficção científica, urbano — valor obrigatório (nunca nulo após esta fase).
- **FR-002**: O género MUST ser escolhido **na criação** e MUST ser **imutável** depois (mesmo estatuto que o sistema de jogo).
- **FR-003**: A migração MUST atribuir género às campanhas existentes: WFRP+latão → fantasia; WoD+vinho → gótico; acento vinho noutros casos → gótico; restantes → fantasia.
- **FR-004**: O mecanismo de **acento solto** (paleta de 5 ids, sugestão por sistema, seletor no Painel) MUST ser **removido** do produto.
- **FR-005**: A identidade visual da mesa MUST derivar do **género** da campanha (fundo, superfícies e acento do género), não de um acento independente.
- **FR-006**: O formulário de criação no Painel MUST apresentar **quatro cards** de género (rótulo + tagline de referência do protótipo) e MUST **pré-visualizar ao vivo** a identidade do género seleccionado no próprio formulário antes de confirmar.
- **FR-007**: O campo **sistema** MUST permanecer livre (texto); o produto MAY sugerir sistemas por género sem impor a escolha.
- **FR-008**: Cartões da home e do Painel MUST mostrar o **género** (amostra de cor + rótulo), não o acento antigo.
- **FR-009**: Export MUST incluir o género; import MUST gravar o género na campanha nova; round-trip MUST preservar o valor. Pacotes antigos só com `acento_id` MUST ser aceites aplicando o mapeamento de migração (clarificação).
- **FR-010**: Não MUST existir superfície de produto para editar o género após a criação.
- **FR-011**: Não MUST adicionar géneros além dos quatro do protótipo.
- **FR-012**: A **capa** MUST continuar editável no Painel via fluxo dedicado (sem acento); MUST continuar a poder ser exibida nos cartões quando existir.
- **FR-013**: Copy de UI dos géneros (rótulos, taglines, erros) MUST existir em pt-BR e en.
- **FR-014**: Em géneros sem suporte a claro (gótico, sci-fi, urbano), a mesa MUST renderizar em modo escuro independentemente da preferência claro do utilizador.

### Key Entities

- **Campanha**: mestra no controlo; passa a ter **género** obrigatório e imutável; deixa de usar **acento** como identidade; **capa** editável à parte; **sistema** livre.
- **Género**: um de quatro identidades visuais fechadas (fantasia, gótico, ficção científica, urbano), cada uma com rótulo, tagline e sugestões de sistema de referência.
- **Pacote de exportação**: artefacto portátil com `genero`; pacotes antigos com `acento_id` ainda importáveis via mapeamento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Após migração, **100%** das campanhas existentes na instância de referência (incluindo WFRP e WoD) têm género definido; WFRP renderiza fantasia e WoD renderiza gótico **sem** passo manual do mestre.
- **SC-002**: **0** campanhas novas criadas sem género; tentativa de criar sem género falha de forma compreensível na UI.
- **SC-003**: Em teste de round-trip, exportar e importar uma campanha de **cada** género preserva o género em **100%** dos casos.
- **SC-004**: Um revisor humano, ao abrir mesa fantasia vs gótica (e cartões correspondentes), distingue as identidades **sem** ver o antigo seletor de 5 acentos.
- **SC-005**: No formulário de criação, ao mudar o card de género, a mudança visual do formulário é perceptível **antes** de confirmar (pré-visualização ao vivo).

## Assumptions

- Spec **110** entregou a paridade de tokens na base fantasia; esta fase **introduz / completa** as quatro identidades de género na mesa (o protótipo usa `data-genre` + modo claro/escuro — o plano técnico detalhará o mapeamento).
- Rótulos/taglines/sistemas sugeridos seguem o protótipo como referência de copy (traduzidos pt-BR/en na UI).
- **Capa** e upload por cota (096/108) não saem do produto; só o acoplamento ao seletor de acento é removido.
- Sistema de jogo continua imutável após criação (comportamento já existente); género alinha-se a essa regra.
- Produção actual tem essencialmente WFRP e WoD; o fallback da migração é rede de segurança, não um catálogo rico de casos.
- Fora de escopo: género editável depois; quinto género; temas totalmente customizados; obrigar sistema a um enum por género.

## Out of Scope

- Editar género depois de a campanha existir.
- Géneros além de fantasia / gótico / ficção científica / urbano.
- Redesign alheio à identidade (mapas, relações, planejador) excepto o que a troca de tokens/género naturalmente recolorir.
- Nova UX de marketing do protótipo (landing/explore) além do necessário no Painel/home.
