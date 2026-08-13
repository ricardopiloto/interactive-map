# Entrada para config.yml do cloudflared (colar manualmente).
# Depois: cloudflared tunnel route dns <TUNNEL_ID> __HOSTNAME__

  - hostname: __HOSTNAME__
    service: http://127.0.0.1:__PORTA_WEB__
