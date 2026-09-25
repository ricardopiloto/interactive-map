from __future__ import annotations

from app.models.npc import PersonagemTipo
from app.models.vinculo import Vinculo, VinculoTipo
from tests.conftest import api
from tests.helpers import seed_personagem


def test_public_relations_omit_private_pairs_and_hidden_characters(client_anon, db_session) -> None:
    public_a = seed_personagem(db_session, nome="PJ Publico A", visivel=True)
    public_b = seed_personagem(
        db_session, nome="NPC Publico B", visivel=True, tipo=PersonagemTipo.npc
    )
    hidden = seed_personagem(db_session, nome="NPC Oculto", visivel=False, tipo=PersonagemTipo.npc)

    private = Vinculo(
        personagem_a_id=public_a.id,
        personagem_b_id=public_b.id,
        tipo_ab=VinculoTipo.aliado,
        publico=False,
    )
    hidden_pair = Vinculo(
        personagem_a_id=public_a.id,
        personagem_b_id=hidden.id,
        tipo_ab=VinculoTipo.amizade,
        publico=True,
    )
    db_session.add(private)
    db_session.add(hidden_pair)
    db_session.commit()

    response = client_anon.get(api("/api/vinculos"))

    assert response.status_code == 200
    returned_ids = {row["id"] for row in response.json()}
    assert private.id not in returned_ids
    assert hidden_pair.id not in returned_ids


def test_public_relations_redact_unknown_direction_content(client_anon, db_session) -> None:
    a = seed_personagem(db_session, nome="PJ Sentido A", visivel=True)
    b = seed_personagem(db_session, nome="NPC Sentido B", visivel=True, tipo=PersonagemTipo.npc)
    bond = Vinculo(
        personagem_a_id=a.id,
        personagem_b_id=b.id,
        tipo_ab=VinculoTipo.romance,
        tipo_ba=VinculoTipo.amizade,
        nota_ab="romance secreto marcador privado",
        nota_ba="amizade pública marcador conhecido",
        publico=True,
        conhecido_ab=False,
        conhecido_ba=True,
        qualificador_ab="Segredo arcano privado",
        qualificador_ba="Companheiro conhecido",
    )
    db_session.add(bond)
    db_session.commit()

    response = client_anon.get(api("/api/vinculos"))

    assert response.status_code == 200
    row = next(item for item in response.json() if item["id"] == bond.id)
    # The response model excludes None fields; the private direction must not be serialized.
    assert "tipo_ab" not in row
    assert row["nota_ab"] == ""
    assert row["qualificador_ab"] == ""
    assert row["tipo_ba"] == VinculoTipo.amizade.value
    assert row["nota_ba"] == "amizade pública marcador conhecido"
    assert row["qualificador_ba"] == "Companheiro conhecido"
    assert "conhecido_ab" not in row
    assert "conhecido_ba" not in row
