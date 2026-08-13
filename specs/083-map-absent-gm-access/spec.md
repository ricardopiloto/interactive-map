# Feature Specification: Acesso ao Mapa Sem Imagem (GM)

**Feature Branch**: `083-map-absent-gm-access`

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Bug: quando não existe a imagem do mapa da campanha, a app redireciona para Relações — correcto para jogadores, mas o GM precisa de abrir o Mapa para enviar a imagem. Sem mapa e sem ser GM: redirecionar para Relações **e** esconder o botão «Mapa». Com sessão GM: permitir abrir o Mapa mesmo sem imagem.

## Clarifications

### Session 2026-08-13

- Q: Ao sair do modo GM na página de Mapa sem imagem, o que acontece? → A: **Redireccionar de imediato para Relações** (não permanecer no Mapa em vista jogador; sem diálogo de confirmação).
- Q: Entrada directa no Mapa sem imagem (`/?gm=1` ou `/admin`)? → A: **Sem mapa, a entrada (incluindo `/?gm=1`) vai sempre para Relações**; desbloquear GM só em Relações; depois abrir «Mapa».
- Q: `/admin` ou `gm=1` sem mapa — abrir o diálogo em Relações? → A: **Só redireccionar para Relações**; o utilizador clica «Acesso restrito» manualmente (não abrir o diálogo automaticamente).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogador sem mapa cai em Relações e não vê «Mapa» (Priority: P1)

Numa instância ainda sem imagem de mapa, um visitante ou jogador (não GM) abre a app e aterra em Relações. O link de navegação «Mapa» não aparece, para não sugerir uma vista vazia ou inutilizável.

**Why this priority**: Corrige a experiência pública/jogador e evita confusão com uma área de mapa inexistente.

**Independent Test**: Instância sem imagem de mapa; sessão sem modo GM; abrir a raiz da app e a página de Relações; confirmar redireccionamento e ausência do botão «Mapa».

**Acceptance Scenarios**:

1. **Given** a campanha não tem imagem de mapa e o utilizador **não** está em modo GM, **When** abre a entrada principal da app (raiz), **Then** é levado para Relações (não permanece numa vista de mapa vazia).
2. **Given** a campanha não tem imagem de mapa e o utilizador **não** está em modo GM, **When** está em Relações (ou em qualquer ecrã com a barra superior), **Then** o botão/link de navegação «Mapa» **não** é mostrado.
3. **Given** a campanha não tem imagem de mapa e o utilizador **não** está em modo GM, **When** tenta aceder directamente ao endereço do Mapa (marcador, URL partilhada, `/?gm=1` ou `/admin`), **Then** é redireccionado para Relações.

---

### User Story 2 - GM sem mapa consegue abrir o Mapa para enviar a imagem (Priority: P1)

O GM autentica-se (modo restrito). Enquanto a campanha ainda não tem imagem de mapa, continua a ver o botão «Mapa» e consegue abrir a página de Mapa — único sítio da interface onde envia/substitui a imagem do mapa.

**Why this priority**: Sem isto, uma campanha nova ou sem ficheiro de mapa fica bloqueada: o GM nunca consegue carregar o mapa pela UI.

**Independent Test**: Instância sem imagem; entrar em modo GM a partir de Relações; abrir «Mapa»; confirmar que a página abre e permite o fluxo de envio de mapa já existente.

**Acceptance Scenarios**:

1. **Given** a campanha não tem imagem de mapa e o utilizador **está** em modo GM, **When** olha para a navegação superior, **Then** o botão «Mapa» **está** visível.
2. **Given** a campanha não tem imagem de mapa e o utilizador **está** em modo GM, **When** escolhe «Mapa» (ou abre o endereço do Mapa), **Then** a página de Mapa abre (não é forçado para Relações).
3. **Given** a campanha não tem imagem de mapa e o utilizador está em modo GM na página de Mapa, **When** conclui o envio da imagem de mapa com sucesso, **Then** a imagem passa a estar disponível e o comportamento normal «com mapa» aplica-se daí em diante (ver US3).
4. **Given** a campanha não tem imagem de mapa e o utilizador está em modo GM na página de Mapa, **When** sai do modo GM, **Then** é redireccionado de imediato para Relações e o botão «Mapa» deixa de estar visível.

---

### User Story 3 - Com mapa, navegação normal para todos (Priority: P2)

Quando a campanha já tem imagem de mapa, jogadores e GM voltam a ver «Mapa» e «Relações»; a entrada principal pode abrir o Mapa como hoje.

**Why this priority**: Garante que o fix não altera o fluxo habitual das campanhas já configuradas.

**Independent Test**: Instância com imagem de mapa; sessão jogador e sessão GM; confirmar que «Mapa» aparece e a raiz abre o Mapa.

**Acceptance Scenarios**:

1. **Given** a campanha **tem** imagem de mapa, **When** o utilizador (jogador ou GM) vê a barra superior, **Then** «Mapa» e «Relações» estão ambos disponíveis.
2. **Given** a campanha **tem** imagem de mapa e o utilizador **não** está em modo GM, **When** abre a entrada principal, **Then** aterra no Mapa (comportamento actual com mapa presente).

---

### Edge Cases

- Utilizador ainda não GM numa campanha sem mapa: deve poder desbloquear o modo GM a partir de Relações (único sítio útil); depois de desbloquear, «Mapa» passa a aparecer.
- Utilizador sai do modo GM numa campanha sem mapa: «Mapa» volta a esconder-se; se estiver na página de Mapa, **é redireccionado de imediato para Relações** (sem permanecer numa vista de mapa jogador e sem diálogo de confirmação).
- URL desconhecida / catch-all sem mapa: redirecciona para Relações (jogador e visitante). O GM já autenticado acede ao Mapa pela navegação «Mapa», não por atalhos de entrada na raiz.
- Entrada na raiz ou `/?gm=1` / `/admin` **sem** imagem de mapa: redirecciona para Relações **sem** abrir automaticamente o diálogo de acesso restrito; o utilizador inicia o desbloqueio GM manualmente em Relações.
- Durante o carregamento do estado «há mapa?» / «é GM?», a UI não deve piscar um botão «Mapa» enganador para jogadores (preferir ocultar até haver certeza, ou equivalente sem falso positivo).
- Após o GM enviar o mapa, jogadores que já tinham a app aberta devem passar a ver «Mapa» quando o estado da instância for actualizado (recarregar ou refresh de configuração, conforme o fluxo actual da app).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Quando a campanha **não** tem imagem de mapa e o utilizador **não** está em modo GM, a app MUST redireccionar a entrada do Mapa (raiz, incluindo `/?gm=1` / fluxo `/admin`, e endereços desconhecidos) para Relações.
- **FR-002**: Quando a campanha **não** tem imagem de mapa e o utilizador **não** está em modo GM, a navegação superior MUST **ocultar** o botão/link «Mapa».
- **FR-003**: Quando a campanha **não** tem imagem de mapa e o utilizador **está** em modo GM, a navegação superior MUST **mostrar** o botão/link «Mapa».
- **FR-004**: Quando a campanha **não** tem imagem de mapa e o utilizador **está** em modo GM, a app MUST permitir abrir a página de Mapa **via navegação «Mapa»** (sem redireccionar forçosamente para Relações), para o GM poder enviar a imagem. A entrada na raiz sem modo GM NÃO MUST abrir o Mapa só por causa de `gm=1`.
- **FR-005**: Quando a campanha **tem** imagem de mapa, a navegação MUST mostrar «Mapa» para jogador e GM, e a entrada principal MUST poder abrir o Mapa como no comportamento actual com mapa.
- **FR-006**: A decisão «há imagem de mapa?» MUST basear-se no estado de configuração da instância já exposto à UI (presença da imagem do mapa da campanha), não em adivinhar ficheiros no cliente.
- **FR-007**: Ao sair do modo GM numa campanha sem mapa, o utilizador MUST deixar de ter acesso à navegação «Mapa» (botão oculto). Se estiver na página de Mapa, a app MUST **redireccionar de imediato para Relações** (sem vista jogador no Mapa e sem confirmação).
- **FR-008**: O desbloqueio do modo GM numa campanha **sem** imagem de mapa MUST acontecer em Relações (fluxo de acesso restrito existente); não há atalho de entrada que abra o Mapa sem imagem para apresentar o diálogo GM. Redireccionamentos de `/admin` ou `gm=1` para Relações NÃO MUST abrir o diálogo automaticamente — o utilizador inicia o acesso restrito manualmente.

### Out of Scope

- Alterar o fluxo de autenticação GM (credenciais, diálogo de acesso restrito).
- Alterar o formulário/fluxo de upload da imagem do mapa em si (apenas garantir que o GM consegue chegar à página).
- Hub estático de campanhas (`hub/`).
- Criar uma página alternativa de «enviar mapa» fora do Mapa.

### Key Entities

- **Imagem do mapa da campanha**: recurso visual da instância; presente ou ausente.
- **Modo GM**: sessão privilegiada do mestre; determina se o Mapa sem imagem permanece acessível.
- **Navegação principal**: links «Mapa» e «Relações» na barra superior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos testes manuais com campanha **sem** mapa e **sem** modo GM, a entrada principal leva a Relações e o botão «Mapa» não é visível.
- **SC-002**: Em 100% dos testes manuais com campanha **sem** mapa e **com** modo GM, o botão «Mapa» está visível e a página de Mapa abre em menos de 3 segundos após o clique (rede local / ambiente de desenvolvimento).
- **SC-003**: Em campanha **com** mapa, jogador e GM continuam a ver e a usar «Mapa» e «Relações» sem regressão (checklist de smoke: raiz → Mapa; nav → Relações → Mapa).
- **SC-004**: Um GM consegue, a partir de uma campanha sem imagem, completar o caminho «desbloquear GM → abrir Mapa → enviar imagem» sem precisar de ficheiros no servidor nem de URLs manuais fora da UI.

## Assumptions

- «Modo GM» é o mesmo estado já usado na barra (acesso restrito / sair do modo GM), partilhado conceptualmente entre Mapa e Relações.
- Sem mapa, o caminho típico do GM é: abrir a app → Relações → desbloquear GM (clique manual em «Acesso restrito») → aparecer «Mapa» → abrir Mapa → enviar imagem. Atalhos `/?gm=1` e `/admin` sem mapa NÃO abrem o Mapa nem o diálogo; levam só a Relações.
- A página de Mapa já oferece (ou continuará a oferecer no âmbito actual) a capacidade de o GM enviar/substituir a imagem; esta feature só corrige **acesso e navegação**.
- «Esconder o botão Mapa» aplica-se à navegação principal da barra; não exige esconder outras menções ao mapa em textos de ajuda.
- Com mapa presente, não há mudança de produto além de manter o comportamento actual.
