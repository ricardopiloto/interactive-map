# Feature Specification: Aposentar nocturne.css

**Feature Branch**: `117-aposentar-nocturne`

**Created**: 2026-09-22

**Updated**: 2026-09-23

**Status**: Draft — *gates de remoção já satisfeitos no código actual (ficheiro ausente; `main.tsx` sem import); manter Draft até validar inventário **depois** de 114–116 e 118–120 no branch de integração*

**Input**: User description: "Aposentar nocturne.css — só depois das specs 114, 115, 116, 118, 119 e 120. Levantar usos restantes das classes pré-redesign; migrar para components/ui; remover import e apagar o ficheiro só sem classes órfãs. Critério-chave: grep fora de components/ui/ = zero; build e testes visuais passam; nocturne.css não existe no repositório."

**Depends on** (bloqueantes — **MUST** estar entregues antes de fechar esta feature / apagar o ficheiro num branch que ainda o tenha):

| Spec | Porquê esperar |
|------|----------------|
| **114** | Cabeçalho/navegação reconstruídos |
| **115** | Mapa + painel flutuante |
| **116** | Relações e Rota no painel partilhado |
| **118** | Rede de rotas — entrada/casca do digitalizador |
| **119** | Home / Explorar / Painel (três telas + cartão) |
| **120** | Assistente `/painel/novo` |

*Recomendado antes do fecho (não na lista obrigatória do pedido):* **121** (casca auth), se ainda restarem classes-alvo em login/convite/reset/conta.

**Phase**: Paridade estrutural — limpeza final do design system pré-redesign (**última** da sequência de casca acima).

## Constitution *(constraints; not implementation)*

- Isolation (I): Sem rotas HTTP novas. Matriz isolamento **N/A**.
- Testes primeiro (II): UI de polimento — inventário por grep + quickstart/capturas MAY; build TypeScript MUST passar. Sem schema/auth.
- Produção legada (III): Só produto Codex; MUST NOT tocar `/opt`.
- Simplicidade (IV): Um único kit visual (`components/ui`); MUST NOT inventar um segundo sistema de classes paralelo ao kit.
- i18n (V): Sem copy obrigatória nova além do que já exista; se alguma string surgir, pt-BR+en.
- Migrações (VI): N/A.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inventário pós-reconstruções (Priority: P1) 🎯 MVP

Com as specs 114–116 e 118–120 já aplicadas, a equipa **levanta de novo** todos os usos restantes das classes do sistema antigo (botões, campos, segmentos, cartões, etiquetas, diálogos) **fora** do kit e **fora** do que essas specs já reescreveram. Produz um **mapa** classe-antiga → componente do kit (e lacunas a criar no kit).

**Why this priority**: Inventário prematuro (antes das telas grandes / home / wizard) gera remigração; o pedido exige esperar.

**Independent Test**: Grep das classes-alvo no código-fonte após 114–116+118–120; cada hit fora do kit tem destino no mapa.

**Acceptance Scenarios**:

1. **Given** o branch com 114–116 e 118–120 integradas, **When** se inventariam as classes-alvo, **Then** nenhuma ocorrência fora do kit fica sem destino de migração.
2. **Given** o mapa, **When** há lacuna no kit, **Then** fica listada para criação **no mesmo padrão** dos componentes existentes — não CSS global paralelo.

---

### User Story 2 - Migrar consumidores restantes (Priority: P1)

Tudo o que ainda usa classes do sistema antigo (restos de formulários, digitalizador, auth se aplicável, widgets, etc.) passa ao kit (`Button`, `Field`, `Chip`, `Card`, `Dialog`/`Drawer`, `SegmentedControl`, …). O aspecto segue tokens 110+; fluxos de dados intactos.

**Why this priority**: Critério-chave «zero órfãs fora do kit».

**Independent Test**: Grep fora de `components/ui/` = zero **antes** de apagar o ficheiro (se ainda existir); smoke das telas principais.

**Acceptance Scenarios**:

1. **Given** uma superfície com classe antiga, **When** migrada, **Then** usa o kit e deixa de referenciar a classe-alvo.
2. **Given** diálogo legado, **When** migrado, **Then** usa Dialog/Drawer/Confirm do kit.
3. **Given** segmento PJ/NPC ou equivalente, **When** migrado, **Then** usa o controlo segmentado do kit — não `.seg` solto.

---

### User Story 3 - Remover nocturne.css com segurança (Priority: P1)

Globais necessários (tipografia, foco, `text-muted`, chrome de formulário) estão em `global.css` / CSS de componente. O import some de `main.tsx`; **`nocturne.css` deixa de existir** no repositório. Build e revisão visual passam.

**Why this priority**: Critério-chave «o ficheiro não existe mais».

**Independent Test**: Ficheiro ausente; sem import; grep zero; `tsc` limpo; smoke claro/escuro.

**Acceptance Scenarios**:

1. **Given** migração completa, **When** se remove import e ficheiro, **Then** a app arranca e o build de tipos passa.
2. **Given** o repositório, **When** se procura classes-alvo fora do kit, **Then** zero resultados.
3. **Given** home/explorar/painel/wizard/auth/mapa/relações/rota, **When** revisão rápida claro/escuro, **Then** controlos utilizáveis sem cascata partida.

---

### Edge Cases

- **Ordem**: MUST NOT apagar o ficheiro num branch onde 114–116 ou 118–120 ainda deixam chrome antigo a depender de classes nocturne — esperar essas entregas.
- Dívida **dentro** do kit (ex.: `dialog-body`): renomear para `ui-*` antes do delete.
- Globais só no legado: absorver em `global.css` / CSS de formulário/media.
- Não-alvos (`auth-card`, `ui-btn`, BEM de página, `rota-page__digitizer-btn`): fora do inventário.
- `frontend-next/`: fora de escopo.
- Se o ficheiro **já** foi removido no branch actual: US3 reduz-se a **verificar** gates (grep + build + smoke) após as specs dependentes; não recriar o ficheiro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir inventário completo das classes-alvo **após** 114–116 e 118–120, com destino de migração.
- **FR-002**: Classes-alvo: `.btn` (+ primary/secondary/ghost/danger/icon/block/sm), `.seg`/`.seg-opt`, `.input` fora do kit, `.card`/`.card-*`/elevações de cartão, `.tag` (+ variantes), `.dialog*` / `.dialog-backdrop` e afins.
- **FR-003**: Todo uso **fora** de `components/ui/` MUST migrar para o kit.
- **FR-004**: Lacunas do kit MUST ser criadas **dentro** de `components/ui/` no padrão existente — MUST NOT criar «nocturne-2».
- **FR-005**: O kit MUST NOT depender de estilos só definidos no ficheiro legado.
- **FR-006**: Globais necessários MUST estar absorvidos antes da remoção.
- **FR-007**: `main.tsx` MUST NOT importar o legado; o ficheiro MUST estar ausente do repositório.
- **FR-008**: Remoção (ou fecho se já removido) MUST ocorrer só com: (a) dependências 114–116+118–120 satisfeitas, (b) grep zero fora do kit, (c) build a passar.
- **FR-009**: MUST NOT alterar API/schema/fluxos de negócio.
- **FR-010**: MUST NOT reinventar telas das specs 114–116, 118–120; só limpar remanescentes de classes antigas.

### Key Entities

- **Classe-alvo**: Selector do sistema pré-redesign no inventário.
- **Componente do kit**: Peça em `components/ui` que substitui a classe.
- **Ficheiro legado**: `nocturne.css` — ausente no fim da feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Grep das classes-alvo → **0** fora de `components/ui/` (kit sem selectors só do legado).
- **SC-002**: `nocturne.css` **não existe**; `main.tsx` **não** o importa.
- **SC-003**: Build de tipos/frontend passa sem erros novos desta migração.
- **SC-004**: Smoke visual (&lt; 15 min) das superfícies pós-114–120 (mapa, relações, rota/digitizer, home/explorar/painel, wizard, auth se no branch) em claro/escuro — controlos utilizáveis.
- **SC-005**: Fluxos de dados (login, CRUD, rotas, criação de campanha) inalterados além da casca.

## Assumptions

- Esta feature é a **porta de fecho** da limpeza de casca: corre **depois** de 114, 115, 116, 118, 119 e 120 (pedido explícito).
- No tree actual (2026-09-23) o ficheiro e o import **já** podem estar removidos e o kit já incluir SegmentedControl/Chip/Button — o fecho formal é **re-validar** inventário e SC após as specs dependentes no branch de integração.
- Plan/tasks/contracts existentes em `specs/117-aposentar-nocturne/` permanecem válidos; actualizar inventário se 118–120 introduzirem novos hits.
- `frontend-next/` e docs não entram no grep de produção.
