# Feature Specification: Multi-Deploy & Hub Índice

**Feature Branch**: `078-multideploy-hub`

**Release**: Codex **v2.0.0** (Frente B)

**Created**: 2026-08-13

**Status**: Implemented

**Input**: Isolar campanhas em deploys separados (mesmo código) e vitrine pública listando campanhas activas.

**Depends on**: [077-sistema-modulos](../077-sistema-modulos/spec.md) (código agnóstico por instância)

**Source**: [docs/v2/rfc-multideploy-hub.md](../../docs/v2/rfc-multideploy-hub.md)

## Clarifications

### Session 2026-08-13

- Q: Como o hub reflecte alterações em `campanhas.json`? → A: Fetch em runtime — ficheiro JSON separado; editar JSON + refresh no browser (sem rebuild do hub).
- Q: Onde o scaffold cria a pasta da campanha? → A: Caminho configurável (`CODEX_INSTANCES_ROOT` ou parâmetro); default `/opt` → pasta `/opt/codex-<nome>/`.
- Q: Como o scaffold obtém a senha admin? → A: Prompt interactivo (silencioso); gera `ADMIN_PASSWORD` e `ADMIN_PASSWORD_HASH` (Caddy) no `.env`.
- Q: O que 078 entrega para migrar a campanha WFRP actual para `codex-wfrp`? → A: Script `migrar-wfrp.sh` que automatiza cópia/reconfiguração da instância actual.
- Q: `migrar-wfrp.sh` actualiza hub e aplica Caddy/tunnel? → A: Só a pasta da instância; imprime snippets Caddy/hub para colar; **não** edita Caddyfile nem `campanhas.json`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nova campanha via scaffold (Priority: P1)

O sysadmin executa um script que prepara pasta, variáveis de ambiente, portas e blocos de configuração (proxy/tunnel) para uma nova instância, reduzindo erros manuais (portas em conflito, hash de senha, etc.).

**Why this priority**: Ricardo já opera várias instâncias Foundry; formalizar o processo escala para ~5 mestres.

**Independent Test**: Correr scaffold com portas ocupadas → aborta com erro claro; com portas livres → gera pasta + `.env` + instruções de Caddy/tunnel.

**Acceptance Scenarios**:

1. **Given** portas já em uso, **When** corre scaffold, **Then** aborta antes de criar ficheiros com mensagem explícita.
2. **Given** portas livres e parâmetros válidos, **When** scaffold completa, **Then** existe pasta da campanha (default `<root>/codex-<nome>/`, root configurável) com `.env` preenchido (sistema, portas, credenciais admin).
3. **Given** scaffold concluído, **When** sysadmin segue instruções impressas, **Then** consegue colar blocos Caddy/cloudflared sem recalcular portas manualmente.

---

### User Story 2 - Hub índice público (Priority: P1)

Visitante abre o site-índice e vê cartões de campanhas activas (nome, sistema, mestre, link, capa opcional), editados manualmente num ficheiro de configuração — sem login no hub.

**Why this priority**: Descoberta de campanhas do grupo sem partilhar credenciais.

**Independent Test**: Editar `campanhas.json` → refresh no browser → hub reflecte nova entrada (sem rebuild).

**Acceptance Scenarios**:

1. **Given** lista com duas campanhas, **When** visitante abre hub, **Then** vê dois cartões com links que abrem instâncias respectivas.
2. **Given** campanha sem `capa_url`, **When** renderiza cartão, **Then** mostra cartão sem imagem (não quebra layout).
3. **Given** instância individual, **When** jogador acede, **Then** continua protegida por auth própria — hub não expõe dados sensíveis além do vitrine.

---

### User Story 3 - Actualização manual de instâncias (Priority: P2)

Sysadmin actualiza código numa instância com fluxo documentado (`git pull` + rebuild containers). Risco de gargalo manual aceite até ~5 instâncias.

**Independent Test**: Documentação/quickstart descreve passos; uma instância de teste sobe após pull.

**Acceptance Scenarios**:

1. **Given** nova versão no repositório, **When** sysadmin segue runbook, **Then** instância reflecte versão sem afectar outras pastas.
2. **Given** múltiplas instâncias, **When** actualiza uma, **Then** as restantes permanecem no ar.

---

### User Story 4 - Migração da campanha WFRP actual (Priority: P1)

O sysadmin executa `migrar-wfrp.sh` para reconfigurar a instância WFRP em produção como `codex-wfrp` (pasta isolada no root de instâncias), sem recriar a campanha à mão.

**Why this priority**: Campanha em produção não pode ficar órfã do modelo multi-deploy; SC-004 depende disto.

**Independent Test**: Script corre contra cópia de teste da pasta actual → resulta `codex-wfrp` com `.env` de sistema WFRP e dados preservados.

**Acceptance Scenarios**:

1. **Given** instância WFRP actual válida, **When** corre `migrar-wfrp.sh`, **Then** existe pasta `codex-wfrp` configurada (sistema, portas, credenciais) com dados da campanha copiados/reapontados.
2. **Given** migração concluída, **When** sysadmin sobe a instância, **Then** mapa e relações da campanha WFRP continuam acessíveis.
3. **Given** `migrar-wfrp.sh` concluído, **When** verifica Caddyfile e `campanhas.json`, **Then** esses ficheiros **não** foram alterados pelo script; snippets prontos a colar foram impressos.

---

### Edge Cases

- Scaffold **não** edita Caddyfile/cloudflared automaticamente (evita corromper produção).
- Scaffold **não** aceita senha por argumento de linha de comando (evita histórico/shell logs).
- `migrar-wfrp.sh` **não** edita Caddyfile, cloudflared nem `campanhas.json` — só a pasta da instância; imprime snippets para colar.
- Subir containers continua passo manual deliberado pós-revisão.
- Hub público: sem robots block obrigatório; sem dados de personagens/lore.
- Propagação multi-host automatizada fica **fora de escopo** v2.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: MUST existir script scaffold parametrizável (nome, portas API/web, sistema, root opcional de instâncias).
- **FR-002**: Scaffold MUST verificar portas livres antes de criar recursos.
- **FR-003**: Scaffold MUST gerar `.env` com sistema, portas, `ADMIN_USER`, `ADMIN_PASSWORD` (via prompt interactivo) e `ADMIN_PASSWORD_HASH` (gerado automaticamente via Caddy).
- **FR-004**: Scaffold MUST imprimir (não aplicar) blocos Caddy e cloudflared prontos a colar.
- **FR-005**: Hub MUST ser site estático servido separadamente da app Codex.
- **FR-006**: Hub MUST ler lista de campanhas de ficheiro JSON editado manualmente, via **fetch em runtime** (`campanhas.json` servido como asset estático separado do HTML).
- **FR-007**: Cada cartão MUST mostrar nome, sistema, mestre, URL; capa opcional.
- **FR-008**: Hub MUST ser público (sem auth); instâncias individuais mantêm protecção própria.
- **FR-009**: Runbook MUST documentar actualização manual por instância.
- **FR-010**: MUST existir script `migrar-wfrp.sh` que automatiza cópia/reconfiguração da instância WFRP actual para `codex-wfrp` (preserva dados da campanha); MUST imprimir snippets Caddy/hub e MUST NOT alterar Caddyfile, tunnel nem `campanhas.json`.

### Key Entities

- **Instância de campanha**: deploy isolado em `<CODEX_INSTANCES_ROOT>/codex-<nome>/` (default root `/opt`; pasta, `.env`, containers, domínio).
- **Entrada de hub**: nome, sistema, mestre, url, capa_url opcional.
- **Scaffold**: automação de preparação, não de deploy final nem DNS automático.
- **Migração WFRP**: script que reconfigura só a pasta da instância para o layout `codex-wfrp`; proxy/hub continuam passos manuais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sysadmin cria segunda campanha de teste em **<30 min** seguindo scaffold + passos manuais documentados.
- **SC-002**: Hub lista **100%** das campanhas presentes no JSON após refresh, sem endpoint dinâmico nem rebuild.
- **SC-003**: Nenhum dado de personagem/lore aparece no hub — só metadados de vitrine.
- **SC-004**: Campanha WFRP actual migra para `codex-wfrp` via `migrar-wfrp.sh` após A validado, com dados preservados e downtime limitado à janela de recarregar containers.

## Assumptions

- Isolamento de dados vem da infra (uma BD por deploy), não multi-tenant na app.
- Apenas Ricardo faz deploy/scaffold; mestres usam GM na instância pronta.
- Auto-registro de campanhas no hub fica para evolução futura.
- Mesmo repositório/branch `feature/multi-sistema` para todas as instâncias.
- Default de produção: `CODEX_INSTANCES_ROOT=/opt`; override para dev local documentado no runbook.
