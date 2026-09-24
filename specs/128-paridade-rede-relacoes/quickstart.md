# Quickstart: Auditoria de paridade da Rede de Relações

Execute localmente com campanhas de teste e os mesmos critérios do [contrato visual](contracts/relationship-visual-contract.md). Não altere nem use dados de produção.

## Pré-requisitos

- Dependências do backend e do frontend instaladas.
- Campanha de teste com PJ e NPC visíveis, personagem oculto, vínculo público e privado, par de duas vias com ambos sentidos conhecidos e outro com um sentido secreto.
- Acesso de GM e jogador para a mesma campanha.
- Matriz de paridade em `specs/128-paridade-rede-relacoes/parity-matrix.md` preenchida com critério, fonte, estado, evidência e justificativa.

## Validar privacidade do servidor

1. Antes de qualquer alteração ao endpoint, executar os testes existentes e adicionar os casos de par privado e projeção por sentido em `backend/tests/test_visibility_relacoes.py`.
2. Em resposta pública de jogador, confirmar ausência completa de vínculo privado e de qualquer vínculo ligado a personagem oculto.
3. Para par público de duas vias com apenas um sentido conhecido, confirmar que tipo, qualificador e nota do sentido desconhecido não chegam na resposta JSON; o sentido conhecido permanece legível.
4. Como GM, confirmar que o endpoint administrativo entrega ambos sentidos e a visibilidade que a interface precisa distinguir.

Com diretório `backend`, executar `uv run pytest tests/test_visibility_relacoes.py tests/test_visibility.py`.

## Validar a experiência visual

1. Abrir `/c/{slug}/relacoes` em vista de GM. Confirmar painel flutuante atual, busca, filtros, lista/detalhe e controles de zoom/pan.
2. Conferir um vínculo público e um privado do mesmo tipo: GM identifica o privado no palco e no detalhe sem abrir o editor; jogador não recebe nem exibe indicador ou vestígio do vínculo privado.
3. Usar um par de duas vias com um sentido desconhecido. GM identifica o sentido conhecido e o secreto junto ao extremo correto. Jogador vê apenas o sentido autorizado, sem gradiente ou pista que indique conteúdo secreto.
4. Conferir que todos os segmentos visíveis são linhas retas, que A→B e B→A apontam corretamente e que rótulos permanecem associados aos extremos corretos em foco/hover.
5. Em tema claro e escuro, identificar os oito tipos tanto no grafo como nas amostras de filtro/legenda. Confirmar nomes e padrões/texto sem depender exclusivamente da cor.
6. Abrir campanhas com muitos vínculos em desktop e mobile, com painel recolhido/expandido. Confirmar PJs/NPCs localizáveis, foco central legível, vizinhos diretos no anel interno e nós essenciais não encobertos pelo painel.
7. Percorrer busca, filtros, isolar, seleção na lista e no palco, detalhe, edição e exclusão. Comparar o painel com a estrutura atual da branch; não reintroduzir coluna fixa/painel separado.
8. Repetir cenários em pt-BR/en e passar axe nos estados de GM/jogador e painel aberto/recolhido.

Da pasta `frontend`, executar `npm run build` e `npm run test:e2e -- e2e/relacoes-parity.spec.ts`.

## Validar documentação e comparação

1. Completar `specs/128-paridade-rede-relacoes/parity-matrix.md` com evidência da branch atual, `main`, manual e specs históricas aplicáveis.
2. Atualizar `docs/manual-relacoes.md` com cores/traços, indicadores GM, linha reta e regras de privacidade que foram aprovadas.
3. Atualizar `specs/116-relacoes-rota-reconstrucao/spec.md` com a casca atual e apontar as divergências intencionais de spec 105 e `main`.

## Resultados esperados

- GM reconhece vínculos privados e sentidos desconhecidos sem depender do formulário; jogador não consegue inferir dados secretos.
- Todas as relações são segmentos retos e os sentidos bidirecionais são lidos sem inversão.
- Oito tipos são distinguíveis nos dois temas por cor e pistas redundantes; chips/amostras reproduzem o estilo da aresta.
- Layout PJ/NPC e fluxo painel/lista/detalhe continuam compreensíveis em desktop e mobile.
- Nenhum estado secreto, contrato de dados ou algoritmo radial novo foi introduzido.
- Manual, referência de estrutura e matriz refletem os critérios finais e as diferenças intencionais.
