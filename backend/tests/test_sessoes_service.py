from __future__ import annotations

from sqlmodel import Session

from app.services import sessao_service
from tests.helpers import seed_sessao


def test_proximo_numero_empty(db_session: Session) -> None:
    assert sessao_service.proximo_numero(db_session) == 1


def test_proximo_numero_after_max(db_session: Session) -> None:
    seed_sessao(db_session, numero=1, titulo="um")
    seed_sessao(db_session, numero=4, titulo="quatro")
    assert sessao_service.proximo_numero(db_session) == 5
