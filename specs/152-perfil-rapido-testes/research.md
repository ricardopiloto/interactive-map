# Research: Otimizar a execução dos testes

**Feature**: `152-perfil-rapido-testes`  
**Date**: 2026-09-25

## 1. Linha de base antes da otimização

**Decision**: medir separadamente cinco etapas — instalação inicial (informativa), preparação/seeding E2E, suíte backend, build/checagens frontend e execução Playwright com serviços prontos versus inicialização completa. Registrar ambiente, inventário de testes e duração de cinco execuções após aquecimento; usar a mediana.

**Rationale**: o repositório não registra perfil ou linha de base existente. Misturar build, serviço, seed e execução dos testes esconde onde a espera ocorre. A repetição e a mediana reduzem influência de variação pontual.

**Alternatives considered**: otimizar primeiro o gargalo aparente — rejeitado porque os custos observados são hipóteses e a spec exige medir antes de escolher otimizações.

## 2. Backend pytest

**Decision**: instrumentar primeiro o setup dos fixtures e identificar o custo de criar diretório de dados, engines SQLite, bancos/migrações, campanha, usuário e sessão de teste. Manter o escopo isolado atual dos fixtures até que medições e análise de estado global provem que ampliar sua duração é seguro.

**Rationale**: `backend/tests/conftest.py` cria `data_root` e `client` por teste; o caminho inclui bootstrap de banco/campanha e criação/autenticação de usuário. São operações repetidas potencialmente custosas, mas o compartilhamento pode introduzir contaminação de estado.

**Alternatives considered**: transformar fixtures em sessão/módulo compartilhada imediatamente — rejeitado por risco de estado residual, dependências de ordem e quebra do isolamento entre testes.

## 3. Playwright E2E

**Decision**: o perfil rápido deve selecionar specs/casos de alto sinal e usar projeto desktop; o fluxo completo mantém desktop e mobile. Antes de compartilhar workers ou dados, medir o custo da serialização e manter execução serial até que cada worker tenha DATA_DIR, campanhas, credenciais e portas independentes.

**Rationale**: `playwright.config.ts` define `workers: 1`, `fullyParallel: false`, dois projetos e um DATA_DIR compartilhado. Fixtures alteram campanhas/usuários persistentes. Subir workers sem isolamento pode produzir colisões ou resultados não determinísticos.

**Alternatives considered**: elevar `workers` globalmente — rejeitado sem isolamento comprovado. Tornar mobile opcional no fluxo completo — rejeitado, pois reduziria cobertura.

## 4. Startup, build e seed E2E

**Decision**: medir separadamente inicialização do backend, build frontend, readiness do preview e execução dos testes. Evitar repetir build ou seed quando artefatos/serviços preparados forem explicitamente reutilizáveis; manter um fluxo completo que inicia tudo em ambiente limpo.

**Rationale**: o `webServer` do Playwright inicializa uvicorn e executa `npm run build` antes de `vite preview`; a preparação da sessão E2E é manual e roda `seed_e2e.py`. O servidor local pode ser reutilizado fora do CI, mas o build ainda faz parte do comando quando o preview precisa ser iniciado.

**Alternatives considered**: remover build/seed do caminho completo — rejeitado, pois uma validação limpa precisa provar a aplicação e os dados de teste inicializam corretamente.

## 5. Timeouts e diagnóstico

**Decision**: manter limites globais generosos para casos legítimos e substituir espera silenciosa por etapas diagnosticáveis: timeout de inicialização/readiness, timeout de expectativa/ação e duração do teste devem ser reportados separadamente. Reduzir timeout apenas em testes ou operações onde o limite correto é conhecido.

**Rationale**: configuração atual permite 90s por teste, 120s para backend e 180s para build+preview; esses limites tornam falhas iniciais lentas para diagnosticar. O backlog e o ciclo da spec 149 registram casos de espera em timeout quando serviços ou interações não progridem.

**Alternatives considered**: reduzir todos os timeouts em bloco — rejeitado por trocar espera excessiva por falsos negativos em operações genuinamente lentas.

## 6. Perfil rápido e comandos completos

**Decision**: oferecer um comando de perfil rápido que declare sua seleção, pré-requisitos e exclusões; manter `uv run pytest` e o conjunto Playwright desktop+mobile como caminhos completos, junto aos gates de build/lint/contraste aplicáveis. Falha em qualquer teste executado deve produzir saída de falha e identificação do caso.

**Rationale**: hoje não existe perfil nomeado; backend tem comando completo documentado e frontend tem scripts npm para checks/E2E. Não há runner de unit tests frontend separado. O perfil rápido deve usar ferramentas disponíveis e não pode fingir ser gate de entrega.

**Alternatives considered**: novo framework de teste ou remoção de suites — rejeitado por custo e violação do requisito de manter cobertura.

## 7. Métrica de cobertura

**Decision**: comparar lista de testes coletados e execução de todos os testes obrigatórios antes/depois; não inferir cobertura de código se não existir medição de coverage já configurada. Qualquer redução de cenários existentes bloqueia a otimização.

**Rationale**: o projeto não declara ferramenta de cobertura em `pyproject.toml` ou `package.json`; o requisito garante manter os testes e seus gates, não adicionar ferramenta nova sem evidência.

**Alternatives considered**: introduzir ferramenta de coverage como pré-requisito — rejeitado por não ser necessária para demonstrar que nenhum teste foi removido.
