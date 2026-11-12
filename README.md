# Couturia

Plateforme web de vitrine et de gestion de commandes pour couturières, stylistes et créateurs (devise FCFA / XOF, langue FR).

Référence produit / technique : `couturia-web/AGENTS.md`.

## Arborescence (Sprint 1)

```text
couturia/
├── couturia-web/          # React + Vite + TypeScript + Tailwind + DaisyUI
├── couturia-api/
│   ├── auth-service/      # :8001 JWT
│   ├── atelier-service/   # :8002 profils ateliers
│   └── catalogue-service/ # :8003 créations / catégories
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/
│   └── rabbitmq/
├── docs/
├── .env.example
└── README.md
```

Services restants plus tard : demande, commande, client, notification.

## Prérequis

- Node.js 20+
- Python 3.12+
- Docker Desktop

## 1. Variables d’environnement

```bash
copy .env.example .env
```

## 2. Infra locale (PostgreSQL + RabbitMQ + auth-service)

```bash
docker compose --env-file .env -f docker/docker-compose.yml up --build
```

> Sur Windows, si le port `5432` est déjà pris, utilise `POSTGRES_PORT=5434` dans `.env` (déjà prévu dans `.env.example`).

Vérifications :

- Postgres : `localhost:5432`
- RabbitMQ UI : [http://localhost:15672](http://localhost:15672) (`couturia` / `couturia_dev`)
- Auth : [http://localhost:8001/health](http://localhost:8001/health) · docs `/docs`
- Atelier : [http://localhost:8002/health](http://localhost:8002/health) · docs `/docs`
- Catalogue : [http://localhost:8003/health](http://localhost:8003/health) · docs `/docs`

Pour démarrer seulement l’infra (sans rebuild du service) :

```bash
docker compose -f docker/docker-compose.yml up postgres rabbitmq
```

## 3. Frontend

```bash
cd couturia-web
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## 4. Auth service en local (hors conteneur)

```bash
cd couturia-api/auth-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload --port 8001
pytest
```

## Scénario métier futur

Inscription → publication création → demande → devis → acceptation (`devis.accepte` via RabbitMQ) → commande → suivi des statuts. Voir `AGENTS.md` section 5.

Champ	Valeur
Username
couturia
Password
couturia_dev
Connexion AMQP (si un outil le demande)