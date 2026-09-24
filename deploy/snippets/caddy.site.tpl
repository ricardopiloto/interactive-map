# Colar no Caddyfile do host — não aplicado automaticamente pelos scripts.
# Hostname: __HOSTNAME__
# Reverse proxy → 127.0.0.1:__PORTA_WEB__
# Auth: cookie de sessão na API (spec 095) — sem basicauth.

__HOSTNAME__ {
	encode gzip

	handle /api/* {
		reverse_proxy 127.0.0.1:__PORTA_API__
	}

	handle /uploads/* {
		reverse_proxy 127.0.0.1:__PORTA_API__
	}

	handle {
		reverse_proxy 127.0.0.1:__PORTA_WEB__
	}
}
