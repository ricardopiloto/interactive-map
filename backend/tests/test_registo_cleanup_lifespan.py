import asyncio
from fastapi import FastAPI

from app import main


def test_periodic_cleanup_retries_after_error(monkeypatch):
    calls = []
    def cycle():
        calls.append(1)
        if len(calls) == 1:
            raise RuntimeError('test failure')
    monkeypatch.setattr(main, '_purge_pending_cycle', cycle)
    async def inline_thread(fn):
        fn()
    monkeypatch.setattr(main.asyncio, 'to_thread', inline_thread)
    async def run():
        task = asyncio.create_task(main._periodic_pending_cleanup(0.001))
        while len(calls) < 2:
            await asyncio.sleep(0.005)
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    asyncio.run(run())
    assert len(calls) >= 2


def test_lifespan_starts_and_cancels_cleanup(monkeypatch):
    monkeypatch.setattr('app.services.registo_config.validate_registo_startup', lambda: None)
    monkeypatch.setattr(main, 'init_control', lambda: None)
    monkeypatch.setattr('app.services.admin_console.reconcile_campaign_deletions', lambda: None)
    started = asyncio.Event()
    stopped = asyncio.Event()
    async def worker():
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            stopped.set()
    monkeypatch.setattr(main, '_periodic_pending_cleanup', worker)
    async def run():
        async with main.lifespan(FastAPI()):
            await started.wait()
        assert stopped.is_set()
    asyncio.run(run())
