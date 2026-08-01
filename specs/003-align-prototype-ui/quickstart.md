# Quickstart: Validar alinhamento ao protótipo

## Prerequisites

- Docker Compose **ou** backend + frontend locais (ver README raiz)
- `.env` com `ADMIN_USER` e `ADMIN_PASSWORD` definidos
- Protótipo aberto em paralelo: `prototype/Mapa da Campanha.dc.html` (modo jogador; opcionalmente `startMode=admin` só como referência visual)
- Mapa de campanha disponível (seed/dev ou upload)

## Setup

```bash
# na raiz do repositório
cp -n .env.example .env   # garantir ADMIN_USER / ADMIN_PASSWORD
# subir stack conforme README (docker compose up --build, ou uv + vite)
```

Abra a app em `http://localhost:5173` (ou URL do compose) e o protótipo no browser.

## Cenários de validação

### A — Visual jogador (SC-001, SC-002, SC-003)

1. Side-by-side desktop: fundo, accent blurple, sidebar, seg, cards — sem âmbar/marrom.
2. Zoom +/−/1:1 e pan; legenda Local/Grupo.
3. Pin em forma de gota; clique abre **dialog** (backdrop), não card solto; Fechar/backdrop fecham.
4. Chips no modal levam a História/NPCs.
5. Viewport ~375px: bottom bar, overlay, `‹ Mapa`.

### B — Modo GM in-page (SC-004, SC-005)

1. Canto “Acesso restrito (GM)” → dialog sem dica de senha.
2. Senha errada → permanece fora do Modo GM.
3. Senha correta → badge “Modo GM”, aba Grupo, listas Editar/Excluir.
4. Sem Basic Auth na API: chamadas admin falham (401); UI não deve parecer “aberta”.
5. “Modo GM · Sair” → volta ao jogador.
6. `/admin` (se existir) redireciona/abre o mesmo gate — não um shell paralelo como jornada.

### C — Mídia e mapa (SC-006, SC-007)

1. Em Modo GM, substituir imagem pelo **slot no fundo do mapa**.
2. Em modo jogador, fundo **não** editável pelo slot.
3. Forms/listas: slots de imagem local e retrato NPC (não só file input genérico).
4. Sem mapa: placeholder; sem mensagem falsa de mapa já carregado (feature 002).

### D — Formato do grupo (SC-008)

1. Aba Grupo: escolher **brasão** → ícone no mapa muda; reload → persiste.
2. Escolher **bandeira** → volta; jogador (logout) vê o formato escolhido.

## Expected outcomes

- Checklist visual vs [ui-parity.md](./contracts/ui-parity.md) marcado alinhado.
- Contratos de grupo/auth em [openapi-delta.md](./contracts/openapi-delta.md) respeitados.
- Nenhuma regressão óbvia de CRUD público/leitura.

## Referências

- [spec.md](./spec.md)
- [data-model.md](./data-model.md)
- [research.md](./research.md)
