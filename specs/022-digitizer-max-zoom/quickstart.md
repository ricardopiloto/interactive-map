# Quickstart: 022-digitizer-max-zoom

Validação manual do zoom aumentado na vista **Rede de rotas**.

## Prerequisites

- Backend e frontend em execução (ex.: uvicorn `:8000`, `npm run dev`)
- Credenciais GM (`ADMIN_USER` / `ADMIN_PASSWORD`)
- Arte do mapa carregada; idealmente já existir rede ou capacidade de criar segmento

## Steps

1. Abrir o app → **Modo GM** → autenticar → **Rede de rotas**.
2. Com a roda do mouse, aproximar até o máximo.
3. **Esperado**: consegue passar do antigo teto (4× / sensação do mapa normal) e chegar a um detalhe ~3× maior (estradas finas legíveis). Ver [ui-digitizer-zoom.md](./contracts/ui-digitizer-zoom.md).
4. Cronometrar do zoom inicial até o máximo: **&lt; 5 s** (SC-002). Se falhar, aumentar `wheel.step` na digitalização.
5. Modo **Criar segmento**: com zoom alto, desenhar polilinha acompanhando um traço da arte; pan entre cliques; confirmar segmento.
6. **Esperado**: segmento grava; distância/duração coerentes (zoom não infla km).
7. Alternar **Criar nó** e **Escala** com zoom no máximo — mesmo teto; cliques funcionam.
8. Afastar até o mínimo — visão geral da região/rede.
9. Sair da Rede de rotas; no mapa normal (jogador), zoom máximo continua o de sempre (não 12×).

## Pass criteria

- [ ] Digitalização atinge ~3× o teto do mapa normal
- [ ] Máximo em &lt; 5 s via roda (sem botões novos)
- [ ] Segmento criado sob zoom alto persiste corretamente
- [ ] Todos os modos da vista compartilham o teto
- [ ] Mapa do jogador inalterado
