# Couturia API

Backend microservices FastAPI pour Couturia.

## Services initialisés

```text
couturia-api/
├── auth-service/        # utilisateurs, rôles, JWT          :8001
├── atelier-service/     # profils ateliers / stylistes      :8002
└── catalogue-service/   # créations + catégories            :8003
```

Les services demande / commande / client / notification viendront plus tard.

## Structure interne d’un service (référence AGENTS.md)

```text
app/
  api/           # routes HTTP (controllers)
  services/      # logique métier  ← équivalent d’un dossier "actions"
  repositories/  # accès base
  models/        # tables SQLAlchemy
  schemas/       # DTO Pydantic
  events/        # publication RabbitMQ
  config.py
```

Il n’y a **pas** de dossier `actions/` : la logique métier est dans `services/`.
Si tu préfères le nom `actions`, on pourra le renommer ou l’ajouter comme alias.

## Tests locaux

```bash
cd couturia-api/atelier-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
pytest

cd ../catalogue-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
pytest
```

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```
