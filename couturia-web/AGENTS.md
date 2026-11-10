# AGENTS.md — Contexte et consignes pour Cursor

## 1. Identité du projet

**Nom provisoire :** CoutureConnect (modifiable).

**Description :** plateforme web responsive (mobile-first) de visibilité et de gestion des commandes pour couturières, couturiers, stylistes et créateurs de mode. Chaque professionnel dispose d'une vitrine et publie ses réalisations. Les visiteurs découvrent les modèles et les professionnels. Les clients inscrits demandent une confection, reçoivent un devis, l'acceptent et suivent l'avancement de la commande.

**Choix métier confirmé : OPTION 2 — vitrine + demandes de confection + devis + commandes + suivi.** Ce n'est PAS une marketplace de paiement en ligne pour la V1. Les paiements en ligne, abonnements, logistique de livraison, application mobile native et IA sont hors périmètre V1.

**Contexte :** lancement envisagé au Bénin ; devise d'affichage FCFA (XOF) ; langue initiale français. Prévoir les évolutions internationales sans les développer maintenant.

## 2. Règles essentielles pour l'assistant Cursor

1. Respecter les choix validés : **React + Vite + TypeScript** pour le frontend, **Python + FastAPI** pour le backend, **RabbitMQ** pour les événements asynchrones, **PostgreSQL** pour la persistance, **Docker Compose** pour le développement local.
2. Architecture **microservices**, mais progression **verticale, simple et testable**. Ne pas générer tous les services d'un coup ni ajouter des technologies non demandées sans explication.
3. Avant chaque implémentation : expliquer l'objectif, les fichiers à créer/modifier, les API concernées, les événements RabbitMQ éventuels et les critères d'acceptation. Fournir des commandes d'exécution et de test.
4. Toujours examiner l'existant du dépôt avant de modifier des fichiers. Réutiliser conventions et composants existants. Ne pas remplacer silencieusement du travail utilisateur.
5. Privilégier du code lisible, typé, testé et sécurisé ; ne pas laisser de fonctionnalités factices présentées comme opérationnelles. Ne jamais stocker de secrets dans Git.
6. Chaque microservice possède ses propres tables et migrations et ne lit **jamais directement** les tables d'un autre service. En local, plusieurs bases/schémas logiques séparés peuvent partager un serveur PostgreSQL.
7. REST pour les actions synchrones nécessitant une réponse immédiate. RabbitMQ pour les notifications et réactions interservices asynchrones. Ne pas utiliser RabbitMQ pour remplacer toutes les API HTTP.
8. Utiliser des messages fiables : identifiant unique d'événement, version, timestamp, publication durable, acknowledgments, idempotence, retry limité, dead-letter queue. Prévoir transactional outbox pour les événements critiques (notamment acceptation de devis / création de commande).
9. Quand une fonctionnalité est ambiguë, proposer une hypothèse claire et demander validation uniquement si elle bloque réellement la tâche.
10. Construire d'abord un MVP utilisable de bout en bout, puis enrichir. Maintenir README, documentation API, schémas de données et contrats d'événements à jour.

## 3. Utilisateurs et autorisations

### Visiteur (non authentifié)
- Consulter accueil, catégories, catalogue, détails de créations, annuaire et profils publics des professionnels.
- Rechercher et filtrer par catégorie, spécialité, ville/quartier et prix indicatif si disponible.
- Être redirigé vers inscription/connexion avant d'envoyer une demande.

### Client connecté
- Gérer son profil ; enregistrer des favoris (si inclus dans le sprint).
- Créer une demande de confection à partir d'un modèle ou librement avec description, quantité, photo facultative, date souhaitée, budget facultatif.
- Consulter un devis ; accepter ou refuser ; consulter son historique ; suivre les statuts des commandes.
- Contacter un professionnel via WhatsApp (lien sortant ; pas de messagerie WhatsApp automatisée obligatoire en V1).
- Consulter les notifications internes.

### Professionnel (couturier, couturière, styliste)
- Inscription, connexion, gestion de son atelier/profil public (logo, couverture, description, spécialités, localisation et contact).
- Publier/modifier/masquer/supprimer ses créations et leurs photos.
- Voir les demandes reçues, demander des précisions ou refuser une demande avec motif.
- Établir un devis comprenant prix de confection, tissu éventuel, autres frais, total, délai, validité.
- Après acceptation, consulter et faire évoluer ses commandes ; gérer ses fiches clients et mesures avec autorisation appropriée.
- Accéder à son tableau de bord (demandes, devis, commandes et échéances).

### Administrateur
- Vérifier/suspendre les profils, modérer créations et signalements, gérer catégories, voir statistiques globales.
- Accès limités, actions sensibles journalisées.

**Règle de sécurité :** un client ne voit que ses données privées ; un professionnel ne voit que les demandes/commandes qui concernent son atelier ; l'admin n'a pas un accès arbitraire aux mesures privées.

## 4. Pages et écrans V1

### Public
1. Accueil (hero, recherche, catégories, créations récentes, ateliers mis en avant).
2. Catalogue (grille responsive, recherche, filtres, pagination).
3. Détail création (galerie d'images, description, tarif indicatif facultatif, CTA demande).
4. Annuaire professionnels.
5. Profil public atelier/styliste.
6. Connexion / inscription / récupération de compte.

### Client
7. Tableau de bord client.
8. Nouvelle demande de confection.
9. Demandes et devis (accepter/refuser).
10. Mes commandes.
11. Suivi détaillé d'une commande (historique des statuts).
12. Favoris (après flux principal si besoin).
13. Profil client.

### Professionnel
14. Tableau de bord atelier.
15. Gestion des créations + formulaire édition.
16. Demandes reçues.
17. Gestion des devis.
18. Liste + détail des commandes et changement de statut.
19. Gestion des clients et mesures.
20. Profil de l'atelier.

### Administration
21. Utilisateurs et validation des professionnels.
22. Publications, catégories et signalements.

## 5. Flux métier prioritaire (à implémenter de bout en bout)

1. Un professionnel crée son atelier, puis publie une création (photos + catégorie + description).
2. Le visiteur découvre une création, se connecte comme client et remplit une demande.
3. **Demande Service** enregistre la demande et publie `demande.creee` ; **Notification Service** crée une notification pour le professionnel.
4. Le professionnel examine la demande et établit un devis. **Demande Service** publie `devis.envoye` ; notification au client.
5. Le client accepte le devis. Le service valide l'état et persiste l'acceptation, puis publie `devis.accepte` de manière fiable.
6. **Commande Service** consomme `devis.accepte` de manière idempotente, crée une commande unique associée au devis et publie `commande.creee`.
7. **Notification Service** consomme `commande.creee` et signale la confirmation.
8. Le professionnel met à jour la commande ; **Commande Service** publie `commande.statut_modifie` ; le client voit la progression.
9. La commande passe à `livree` ou `terminee` avec un historique auditable.

**Attention :** la création de commande étant asynchrone, après acceptation du devis, le frontend peut afficher « Confirmation en cours » et actualiser le statut ; ne pas promettre une création immédiatement synchrone.

### Statuts suggérés
- Demande : `soumise`, `en_etude`, `devis_envoye`, `refusee`, `transformee_en_commande`.
- Devis : `brouillon`, `envoye`, `accepte`, `refuse`, `expire`.
- Commande : `en_attente`, `en_preparation`, `en_confection`, `prete_essayage`, `en_retouche`, `prete_a_recuperer`, `livree`, `annulee`.
- Ne permettre que des transitions métier autorisées ; conserver horodatage, auteur et historique.

## 6. Architecture technique cible

### Frontend
- React + Vite + TypeScript ; Tailwind CSS ; React Router.
- Client HTTP centralisé ; TanStack Query optionnel pour cache et synchronisation.
- Layouts Public / Client / Professionnel / Admin, routes protégées selon rôle.
- Mobile-first, navigation accessible, composants réutilisables, images optimisées, états chargement/erreur/vides.

### Infrastructure
- Reverse proxy/API Gateway : Nginx en première version (routage, HTTPS en production).
- Services Python FastAPI avec Pydantic, SQLAlchemy, Alembic et Pytest.
- RabbitMQ : exchange topic `couture.events`, files distinctes par service/usage.
- PostgreSQL : séparation des données par service ; migrations indépendantes.
- Médias : stockage objet compatible S3, sans conserver les binaires d'images dans PostgreSQL.
- Conteneurs : Docker Compose pour l'environnement local, variables via `.env` non commité.
- Logs structurés, healthchecks et observabilité minimale.

### Microservices métier
1. **auth-service** : utilisateurs, identités, connexion, rôles, jetons/sessions.
2. **atelier-service** : ateliers, profils professionnels, spécialités, coordonnées.
3. **catalogue-service** : créations, catégories, images, recherche et exposition publique.
4. **demande-service** : demandes de confection, devis, décisions sur les devis.
5. **commande-service** : commandes, transitions, échéances, historique des statuts.
6. **client-service** : fiches clients atelier, mesures privées, favoris (peut arriver en sprint ultérieur).
7. **notification-service** : notifications dans l'application déclenchées par événements.

**Ne pas centraliser toutes les tables dans une base partagée accessible à tous les services.** Utiliser des identifiants externes pour les références interservices et des projections locales si nécessaire.

## 7. Événements RabbitMQ (contrats initiaux)

Exchange `couture.events` (type `topic`). Routing keys :

| Routing key | Producteur | Consommateur principal | Intention |
|---|---|---|---|
| `utilisateur.inscrit` | auth-service | notification-service | Message de bienvenue éventuel |
| `creation.publiee` | catalogue-service | notification-service (facultatif) | Confirmation de publication |
| `demande.creee` | demande-service | notification-service | Avertir le professionnel |
| `devis.envoye` | demande-service | notification-service | Avertir le client |
| `devis.accepte` | demande-service | commande-service | Créer la commande |
| `commande.creee` | commande-service | notification-service | Confirmer la commande |
| `commande.statut_modifie` | commande-service | notification-service | Signaler changement de statut |
| `commande.terminee` | commande-service | notification-service | Signaler clôture |

Enveloppe commune attendue (exemple, valeurs fictives) :

```json
{
  "event_id": "evt-uuid",
  "event_type": "devis.accepte",
  "version": 1,
  "occurred_at": "2026-11-01T12:00:00Z",
  "data": {
    "devis_id": "uuid",
    "demande_id": "uuid",
    "client_id": "uuid",
    "atelier_id": "uuid",
    "montant": 25000,
    "devise": "XOF"
  }
}
```

Principes : messages versionnés ; consommateur idempotent (unicité `devis_id` côté commande) ; ack après persistance ; retry/backoff et DLQ ; outbox pour publier après une transaction métier ; ne jamais y inclure mots de passe ni mensurations personnelles sensibles.

## 8. API REST (exemples d'intentions, à détailler dans les contrats OpenAPI)

| Méthode | Route indicative | Usage |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/ateliers` | Annuaire |
| GET | `/api/ateliers/{id}` | Profil professionnel |
| GET | `/api/creations` | Catalogue filtrable |
| GET | `/api/creations/{id}` | Détail création |
| POST | `/api/creations` | Publication par professionnel |
| POST | `/api/demandes` | Nouvelle demande client |
| GET | `/api/demandes` | Demandes selon acteur connecté |
| POST | `/api/demandes/{id}/devis` | Proposer devis |
| POST | `/api/devis/{id}/accepter` | Acceptation devis |
| GET | `/api/commandes` | Liste des commandes autorisées |
| GET | `/api/commandes/{id}` | Détail commande |
| PATCH | `/api/commandes/{id}/statut` | Mise à jour contrôlée |
| GET | `/api/notifications` | Notifications de l'utilisateur |

**Routes indicatives :** valider conventions et schémas des requêtes/réponses avant codage. Toutes les routes privées exigent contrôle d'autorisation côté backend, pas seulement dans React.

## 9. Arborescence recommandée

```text
couture-platform/
├── AGENTS.md
├── README.md
├── frontend/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── features/
│       └── lib/
├── backend/
│   ├── auth-service/
│   ├── atelier-service/
│   ├── catalogue-service/
│   ├── demande-service/
│   ├── commande-service/
│   ├── client-service/
│   └── notification-service/
├── gateway/
├── infrastructure/
│   ├── rabbitmq/
│   └── postgres/
├── contracts/
│   ├── events/
│   └── api/
├── docker-compose.yml
└── .env.example
```

Structure interne suggérée pour chaque FastAPI service : `app/main.py`, `app/api/`, `app/models/`, `app/schemas/`, `app/services/`, `app/repositories/`, `app/events/`, `app/config.py`, `alembic/`, `tests/`, `Dockerfile`, `pyproject.toml`.

## 10. Plan de développement par sprints

### Sprint 1 — Fondations
- Initialiser React/Vite/TypeScript/Tailwind ; structure des routes et design system.
- Docker Compose PostgreSQL, RabbitMQ, services et gateway (en commençant petit).
- Auth service et autorisation de base.
- CI/test minimum, `.env.example`, documentation démarrage.

### Sprint 2 — Vitrine
- Atelier service : profils professionnels.
- Catalogue service : publications, images, catégories.
- Pages publiques : accueil, catalogue, détail, annuaire, profil atelier.

### Sprint 3 — Demandes et devis
- Demande service, formulaire client, liste des demandes professionnelles et devis.
- Premier événement réel via RabbitMQ et notification visible.

### Sprint 4 — Commandes et suivi
- Commande service consommateur `devis.accepte`, idempotence et outbox.
- Écrans commande côté client/professionnel, historique et notifications.

### Sprint 5 — Finalisation V1
- Client service/mesures si nécessaire, favoris, administration et modération.
- Tests d'intégration interservices, sécurité, responsive, sauvegardes, déploiement.

## 11. Conditions de livraison et tests

Scénario de recette principal :
1. Professionnel inscrit et connecté ; atelier créé.
2. Création publiée avec photo ; visible dans catalogue public.
3. Client inscrit ; demande envoyée pour la création.
4. Professionnel notifié ; devis envoyé ; client notifié.
5. Client accepte ; une et une seule commande créée via RabbitMQ.
6. Professionnel change statut ; le client voit le statut et son historique.
7. Client A ne peut pas lire commande de client B ; atelier X ne peut pas modifier commande de Y.
8. Interface utilisable sur téléphone et ordinateur.

Tests nécessaires : validation de données, auth/autorisation, transitions de statut, idempotence des événements, reconnexion RabbitMQ, erreurs réseau, upload de fichiers, migrations, tests E2E des flux essentiels.

## 12. Priorité immédiate demandée à Cursor

**Ne commence pas par coder les sept microservices d'un coup.**

Première mission :
1. Lire ce fichier, inspecter le dépôt et expliquer ce qui existe déjà.
2. Proposer l'arborescence exacte du Sprint 1 et les commandes d'installation.
3. Initialiser le frontend React/Vite/TypeScript/Tailwind avec une page d'accueil responsive soignée (données fictives clairement identifiées).
4. Mettre en place le socle Docker Compose pour PostgreSQL et RabbitMQ et un Auth Service FastAPI minimal, testé.
5. Expliquer comment lancer frontend, backend, RabbitMQ, PostgreSQL ; montrer une vérification de santé et le chemin du scénario métier futur.
6. Attendre mon instruction pour élargir au Sprint 2.

### Message initial que l'utilisateur peut envoyer à Cursor

> Lis le fichier AGENTS.md à la racine : c'est la référence de mon projet. Je construis une plateforme web de couture avec React + Vite + TypeScript, Python FastAPI, PostgreSQL, RabbitMQ et des microservices. Commence par examiner le dépôt et propose le Sprint 1. Explique chaque étape simplement en français. N'implémente pas les autres sprints sans mon accord.
