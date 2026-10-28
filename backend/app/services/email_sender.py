from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Protocol

import httpx

from app.config import Settings, settings

logger = logging.getLogger(__name__)


class EmailSender(Protocol):
    def send(self, to: str, subject: str, html: str, text: str, *, reply_to: str | None = None) -> bool: ...


class ResendSender:
    def __init__(self, api_key: str, from_email: str, transport: httpx.BaseTransport | None = None):
        self.api_key, self.from_email, self.transport = api_key, from_email, transport

    def send(self, to: str, subject: str, html: str, text: str, *, reply_to: str | None = None) -> bool:
        try:
            with httpx.Client(transport=self.transport, timeout=3.0) as client:
                payload = {'from': self.from_email, 'to': [to], 'subject': subject, 'html': html, 'text': text}
                if reply_to is not None:
                    payload['reply_to'] = reply_to
                response = client.post('https://api.resend.com/emails', headers={'Authorization': f'Bearer {self.api_key}'}, json=payload)
            request_id = response.headers.get('x-request-id', '')
            if response.is_success:
                logger.info('email delivery status=%s request_id=%s', response.status_code, request_id)
            else:
                logger.error('email delivery failed status=%s request_id=%s', response.status_code, request_id)
            return response.is_success
        except Exception as exc:
            logger.error('email delivery failed type=%s', type(exc).__name__)
            return False


class LogSender:
    def __init__(self, data_dir: Path, log_file: Path | None = None):
        self.data_dir, self.log_file = data_dir, log_file

    def send(self, to: str, subject: str, html: str, text: str, *, reply_to: str | None = None) -> bool:
        try:
            payload = {'to': to, 'subject': subject, 'html': html, 'text': text, 'reply_to': reply_to}
            if self.log_file is not None:
                base = self.data_dir.resolve()
                destination = (base / self.log_file).resolve()
                if not destination.is_relative_to(base):
                    raise ValueError('EMAIL_LOG_FILE must be under DATA_DIR')
                destination.parent.mkdir(parents=True, exist_ok=True)
                with destination.open('a', encoding='utf-8') as stream:
                    stream.write(json.dumps(payload, ensure_ascii=False) + '\n')
            logger.info('development email recorded')
            return True
        except Exception as exc:
            logger.error('development email failed type=%s', type(exc).__name__)
            return False


def get_email_sender(config: Settings = settings, *, testing: bool = False) -> EmailSender | None:
    if config.email_api_key:
        return ResendSender(config.email_api_key, config.email_from)
    if config.debug or testing:
        return LogSender(config.data_dir, config.email_log_file)
    return None
