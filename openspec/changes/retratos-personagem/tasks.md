# Tasks

## 1. Prévia no editor de Personagem

- [ ] 1.1 Em `frontend-v2/src/components/codex/RelationEditors.tsx` (`PersonagemEditor`), adicionar `{draft.retrato_url && <img src={draft.retrato_url} alt="" className="h-24 w-24 rounded-full object-cover" />}` imediatamente acima do `<Input type="file">` já existente (mesmo padrão de `MapEditors.tsx:363-376`); ajustar o `onChange` do input pra também resetar `event.target.value = ""` depois de ler o arquivo (igual a `MapEditors.tsx`, permitindo reenviar o mesmo nome de arquivo em sequência). Verificar abrindo o editor de um Personagem com retrato existente (prévia aparece) e enviando um arquivo novo (prévia atualiza pro resultado do upload).

## 2. Retrato no painel de detalhe

- [ ] 2.1 Em `frontend-v2/src/routes/relacoes.tsx`, função `Profile`, renderizar o retrato do Personagem (`person.retrato_url`) no topo do painel quando existir, antes do kicker/nome — mesmo padrão de `LocationInspector.tsx:50-57` (`<img>` de largura total, `object-cover`, sem reservar espaço quando não há imagem). Verificar com um Personagem com retrato (imagem aparece no topo) e um sem retrato (sem espaço em branco/quebrado).

## 3. Retrato nos nós do grafo

- [ ] 3.1 Em `frontend-v2/src/components/codex/RelationsGraph.tsx`, adicionar um `<clipPath id={`avatar-clip-${person.id}`}><circle r={radius} /></clipPath>` em `<defs>` e um `<image href={person.retrato_url} x={-radius} y={-radius} width={radius*2} height={radius*2} clipPath="url(#avatar-clip-...)" preserveAspectRatio="xMidYMid slice" />` por cima do `<circle>` de preenchimento sólido já existente, só quando `person.retrato_url` existir; manter o `<circle>` de fundo (serve de placeholder enquanto a imagem carrega, sem *layout shift*). Verificar que o anel de destaque de PJ e o traço de seleção/arrasto continuam desenhados por cima da imagem, como já fazem hoje sobre o círculo sólido.
- [ ] 3.2 Rastrear falhas de carregamento com um `Set<number>` de ids (`onError` do `<image>` adiciona o id ao set); quando um id está nesse set, ou quando não há `retrato_url`, renderizar as iniciais (`<text>`) como já acontece hoje — nunca deixar o `<image>` quebrado visível. Verificar com um `retrato_url` apontando pra uma URL inexistente: o nó cai pras iniciais, sem ícone de imagem quebrada.
- [ ] 3.3 Escrever/estender um teste de render em `RelationsGraph.test.tsx` cobrindo: Personagem com retrato válido mostra a imagem recortada; Personagem sem retrato mostra iniciais (comportamento já existente, só confirmar que não regrediu); simular falha de carregamento (disparar `onError` no teste) e confirmar que cai pras iniciais.

## 4. Regressão

- [ ] 4.1 Rodar `npm run lint`, `npx tsc --noEmit`, `npm run test` e `npx playwright test` completos em `frontend-v2/`; confirmar que `e2e/relacoes.spec.ts` continua passando sem modificação de asserção — esta mudança é só exibição de imagem, não deveria afetar nenhum fluxo de vínculo/visibilidade/CRUD já testado.
- [ ] 4.2 Validar manualmente (ou com fixture) contra um Personagem real com retrato já cadastrado — se a cópia de dados de produção usada nos testes anteriores (`tmp/producao-copia`, se ainda disponível) tiver algum Personagem com `retrato_url` preenchido, usar esse caso real como confirmação final, além dos fixtures sintéticos das tasks acima.

## Workflow follow-up

- Arquivar esta change (`/openspec-archive-change`) depois que as tasks acima estiverem concluídas.
