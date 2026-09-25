# Medição de desempenho das suítes de teste

## Ambiente de referência

- Data: 2026-09-25
- SO/kernel: Fedora Linux, kernel 7.2.5-200.fc44.x86_64
- Recursos disponíveis: 24 CPUs lógicas, 31 GiB RAM total, 20 GiB disponíveis no início
- Python global: 3.14.7; Python da virtualenv backend: 3.13.14
- uv: 0.11.26; Node.js: v24.16.0; npm: 11.13.0
- FastAPI 0.141.1; Starlette 1.3.1; AnyIO 4.14.2; httpx 0.28.1
- Playwright: 1.63.0; oxlint: 1.76.0
- Dependências já instaladas; execuções locais sequenciais e aquecidas
- `DEBUG` herdado tinha valor inválido `release`; comandos backend/E2E usaram `DEBUG=false`. O cache uv padrão não é gravável no sandbox; medições usaram `UV_CACHE_DIR=/tmp/uv-cache-interactive-map`.
- Starlette emite aviso de depreciação no TestClient: recomenda instalar `httpx2` em vez de usar fallback `httpx`.

## Inventário e comandos completos

- Backend: 206 testes coletados em `backend/tests/`; comando `cd backend && uv run pytest`. Abrange autenticação, permissões, migrações, import/export, dados e isolamento.
- Frontend: `cd frontend && npm run build`, `npm run lint` e `npm run test:contrast`.
- E2E: 162 testes em 21 arquivos, projetos desktop e mobile; `cd frontend && npm run test:e2e`. Playwright está serial, com um worker, timeout de caso 90 s, readiness de API 120 s e build/preview 180 s.
- Seed E2E: `cd backend && DATA_DIR=../frontend/e2e/.data uv run python ../frontend/e2e/seed_e2e.py`; escreve sessão local em `frontend/e2e/.auth/session.json`.
- Execução E2E focada: `cd frontend && npm run test:e2e -- --project=desktop <spec>` depois de preparar dados/serviços.
- Selecione a validação pelo escopo e risco da mudança. A suite completa não é exigida para cada spec ou ajuste visual; reserve-a para mudanças de alto risco, marcos de entrega e CI.

## Linha de base inicial

Foram feitas cinco execuções aquecidas de pytest, build, lint, contraste e da seleção que compõe o perfil rápido. O baseline inicial do pytest teve oito falhas repetíveis. Após corrigir essas falhas, cinco execuções passaram. O Playwright completo não foi medido cinco vezes: após liberar bind de portas, a execução ampla revelou falhas funcionais e visuais; os fluxos afetados foram investigados individualmente.

| Comando/etapa | Execuções (s) | Mediana (s) | Observações |
|---|---:|---:|---|
| pytest completo inicial | 42,93; 42,51; 42,71; 42,76; 43,20 | 42,76 | 206 testes coletados; em todas: 198 passaram e 8 falharam. No sandbox isolado, TestClient/AnyIO trava; fora dele as medições concluem. |
| pytest completo após correções | 41,36; 40,44; 41,13; 41,38; 41,64 | 41,36 | 206 testes passaram em cada execução; a primeira reportou 2.803 avisos. |
| frontend build | 5,43; 5,13; 5,34; 5,02; 5,07 | 5,13 | TypeScript + Vite; cinco sucessos. |
| frontend lint | 0,18; 0,15; 0,15; 0,17; 0,16 | 0,16 | Oxlint terminou com sucesso e reportou avisos existentes de Fast Refresh/dependências React. |
| frontend contraste | 0,13; 0,13; 0,12; 0,13; 0,12 | 0,13 | Gate AA/3:1; cinco sucessos. |
| seed E2E descartável | 0,74 | — | Uma execução isolada; arquivo de sessão local foi restaurado para o diretório de dados habitual depois. |
| Playwright startup + build + preview + casos | tentativa inicial 120,60 (timeout); execução ampla interrompida em 151,95 | — | A execução ampla foi interrompida após 30 casos passarem, 15 serem ignorados e falhas na checagem de qualidade visual/acessibilidade. Três fluxos focados de gestão/visibilidade de arcos e marcador passaram em 11,2 s. A checagem direcionada da home passou em acessibilidade, mas ainda falha por 4% de diferença visual contra baseline antigo. |
| Playwright com serviços prontos | não isolado | — | Preview iniciado fora do runner recebeu `EPERM` ao tentar bind de localhost; não há medição focada confiável no sandbox. |

## Custos e limites observados

Seed foi rápido (0,74 s), build ficou em torno de 5,13 s e pytest completo em torno de 41 s. As oito falhas do baseline foram corrigidas: migração ponte para `estado_exploracao`, expectativa do teste de sessão administrativa e expectativa de campo omitido na resposta pública. O aviso de depreciação do fallback `httpx` continua presente; nenhuma dependência foi trocada. No sandbox isolado, TestClient/AnyIO bloqueia; as medições completas foram feitas fora dele.

Playwright usa um worker e compartilha `DATA_DIR`, sessão e slugs de campanha entre desktop/mobile; vários testes alteram estado. Manter serial até isolamento e estabilidade independentes serem demonstrados. Não alterar fixtures, timeout global nem build com base em medições incompletas.

## Perfil rápido

`./scripts/test-fast.sh --frontend` executa `npm run lint` e `npm run test:contrast`, adequado a alterações visuais como CSS de botão; não exige Python nem backend. `--backend` executa nove testes unitários/CLI selecionados. Sem opção, o script combina as duas seleções. Requer somente as dependências dos perfis escolhidos já instaladas. Não instala/sincroniza dependências, faz build, seed nem inicializa serviços. O perfil frontend omite build, backend e Playwright; amplie a validação quando a mudança tocar esses escopos.

Tempos aquecidos do perfil combinado: 1,40; 1,30; 1,30; 1,30; 1,33 s. Mediana: 1,30 s, abaixo da meta de 120 s. Cada execução teve nove testes backend aprovados e lint/contraste aprovados. Falha simulada no lint foi identificada pelo nome da etapa, retornou exit 37 e interrompeu antes do contraste. A seleção frontend isolada é ainda mais curta, sem custo de inicialização do backend.

## Baseline após otimização

O perfil rápido cumpre a meta de duração e agora pode ser limitado ao frontend ou backend. A suite pytest está verde nas cinco medições pós-correção. A suite Playwright ampla segue sem baseline completo repetível devido a falhas visuais e execução interrompida; não se deve impor essa suite para cada mudança simples de frontend. Fixtures, timeout global e workers não foram alterados. Use Playwright focado nas jornadas afetadas e mantenha a suite ampla para marcos de risco elevado e CI; o paralelismo exige primeiro isolamento de dados/sessões/slugs por worker. Consulte a documentação oficial de [parallelism](https://playwright.dev/docs/test-parallel) e [sharding](https://playwright.dev/docs/test-sharding).

## Achado para a spec 152 — E2E de associação de personagens

Durante a validação funcional da spec 151, o Playwright não conseguiu concluir a jornada de reabertura do editor após salvar associações PJ/NPC. No primeiro fluxo, o clique por coordenadas no pin do Local foi interceptado por outro pin sobreposto; após tornar a seleção determinística, a asserção de `aria-pressed` dos personagens reabertos não correspondeu ao estado esperado. A leitura administrativa confirmou os IDs persistidos após o primeiro salvamento. A execução foi interrompida sem diagnóstico conclusivo e sem rodar a suite completa.

Esse registro não classifica o caso como defeito do produto nem como defeito exclusivo do teste. A spec 152 deve avaliar seletores/seleção determinística, sincronização de dados no E2E e diagnóstico de divergências entre estado persistido e estado renderizado, sem ampliar o escopo da feature 151.
