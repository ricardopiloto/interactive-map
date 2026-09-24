from __future__ import annotations

import sqlite3
from pathlib import Path

CONTENT_TABLES = (
    "arco",
    "npc",
    "local",
    "local_npc",
    "local_conexao",
    "grupo_posicao",
    "vinculo",
    "waypoint",
    "route_segment",
    "map_scale",
)


def _write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def hash_tree(root: Path) -> str:
    from app.services.legacy_import import hash_tree as _hash

    return _hash(root)


def build_legacy_tree(
    dest: Path,
    *,
    n_locais: int,
    n_npcs: int,
    prefix: str,
    retrato_style: str = "cat",
) -> Path:
    """Create `{dest}/mapa.db` + `{dest}/uploads/` in pre-Alembic shape."""
    dest.mkdir(parents=True, exist_ok=True)
    db = dest / "mapa.db"
    uploads = dest / "uploads"
    portraits = uploads / "portraits"
    locals_dir = uploads / "locals"
    portraits.mkdir(parents=True, exist_ok=True)
    locals_dir.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db)
    conn.executescript(
        """
        CREATE TABLE local (
            id INTEGER PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            descricao VARCHAR(10000) NOT NULL DEFAULT '',
            x FLOAT NOT NULL,
            y FLOAT NOT NULL,
            imagem_url VARCHAR(500),
            data_sessao VARCHAR(100),
            arco_id INTEGER
        );
        CREATE TABLE npc (
            id INTEGER PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            descricao VARCHAR(10000) NOT NULL DEFAULT '',
            faccao VARCHAR(200),
            status VARCHAR(20),
            retrato_url VARCHAR(500),
            visivel_para_todos BOOLEAN NOT NULL DEFAULT 1
        );
        CREATE TABLE vinculo (
            id INTEGER PRIMARY KEY,
            personagem_a_id INTEGER NOT NULL,
            personagem_b_id INTEGER NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            nota VARCHAR(500) NOT NULL DEFAULT '',
            publico BOOLEAN NOT NULL DEFAULT 0
        );
        """
    )
    for i in range(1, n_locais + 1):
        img = f"l-{prefix}-{i}.webp"
        _write_bytes(locals_dir / img, f"local-{prefix}-{i}".encode())
        url = f"/uploads/locals/{img}"
        conn.execute(
            "INSERT INTO local (id, nome, descricao, x, y, imagem_url) VALUES (?,?,?,?,?,?)",
            (i, f"Local {prefix} {i}", "", 0.1 * i, 0.2, url),
        )
    for i in range(1, n_npcs + 1):
        img = f"p-{prefix}-{i}.webp"
        _write_bytes(portraits / img, f"portrait-{prefix}-{i}".encode())
        if retrato_style == "c-slug":
            url = f"/uploads/c/old-{prefix}/portraits/{img}"
        else:
            url = f"/uploads/portraits/{img}"
        conn.execute(
            "INSERT INTO npc (id, nome, retrato_url) VALUES (?,?,?)",
            (i, f"Npc {prefix} {i}", url),
        )
    if n_npcs >= 2:
        conn.execute(
            "INSERT INTO vinculo (id, personagem_a_id, personagem_b_id, tipo, publico) "
            "VALUES (1, 1, 2, 'aliado', 1)"
        )
    conn.commit()
    conn.close()

    _write_bytes(uploads / f"campaign-map.webp", f"map-{prefix}".encode())
    return dest


def build_wfrp_tree(dest: Path) -> Path:
    return build_legacy_tree(dest, n_locais=2, n_npcs=2, prefix="wfrp")


def build_wod_tree(dest: Path) -> Path:
    return build_legacy_tree(dest, n_locais=1, n_npcs=1, prefix="wod")
