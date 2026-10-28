from app.config import settings
from app.models.usuario import Usuario
from sqlmodel import Session, select
from app.campaign_db import get_control_engine


def test_invite_email_unavailable(admin_client, monkeypatch):
    monkeypatch.setattr(settings, 'debug', False)
    monkeypatch.setattr(settings, 'email_api_key', None)
    assert admin_client.get('/api/admin/convites/config').json() == {'envio_email_disponivel': False}
    response = admin_client.post('/api/admin/convites', json={'email': 'no-mail@example.org', 'enviar_email': True})
    assert response.status_code == 503
    assert response.json()['detail']['erro'] == 'ENVIO_EMAIL_INDISPONIVEL'
    with Session(get_control_engine()) as session:
        assert session.exec(select(Usuario).where(Usuario.email == 'no-mail@example.org')).first() is None
    assert admin_client.post('/api/admin/convites', json={'email': 'manual@example.org'}).status_code == 201


def test_invite_email_sent_and_link_returned(admin_client, monkeypatch):
    from app.routers import administrador
    sent = []
    class Sender:
        def send(self, *args):
            sent.append(args)
    monkeypatch.setattr(settings, 'email_api_key', 'test-key')
    monkeypatch.setattr(administrador, 'get_email_sender', lambda: Sender())
    assert admin_client.get('/api/admin/convites/config').json() == {'envio_email_disponivel': True}
    response = admin_client.post('/api/admin/convites', json={'email': 'sent@example.org', 'enviar_email': True})
    assert response.status_code == 201
    assert response.json()['link'] in sent[0][3]
    assert sent[0][0] == 'sent@example.org'
