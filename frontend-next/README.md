# Campaign Codex — protótipo de novo frontend

Protótipo navegável e **100% desconectado do backend real** (`frontend/`, `backend/`) — dados
mocados em [`src/data/mock.ts`](src/data/mock.ts), estado só em memória do navegador. Serve para
validar a direção de design antes de qualquer trabalho de produção; nada aqui é destinado a virar
o app real linha por linha, é a referência visual e de interação para as specs `UX-*`.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5183`. Ou, de dentro do Claude Code / Cursor, `preview_start` com o
nome `frontend-next` (já configurado em `../.claude/launch.json`).

## O que está aqui

- **Marketing** (`/`): apresentação, com os 4 temas de gênero clicáveis ao vivo.
- **Descoberta** (`/explorar`): página do jogador, sem conta — cartões de campanha, filtro por gênero.
- **Entrar** (`/entrar`): login do mestre + fluxo de convite (mock).
- **Campanha** (`/c/:slug`, `/c/:slug/relacoes`, `/c/:slug/rota`, `/c/:slug/sessoes`): mapa ao
  estilo Google/Apple Maps (busca + lista + detalhe no mesmo painel, zoom/pan com
  `react-zoom-pan-pinch`, pinos de tamanho estável via `KeepScale`), Rede de Relações (4 famílias
  de vínculo por cor + traço), calculadora de rotas (Dijkstra real sobre o grafo mocado da
  campanha) e uma prévia de "Crônica de sessões" (item de roadmap da pesquisa de mercado).
  "Modo mestre" alterna as ações de edição (criar/editar/excluir local, personagem, vínculo).
- **Painel do mestre** (`/painel`) e **assistente de criação** (`/painel/novo`): o mestre é o
  "administrador" da própria campanha — cria um codex novo escolhendo sistema e **gênero**
  (a tela inteira já mostra o tema escolhido, em tempo real, antes de confirmar).
- **Console do administrador** (`/admin`): visão do super-admin — todas as campanhas, convite de
  mestre por link de uso único, uso de disco agregado.

Um menu flutuante no canto inferior esquerdo (bolinha com ícone de mapa) pula entre todas essas
telas sem decorar URLs — é só andaime do protótipo, não faz parte do produto.

## Sistema de design ("Compass")

Tokens em [`src/styles/tokens.css`](src/styles/tokens.css): cada gênero (fantasia, gótico, ficção
científica, urbano) é gerado pela mesma fórmula HSL — só o matiz muda —, o que garante contraste
AA equivalente em todos, nos dois modos (claro só implementado para fantasia por ora). Trocar de
gênero/tema é `data-genre`/`data-mode` na raiz do documento — ver `src/theme/ThemeContext.tsx`.

## Limitações conhecidas (é protótipo, não produção)

- Sem i18n (só PT-BR), sem persistência real, sem autenticação de verdade.
- Tema claro só para o gênero "fantasia"; os outros têm as variáveis mas não foram
  visualmente calibrados.
- Bundle não otimizado (single chunk, ~520 KB) — não é um problema de produção, ninguém vai
  servir este build.
- Layout de grafo e de rotas são versões simplificadas dos algoritmos do app real.
