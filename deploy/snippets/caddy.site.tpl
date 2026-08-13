# Colar no Caddyfile do host — não aplicado automaticamente pelos scripts.
# Hostname: __HOSTNAME__
# Reverse proxy → 127.0.0.1:__PORTA_WEB__

__HOSTNAME__ {
	encode gzip

	handle /admin* {
		basicauth {
			__ADMIN_USER__ __ADMIN_PASSWORD_HASH__
		}
		reverse_proxy 127.0.0.1:__PORTA_WEB__
	}

	@admin_write {
		path /api/admin*
		method POST PUT PATCH DELETE
	}
	handle @admin_write {
		basicauth {
			__ADMIN_USER__ __ADMIN_PASSWORD_HASH__
		}
		reverse_proxy 127.0.0.1:__PORTA_API__
	}

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
