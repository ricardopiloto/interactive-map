from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sqlmodel import Session, select

from app.campaign_db import get_control_engine, init_control
from app.models.campanha import Campanha
from app.services.auth_admin import (
    AuthAdminError,
    assign_owner,
    create_usuario_with_invite,
    deactivate_usuario,
    demote_admin,
    invite_url,
    promote_admin,
    reset_usuario,
)
from app.services.campanha_admin import (
    CampanhaAdminError,
    create_campanha,
)
from app.services.campaign_export import export_campaign_to_path
from app.services.campaign_import import import_campaign_from_zip, owner_email_exists
from app.services.legacy_import import LegacyImportError, import_legacy_instance
from app.services.package_schema import PackageError
from app.services.uploads import reconcile_bytes_usados


def _create_campanha(
    *,
    slug: str,
    nome: str,
    sistema: str,
    genero: str = "fantasia",
    visibilidade: str = "listada",
    modulos: list[str] | None = None,
) -> Campanha:
    """Back-compat wrapper used by tests and CLI."""
    return create_campanha(
        slug=slug,
        nome=nome,
        sistema=sistema,
        genero=genero,
        visibilidade=visibilidade,
        modulos=modulos,
    )


def _list_campanhas() -> list[Campanha]:
    init_control()
    with Session(get_control_engine()) as session:
        rows = list(session.exec(select(Campanha).order_by(Campanha.slug)).all())
        for r in rows:
            session.expunge(r)
        return rows


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="app.cli", description="Codex super-admin CLI")
    sub = parser.add_subparsers(dest="entity", required=True)

    camp = sub.add_parser("campanha", help="Gerir campanhas")
    camp_sub = camp.add_subparsers(dest="action", required=True)

    criar = camp_sub.add_parser("criar", help="Criar campanha isolada")
    criar.add_argument("--slug", required=True)
    criar.add_argument("--nome", required=True)
    criar.add_argument("--sistema", required=True)
    criar.add_argument("--visibilidade", default="listada", choices=["listada", "so_link"])
    criar.add_argument(
        "--modulos",
        default=None,
        help="Lista separada por vírgulas; omissão = default do sistema",
    )

    camp_sub.add_parser("listar", help="Listar campanhas no controle")

    atribuir = camp_sub.add_parser("atribuir-dono", help="Atribuir dono (substitui anterior)")
    atribuir.add_argument("--slug", required=True)
    atribuir.add_argument("--email", required=True)

    reconciliar = camp_sub.add_parser("reconciliar-cota", help="Recalcular bytes_usados a partir do disco")
    reconciliar.add_argument("--slug", required=True)

    exportar = camp_sub.add_parser("exportar", help="Exportar campanha para zip")
    exportar.add_argument("--slug", required=True)
    exportar.add_argument("--out", required=True)

    importar = camp_sub.add_parser("importar", help="Importar campanha a partir de zip")
    importar.add_argument("--zip", required=True, dest="zip_path")
    importar.add_argument("--email", required=True)
    importar.add_argument("--slug", default=None)

    legado = camp_sub.add_parser(
        "importar-legado",
        help="Importar instância legada (árvore mapa.db + uploads)",
    )
    legado.add_argument("--origem", required=True)
    legado.add_argument("--slug", required=True)
    legado.add_argument("--sistema", required=True)
    legado.add_argument("--nome", required=True)
    legado.add_argument("--email", required=True)
    legado.add_argument("--visibilidade", default="listada", choices=["listada", "so_link"])
    legado.add_argument("--cota-bytes", type=int, default=None, dest="cota_bytes")
    legado.add_argument("--relatorio", default=None)

    user = sub.add_parser("usuario", help="Gerir contas de mestre")
    user_sub = user.add_subparsers(dest="action", required=True)

    u_criar = user_sub.add_parser("criar", help="Criar utilizador pendente + convite")
    u_criar.add_argument("--email", required=True)

    u_reset = user_sub.add_parser("reset", help="Emitir link de reset de senha")
    u_reset.add_argument("--email", required=True)

    u_deact = user_sub.add_parser("desactivar", help="Desactivar utilizador e revogar sessões")
    u_deact.add_argument("--email", required=True)

    u_promote = user_sub.add_parser("promover-admin", help="Promover utilizador a administrador")
    u_promote.add_argument("--email", required=True)

    u_demote = user_sub.add_parser("rebaixar-admin", help="Rebaixar administrador")
    u_demote.add_argument("--email", required=True)

    args = parser.parse_args(argv)
    try:
        if args.entity == "campanha" and args.action == "criar":
            mods = None
            if args.modulos is not None:
                mods = [p.strip() for p in args.modulos.split(",") if p.strip()]
            row = _create_campanha(
                slug=args.slug,
                nome=args.nome,
                sistema=args.sistema,
                visibilidade=args.visibilidade,
                modulos=mods,
            )
            print(f"OK {row.slug} {row.caminho}")
            return 0
        if args.entity == "campanha" and args.action == "listar":
            rows = _list_campanhas()
            if not rows:
                print("(vazio)")
                return 0
            for r in rows:
                print(f"{r.slug}\t{r.nome}\t{r.sistema}\t{r.visibilidade}")
            return 0
        if args.entity == "campanha" and args.action == "atribuir-dono":
            init_control()
            with Session(get_control_engine()) as session:
                result = assign_owner(session, args.slug, args.email)
            print(f"OK dono={args.email} campanha={args.slug} prev={result.previous_dono_id}")
            return 0
        if args.entity == "campanha" and args.action == "reconciliar-cota":
            init_control()
            row = reconcile_bytes_usados(args.slug)
            print(f"OK {args.slug} bytes_usados={row.bytes_usados} cota_bytes={row.cota_bytes}")
            return 0
        if args.entity == "campanha" and args.action == "exportar":
            init_control()
            path = export_campaign_to_path(args.slug, Path(args.out))
            print(f"OK {path}")
            return 0
        if args.entity == "campanha" and args.action == "importar":
            init_control()
            if not owner_email_exists(args.email):
                print("ERRO USUARIO_NAO_ENCONTRADO", file=sys.stderr)
                return 1
            try:
                row = import_campaign_from_zip(
                    Path(args.zip_path),
                    owner_email=args.email,
                    slug_override=args.slug,
                )
            except PackageError as exc:
                print(f"ERRO {exc.codigo}", file=sys.stderr)
                return 1
            print(f"OK {row.slug} {row.caminho}")
            return 0
        if args.entity == "campanha" and args.action == "importar-legado":
            init_control()
            try:
                row, report = import_legacy_instance(
                    Path(args.origem),
                    slug=args.slug,
                    sistema=args.sistema,
                    nome=args.nome,
                    email=args.email,
                    visibilidade=args.visibilidade,
                    cota_bytes=args.cota_bytes,
                    relatorio_path=Path(args.relatorio) if args.relatorio else None,
                )
            except LegacyImportError as exc:
                print(f"ERRO {exc.codigo}", file=sys.stderr)
                return 1
            print(f"OK {row.slug} {row.caminho} {report['resultado']}")
            return 0
        if args.entity == "usuario" and args.action == "criar":
            init_control()
            with Session(get_control_engine()) as session:
                _user, token = create_usuario_with_invite(session, args.email)
            print(invite_url(token, "activar"))
            return 0
        if args.entity == "usuario" and args.action == "reset":
            init_control()
            with Session(get_control_engine()) as session:
                token = reset_usuario(session, args.email)
            print(invite_url(token, "reset"))
            return 0
        if args.entity == "usuario" and args.action == "desactivar":
            init_control()
            with Session(get_control_engine()) as session:
                deactivate_usuario(session, args.email)
            print(f"OK desactivado {args.email}")
            return 0
        if args.entity == "usuario" and args.action == "promover-admin":
            init_control()
            with Session(get_control_engine()) as session:
                promote_admin(session, args.email)
            print(f"OK admin={args.email}")
            return 0
        if args.entity == "usuario" and args.action == "rebaixar-admin":
            init_control()
            with Session(get_control_engine()) as session:
                demote_admin(session, args.email)
            print(f"OK removido admin={args.email}")
            return 0
    except CampanhaAdminError as exc:
        print(f"ERRO {exc.codigo}", file=sys.stderr)
        return 1
    except AuthAdminError as exc:
        print(f"ERRO {exc.codigo}", file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
