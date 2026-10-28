# Colar no Caddyfile do host — não aplicado automaticamente pelos scripts.
# Hostname: __HOSTNAME__
# Reverse proxy → 127.0.0.1:__PORTA_WEB__
# Auth: cookie de sessão na API (spec 095) — sem basicauth.

__HOSTNAME__ {
	encode gzip

	# Páginas de conta, administração e links com token fora dos buscadores.
	@privadas path /painel* /admin* /conta* /login* /registo* /esqueci-senha* /convite/* /reset/*
	header @privadas X-Robots-Tag "noindex, nofollow"
	@tokens path /convite/* /reset/*
	header @tokens Referrer-Policy "no-referrer"
	header /api/* X-Robots-Tag "noindex"

	# API, mídia legada e sitemap são servidos pela API.
	handle /api/* {
		reverse_proxy 127.0.0.1:__PORTA_API__
	}
	handle /uploads/* {
		reverse_proxy 127.0.0.1:__PORTA_API__
	}
	handle /sitemap.xml {
		reverse_proxy 127.0.0.1:__PORTA_API__
	}

	# Rotas válidas da SPA e arquivos estáticos; HTML inicial sem cache persistente.
	@spa path / /explorar /login /registo /esqueci-senha /contato /termos /privacidade /conta /painel /painel/* /admin /admin/* /convite/* /reset/* /c/* /assets/* /favicon.svg /favicon.ico /robots.txt
	handle @spa {
		@index path / /index.html
		header @index Cache-Control "no-cache"
		reverse_proxy 127.0.0.1:__PORTA_WEB__
	}

	# Rota desconhecida: conteúdo da página não encontrada da SPA com HTTP 404.
	# Plano B: se copy_response 404 não funcionar no Caddy 2.9, remover este
	# handle final e deixar o fallback do contêiner (soft 404 com noindex).
	handle {
		rewrite * /index.html
		reverse_proxy 127.0.0.1:__PORTA_WEB__ {
			@ok status 2xx
			handle_response @ok {
				copy_response 404
			}
		}
	}
}
