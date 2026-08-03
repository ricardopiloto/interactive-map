# UI Contract: Cor do pin de local

## Must

| Superfície | Comportamento |
|------------|----------------|
| Pin no mapa | `background` = `cor_pin` do local; borda/forma atuais preservadas |
| Formulário GM (criar/editar local) | Seletor livre + swatches sugeridos (vermelho visitado, lilás conhecido); salvar exige cor |
| Legenda | Convenção sugerida visitado / conhecido não visitado; GM pode usar outras cores |
| Modo jogador | Sem controle de edição de cor |
| Pin do grupo | Aparência inalterada por esta feature |

## Must not

- Persistir local sem cor
- Expor edição de cor fora do Modo GM
- Substituir seletor livre por enum rígido de status nesta entrega

## Acceptance check

Criar local lilás e outro vermelho → pins distintos no mapa; jogador vê as mesmas cores; salvar sem cor bloqueado; grupo intacto.
