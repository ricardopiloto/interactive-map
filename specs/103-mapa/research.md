# Research: Mapa

**Feature**: `103-mapa`  
**Date**: 2026-09-21

## 1. Visitado vs conhecido (sem API nova)

**Decision**: Forma derivada de `data_sessao`: não-vazio → **visitado** (preenchido); vazio → **conhecido** (contorno). Grupo continua marcador bandeira/brasão. Cor = `cor_pin` do mestre (fill ou stroke conforme forma).

**Rationale**: Não existe campo de estado; `data_sessao` é o sinal de «já jogado ali» mais próximo. Botões Visitado/Conhecido no formulário continuam a ser só atalhos de cor (UX-5 pode alinhar depois).

**Alternatives**: Inferir pela igualdade a cores sugeridas (frágil); novo campo API (fora de escopo).

## 2. Limiar de zoom para nomes

**Decision**: Nomes visíveis quando `scale >= 1.35` **ou** pino hovered/selected. Escala lida do transform (`--map-zoom` / estado React).

**Rationale**: Clarify Q1; 1.35 ≈ entre fit e FOCUS_SCALE(2).

## 3. Painel de controlos

**Decision**: Manter canto inferior direito; painel com fundo translúcido + borda (tokens); IconButton/Tabler; i18n aria-labels. «1:1» = `resetTransform()`. «Ir ao grupo» desactivado se sem grupo.

**Rationale**: Clarify Q2; já posicionado.

## 4. Legenda

**Decision**: Canto inferior esquerdo; inicia fechada; toggle local; sem `localStorage`.

**Rationale**: Clarify Q3/Q5.

## 5. Popover

**Decision**: Remover dimming do backdrop (`background: transparent` / classe sem scrim); manter posicionamento beside/centered; Esc + clique fora + botão fechar; omitir bloco quando `descricao` vazia (não mostrar `empty.semDescricao` no PinModal do mapa).

**Rationale**: Clarify Q4; FR-004/005.
