import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)


class EventPublisher:
    """Stub Sprint 1 : journalise l'événement. Branchement AMQP au sprint suivant."""

    def publish(self, event_type: str, data: dict[str, Any]) -> dict[str, Any]:
        envelope = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "version": 1,
            "occurred_at": datetime.now(UTC).isoformat(),
            "data": data,
        }
        settings = get_settings()
        logger.info(
            "event_published",
            extra={
                "envelope": envelope,
                "broker": settings.rabbitmq_url,
            },
        )
        return envelope
