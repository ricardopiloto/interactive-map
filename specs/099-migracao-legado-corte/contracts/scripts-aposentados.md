# Contract: Scripts 078 aposentados

**Feature**: 099  
**Ficheiros**: `scripts/nova-campanha.sh`, `scripts/migrar-wfrp.sh`  
**Hub**: `hub/` permanece no git; **não** é procedimento corrente.

## Comportamento

Qualquer invocação (com ou sem args, excepto talvez `-h` que ainda explica a aposentadoria):

1. Imprime em stderr (pt-BR) que o modelo multi-instância está **aposentado**; campanhas novas = Campaign Codex (`campanha criar` / `/painel`).
2. `exit 1`.
3. MUST NOT criar `codex-<slug>/`, MUST NOT clonar, MUST NOT escrever `.env` / override, MUST NOT imprimir snippets de **nova instância** como se fossem o caminho actual.

Teste: contra um tmp root, após o script, o root continua vazio (além do que já existia).

## Docs activas

README, `docs/manuais.md` + manuais, runbook 099: URLs `https://campaign-codex.1nodado.com.br/c/wfrp` e `/c/wod`. MUST NOT instruir `nova-campanha.sh` nem editar `hub/campanhas.json` como passo de campanha nova.

`hub/README.md` MAY dizer «histórico / 078».
