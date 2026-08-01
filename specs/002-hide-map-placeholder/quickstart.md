# Quickstart: 002-hide-map-placeholder

Validação do empty state do mapa. Contrato: [contracts/ui-map-empty-state.md](./contracts/ui-map-empty-state.md).

## Prerequisites

- Backend + frontend em execução (como no README do repo)
- Opcional: seed da feature 001

## 1. Com campaign-map presente

```bash
# Garanta um arquivo de imagem válido, p.ex.:
ls backend/uploads/map/campaign-map.*
# Se não houver, envie pelo /admin ou copie um .webp/.png para esse path
```

1. Abrir http://localhost:5173/
2. **Esperado**: mapa de fundo visível; **sem** o texto “envie a imagem pelo painel GM”.
3. Abrir http://localhost:5173/admin (com auth se já estiver ativa)
4. **Esperado**: mesma regra na área do mapa.

## 2. Sem campaign-map

```bash
# Temporário: mover/renomear o arquivo
mv backend/uploads/map/campaign-map.webp /tmp/campaign-map.webp.bak  # ajuste a extensão
```

1. Hard refresh em `/`
2. **Esperado**: empty state com orientação para enviar pelo painel GM; sem mensagem “por cima” de um mapa fantasma.
3. Restaurar o arquivo e refresh → mensagem some, imagem volta.

## 3. Done quando

- [ ] SC-001: com mapa, mensagem ausente
- [ ] SC-002: sem mapa, mensagem presente
- [ ] Admin e público consistentes
