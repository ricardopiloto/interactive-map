# SEO e indexação em produção

## Aplicar o Caddy no host

O Caddy do host é configurado à mão. Copiar o bloco do site de `deploy/Caddyfile` (Docker: `api:8000`, `web:80`) ou preencher `__HOSTNAME__`, `__PORTA_API__` e `__PORTA_WEB__` em `deploy/snippets/caddy.site.tpl` quando os serviços são publicados em loopback. Os blocos incluem `@privadas` e `X-Robots-Tag: noindex, nofollow`, `@tokens` e `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex` para `/api/*`, os encaminhamentos de `/api/*`, `/uploads/*` e `/sitemap.xml`, o matcher `@spa` e o fallback de 404 real. Copiar o bloco inteiro para manter a ordem e atualizar `@spa` ao criar uma rota.

Bloco de exemplo a colar no Caddy do host quando os upstreams são os serviços Docker:

```caddyfile
# Snippet para o Caddy do host (produção).
# Ajuste o upstream conforme a rede Docker / reverse proxy já existente.
#
# Domínio sugerido: campaign-codex.1nodado.com.br
# Auth: cookie de sessão na API (spec 095) — sem basicauth no proxy.

campaign-codex.1nodado.com.br {
	encode gzip

	# Páginas de conta, administração e links com token fora dos buscadores.
	@privadas path /painel* /admin* /conta* /login* /registo* /esqueci-senha* /convite/* /reset/*
	header @privadas X-Robots-Tag "noindex, nofollow"
	@tokens path /convite/* /reset/*
	header @tokens Referrer-Policy "no-referrer"
	header /api/* X-Robots-Tag "noindex"

	# API, mídia legada e sitemap são servidos pela API.
	handle /api/* {
		reverse_proxy api:8000
	}
	handle /uploads/* {
		reverse_proxy api:8000
	}
	handle /sitemap.xml {
		reverse_proxy api:8000
	}

	# Rotas válidas da SPA e arquivos estáticos; HTML inicial sem cache persistente.
	@spa path / /explorar /login /registo /esqueci-senha /contato /termos /privacidade /conta /painel /painel/* /admin /admin/* /convite/* /reset/* /c/* /assets/* /favicon.svg /favicon.ico /robots.txt
	handle @spa {
		@index path / /index.html
		header @index Cache-Control "no-cache"
		reverse_proxy web:80
	}

	# Rota desconhecida: conteúdo da página não encontrada da SPA com HTTP 404.
	# Plano B: se copy_response 404 não funcionar no Caddy 2.9, remover este
	# handle final e deixar o fallback do contêiner (soft 404 com noindex).
	handle {
		rewrite * /index.html
		reverse_proxy web:80 {
			@ok status 2xx
			handle_response @ok {
				copy_response 404
			}
		}
	}
}
```

Para portas locais, usar o bloco equivalente em `deploy/snippets/caddy.site.tpl` após substituir os placeholders.

O domínio canônico pressupõe **um único hostname público**, `campaign-codex.1nodado.com.br`. Outros hostnames que sirvam a aplicação devem redirecionar para ele no Caddy, pois o frontend monta o canônico com a origem da URL atual.

Validar o exemplo do repositório antes de aplicar e validar também o Caddyfile efetivo do host após a edição:

```sh
docker run --rm -v "$PWD/deploy:/etc/caddy:ro" caddy:2.9-alpine caddy validate --config /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile
caddy reload --config /etc/caddy/Caddyfile
```

Para o template, substituir os três placeholders por valores reais antes de validar. O plano B, caso `copy_response 404` não funcione no Caddy 2.9, é remover o `handle` final e deixar o fallback do contêiner; nesse caso a página desconhecida terá soft 404, mas a meta `noindex` permanece.

Conferir os cabeçalhos no endereço público, inclusive depois da Cloudflare:

```sh
curl -I https://campaign-codex.1nodado.com.br/
curl -I https://campaign-codex.1nodado.com.br/painel
curl -I https://campaign-codex.1nodado.com.br/convite/exemplo
curl -I https://campaign-codex.1nodado.com.br/api/health
curl -I https://campaign-codex.1nodado.com.br/sitemap.xml
curl -I https://campaign-codex.1nodado.com.br/rota-inexistente
```

Esperado: `/` responde 200 e `Cache-Control: no-cache`; `/painel` tem `X-Robots-Tag: noindex, nofollow`; `/convite/exemplo` também tem `Referrer-Policy: no-referrer`; `/api/health` tem `X-Robots-Tag: noindex`; `/sitemap.xml` responde 200 e `Content-Type: application/xml`; a rota inexistente responde 404 com a página da SPA. Uma campanha inexistente em `/c/…` pode responder 200 no proxy, mas o frontend declara `noindex` após consultar a API.

## Google Search Console

1. Adicionar a propriedade de domínio no Google Search Console e verificar a titularidade com o registro TXT indicado no DNS da Cloudflare.
2. Enviar `https://campaign-codex.1nodado.com.br/sitemap.xml` em **Sitemaps**. O sitemap não publica `lastmod` e tem limite de 50 000 URLs por arquivo; rever a estrutura antes de atingir dezenas de milhares de campanhas.
3. Em **Inspecionar URL**, testar `/`, `/explorar` e uma campanha autorizada. Confirmar resposta 200, renderização do conteúdo e ausência de desafio da Cloudflare WAF ou Bot Fight Mode para o Googlebot. Se necessário, liberar o Googlebot verificado na Cloudflare.
4. Para URLs já indexadas que devem sair dos resultados, usar **Remoções** no Search Console. O `noindex` permanente é aplicado no próximo rastreio; a remoção imediata é temporária.

A Cloudflare pode entregar um bloco gerenciado antes do `robots.txt` do repositório. Conferir o arquivo público completo, inclusive a linha `Sitemap:`. Não adicionar `Disallow` para `/api` ou páginas privadas: o robô precisa acessar a API para renderizar a SPA e ler o `noindex` das páginas. O `X-Robots-Tag: noindex` de `/api/*` também tira imagens servidas por `/api/c/{slug}/media` do Google Imagens, conforme a política segura da change.

A indexação por campanha começa desligada. O ganho imediato esperado é a descoberta do site institucional e do catálogo; o mestre pode autorizar cada campanha listada no Painel.
