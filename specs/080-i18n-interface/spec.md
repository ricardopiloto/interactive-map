# Feature Specification: Internacionalização da Interface

**Feature Branch**: `080-i18n-interface`

**Release**: Codex **v2.0.0** (Frente D)

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Interface do Codex em PT-BR e EN, detectando idioma do navegador com override manual; conteúdo do mestre não traduzido.

**Depends on**: Recomendado após ou junto de [079-ux-nocturne](../079-ux-nocturne/spec.md)

**Source**: [docs/v2/rfc-internacionalizacao.md](../../docs/v2/rfc-internacionalizacao.md)

## Clarifications

### Session 2026-08-13

- Q: O hub índice (`hub/`) entra no critério de aceitação da Frente D (080), ou fica explicitamente fora de escopo nesta release? → A: Fora de escopo 080 — hub permanece PT-only; follow-up documentado no plan.
- Q: Qual é o âmbito da migração de erros da API para códigos estruturados (FR-006 / SC-003)? → A: Só erros surfaced na UI (toast/inline/dialog); resto pode usar fallback genérico localizado.
- Q: A digitalização de rotas (overlay GM no Mapa, pós-079) conta como ecrã principal para US2 / auditoria ≥95%? → A: P1 explícito — digitalização incluída em US2 e auditoria ≥95%.
- Q: Como mapear o idioma do navegador para os dois locales suportados (`pt-BR` e `en`)? → A: Prefixo — `pt*` → PT-BR; `en*` → EN; resto → PT-BR.
- Q: Se uma chave de tradução faltar no idioma activo, o que o utilizador deve ver? → A: Fallback PT-BR (texto legível); chave em falta conta contra auditoria ≥95%.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Detecção e persistência de idioma (Priority: P1)

Utilizador abre o Codex; interface aparece em PT-BR ou EN conforme idioma do navegador, salvo escolha manual anterior guardada no dispositivo.

**Why this priority**: Base para todos os ecrãs traduzidos.

**Independent Test**: Browser `en-US` ou `en-GB` → EN; `pt-PT` → PT-BR; escolher PT no seletor → persiste após reload.

**Acceptance Scenarios**:

1. **Given** navegador em inglês (`en`, `en-US`, `en-GB`, …), primeira visita, **When** abre app, **Then** menus/botões em EN.
2. **Given** utilizador escolhe PT-BR no seletor, **When** recarrega página, **Then** mantém PT-BR.
3. **Given** idioma cujo prefixo não é `pt` nem `en` (ex. `fr-FR`), **When** abre app, **Then** fallback PT-BR.
4. **Given** navegador `pt-PT` (ou outro `pt*`), primeira visita, **When** abre app, **Then** interface em PT-BR.

---

### User Story 2 - Cobertura de ecrãs principais (Priority: P1)

Mapa, Relações, digitalização de rotas (overlay GM), fluxos GM (criar/editar entidades), mensagens comuns e erros aparecem traduzidos nos dois idiomas de lançamento.

**Why this priority**: i18n parcial quebra confiança na primeira mensagem de erro.

**Independent Test**: Percorrer Mapa + Relações + digitalização de rotas + um diálogo GM em EN e PT — sem strings hardcoded visíveis.

**Acceptance Scenarios**:

1. **Given** idioma EN, **When** navega Mapa, Relações e digitalização de rotas, **Then** labels de nav, botões GM, chips, estados (Vivo/Morto/…), coluna/busca/sheet da digitalização em inglês.
2. **Given** idioma PT-BR, **When** mesma navegação, **Then** equivalente em português.
3. **Given** conteúdo escrito pelo mestre (descrição de local, nota de vínculo, nome de waypoint), **When** troca idioma UI, **Then** conteúdo do mestre **não** muda.

---

### User Story 3 - Erros da API traduzíveis (Priority: P2)

Erros de validação, auth e limites **mostrados ao utilizador** retornam **código estruturado**; frontend mapeia código → mensagem localizada (com detalhes interpolados quando aplicável). Erros não surfaced na UI podem usar fallback genérico localizado.

**Why this priority**: Strings PT soltas no backend tornam EN incompleto.

**Independent Test**: Forçar erro de upload/tamanho → mensagem EN/PT conforme idioma UI, não string fixa do servidor.

**Acceptance Scenarios**:

1. **Given** UI em EN, **When** API devolve `ARQUIVO_EXCEDE_TAMANHO_MAXIMO` com `limite_mb`, **Then** utilizador vê mensagem EN com valor correcto.
2. **Given** UI em PT-BR, **When** mesmo erro, **Then** mensagem PT equivalente.
3. **Given** código desconhecido, **When** erro ocorre, **Then** fallback genérico localizado (não crash).

---

### Edge Cases

- Seletor na barra superior (discreto, ex. sigla PT/EN).
- Troca de idioma **sem** reload completo da página.
- Namespaces por área (mapa, relações, admin, comum) — organização interna, não exposta ao utilizador.
- Mapeamento de browser: qualquer `pt*` (incl. `pt-PT`) → PT-BR; qualquer `en*` (incl. `en-GB`) → EN; demais códigos → PT-BR.
- Erros API não surfaced na UI (ex. 404 internos): frontend MUST mostrar fallback genérico localizado, não string PT do servidor.
- Chave de tradução em falta no locale activo: runtime MUST mostrar fallback **PT-BR** (nunca identificador cru); cada omissão conta como falha na auditoria SC-002.
- Hub índice (`hub/`, spec 078) **fora de escopo** desta frente — permanece PT-only; i18n do hub fica para follow-up documentado no plan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Interface MUST suportar **PT-BR** e **EN** no lançamento v2; ecrãs principais incluem Mapa, Relações, **digitalização de rotas** e diálogos GM.
- **FR-002**: Detecção MUST usar: preferência guardada → idioma navegador (prefixo: `pt*` → PT-BR, `en*` → EN) → fallback PT-BR.
- **FR-003**: Utilizador MUST poder override manual persistente (por dispositivo/navegador).
- **FR-004**: Conteúdo criado por mestres MUST NOT ser traduzido automaticamente.
- **FR-005**: Textos de UI MUST organizar-se por áreas funcionais (mapa, relações, admin, comum).
- **FR-006**: Para erros **surfaced na UI** (toast, inline, diálogo), backend MUST retornar **código + detalhes**, não texto final localizado.
- **FR-007**: Frontend MUST mapear códigos de erro surfaced para strings traduzidas; erros não surfaced MUST usar fallback genérico localizado (nunca string PT crua do servidor).
- **FR-008**: Seletor de idioma MUST estar acessível na barra superior partilhada.
- **FR-009**: Chave de tradução em falta no locale activo MUST fazer fallback para o texto **PT-BR** em runtime (nunca mostrar identificador cru ao utilizador).

### Out of Scope

- **Hub índice** (`hub/`): artefacto estático separado da app React; permanece PT-only em 080; tradução EN planeadas como follow-up.

### Key Entities

- **Locale**: pt-BR | en (extensível).
- **Chave de tradução**: identificador estável por string de UI.
- **Código de erro API**: identificador + payload opcional para interpolação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Utilizador anglófono completa fluxo Mapa → Relações → digitalização de rotas → editar personagem **sem** encontrar texto PT residual na UI.
- **SC-002**: **≥95%** das strings de UI dos ecrãs principais (Mapa, Relações, digitalização de rotas, diálogos GM) passam auditoria de chaves (sem hardcode visível); chaves EN em falta (mesmo com fallback PT-BR em runtime) contam como falha na auditoria.
- **SC-003**: **100%** dos erros API **surfaced na UI** retornam código estruturado (não texto PT fixo).
- **SC-004**: Troca de idioma reflecte-se em **<1 s** sem reload manual.

## Assumptions

- react-i18next + detector de browser é escolha técnica do plan (não desta spec).
- Ambos locales bundled no build (2 idiomas — peso irrelevante).
- Frente C redesenha digitalização antes/junto — strings novas nascem já como chaves.
- Hub estático (078) **excluído** de 080; i18n do hub documentada como follow-up no plan.
