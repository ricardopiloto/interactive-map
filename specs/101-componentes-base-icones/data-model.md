# Data Model: Componentes base e ícones

Sem persistência. Entidades de UI:

| Entity | Role |
|--------|------|
| Button | variants: primary, secondary, ghost, danger |
| ConfirmDialog | title, description, confirmLabel, cancelLabel, danger?, open, onConfirm, onCancel |
| Toast item | id, tone (success/error/info), message, ttl |
| Dialog/Drawer | open, onClose, title?, initialFocusRef? |

Estado Toast: fila em memória no Provider (não URL).
