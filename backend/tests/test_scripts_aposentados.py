from __future__ import annotations

import os
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def test_nova_campanha_e_migrar_recusam(tmp_path: Path) -> None:
    root = tmp_path / "opt"
    root.mkdir()
    env = {**os.environ, "CODEX_INSTANCES_ROOT": str(root)}
    nova = REPO / "scripts" / "nova-campanha.sh"
    migrar = REPO / "scripts" / "migrar-wfrp.sh"
    r1 = subprocess.run(
        [str(nova), "foo", "8020", "8091", "wod"],
        cwd=str(REPO),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    r2 = subprocess.run(
        [str(migrar), "8020", "8091"],
        cwd=str(REPO),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert r1.returncode != 0
    assert r2.returncode != 0
    blob = (r1.stderr + r2.stderr + r1.stdout + r2.stdout).lower()
    assert "aposent" in blob or "codex" in blob
    assert list(root.iterdir()) == []
