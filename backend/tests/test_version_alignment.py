"""Verify release versions across repository manifests.

README uses ``^\\*\\*Versão:\\*\\*\\s*(\\d+\\.\\d+\\.\\d+)`` and CHANGELOG
uses ``^## \\[(\\d+\\.\\d+\\.\\d+)\\]``: the latter selects the first
published heading and therefore skips ``[Unreleased]``. TOML fields are parsed,
including the project package entry in uv.lock; JSON fields are parsed directly.
"""
import json
import re
import tomllib
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
FILES = [
    "frontend-v2/package.json", "frontend-v2/package-lock.json",
    "backend/pyproject.toml", "backend/uv.lock", "README.md", "CHANGELOG.md",
]


def test_version_alignment():
    if any(not (ROOT / name).exists() for name in FILES):
        pytest.skip("release files unavailable in this build context")
    frontend = json.loads((ROOT / FILES[0]).read_text())
    frontend_lock = json.loads((ROOT / FILES[1]).read_text())
    backend = tomllib.loads((ROOT / FILES[2]).read_text())
    backend_lock = tomllib.loads((ROOT / FILES[3]).read_text())
    readme = re.search(r"^\*\*Versão:\*\*\s*(\d+\.\d+\.\d+)", (ROOT / FILES[4]).read_text(), re.M)
    changelog = re.search(r"^## \[(\d+\.\d+\.\d+)\]", (ROOT / FILES[5]).read_text(), re.M)
    assert readme is not None, "README version missing"
    assert changelog is not None, "CHANGELOG published version missing"
    sources = {
        "frontend-v2/package.json": frontend["version"],
        "frontend-v2/package-lock.json root": frontend_lock["version"],
        'frontend-v2/package-lock.json packages[""]': frontend_lock["packages"][""]["version"],
        "backend/pyproject.toml": backend["project"]["version"],
        "backend/uv.lock mapa-campanha-api": next(p["version"] for p in backend_lock["package"] if p["name"] == "mapa-campanha-api"),
        "README.md": readme.group(1),
        "CHANGELOG.md": changelog.group(1),
    }
    expected = frontend["version"]
    for source, version in sources.items():
        assert version == expected, f"{source}: {version} != {expected}"
