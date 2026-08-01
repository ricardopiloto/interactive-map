# Research: 003-align-prototype-ui

## 1. Fonte de verdade visual

**Decision**: Portar tokens e classes de componente de `prototype/nocturne.css` para `frontend/src/styles/nocturne.css` (e consumir em layout/componentes). Remover paleta âmbar/marrom hardcoded.

**Rationale**: Spec FR-001/FR-008; protótipo já define `.btn`, `.card`, `.seg`, `.dialog`, `.tag`, `.input`, cores e tipografia.

**Alternatives considered**:
- Reescrever tokens “parecidos” sem copiar classes → risco de drift visual
- Carregar o arquivo do protótipo via `<link>` em produção → acopla pasta de design ao runtime; melhor copiar/adaptar no bundle

## 2. Shell único (Modo GM in-page)

**Decision**: Um shell (`MapPage`): estados `jogador` | `gate` | `gm`. Canto “Acesso restrito (GM)” / “Modo GM · Sair”. Listas/forms admin renderizam nas mesmas abas quando `gm`. Rota `/admin` redireciona para `/` e abre o gate (ou equivalente).

**Rationale**: Clarificação Q1; FR-007/FR-011.

**Alternatives considered**:
- Manter `/admin` separado com visual Nocturne → rejeitado na clarificação
- Iframe do protótipo → não persiste dados reais

## 3. Autenticação do gate

**Decision**:
- UI: dialog “Acesso do Mestre” com campo senha (sem dica `gm123`); opcionalmente usuário fixo via env (não exibir se único).
- API: HTTP Basic em **todas** `/api/admin/*` com `ADMIN_USER`/`ADMIN_PASSWORD` (fail closed se ausentes). Credencial válida fica em `sessionStorage` (ou memória) para o header das chamadas admin.
- Logout limpa credencial e volta a `jogador`.

**Rationale**: Clarificação Q4 + amendment 001 ainda não implementado no código; defesa em profundidade com Caddy em prod.

**Alternatives considered**:
- Só senha client-side como o HTML demo → inseguro
- Só Caddy → admin aberto em localhost

## 4. Modal do pin

**Decision**: Substituir `LocalPanel` (card flutuante) por dialog Nocturne (backdrop + `.dialog`) com slot de imagem, meta, chips arco/NPCs, Fechar; clique no backdrop fecha; chips navegam abas.

**Rationale**: FR-005, US2; protótipo usa `dialog-backdrop` / `dialog`.

**Alternatives considered**: Estilizar o painel atual para “parecer” modal → ainda falha hierarquia/backdrop do DS.

## 5. Slots de mídia

**Decision**: Componente `ImageSlot` (drag + click-to-file + preview + placeholder). Usos: fundo do mapa (editável só em Modo GM), imagem do local (modal leitura read-only; form GM editável), retrato NPC (lista/expansão/form). Upload continua em `POST /api/admin/uploads` (multipart); URLs públicas em `/uploads/...`.

**Rationale**: Clarificações Q2/Q3; FR-012/FR-013.

**Alternatives considered**: Manter `ImageUploadField` só em forms → rejeitado; painel lateral para mapa → rejeitado.

## 6. Pins e ícone do grupo

**Decision**:
- Pin local: CSS clip-path / forma “gota” vermelha como no protótipo + estado selected.
- Grupo: duas variantes CSS — `bandeira` (retângulo + haste/clip) e `brasao` (clip polígono do protótipo); campo persistido `formato`.
- Default `bandeira` se nulo/ausente.
- UI aba Grupo: controle para escolher formato + “Mover ícone no mapa”.

**Rationale**: FR-004; clarificação Q5; código do protótipo (`groupClip` bandeira/brasao).

**Alternatives considered**: Uma única forma → não cobre Q5; só prop local sem API → some no reload.

## 7. Zoom / layout / mobile

**Decision**: Manter `react-zoom-pan-pinch`; alinhar chrome (+/−/1:1), legenda e disposição ao protótipo. Sidebar desktop + bottom bar / overlay mobile (`‹ Mapa`) com classes Nocturne.

**Rationale**: FR-002/FR-003; US4.

**Alternatives considered**: Trocar lib de zoom → custo sem ganho de paridade se o chrome for alinhado.

## 8. Migração SQLite `formato`

**Decision**: Adicionar `formato: str` default `"bandeira"` em `GrupoPosicao`. Em SQLite existente: migration leve (ALTER TABLE) no startup ou recreação documentada em dev; seed define `bandeira`.

**Rationale**: Persistência da escolha do GM.

**Alternatives considered**: Tabela settings separada → overkill para singleton.

## 9. Escopo vs amendment 001 (Nocturne + auth)

**Decision**: Esta feature **absorve** o trabalho visual Nocturne e o Basic Auth/gate que o plan 001 amendment descreveu mas o código ainda não tem; 003 amplia para paridade total (shell, modal, slots, formato).

**Rationale**: Evitar duas implementações paralelas; spec 003 é o aceite visual completo.

**Alternatives considered**: Implementar 001 amendment primeiro isolado → retrabalho quando unificar shell.
