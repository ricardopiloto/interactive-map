# Data Model: Tema claro e escuro em todos os gêneros

Esta feature não cria entidades nem altera o schema da aplicação.

## Estado de preferência existente

| Campo conceitual | Valores | Persistência e regra |
|---|---|---|
| Preferência de tema | `auto`, `light`, `dark` | Mantida no perfil local do navegador em `codex.theme`; valor ausente ou inválido resolve como `auto`. |
| Modo efetivo | `light`, `dark` | Derivado da preferência salva; para `auto`, acompanha `prefers-color-scheme`. |
| Gênero da campanha | `fantasia`, `gotico`, `scifi`, `urbano` | Dado existente da campanha; seleciona identidade/paleta sem substituir o modo efetivo. |

## Regras e transições

- Escolher `auto`, `light` ou `dark` altera somente a preferência local do navegador.
- Em `auto`, mudanças na preferência do sistema atualizam o modo efetivo.
- Em `light` ou `dark`, mudanças na preferência do sistema não alteram o modo efetivo.
- Entrar, sair ou alternar entre campanhas muda a paleta de gênero sem sobrescrever a preferência do usuário.
- Todos os quatro gêneros fornecem tokens para ambos os modos efetivos.

Não há relacionamento novo entre usuário, campanha ou entidade persistida.
