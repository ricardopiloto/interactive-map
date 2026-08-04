"""One-to-one Waypoint ↔ Local link with Local pin snap to waypoint coords."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.local import Local
from app.models.waypoint import Waypoint


def snap_local_to_waypoint(local: Local, waypoint: Waypoint) -> None:
    local.x = float(waypoint.x)
    local.y = float(waypoint.y)


def set_waypoint_local_id(
    session: Session, waypoint: Waypoint, local_id: int | None
) -> None:
    """Assign or clear Local on a waypoint; snap Local when linking.

    If ``local_id`` is already on another waypoint → 422 (must unlink first).
    """
    if local_id is None:
        waypoint.local_id = None
        session.add(waypoint)
        return

    local = session.get(Local, local_id)
    if local is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Local {local_id} não encontrado",
        )

    existing = session.exec(
        select(Waypoint).where(
            Waypoint.local_id == local_id,
            Waypoint.id != waypoint.id,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Local já vinculado a outro waypoint",
        )

    waypoint.local_id = local_id
    snap_local_to_waypoint(local, waypoint)
    session.add(waypoint)
    session.add(local)


def set_local_waypoint_id(
    session: Session, local: Local, waypoint_id: int | None
) -> None:
    """Assign or clear waypoint for a Local; snap Local when linking.

    Unlink does not move Local. Relink to a free waypoint clears the previous
    node. If the target waypoint is linked to another Local → 422.
    """
    if local.id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Local sem id para vincular waypoint",
        )
    local_id = int(local.id)

    if waypoint_id is None:
        current = session.exec(select(Waypoint).where(Waypoint.local_id == local_id)).first()
        if current:
            current.local_id = None
            session.add(current)
        return

    waypoint = session.get(Waypoint, waypoint_id)
    if waypoint is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Waypoint {waypoint_id} não encontrado",
        )

    if waypoint.local_id is not None and waypoint.local_id != local_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Waypoint já vinculado a outro local",
        )

    previous = session.exec(select(Waypoint).where(Waypoint.local_id == local_id)).first()
    if previous is not None and previous.id != waypoint.id:
        previous.local_id = None
        session.add(previous)

    waypoint.local_id = local_id
    snap_local_to_waypoint(local, waypoint)
    session.add(waypoint)
    session.add(local)


def waypoint_id_for_local(session: Session, local_id: int) -> int | None:
    wp = session.exec(select(Waypoint).where(Waypoint.local_id == local_id)).first()
    return int(wp.id) if wp is not None and wp.id is not None else None
