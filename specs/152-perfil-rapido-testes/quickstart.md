# Quickstart: Medir e validar perfis de teste

## Pré-requisitos

- Dependências instaladas com os fluxos documentados em `backend/README.md` e `frontend/README.md`.
- Ambiente local consistente para medições repetidas; fechar processos concorrentes que usem os mesmos diretórios/portas.
- Para E2E, dados e sessão preparados pelo seed existente.

## Linha de base

Antes de otimizar, registrar cinco medições aquecidas de cada caminho separadamente e calcular a mediana:

1. No diretório `backend/`, suíte pytest completa: `uv run pytest`.
2. No diretório `frontend/`, build: `npm run build`.
3. No diretório `frontend/`, lint e contraste: `npm run lint` e `npm run test:contrast`.
4. Seed E2E, medido isoladamente: `DATA_DIR=../frontend/e2e/.data uv run python ../frontend/e2e/seed_e2e.py` a partir de `backend/`.
5. Em `frontend/`, Playwright completo: `npm run test:e2e`.
6. Playwright focado com servidor/API já prontos, separado de inicialização/build, para estimar o tempo da suíte e do overhead de serviços.

Anotar ambiente, estado frio/aquecido, contagem de testes coletados, setup/seed e duração por etapa. Não comparar medições com ambientes ou estados de cache diferentes sem registrar a diferença.

## Validar o perfil rápido após implementação

1. Instalar dependências uma vez conforme `backend/README.md` e `frontend/README.md`; o perfil rápido não instala pacotes.
2. Para alterações visuais, a partir da raiz executar `./scripts/test-fast.sh --frontend` (lint e contraste; não exige Python/backend). Para lógica backend, `./scripts/test-fast.sh --backend`. Sem opção, `./scripts/test-fast.sh` executa ambos. Não requer seed, serviços nem build.
3. O perfil executa nove testes backend selecionados, lint e contraste do frontend; registra duração por etapa e encerra com erro identificado se um comando falhar.
4. Escolher verificações pelo escopo: por exemplo, pytest focado para lógica backend, build para integração de frontend e Playwright focado nas jornadas afetadas. A suite completa é indicada para mudanças de alto risco, marcos de entrega e CI, não para toda alteração de spec.
5. Para E2E completo, preparar os dados com `DATA_DIR=../frontend/e2e/.data uv run python ../frontend/e2e/seed_e2e.py` a partir de `backend/`, depois executar `npm run test:e2e` em `frontend/`.
6. Repetir o perfil rápido cinco vezes aquecidas e comparar a mediana; repetir cinco vezes cada suíte completa somente em ambiente que consiga inicializar seus serviços E2E.

Na referência de 2026-09-25, o perfil rápido foi executado cinco vezes (1,40; 1,30; 1,30; 1,30; 1,33 s), com mediana de 1,30 s. A linha de base dos fluxos integrais permanece parcial; veja `docs/test-performance.md` para os bloqueios observados.

Achado de 2026-09-25 a investigar nesta spec: o E2E de associação PJ/NPC a Local foi instável na seleção de pins sobrepostos e, após salvar, a reabertura exibiu os chips sem seleção apesar de a leitura administrativa confirmar os IDs persistidos. A execução foi interrompida sem determinar se a causa está no teste, na sincronização do estado renderizado ou na funcionalidade. Manter esse diagnóstico no escopo de confiabilidade E2E; não condicionar a entrega da spec 151 à correção da infraestrutura de testes.

## Resultado esperado

O perfil rápido produz feedback local em até dois minutos e explica seu escopo. Os comandos completos seguem disponíveis e preservam os testes de cobertura, isolamento e segurança. Nenhuma otimização paralela é habilitada sem demonstrar isolamento dos dados e estabilidade dos resultados.
