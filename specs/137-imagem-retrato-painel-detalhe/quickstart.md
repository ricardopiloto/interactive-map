# Quickstart: Retrato no painel de detalhe (137)

Validar [spec.md](./spec.md) SC-001–002 e [contracts/detail-portrait-layout.md](./contracts/detail-portrait-layout.md).

## Pré-requisitos

```bash
cd frontend && npm run dev
```

Personagens de teste:
- Com retrato vertical (mais alto que largo)
- Com retrato paisagem (largo)
- Sem retrato

## 1. Retrato vertical (SC-001 / FR-001)

1. Abrir `/c/:slug/relacoes` e seleccionar o personagem com retrato vertical.
2. Esperado: imagem preenche a largura do painel; **sem** moldura tracejada nas laterais; sem distorção.

## 2. Proporções variadas (FR-002 / FR-003)

1. Abrir personagem com retrato paisagem e outro com quadrado.
2. Esperado: sem corte agressivo nem stretch; altura ≤ ~140px; layout do painel utilizável.

## 3. Sem retrato (aceitação 3)

1. Seleccionar personagem sem `retrato_url`.
2. Esperado: nenhum placeholder de imagem no detalhe (só texto/tags como hoje).

## 4. Mobile estreito

1. Viewport ~390px de largura; abrir detalhe com retrato.
2. Esperado: imagem proporcional à largura do painel; sem overflow horizontal.

## 5. Build

```bash
cd frontend && npx tsc -p tsconfig.app.json --noEmit
```

## Grep sanity (pós-implementação)

```bash
rg -n 'detail-portrait' frontend/src/pages/RelacoesPage.css frontend/src/components/media/ImageSlot.css
rg -n 'width:\s*100%' frontend/src/components/media/ImageSlot.css
```

Esperado: regras completas (width/height auto/max-height/img) para `.relacoes-page__detail-portrait`; não só `max-height` isolado em `RelacoesPage.css`.
