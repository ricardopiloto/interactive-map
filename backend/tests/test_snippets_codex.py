from __future__ import annotations

import hashlib
import re
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def _digest(path: Path) -> bytes:
    return hashlib.sha256(path.read_bytes()).digest()


def test_snippets_codex_stdout_sem_escrever_caddy(tmp_path: Path) -> None:
    script = REPO / "scripts" / "imprimir-snippets-codex.sh"
    caddy = REPO / "deploy" / "Caddyfile"
    caddy_local = REPO / "deploy" / "Caddyfile.local"
    hub = REPO / "hub" / "campanhas.json"
    before = {
        "caddy": _digest(caddy),
        "local": _digest(caddy_local) if caddy_local.is_file() else b"",
        "hub": _digest(hub) if hub.is_file() else b"",
    }
    proc = subprocess.run(
        [str(script), "--porta-api", "8000", "--porta-web", "8080"],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr
    assert "campaign-codex.1nodado.com.br" in proc.stdout
    assert not re.search(r"\bredir\b", proc.stdout.lower())
    assert before["caddy"] == _digest(caddy)
    if caddy_local.is_file():
        assert before["local"] == _digest(caddy_local)
    if hub.is_file():
        assert before["hub"] == _digest(hub)
