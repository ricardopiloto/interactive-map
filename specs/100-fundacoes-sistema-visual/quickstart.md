# Quickstart: Fundações do sistema visual

**Feature**: `100-fundacoes-sistema-visual`

## Pré-requisitos

- Node/npm no `frontend/`
- `npm run dev` (Vite)

## Verificar

1. **Tema sistema**: preferência escura → UI dark; clara → light. Mudar a preferência do SO com a app aberta → tema actualiza sem reload.
2. **Sem Google Fonts**: DevTools → Network → sem pedidos a `fonts.googleapis.com` / `fonts.gstatic.com`.
3. **Styleguide (só dev)**: abrir `http://localhost:5173/__styleguide` → ver tokens; alternar dark/light **no preview**; navegar para `/` → tema da app ainda é o do sistema (não o do toggle).
4. **Produção**: `npm run build && npm run preview` → `/__styleguide` → 404 (ou sem rota).
5. **Gates**:
   ```bash
   cd frontend && npm run test:contrast && npm run lint:tokens
   ```
   Ambos passam.
6. **Spot-check**: mapa, relações, home/painel, login — texto legível; sem hex soltos óbvios em CSS de UI (excepto cor de pino).

## Fora desta fase

Seletor Auto/Claro/Escuro (UX-3); componentes Button/Dialog (UX-2).
