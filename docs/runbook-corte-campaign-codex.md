# Runbook de corte — Campaign Codex

**Hostname**: `https://campaign-codex.1nodado.com.br`  
**Slugs de produção**: `/c/wfrp`, `/c/wod`  
**Janela de retorno**: **14 dias** após parar as instâncias antigas.

Este documento **não** edita Caddy, Cloudflare Tunnel nem `/opt/codex-*`. Colar snippets à mão.

## 1. Ensaio (obrigatório)

1. Copiar as pastas das instâncias WFRP e WoD para um sítio de trabalho (a origem de produção fica só de leitura).
2. Garantir um mestre 095 (email) activo.
3. Importar cada cópia:

```bash
cd backend
uv run python -m app.cli campanha importar-legado \
  --origem /caminho/copia-wfrp \
  --slug wfrp --sistema wfrp4e --nome "WFRP" \
  --email mestre@exemplo.com \
  --relatorio /tmp/rel-wfrp.json

uv run python -m app.cli campanha importar-legado \
  --origem /caminho/copia-wod \
  --slug wod --sistema wod --nome "WoD" \
  --email mestre@exemplo.com \
  --relatorio /tmp/rel-wod.json
```

4. Só avançar com **dois** `resultado: PASS`. FAIL → não cortar.

O import de produção usa o `DATA_DIR` do compose **novo**. As pastas `/opt/codex-*` são origem **só leitura**.

Se a soma dos uploads exceder 10 GiB, passar `--cota-bytes` maior.

## 2. Publicar o Codex

Subir o compose Campaign Codex (um único sítio). **Ainda não** parar as instâncias antigas.

## 3. Snippets (colar à mão)

```bash
./scripts/imprimir-snippets-codex.sh --porta-api PORT --porta-web PORT
```

Colar o bloco Caddy e a entrada Cloudflare Tunnel. **Não** configurar `redir` dos hosts antigos para o Codex.

## 4. Verificar (smoke)

- `GET /` lista WFRP e WoD (se `listada`).
- Abrir `/c/wfrp` e `/c/wod`.
- Login do mestre em `/login` → `/painel`.
- Um `GET` da imagem de mapa de cada mesa → 200.

## 5. Parar as instâncias antigas

**Só depois** do smoke: `docker compose stop` (ou equivalente) nas pastas `/opt/codex-*`. **Não** `git pull`. **Não** apagar volumes.

Comunicar o URL novo aos jogadores fora de banda.

## 6. Janela de 14 dias

Pastas antigas **paradas e intactas**. Rollback: desligar o Codex; subir as instâncias antigas **sem alterar ficheiros**.

Após 14 dias: arquivar/desligar as pastas antigas. **Não apagar durante a janela.**
