from urllib.parse import urlsplit

from app.config import Settings, settings


def validate_registo_startup(config: Settings = settings) -> None:
    if config.registo_modo not in {'fechado', 'aberto'}:
        raise RuntimeError('REGISTO_MODO deve ser fechado ou aberto')
    if config.registo_modo != 'aberto' or config.debug:
        return
    if not config.email_api_key:
        raise RuntimeError('EMAIL_API_KEY é obrigatório para registo aberto')
    url = urlsplit(config.public_base_url)
    if url.scheme != 'https' or not url.hostname or url.hostname in {'localhost', '127.0.0.1', '::1'}:
        raise RuntimeError('PUBLIC_BASE_URL deve usar HTTPS e domínio público')
    origin = f'{url.scheme}://{url.netloc}'
    if origin not in config.cors_origin_list:
        raise RuntimeError('PUBLIC_BASE_URL deve constar em CORS_ORIGINS')
    if not config.trusted_proxy:
        raise RuntimeError('TRUSTED_PROXY=true é obrigatório para registo aberto')


def validate_public_forms_startup(config: Settings = settings) -> None:
    if config.contato_email and not config.debug and not config.trusted_proxy:
        raise RuntimeError('TRUSTED_PROXY=true é obrigatório para contacto público')
