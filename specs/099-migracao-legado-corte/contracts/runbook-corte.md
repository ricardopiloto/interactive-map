# Contract: Runbook de corte

**Feature**: 099  
**Hostname**: `campaign-codex.1nodado.com.br`  
**Slugs produção**: `wfrp`, `wod`

## Pré-condições

1. Ensaio: importar **cópias** das duas instâncias → dois relatórios `PASS` ([relatorio-verificacao.md](./relatorio-verificacao.md)).
2. Utilizador dono 095 já existe.
3. Compose Campaign Codex preparado (um `DATA_DIR` novo — **não** os volumes `/opt/codex-*`).

## Ordem (obrigatória)

1. Import legado de produção para o `DATA_DIR` do Codex (origem `/opt/codex-*` **só leitura**).
2. Subir o compose do Codex.
3. Imprimir snippets e **colar à mão** no Caddy e Cloudflare Tunnel do host.
4. **Verificar** smoke: `GET /` lista as duas; `/c/wfrp` e `/c/wod` abrem; login mestre; um `GET` mídia de mapa 200.
5. **Só então** parar os containers/instâncias antigas (`docker compose stop` nas pastas `/opt/codex-*` — **sem** `git pull`, **sem** apagar volumes).
6. Comunicar o URL novo aos jogadores (fora de banda). **Sem** 301/302 dos hosts antigos.

## Snippets

```text
scripts/imprimir-snippets-codex.sh --porta-api PORT --porta-web PORT
```

(ou `campaign-codex campanha snippets-corte …`)

- Preenche `deploy/snippets/caddy.site.tpl` e `cloudflared.ingress.tpl`.
- Hostname fixo `campaign-codex.1nodado.com.br`.
- Stdout **apenas**. MUST NOT escrever:
  - Caddyfile do host / `deploy/Caddyfile` no repo
  - `config.yml` cloudflared
  - `hub/campanhas.json`
  - qualquer path sob `/opt/codex-*`

Sem bloco `redir` para os hostnames antigos.

## Janela de retorno (14 dias)

- Instâncias antigas: **paradas** e **intactas**.
- Rollback: desligar Codex; `docker compose up` nas pastas antigas **sem** modificar ficheiros → serviço antigo.
- Após 14 dias: runbook descreve arquivar/desligar pastas antigas. MUST NOT apagar durante a janela.

## Não-efeitos globais

- MUST NOT exigir `git pull` nas instâncias antigas.
- MUST NOT adoptar zip 097 para WFRP/WoD de produção.
